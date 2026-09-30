import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const stockThreshold = 5;
    const [products, activeProducts, orders, lowStockProducts, sales] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.order.count(),
      this.prisma.product.count({ where: { active: true, inventory: { lte: stockThreshold } } }),
      this.prisma.order.groupBy({ by: ['currency'], where: { status: OrderStatus.PAID }, _sum: { total: true }, orderBy: { currency: 'asc' } }),
    ]);

    return {
      orders,
      products,
      activeProducts,
      lowStockProducts,
      stockThreshold,
      sales: sales.map(sale => ({ currency: sale.currency, total: sale._sum?.total ?? 0 })),
    };
  }
}
