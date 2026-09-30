import { Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import Stripe = require('stripe');

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private get client() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new ServiceUnavailableException('Stripe is not configured');
    return new Stripe(key);
  }

  ensureConfigured() { void this.client; }

  async createCheckoutSession(input: { orderId: string; currency: string; items: Array<{ name: string; price: number; quantity: number }>; successUrl: string; cancelUrl: string }) {
    return this.client.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: input.orderId,
      metadata: { orderId: input.orderId },
      payment_intent_data: { metadata: { orderId: input.orderId } },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      line_items: input.items.map(item => ({ quantity: item.quantity, price_data: { currency: input.currency.toLowerCase(), unit_amount: item.price, product_data: { name: item.name } } })),
    });
  }

  async retrieveCheckoutSession(sessionId: string) {
    return this.client.checkout.sessions.retrieve(sessionId);
  }

  async expireCheckoutSession(sessionId: string) {
    return this.client.checkout.sessions.expire(sessionId);
  }

  constructWebhookEvent(rawBody: Buffer | undefined, signature: string | undefined) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const configuredTolerance = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS ?? 300);
    const tolerance = Number.isFinite(configuredTolerance) && configuredTolerance >= 0 ? configuredTolerance : 300;
    if (!rawBody || !signature || !secret) throw new UnauthorizedException('Stripe webhook signature is not valid');
    try { return this.client.webhooks.constructEvent(rawBody, signature, secret, tolerance); }
    catch (error) {
      this.logger.warn(`Stripe webhook signature validation failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      throw new UnauthorizedException('Stripe webhook signature is not valid');
    }
  }
}
