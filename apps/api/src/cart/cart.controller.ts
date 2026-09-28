import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';
import { CartService } from './cart.service';

@Controller('carts')
export class CartController {
  constructor(private readonly carts: CartService) {}

  @Post()
  create() { return this.carts.create(); }

  @Get(':cartId')
  findById(@Param('cartId') cartId: string, @Headers('x-cart-session') sessionId?: string) { return this.carts.findById(cartId, sessionId); }

  @Post(':cartId/items')
  addItem(@Param('cartId') cartId: string, @Headers('x-cart-session') sessionId: string | undefined, @Body() body: AddCartItemDto) {
    return this.carts.addItem(cartId, sessionId, body.productId, body.quantity);
  }

  @Patch(':cartId/items/:productId')
  updateItem(@Param('cartId') cartId: string, @Headers('x-cart-session') sessionId: string | undefined, @Param('productId') productId: string, @Body() body: UpdateCartItemDto) {
    return this.carts.updateItem(cartId, sessionId, productId, body.quantity);
  }

  @Delete(':cartId/items/:productId')
  removeItem(@Param('cartId') cartId: string, @Headers('x-cart-session') sessionId: string | undefined, @Param('productId') productId: string) {
    return this.carts.removeItem(cartId, sessionId, productId);
  }

  @Delete(':cartId/items')
  clear(@Param('cartId') cartId: string, @Headers('x-cart-session') sessionId: string | undefined) { return this.carts.clear(cartId, sessionId); }
}
