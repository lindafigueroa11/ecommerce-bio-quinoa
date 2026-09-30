import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import Stripe = require('stripe');
import { PrismaService } from '../prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService) {}

  private readonly orderInclude = { items: { include: { product: true } } } as const;
  private readonly adminOrderInclude = { items: { include: { product: true } }, user: { select: { id: true, email: true } } } as const;

  private present(order: any) {
    const items = order.items.map((item: any) => ({ id: item.id, productId: item.productId, name: item.productName, price: item.price, quantity: item.quantity, subtotal: item.price * item.quantity, imageUrl: item.product.imageUrl }));
    return { id: order.id, status: order.status, total: order.total, currency: order.currency, createdAt: order.createdAt, items };
  }

  private presentForAdmin(order: any) {
    return { ...this.present(order), customer: order.user ? { id: order.user.id, email: order.user.email } : null };
  }

  private async createPendingOrder(cartId: string, sessionId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({ where: { id: cartId }, include: { items: true } });
      if (!cart) throw new NotFoundException('Cart not found');
      if (cart.sessionId !== sessionId) throw new UnauthorizedException('Cart session is not valid');
      if (cart.items.length === 0) throw new BadRequestException('Cart is empty');
      const productIds = cart.items.map(item => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      if (products.length !== productIds.length) throw new BadRequestException('A product in the cart no longer exists');
      const productById = new Map(products.map(product => [product.id, product]));
      const currencies = new Set(products.map(product => product.currency));
      if (currencies.size !== 1) throw new BadRequestException('Products must use the same currency');
      const items = cart.items.map(item => {
        const product = productById.get(item.productId)!;
        if (!product.active) throw new BadRequestException(`${product.name} is not available`);
        if (item.quantity < 1 || item.quantity > product.inventory) throw new BadRequestException(`${product.name} does not have enough stock`);
        return { productId: product.id, productName: product.name, price: product.price, quantity: item.quantity };
      });
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return tx.order.create({ data: { userId, cartSessionId: cart.sessionId, total, currency: products[0].currency, items: { create: items } }, include: this.orderInclude });
    });
  }

  async startCheckout(cartId: string, sessionId?: string, userId?: string) {
    if (!sessionId) throw new UnauthorizedException('Cart session is not valid');
    if (!userId) throw new UnauthorizedException('An authenticated user is required');
    this.stripe.ensureConfigured();
    const order = await this.createPendingOrder(cartId, sessionId, userId);
    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
    const checkout = await this.stripe.createCheckoutSession({
      orderId: order.id,
      currency: order.currency,
      items: order.items.map(item => ({ name: item.productName, price: item.price, quantity: item.quantity })),
      successUrl: `${webUrl}/order/success/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${webUrl}/checkout/cancel?order_id=${order.id}`,
    });
    if (!checkout.url) throw new BadRequestException('Stripe did not return a checkout URL');
    await this.prisma.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: checkout.id } });
    return { order: this.present(order), checkoutUrl: checkout.url };
  }

  async cancelCheckout(orderId: string, sessionId?: string, userId?: string, role?: string) {
    if (!sessionId) throw new UnauthorizedException('Cart session is not valid');
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: this.orderInclude });
    if (!order) throw new NotFoundException('Order not found');
    if (!userId || (order.userId !== userId && role !== 'ADMIN')) throw new NotFoundException('Order not found');
    if (order.cartSessionId !== sessionId) throw new UnauthorizedException('Order is not available for this session');
    if (order.status !== 'PENDING') return this.present(order);
    if (!order.stripeCheckoutSessionId) throw new BadRequestException('Order does not have a Stripe Checkout session');

    const session = await this.stripe.retrieveCheckoutSession(order.stripeCheckoutSessionId);
    if (session.status === 'complete' || session.payment_status === 'paid') return this.present(order);
    if (session.status === 'open') await this.stripe.expireCheckoutSession(session.id);
    if (session.status !== 'open' && session.status !== 'expired') throw new BadRequestException('Stripe Checkout session cannot be cancelled');

    const cancelled = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
      include: this.orderInclude,
    });
    return this.present(cancelled);
  }

  async processStripeEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') return this.confirmPaidSession(event, event.data.object as Stripe.Checkout.Session);
    if (event.type === 'checkout.session.async_payment_failed') return this.cancelSession(event, event.data.object as Stripe.Checkout.Session);
    if (event.type === 'checkout.session.expired') return this.cancelSession(event, event.data.object as Stripe.Checkout.Session);
    if (event.type === 'payment_intent.payment_failed') return this.recordPaymentFailure(event, event.data.object as Stripe.PaymentIntent);
    return { received: true };
  }

  verifyStripeEvent(rawBody: Buffer | undefined, signature?: string) {
    return this.stripe.constructWebhookEvent(rawBody, signature);
  }

  private async confirmPaidSession(event: Stripe.Event, session: Stripe.Checkout.Session) {
    if (session.mode !== 'payment' || session.payment_status !== 'paid') return { received: true };
    const orderId = session.metadata?.orderId;
    if (!orderId) throw new BadRequestException('Stripe session is missing the order reference');
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order || order.stripeCheckoutSessionId !== session.id) throw new NotFoundException('Order does not match the Stripe session');
      if (order.status === 'PAID') return;
      if (order.status !== 'PENDING') throw new BadRequestException('Order cannot be paid in its current state');
      for (const item of order.items) {
        const updated = await tx.product.updateMany({ where: { id: item.productId, active: true, inventory: { gte: item.quantity } }, data: { inventory: { decrement: item.quantity } } });
        if (updated.count !== 1) throw new BadRequestException(`Insufficient stock for ${item.productName}`);
      }
      await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null, stripeWebhookEventId: event.id } });
      const cart = await tx.cart.findUnique({ where: { sessionId: order.cartSessionId } });
      if (cart) {
        for (const item of order.items) await tx.cartItem.updateMany({ where: { cartId: cart.id, productId: item.productId, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity } } });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id, quantity: 0 } });
      }
    }, { isolationLevel: 'Serializable' });
    return { received: true };
  }

  private async cancelSession(event: Stripe.Event, session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return { received: true };
    await this.prisma.order.updateMany({ where: { id: orderId, stripeCheckoutSessionId: session.id, status: { in: ['PENDING', 'CANCELLED'] } }, data: { status: 'CANCELLED', stripeWebhookEventId: event.id } });
    return { received: true };
  }

  private async recordPaymentFailure(event: Stripe.Event, paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return { received: true };
    await this.prisma.order.updateMany({
      where: { id: orderId, status: 'PENDING' },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
    return { received: true };
  }

  async findAllForUser(userId: string) {
    const orders = await this.prisma.order.findMany({ where: { userId }, include: this.orderInclude, orderBy: { createdAt: 'desc' } });
    return orders.map(order => this.present(order));
  }

  async findAllForAdmin(query?: string) {
    const search = query?.trim();
    const where = search ? {
      OR: [
        { id: { contains: search } },
        { user: { is: { email: { contains: search, mode: 'insensitive' as const } } } },
        { items: { some: { productName: { contains: search, mode: 'insensitive' as const } } } },
      ],
    } : undefined;
    const orders = await this.prisma.order.findMany({ where, include: this.adminOrderInclude, orderBy: { createdAt: 'desc' } });
    return orders.map(order => this.presentForAdmin(order));
  }

  async findForAdmin(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: this.adminOrderInclude });
    if (!order) throw new NotFoundException('Order not found');
    return this.presentForAdmin(order);
  }

  async findForUser(orderId: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: this.orderInclude });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId && role !== 'ADMIN') throw new NotFoundException('Order not found');
    return this.present(order);
  }
}
