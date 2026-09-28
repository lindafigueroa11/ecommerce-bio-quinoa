import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: CreateOrderDto, @Headers('x-cart-session') sessionId?: string) {
    return this.orders.createFromCart(body.cartId, sessionId);
  }

  @Get(':orderId')
  findOne(@Param('orderId') orderId: string, @Headers('x-cart-session') sessionId?: string) {
    return this.orders.findForSession(orderId, sessionId);
  }
}
