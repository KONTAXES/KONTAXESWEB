# Integración de Recurrente (pasarela de pagos) para Base44

Paquete listo para entregar al equipo/agente de **Base44** e integrar pagos de
**Recurrente** (Guatemala) en KONTAXES. Basado en la **documentación oficial** de
la API de Recurrente.

Cubre **dos flujos** (elige el que necesites, o ambos):

- 🌐 **Checkout online** — el cliente paga con tarjeta/QR **desde la página web**.
- 🏪 **Terminal POS** — envías el cobro a una **terminal física** de Recurrente.

## 📦 Contenido

| Archivo | Dónde va en Base44 | Flujo | Qué hace |
|---|---|---|---|
| `backend/createCheckout.js` | Backend Function | 🌐 Online | Crea el checkout y devuelve la `checkout_url` |
| `backend/terminalSessionCommand.js` | Backend Function | 🏪 POS | Envía un cobro a una terminal POS |
| `backend/recurrenteWebhook.js` | Backend Function | Ambos | Recibe la confirmación de pago y actualiza la orden |
| `frontend/RecurrentePayButton.tsx` | Componente React | 🌐 Online | Botón que inicia el pago y redirige a la pasarela |

## 🔑 Variables de entorno (Base44 → Settings → Environment)

| Variable | Ejemplo | Nota |
|---|---|---|
| `RECURRENTE_SECRET_KEY` | `sk_live_xxx` | **Solo backend.** Panel → Configuración → Llaves API |
| `RECURRENTE_WEBHOOK_SECRET` | `whsec_xxx` | Panel → Webhooks → Signing Secret |
| `SITE_URL` | `https://kontaxes.com` | Sin slash final |

> Usa llaves **TEST** (`sk_test_`) mientras integras y cambia a **producción**
> (`sk_live_`) al salir en vivo.

## ✅ Datos técnicos confirmados (API de Recurrente)

- **Base URL:** `https://app.recurrente.com/api`
- **Autenticación:** header `X-SECRET-KEY` en cada request (respuestas en JSON;
  los errores vienen en la key `error`).
- **Prueba de credenciales:** `GET /api/test` con tu `X-SECRET-KEY`.
- **Montos:** `amount_in_cents` (centavos). Mínimos: **GTQ = 500 (Q5.00)**,
  **USD = 100 ($1.00)**.
- **Webhooks:** firmados con esquema **Svix** (`svix-id`, `svix-timestamp`,
  `svix-signature`). Evento de pago: **`payment_intent.succeeded`**.
- **Docs oficiales:** https://docs.recurrente.com/ · Soporte: Discord / soporte@recurrente.com

## 🌐 Flujo 1 — Checkout online (web)

```
Cliente pulsa "Pagar"
        │
        ▼
Frontend (RecurrentePayButton)  ──POST──►  Backend (createCheckout)
                                                └─ POST /api/checkouts (items inline)
        ┌───────────────────────────────────────┘  └─ devuelve checkout_url
        ▼
window.location = checkout_url  ──►  Cliente paga en Recurrente
                                                │
                        Recurrente ──webhook──► Backend (recurrenteWebhook)
                                                │  verifica firma (Svix)
                                                └─ marca la orden como PAGADA
        ┌───────────────────────────────────────┘
        ▼
Redirección a SITE_URL/pago-exitoso
```

Ejemplo del request que hace `createCheckout` a Recurrente:

```json
POST /api/checkouts
{
  "items": [{ "name": "Plan Contabilidad", "amount_in_cents": 15000, "currency": "GTQ", "quantity": 1 }],
  "success_url": "https://kontaxes.com/pago-exitoso",
  "cancel_url": "https://kontaxes.com/pago-cancelado",
  "metadata": { "external_id": "ORD-001" }
}
```

## 🏪 Flujo 2 — Terminal POS

```
Tu sistema ──POST /api/terminal_session_commands──► Recurrente ──► Terminal POS
   { terminal_id, amount, currency, external_id }         (crea comando)   (cobra)
                        checkout_url + status pending
   Terminal (en "Modo espera") levanta el comando y muestra pantalla de cobro
                        Cliente paga con tarjeta
   Recurrente ──webhook payment_intent.succeeded──► tu Backend (recurrenteWebhook)
```

- La terminal debe estar en **"Modo espera"** (Dashboard → POS → terminal → Modo espera).
- El `terminal_id` se ve en Dashboard → POS → clic en la terminal.
- `external_id` da **idempotencia**: reintentar con el mismo id no duplica el cobro.
- Estados del comando: `pending → dispatched → consumed` (o `superseded` / `failed`).

## 🛠️ Pasos para el equipo de Base44

1. Crear las **funciones backend** con el contenido de los archivos `backend/*.js`
   (solo las del flujo que uses).
2. Configurar las **variables de entorno** de la tabla de arriba.
3. **Registrar el webhook** en el panel de Recurrente apuntando a la URL pública
   de la función `recurrenteWebhook`, y copiar el *Signing Secret* (`whsec_...`).
4. **(Online)** Agregar `RecurrentePayButton.tsx` donde se cobre, ajustando
   `BACKEND_URL` a la ruta real de la función (o usar el SDK:
   `base44.functions.createCheckout({...})`).
5. **Crear las páginas** `/pago-exitoso` y `/pago-cancelado`.
6. **Conectar el webhook con tus datos**: en `recurrenteWebhook.js`, en el bloque
   `payment_intent.succeeded`, actualizar la entidad de Órdenes/Pagos de Base44
   (marcar pagado, enviar correo, generar factura, etc.).

## 🧪 Pruebas (Sandbox)

- Usa llaves **TEST**. Tarjeta de prueba: **4242 4242 4242 4242**.
- Los checkouts TEST muestran aviso **"PRUEBA"**, tienen `live_mode = false`,
  **no** afectan el balance y **no** disparan webhooks.
- Para validar el webhook end-to-end, prueba en **producción** con montos
  mínimos y **reembolsa el mismo día** (`/api/refunds`, reembolso al 100%).

## 💳 Suscripciones / cobros recurrentes (opcional)

Recurrente soporta **facturación recurrente** (Suscripciones) vía Productos con
precios recurrentes. Si necesitas cobros mensuales/anuales automáticos en vez de
pago único, se agrega usando los endpoints de Productos + Suscripciones — avísame
y preparo esa variante.
