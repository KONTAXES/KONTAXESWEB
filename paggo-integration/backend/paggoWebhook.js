/**
 * ============================================================================
 *  PAGGO · Función Backend: Webhook (confirmación de pago)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *
 *  Qué hace:
 *   - Recibe la notificación que Paggo envía cuando un link cambia de estado
 *     (ej. cuando se paga). Verifica que la llamada sea legítima y actualiza
 *     tu orden (marcar como PAGADA, guardar voucher, etc.).
 *   - Con webhook YA NO necesitas hacer polling del estado del link.
 *
 *  Configuración en el panel de Paggo:
 *   - Registra la URL pública de esta función como tu Webhook URL, p. ej.:
 *       https://<tu-backend-base44>/paggoWebhook
 *
 *  Seguridad — [VERIFICAR] con Paggo cómo autentican el webhook:
 *   - Opción A (recomendada): Paggo permite configurar un secreto/token que
 *     envía en un header. Guarda ese valor como variable de entorno y compáralo:
 *       PAGGO_WEBHOOK_SECRET = <secreto que configures en Paggo>
 *       PAGGO_WEBHOOK_HEADER = x-paggo-signature   (nombre real del header)
 *   - Si Paggo reusa tu X-API-KEY o manda otro esquema (HMAC/firma), ajusta
 *     `verifyRequest()` según su documentación.
 *
 *  [VERIFICAR] el formato exacto del payload que envía Paggo. Este handler lee
 *   los campos de forma flexible (id/linkId, status, paymentDate, amount) para
 *   funcionar con la estructura de sus objetos de link.
 * ============================================================================
 */

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  // Cuerpo CRUDO (por si luego se necesita validar una firma HMAC).
  const rawBody = await req.text();

  try {
    // ---- 1) Verificación de origen -------------------------------------
    if (!verifyRequest(req)) {
      console.warn("[paggoWebhook] verificación fallida");
      return new Response("No autorizado", { status: 401 });
    }

    // ---- 2) Parseo flexible del payload --------------------------------
    const evt = JSON.parse(rawBody);
    // Paggo puede anidar la info en result/data o mandarla en la raíz.
    const p = evt.result || evt.data || evt;

    const linkId = p.id ?? p.linkId ?? evt.linkId;
    const rawStatus = String(p.status ?? evt.status ?? "").toLowerCase();
    const paymentDate = p.paymentDate ?? p.fechaRealizoPago ?? null;
    const amount = p.amount ?? p.monto ?? null;

    // Normaliza el estado a: paid | canceled | pending
    const status = rawStatus.includes("pagad")
      ? "paid"
      : rawStatus.includes("cancel")
        ? "canceled"
        : "pending";

    console.log(
      `[paggoWebhook] link=${linkId} status=${status} monto=${amount}`,
    );

    // ---- 3) Actúa según el estado --------------------------------------
    if (status === "paid") {
      // TODO (Base44): relaciona el linkId con tu orden y márcala pagada.
      //   const order = await base44.entities.Order.filter({ paggoLinkId: linkId });
      //   await base44.entities.Order.update(order.id, {
      //     status: "paid", paidAt: paymentDate, amount,
      //   });
      //   (opcional) descargar voucher con paggoLinks · action:"voucher".
      console.log(`[paggoWebhook] PAGO CONFIRMADO link=${linkId}`);
    } else if (status === "canceled") {
      // await base44.entities.Order.update(..., { status: "canceled" });
      console.log(`[paggoWebhook] link cancelado link=${linkId}`);
    }

    // Responde 200 rápido para que Paggo no reintente.
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[paggoWebhook] error:", err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/**
 * Verifica que la petición venga realmente de Paggo.
 * [VERIFICAR] Ajusta al esquema real de Paggo.
 * Por defecto: compara un secreto compartido enviado en un header configurable.
 * Si no configuras PAGGO_WEBHOOK_SECRET, deja pasar (útil solo en pruebas).
 */
function verifyRequest(req) {
  const secret = Deno.env.get("PAGGO_WEBHOOK_SECRET");
  if (!secret) return true; // ⚠️ sin secreto no hay validación (solo pruebas)

  const headerName =
    Deno.env.get("PAGGO_WEBHOOK_HEADER") || "x-paggo-signature";
  const received = req.headers.get(headerName);
  return received === secret;
}
