import { Body, Controller, Get, Headers, HttpCode, Param, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: CreateOrderDto, @Headers('x-cart-session') sessionId?: string) {
    return this.orders.startCheckout(body.cartId, sessionId);
  }

  @Post('webhooks/stripe')
  @HttpCode(200)
  webhook(@Req() request: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
    return this.orders.processStripeEvent(this.orders.verifyStripeEvent(request.rawBody, signature));
  }

  @Get(':orderId')
  findOne(@Param('orderId') orderId: string, @Headers('x-cart-session') sessionId?: string) {
    return this.orders.findForSession(orderId, sessionId);
  }
}
