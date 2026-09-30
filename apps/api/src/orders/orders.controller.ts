import { Body, Controller, Get, Headers, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

type RequestWithUser = Request & { user: JwtPayload };

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateOrderDto, @Headers('x-cart-session') sessionId: string | undefined, @Req() request: RequestWithUser) {
    return this.orders.startCheckout(body.cartId, sessionId, request.user.sub);
  }

  @Post('webhooks/stripe')
  @HttpCode(200)
  webhook(@Req() request: Request, @Headers('stripe-signature') signature?: string) {
    return this.orders.processStripeEvent(this.orders.verifyStripeEvent(Buffer.isBuffer(request.body) ? request.body : undefined, signature));
  }

  @Post(':orderId/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('orderId') orderId: string, @Headers('x-cart-session') sessionId: string | undefined, @Req() request: RequestWithUser) {
    return this.orders.cancelCheckout(orderId, sessionId, request.user.sub, request.user.role);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin(@Query('q') query?: string) {
    return this.orders.findAllForAdmin(query);
  }

  @Get('admin/:orderId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOneAdmin(@Param('orderId') orderId: string) {
    return this.orders.findForAdmin(orderId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() request: RequestWithUser) {
    return this.orders.findAllForUser(request.user.sub);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('orderId') orderId: string, @Req() request: RequestWithUser) {
    return this.orders.findForUser(orderId, request.user.sub, request.user.role);
  }
}
