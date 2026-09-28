# Raíz ecommerce

Monorepo inicial para la migración de la tienda orgánica a una arquitectura escalable.

| App | Stack | Puerto |
| --- | --- | --- |
| `apps/web` | Next.js, React, TypeScript, Tailwind | 3000 |
| `apps/api` | NestJS, Prisma, PostgreSQL, JWT | 4000 |

## Arranque local

1. Copia `.env.example` como `.env` y completa los valores.
2. Inicia PostgreSQL y Redis: `docker compose up -d`.
3. Instala dependencias: `npm install`.
4. Genera Prisma y aplica la base: `npm run db:generate` y `npm run db:migrate`.
5. Ejecuta `npm run dev:api` y `npm run dev:web` en terminales separadas.

Las credenciales de Stripe, Cloudinary, Redis y Supabase no están incluidas: se resuelven mediante variables de entorno en los despliegues.
