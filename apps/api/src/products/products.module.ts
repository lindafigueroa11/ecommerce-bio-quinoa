import { Module } from '@nestjs/common'; import { ProductsController } from './products.controller'; import { ProductsService } from './products.service'; import { PrismaService } from '../prisma.service'; import { CatalogSeed } from './catalog.seed';
@Module({ controllers: [ProductsController], providers: [ProductsService, PrismaService, CatalogSeed] }) export class ProductsModule {}
