# Checkout y órdenes

## Autenticación y propiedad

`POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` y la cancelación de Checkout usan `JwtAuthGuard`. La identidad se obtiene exclusivamente de `request.user.sub`; el frontend no envía `userId`. Las órdenes nuevas guardan esa identidad en `Order.userId`.

La cesta conserva `Cart.sessionId` y la cabecera `X-Cart-Session` durante este MVP. Por tanto, crear o cancelar un pedido requiere ambas garantías: JWT para el propietario y sesión de cesta para el carrito. `GET /api/orders` devuelve únicamente las órdenes del usuario autenticado; consultar una orden de otro usuario devuelve `404` (un administrador puede consultar una orden individual).

En frontend, `/checkout` requiere sesión. Un visitante se redirige a `/login?next=/checkout`; el token se almacena localmente y la cesta no se modifica durante login, registro o logout.

## Stripe Checkout

El endpoint `POST /api/orders` recibe `cartId`, `X-Cart-Session` y un token Bearer válido. Reconstruye el pedido desde PostgreSQL, crea una orden `PENDING` asociada al usuario y crea una Stripe Checkout Session alojada. El navegador recibe exclusivamente `checkoutUrl`; las claves de Stripe y los importes se mantienen en el backend.

El webhook es `POST /api/orders/webhooks/stripe`. Su firma se valida con `STRIPE_WEBHOOK_SECRET`. Para `checkout.session.completed` con `payment_status=paid`, compara el ID de sesión y `metadata.orderId` con la orden, descuenta inventario mediante una transacción serializable y marca la orden como `PAID`. La sesión y el identificador del evento se guardan con restricciones únicas; reenvíos del mismo evento no vuelven a descontar stock.

Una tarjeta rechazada emite `payment_intent.payment_failed`. Se registra su PaymentIntent, pero la orden continúa `PENDING` porque Stripe Checkout permite al cliente intentar otra tarjeta en esa misma sesión. En cambio, `checkout.session.expired` y `checkout.session.async_payment_failed` cambian una orden pendiente a `CANCELLED`, sin descontar stock.

Cuando el cliente pulsa volver desde Stripe, la página `/checkout/cancel` llama a `POST /api/orders/:orderId/cancel` con la sesión de su cesta. El servidor consulta la sesión real en Stripe y, si sigue abierta, la expira mediante la API de Stripe antes de marcar el pedido como `CANCELLED`. Por ello una simple visita de navegador no puede cancelar un pago ya completado; la confirmación de pago sigue siendo responsabilidad del webhook `checkout.session.completed`.

## Stock y pago

Crear una orden o Checkout Session la deja en `PENDING` y **no descuenta inventario**. El descuento definitivo ocurre solo con el webhook firmado que confirme el pago. Si falta stock durante esa confirmación, la transacción falla y la orden no pasa a `PAID`.

## Datos históricos

`OrderItem` guarda `productName`, `price` (en céntimos) y `quantity`; el subtotal se deriva de precio × cantidad. De este modo los cambios posteriores de nombre o precio del catálogo no alteran el resumen histórico. `Order.total` también se calcula en el backend y se guarda en céntimos.

## Prueba local de Stripe

1. Añade `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` al archivo `.env` local. Nunca los publiques.
2. Reinicia la API con `docker compose up -d --force-recreate api`.
3. Ejecuta `stripe listen --forward-to localhost:4000/api/orders/webhooks/stripe` y usa el secreto que muestra la CLI como `STRIPE_WEBHOOK_SECRET`.
4. Inicia el checkout desde `http://localhost:3000/checkout` y completa el pago con una tarjeta de prueba de Stripe.

El webhook marca la orden como `PAID`, descuenta cada producto una sola vez y elimina del carrito solo las cantidades confirmadas, conservando posibles productos añadidos posteriormente.
