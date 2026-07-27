# Hoja de Ruta: Integración de Guías con 99 Envíos (19 Mayo 2026)

## 1. Persistencia del Código DANE en Firestore
**Objetivo:** Asegurar que el `codigoDane` del cliente se guarde en la base de datos al momento del checkout.
- Modificar el flujo de creación de pedido (checkout) para incluir el `codigoDane` (8 dígitos) dentro de los datos del cliente.
- Actualizar el modelo/tipo `Order` en `src/types/order.ts` para reflejar este nuevo campo, además de los campos necesarios para la guía (`guia99envios`, `transportadora99`).

## 2. Desarrollo de Endpoints API (Backend)
**Objetivo:** Crear rutas seguras para la comunicación con la API de 99 Envíos.
- **Ruta de Creación de Preenvío (`/api/envios/crear-guia`):** 
  - Endpoint que reciba los datos del pedido y ejecute la función `crearPreenvio` del servicio de 99 Envíos.
  - Deberá mapear el código DANE de 8 dígitos al formato de 5 dígitos (`idLocalidad`) requerido por el endpoint de pre-envío.
  - Actualizar el pedido en Firestore con el número de guía retornado.
- **Ruta de Generación de PDF (`/api/envios/pdf-guia`):**
  - Consumir el endpoint `POST /api/integration/v1/pdf/{tipo_pdf}` de 99 Envíos.
  - Manejar el flujo de datos para devolver el PDF al frontend. Tamaños disponibles comúnmente son estándar carta o sticker (10x15cm).

## 3. Actualización de Interfaz Administrativa (UI)
**Objetivo:** Permitir al administrador generar e imprimir las guías con un solo clic.
- Añadir un botón "Generar Guía 99 Envíos" en el modal de detalles del pedido.
- Una vez generada la guía, mostrar botones para descargar/imprimir en los formatos disponibles.
- Actualizar el estado del pedido en la interfaz para mostrar el número de guía asignado.

## 4. Pruebas y Validación
- Probar el flujo completo con pedidos de prueba: Checkout -> Admin -> Generar Guía -> Descargar PDF.
- Validar que los casos de cálculo de litros y galones sigan funcionando correctamente tras la persistencia del DANE.
- Asegurar el manejo de errores si la API de 99 Envíos falla o si faltan datos en el pedido.
