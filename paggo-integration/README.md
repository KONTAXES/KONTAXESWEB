# Integración de Paggo (links de cobro) para Base44

Paquete listo para entregar al equipo/agente de **Base44** e integrar cobros con
**Paggo** en KONTAXES. Basado en la **documentación oficial** de Paggo API
(incluye Webhooks, metadata y redirección).

Paggo funciona con **links de cobro**: generas un link por un monto fijo, Paggo
lo envía por correo al cliente y devuelve la URL para que pague. El link vence a
los **3 días**. La confirmación del pago llega por **webhook**.

## 📦 Contenido

| Archivo | Dónde va en Base44 | Qué hace |
|---|---|---|
| `backend/paggoCreateLink.js` | Backend Function | Genera un link de cobro → devuelve `id`, `link`, `expirationDate` |
| `backend/paggoWebhook.js` | Backend Function | **Recibe la confirmación de pago** (LINK_PAYED_SUCCESS y otros) |
| `backend/paggoLinks.js` | Backend Function | Consulta/gestiona links: `list`, `get`, `voucher`, `cancel` |
| `frontend/PaggoPayButton.tsx` | Componente React | Botón que genera el link y redirige a pagar |

## 🔑 Variables de entorno (Base44 → Settings → Environment)

| Variable | Ejemplo | Nota |
|---|---|---|
| `PAGGO_API_KEY` | `••••••` | **Solo backend.** Panel de Paggo → Credenciales |
| `PAGGO_WEBHOOK_KEY_ID` | `6d69e6aa-...` | ID de la llave que emite los webhooks (valida el origen) |
| `PAGGO_VERIFY_WITH_API` | `true` | (Opcional) reconfirmar el pago con un GET al link |
| `SITE_URL` | `https://kontaxes.com` | Sin slash final (CORS + redirect por defecto) |

## ✅ Datos técnicos (Paggo API)

- **Base URL:** `https://api.paggoapp.com/api`
- **Autenticación:** header **`X-API-KEY`** (o query param). Respuestas en JSON;
  errores en la key `error` + `name`, con un `transactionId` para trazabilidad.
- **Validar credenciales:** `POST /center/transactions/welcome`.
- **Montos:** número en **quetzales**, **mínimo Q2.00** (ej. `amount: 150`).
- **Vigencia del link:** 3 días.
- **Metadata:** al crear el link puedes enviar `metadata.custom` (hasta 20 claves
  / 1KB) — esos datos (ej. `orderId`) **regresan en el webhook**. Y
  `metadata.redirectUrl` para redirigir al cliente tras pagar.

## 🔄 Flujo del pago (con webhook)

```
Cliente pulsa "Pagar"
        │
        ▼
Frontend (PaggoPayButton)  ──POST──►  Backend (paggoCreateLink)
                                          └─ POST /create-link (+ metadata.custom.orderId)
        ┌─────────────────────────────────┘  └─ devuelve { id, link, expirationDate }
        ▼                                        (Paggo también envía el link por correo)
window.location = link  ──►  Cliente paga en Paggo
        │
        ▼
Paggo ──webhook LINK_PAYED_SUCCESS──► Backend (paggoWebhook)
        │  valida source.keyId  (opcional: reconfirma con GET al link)
        └─ marca la orden como PAGADA usando data.metadata.custom.orderId
        │
        ▼
Cliente es redirigido a metadata.redirectUrl (/pago-exitoso)
```

## 🔔 Webhooks — eventos disponibles

| Evento | Cuándo | Acción sugerida |
|---|---|---|
| `LINK_PAYED_SUCCESS` | El cliente pagó exitosamente | Marcar orden PAGADA |
| `LINK_WRONG_PAYMENT` | Pago fallido / link expirado / cancelado / rechazo | Marcar FALLIDO |
| `LINK_REVERSED_SUCCESS` | Se revirtió/reembolsó un pago | Marcar REVERTIDO |

**Estructura del payload** (ejemplo `LINK_PAYED_SUCCESS`):

```json
{
  "event": "LINK_PAYED_SUCCESS",
  "timestamp": 1744317667806,
  "source": { "keyId": "6d69e6aa-...", "keyName": "Demo webhooks" },
  "data": {
    "linkId": 102384,
    "hash": "IQIQERPLUW",
    "amount": "850.00",
    "currency": "GTQ",
    "paymentDate": 1744317663000,
    "paymentMethod": { "type": "", "last4": "9305", "brand": "VISA" },
    "customer": { "name": "Juanito Perez", "email": "...", "nit": "84733333" },
    "metadata": {
      "authorizationNumber": "000023",
      "responseCode": "00",
      "custom": { "orderId": "ORD-2025-001", "userId": "user_12345" }
    }
  }
}
```

> 🔐 **Seguridad:** Paggo **no firma** los webhooks con HMAC. La validación posible
> es comparar `source.keyId` contra el ID de tu llave (`PAGGO_WEBHOOK_KEY_ID`).
> Como refuerzo, `paggoWebhook.js` puede **reconfirmar el estado** con un GET al
> link (`PAGGO_VERIFY_WITH_API=true`) — recomendado en producción.

## 🧾 Endpoints cubiertos

| Operación | Función / action | Endpoint Paggo |
|---|---|---|
| Crear link | `paggoCreateLink` | `POST /center/transactions/create-link` |
| Listar links | `paggoLinks` · `list` | `GET /center/transactions/links` |
| Estado de un link | `paggoLinks` · `get` | `GET /center/transactions/links/:id` |
| Voucher (PDF) | `paggoLinks` · `voucher` | `GET /center/transactions/links/:id/voucher` |
| Cancelar link | `paggoLinks` · `cancel` | `POST /center/transactions/links/:id/cancel` |

Estados de un link: `pendiente`, `pagado`, `cancelado` (y vencido por fecha).

## 🔀 Redirección post-pago

Dos formas (la del link tiene prioridad):

1. **Global:** Panel → Credenciales → Redirección Post-Pago → activar y poner la URL.
2. **Por link (recomendada):** enviar `metadata.redirectUrl` al crear el link.
   `paggoCreateLink.js` ya la incluye (usa `redirectUrl` o `SITE_URL/pago-exitoso`).

## 🛠️ Pasos para el equipo de Base44

1. Crear las **funciones backend** `paggoCreateLink`, `paggoWebhook` y `paggoLinks`.
2. Configurar las **variables de entorno** de la tabla de arriba.
3. **Registrar el webhook** en Paggo (Credenciales → Webhooks): elegir la key,
   poner la URL pública de `paggoWebhook`, seleccionar los eventos y activarlo.
   Copiar el `keyId` de esa llave a `PAGGO_WEBHOOK_KEY_ID`.
4. Agregar `PaggoPayButton.tsx` donde se cobre (ajustar `BACKEND_URL` o usar el
   SDK `base44.functions.paggoCreateLink({...})`), pasando `orderId`.
5. En `paggoWebhook.js`, en `LINK_PAYED_SUCCESS`, actualizar la entidad de
   Órdenes/Pagos usando `data.metadata.custom.orderId`.
6. Crear la página `/pago-exitoso` (destino de la redirección).

## 🧪 Notas

- **Guarda el `id` y el `orderId`** del link junto a tu orden: el `id` para
  consultar estado/voucher/cancelar; el `orderId` para reconciliar el webhook.
- `cancel` solo funciona si el link está `pendiente`; `voucher` solo si está `pagado`.
- El `paggoLinks · get` sirve como respaldo/reconciliación si un webhook se pierde.
