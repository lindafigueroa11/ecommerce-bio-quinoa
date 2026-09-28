# Checkout y órdenes

## Estrategia actual

El proyecto no contiene aún módulo de autenticación, estrategia JWT ni guards activos. Por ello las cestas y los pedidos de esta etapa son anónimos y se protegen con el `Cart.sessionId` existente: el navegador conserva ese valor opaco y lo entrega en la cabecera `X-Cart-Session`. Un identificador de carrito por sí solo no permite leerlo, modificarlo ni leer su pedido.

Cuando se implemente JWT, el pedido deberá asociarse al `User` autenticado y los endpoints deberán reemplazar esta comprobación de sesión por un guard que valide el propietario. No se afirma compatibilidad de usuario A/B mientras ese módulo no exista.

## Stock y pago

Crear una orden la deja en `PENDING` y **no descuenta inventario**. Sin un pago confirmado no se debe consumir stock definitivamente: el descuento o una reserva explícita será parte de la futura integración de pagos. Esto evita tratar una orden pendiente como venta pagada.

## Datos históricos

`OrderItem` guarda `productName`, `price` (en céntimos) y `quantity`; el subtotal se deriva de precio × cantidad. De este modo los cambios posteriores de nombre o precio del catálogo no alteran el resumen histórico. `Order.total` también se calcula en el backend y se guarda en céntimos.
