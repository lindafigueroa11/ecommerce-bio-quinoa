import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly cartInclude = {
    items: { include: { product: true } },
  } as const;

  private present(cart: any) {
    const items = cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.quantity * item.product.price,
      product: item.product,
    }));

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      items,
      total: items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
    };
  }

  async create() {
    return this.present(await this.prisma.cart.create({ data: {}, include: this.cartInclude }));
  }

  async findById(cartId: string, sessionId?: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId }, include: this.cartInclude });
    if (!cart) throw new NotFoundException('Cart not found');
    if (!sessionId || cart.sessionId !== sessionId) throw new UnauthorizedException('Cart session is not valid');
    return this.present(cart);
  }

  async addItem(cartId: string, sessionId: string | undefined, productId: string, quantity: number) {
    await this.findById(cartId, sessionId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) throw new NotFoundException('Product is not available');
    if (product.inventory < 1) throw new BadRequestException('Product is out of stock');

    const existing = await this.prisma.cartItem.findUnique({ where: { cartId_productId: { cartId, productId } } });
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > product.inventory) {
      throw new BadRequestException(`Only ${product.inventory} units are available`);
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: nextQuantity },
    });
    return this.findById(cartId, sessionId);
  }

  async updateItem(cartId: string, sessionId: string | undefined, productId: string, quantity: number) {
    await this.findById(cartId, sessionId);
    if (quantity === 0) return this.removeItem(cartId, sessionId, productId);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) throw new NotFoundException('Product is not available');
    if (quantity > product.inventory) throw new BadRequestException(`Only ${product.inventory} units are available`);

    const result = await this.prisma.cartItem.updateMany({ where: { cartId, productId }, data: { quantity } });
    if (result.count === 0) throw new NotFoundException('Cart item not found');
    return this.findById(cartId, sessionId);
  }

  async removeItem(cartId: string, sessionId: string | undefined, productId: string) {
    await this.findById(cartId, sessionId);
    await this.prisma.cartItem.deleteMany({ where: { cartId, productId } });
    return this.findById(cartId, sessionId);
  }

  async clear(cartId: string, sessionId: string | undefined) {
    await this.findById(cartId, sessionId);
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    return this.findById(cartId, sessionId);
  }
}
