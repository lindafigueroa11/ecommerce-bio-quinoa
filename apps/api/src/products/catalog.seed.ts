import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CatalogSeed implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const catalog = [
      { slug: 'white-quinoa', name: 'White Quinoa', description: 'A light and versatile white quinoa from the Peruvian Andes, naturally rich in plant-based protein, fibre, and essential nutrients.', price: 690, imageUrl: '/images/quinoa-white.png', category: 'Peruvian quinoa', inventory: 60, active: true },
      { slug: 'red-quinoa', name: 'Red Quinoa', description: 'A hearty red quinoa grown in Peru, with a nutty flavour and a firm texture for colourful European meals.', price: 790, imageUrl: '/images/quinoa-red.png', category: 'Peruvian quinoa', inventory: 45, active: true },
      { slug: 'black-quinoa', name: 'Black Quinoa', description: 'A bold, mineral-rich black quinoa from Peru, selected for European kitchens that value flavour and provenance.', price: 850, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', category: 'Peruvian quinoa', inventory: 40, active: true },
    ];
    await Promise.all(catalog.map(product => this.prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product })));
    await this.prisma.product.updateMany({ where: { slug: { in: ['manzanas-gala', 'miel-romero'] } }, data: { active: false } });
  }
}
