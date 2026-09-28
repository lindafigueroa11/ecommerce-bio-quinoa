import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private get client() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new ServiceUnavailableException('Stripe is not configured');
    return new Stripe(key);
  }

  async createCheckoutSession(input: { orderId: string; currency: string; items: Array<{ name: string; price: number; quantity: number }>; successUrl: string; cancelUrl: string }) {
    return this.client.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: input.orderId,
      metadata: { orderId: input.orderId },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      line_items: input.items.map(item => ({ quantity: item.quantity, price_data: { currency: input.currency.toLowerCase(), unit_amount: item.price, product_data: { name: item.name } } })),
    });
  }

  constructWebhookEvent(rawBody: Buffer | undefined, signature: string | undefined) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!rawBody || !signature || !secret) throw new UnauthorizedException('Stripe webhook signature is not valid');
    try { return this.client.webhooks.constructEvent(rawBody, signature, secret); }
    catch { throw new UnauthorizedException('Stripe webhook signature is not valid'); }
  }
}
