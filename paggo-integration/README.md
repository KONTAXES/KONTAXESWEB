# Integración de Paggo (links de cobro) para Base44

Paquete listo para entregar al equipo/agente de **Base44** e integrar cobros con
**Paggo** en KONTAXES. Basado en la **documentación oficial** de Paggo API.

Paggo funciona con **links de cobro**: generas un link por un monto fijo, Paggo
lo envía por correo al cliente y devuelve la URL para que pague. El link vence a
los **3 días**.

## 📦 Contenido

| Archivo | Dónde va en Base44 | Qué hace |
|---|---|---|
| `backend/paggoCreateLink.js` | Backend Function | Genera un link de cobro → devuelve `link` + `expirationDate` |
| `backend/paggoLinks.js` | Backend Function | Consulta/gestiona links: `list`, `get` (estado), `voucher`, `cancel` |
| `frontend/PaggoPayButton.tsx` | Componente React | Botón que genera el link y redirige a pagar |

## 🔑 Variables de entorno (Base44 → Settings → Environment)

| Variable | Ejemplo | Nota |
|---|---|---|
| `PAGGO_API_KEY` | `••••••` | **Solo backend.** Panel de Paggo → sección Credenciales |
| `SITE_URL` | `https://kontaxes.com` | Sin slash final (para CORS) |

## ✅ Datos técnicos (Paggo API)

- **Base URL:** `https://api.paggoapp.com/api`
- **Autenticación:** header **`X-API-KEY`** (o query param). Respuestas en JSON.
- **Validar credenciales:** `POST /center/transactions/welcome`.
- **Montos:** número en **quetzales** (ej. `amount: 150` = Q150.00).
- **Vigencia del link:** 3 días.
- **⚠️ Sin webhooks:** la confirmación del pago se hace **consultando el estado**
  del link (`action: "get"`), hasta que `status` sea `"pagado"`.

## 🔄 Flujo del pago

```
Cliente pulsa "Pagar"
        │
        ▼
Frontend (PaggoPayButton)  ──POST──►  Backend (paggoCreateLink)
                                          └─ POST /center/transactions/create-link
        ┌─────────────────────────────────┘  └─ devuelve { link, expirationDate }
        ▼                                        (Paggo también envía el link por correo)
window.location = link  ──►  Cliente paga en Paggo
        │
        ▼   (como NO hay webhook, se confirma consultando el estado)
Backend (paggoLinks · action:"get") ──► status: "pendiente" → "pagado"
        │
        └─ status "pagado": marca la orden como PAGADA + descarga voucher (opcional)
```

## 🧾 Endpoints cubiertos

| Operación | Función / action | Endpoint Paggo |
|---|---|---|
| Crear link | `paggoCreateLink` | `POST /center/transactions/create-link` |
| Listar links | `paggoLinks` · `list` | `GET /center/transactions/links` |
| Estado de un link | `paggoLinks` · `get` | `GET /center/transactions/links/:id` |
| Voucher (PDF) | `paggoLinks` · `voucher` | `GET /center/transactions/links/:id/voucher` |
| Cancelar link | `paggoLinks` · `cancel` | `POST /center/transactions/links/:id/cancel` |

Estados posibles de un link: `pendiente`, `pagado`, `cancelado` (y vencido por fecha).

## 🛠️ Pasos para el equipo de Base44

1. Crear las **funciones backend** `paggoCreateLink` y `paggoLinks`.
2. Configurar la variable **`PAGGO_API_KEY`** (y `SITE_URL`).
3. Agregar `PaggoPayButton.tsx` donde se cobre (ajustar `BACKEND_URL` o usar el
   SDK `base44.functions.paggoCreateLink({...})`).
4. **Confirmación de pago (importante, no hay webhook):** implementar la
   consulta de estado. Dos opciones:
   - **Polling programado**: una tarea/cron en Base44 que cada X minutos llame a
     `paggoLinks` · `get` para los links `pendiente` y actualice la orden cuando
     pasen a `pagado`.
   - **Consulta on-demand**: al volver el cliente al sitio, consultar el estado
     del link antes de mostrar "pago confirmado".
5. **(Opcional)** Al detectar `pagado`, usar `paggoLinks` · `voucher` para
   guardar/mostrar el comprobante PDF.

## 🧪 Notas

- Guarda el `id` del link que devuelve Paggo (aparece en `list`/`get`) junto a tu
  orden para poder consultar su estado luego.
- `cancel` solo funciona si el link está `pendiente` (no pagado ni cancelado).
- `voucher` solo funciona si el link está `pagado`.
