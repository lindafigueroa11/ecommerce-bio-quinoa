import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateProductDto, UpdateProductDto } from './admin-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() { return this.prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } }); }

  findAllAdmin() { return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } }); }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product || !product.active) throw new NotFoundException('Product not found');
    return product;
  }

  async create(input: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data: { ...input, slug: input.slug.trim().toLowerCase(), currency: input.currency.toUpperCase(), active: input.active ?? true } });
    } catch (error) {
      this.throwConflictForDuplicateSlug(error);
      throw error;
    }
  }

  async update(id: string, input: UpdateProductDto) {
    try {
      return await this.prisma.product.update({ data: { ...input, slug: input.slug?.trim().toLowerCase(), currency: input.currency?.toUpperCase() }, where: { id } });
    } catch (error) {
      this.throwConflictForDuplicateSlug(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Product not found');
      throw error;
    }
  }

  deactivate(id: string) { return this.update(id, { active: false }); }

  private throwConflictForDuplicateSlug(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A product already uses this slug');
  }
}
