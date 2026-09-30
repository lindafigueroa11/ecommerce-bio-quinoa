import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto } from './admin-products.dto';
import { ProductsService } from './products.service';

const uploadsPath = process.env.UPLOADS_PATH ?? join(process.cwd(), 'apps/web/public/uploads');
const imageStorage = diskStorage({
  destination: uploadsPath,
  filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
});

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get() findAll() { return this.products.findAll(); }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() { return this.products.findAllAdmin(); }

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() body: CreateProductDto) { return this.products.create(body); }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() body: UpdateProductDto) { return this.products.update(id, body); }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deactivate(@Param('id') id: string) { return this.products.deactivate(id); }

  @Post('admin/upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file', { storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_request, file, callback) => callback(file.mimetype.startsWith('image/') ? null : new BadRequestException('Only image files are accepted'), file.mimetype.startsWith('image/')) }))
  upload(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) return { message: 'Select an image file' };
    const publicApiUrl = process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
    return { imageUrl: `${publicApiUrl}/uploads/${file.filename}` };
  }

  @Get(':slug') findBySlug(@Param('slug') slug: string) { return this.products.findBySlug(slug); }
}
