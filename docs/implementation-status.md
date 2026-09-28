# Estado de implementación

## Implementado

- Monorepo npm con `apps/web` y `apps/api`.
- Frontend: Next.js App Router, React, TypeScript y Tailwind.
- API: NestJS con CORS, validación global y recurso de productos.
- Datos: modelo Prisma para usuarios, productos, carritos, pedidos e inventario en PostgreSQL.
- Infraestructura local: PostgreSQL y Redis en Docker Compose.
- Configuración por entorno para Supabase PostgreSQL, JWT, Stripe, Cloudinary y Redis.

## Próximas integraciones

- Módulos Nest para registro/login, JWT de acceso y refresh tokens.
- Endpoints protegidos de carrito y pedido, persistidos mediante Prisma.
- Stripe Payment Intents y webhook validado.
- Adaptador de imágenes Cloudinary/S3.
- Cliente Redis para caché y límites de operación.
- Variables de producción y despliegue: Vercel (web), Render/Railway (API), Supabase (DB).

Los servicios externos requieren que se proporcionen sus credenciales y URL de cada entorno.
