import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({ imports: [AuthModule], controllers: [OrdersController], providers: [OrdersService, PrismaService, StripeService] })
export class OrdersModule {}
