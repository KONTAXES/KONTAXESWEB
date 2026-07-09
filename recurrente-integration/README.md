# Integración de Recurrente (pasarela de pagos) para Base44

Paquete listo para entregar al equipo/agente de **Base44** e integrar pagos con
tarjeta y QR de **Recurrente** (Guatemala) en el sitio de KONTAXES.

## 📦 Contenido

| Archivo | Dónde va en Base44 | Qué hace |
|---|---|---|
| `backend/createCheckout.js` | Backend Function | Crea la sesión de pago y devuelve la `checkout_url` |
| `backend/recurrenteWebhook.js` | Backend Function | Recibe la confirmación de pago de Recurrente y actualiza la orden |
| `frontend/RecurrentePayButton.tsx` | Componente React | Botón que inicia el pago y redirige a la pasarela |

## 🔑 Variables de entorno (Base44 → Settings → Environment)

| Variable | Ejemplo | Nota |
|---|---|---|
| `RECURRENTE_PUBLIC_KEY` | `pk_live_xxx` | Panel de Recurrente → Configuración → API Keys |
| `RECURRENTE_SECRET_KEY` | `sk_live_xxx` | **Solo backend. Nunca en el frontend.** |
| `RECURRENTE_WEBHOOK_SECRET` | `whsec_xxx` | Panel → Webhooks → Signing Secret |
| `SITE_URL` | `https://kontaxes.com` | Sin slash final |

> Usa las llaves de **prueba** (`pk_test_` / `sk_test_`) mientras integras y cambia
> a las de **producción** al salir en vivo.

## 🔄 Flujo del pago

```
Cliente pulsa "Pagar"
        │
        ▼
Frontend (RecurrentePayButton)  ──POST──►  Backend (createCheckout)
                                                │
                                                ├─ POST /products   (crea producto+precio)
                                                └─ POST /checkouts   (devuelve checkout_url)
        ┌───────────────────────────────────────┘
        ▼
window.location = checkout_url  ──►  Cliente paga en Recurrente
                                                │
                                                ▼
                        Recurrente ──webhook──► Backend (recurrenteWebhook)
                                                │  verifica firma (Svix)
                                                └─ marca la orden como PAGADA
        ┌───────────────────────────────────────┘
        ▼
Redirección a SITE_URL/pago-exitoso
```

## 🛠️ Pasos para el equipo de Base44

1. **Crear la función backend** `createCheckout` con el contenido de
   `backend/createCheckout.js`.
2. **Crear la función backend** `recurrenteWebhook` con
   `backend/recurrenteWebhook.js`.
3. **Configurar las variables de entorno** de la tabla de arriba.
4. **Registrar el webhook** en el panel de Recurrente apuntando a la URL pública
   de la función `recurrenteWebhook`, y copiar el *Signing Secret*.
5. **Agregar el componente** `RecurrentePayButton.tsx` donde se cobre, ajustando
   `BACKEND_URL` a la ruta real de la función en Base44 (o usando el SDK:
   `base44.functions.createCheckout({...})`).
6. **Crear las páginas** `/pago-exitoso` y `/pago-cancelado` (pantallas de
   confirmación / cancelación).
7. **Conectar el webhook con tus datos**: en `recurrenteWebhook.js`, en el bloque
   `payment_intent.succeeded`, actualizar la entidad de Órdenes/Pagos de Base44
   (marcar como pagado, enviar correo, generar factura, etc.).

## ✅ Datos técnicos de la API de Recurrente

- **Base URL:** `https://app.recurrente.com/api`
- **Autenticación (headers en cada request):** `X-PUBLIC-KEY` y `X-SECRET-KEY`
- **Respuestas:** JSON
- **Webhooks:** firmados con el esquema **Svix**
  (`svix-id`, `svix-timestamp`, `svix-signature`)
- **Docs oficiales:** https://docs.recurrente.com/ · Panel → API Keys → "Ver Docs"

## ⚠️ Antes de producción — verificar en el panel

Como la documentación viva requiere login, confirma estos detalles exactos en el
panel de Recurrente (Configuración → API Keys / Webhooks → Documentación):

- [ ] Nombre exacto del campo de precio (`amount_as_decimal` vs `amount_in_cents`)
      y de `charge_type` (`one_time` / `recurring`) en `POST /products`.
- [ ] Campo del `price_id` en la respuesta de `POST /products`.
- [ ] Nombre exacto del evento de pago exitoso en el webhook
      (p. ej. `payment_intent.succeeded`).
- [ ] Prueba end-to-end con llaves `test` antes de usar `live`.

Los archivos están marcados con `[VERIFICAR]` en los puntos exactos a confirmar.

## 💳 Suscripciones / cobros recurrentes (opcional)

Recurrente soporta cobros periódicos. Para ello, en `createCheckout.js` cambia en
`prices_attributes` el `charge_type` a `"recurring"` y agrega el intervalo de
cobro (mensual/anual) según lo indique la documentación del panel. El resto del
flujo (checkout + webhook) es el mismo.
