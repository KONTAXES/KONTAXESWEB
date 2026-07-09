/**
 * ============================================================================
 *  PAGGO · Función Backend: Webhook (notificaciones en tiempo real)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *  Basado en la documentación oficial de Webhooks de Paggo.
 *
 *  Qué hace:
 *   - Recibe los eventos que Paggo envía cuando cambia el estado de un link:
 *       · LINK_PAYED_SUCCESS    → el cliente pagó exitosamente.
 *       · LINK_WRONG_PAYMENT    → pago fallido / link expirado / cancelado / rechazo.
 *       · LINK_REVERSED_SUCCESS → se revirtió (reembolsó) un pago.
 *   - Relaciona el evento con tu orden vía data.metadata.custom.orderId
 *     (el mismo objeto `custom` que enviaste al crear el link) o vía data.linkId.
 *
 *  Configuración en el panel de Paggo (Credenciales → Webhooks):
 *   1. Selecciona la API Key que emitirá los eventos.
 *   2. URL de Webhook: https://<tu-backend-base44>/paggoWebhook
 *   3. Selecciona los eventos (o todos) y activa el webhook.
 *
 *  Seguridad (Paggo NO firma con HMAC):
 *   - El evento trae `source.keyId` = ID de la llave que lo generó. Valida que
 *     coincida con el ID de TU llave (variable de entorno):
 *       PAGGO_WEBHOOK_KEY_ID = 6d69e6aa-....   (lo ves en el panel de Credenciales)
 *   - Defensa adicional recomendada: reconfirmar el estado con un GET al link
 *     (PAGGO_VERIFY_WITH_API=true + PAGGO_API_KEY). Así no dependes solo del POST.
 *
 *  Variables de entorno:
 *     PAGGO_WEBHOOK_KEY_ID   = <keyId esperado>        (recomendado)
 *     PAGGO_API_KEY          = <tu api key>            (para la reconfirmación)
 *     PAGGO_VERIFY_WITH_API  = "true" | "false"        (opcional)
 * ============================================================================
 */

const PAGGO_API = "https://api.paggoapp.com/api";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  try {
    const evt = await req.json();
    const type = evt.event;
    const data = evt.data || {};
    // El objeto `custom` puede venir en data.metadata.custom (pago exitoso/reverso)
    // o en metadata.custom a nivel raíz (LINK_WRONG_PAYMENT).
    const custom = data?.metadata?.custom || evt?.metadata?.custom || {};
    const orderId = custom.orderId;
    const linkId = data.linkId;

    // ---- 1) Validar el origen (source.keyId) --------------------------
    const expectedKeyId = Deno.env.get("PAGGO_WEBHOOK_KEY_ID");
    if (expectedKeyId && evt?.source?.keyId !== expectedKeyId) {
      console.warn(
        `[paggoWebhook] keyId inesperado: ${evt?.source?.keyId}`,
      );
      return new Response("No autorizado", { status: 401 });
    }

    console.log(
      `[paggoWebhook] evento=${type} link=${linkId} order=${orderId}`,
    );

    // ---- 2) (Opcional) Reconfirmar con la API -------------------------
    // Como no hay firma, opcionalmente verificamos el estado real del link.
    if (Deno.env.get("PAGGO_VERIFY_WITH_API") === "true" && linkId) {
      const ok = await confirmStatusViaApi(linkId, type);
      if (!ok) {
        console.warn(`[paggoWebhook] la API no confirma el evento ${type}`);
        return new Response("Estado no confirmado", { status: 409 });
      }
    }

    // ---- 3) Actuar según el evento ------------------------------------
    switch (type) {
      case "LINK_PAYED_SUCCESS": {
        const amount = data.amount;
        const paymentDate = data.paymentDate; // epoch ms
        // TODO (Base44): marca la orden como pagada.
        //   await base44.entities.Order.update(orderId, {
        //     status: "paid", paidAt: new Date(paymentDate), amount,
        //     paymentMethod: data.paymentMethod?.brand, last4: data.paymentMethod?.last4,
        //   });
        //   (opcional) guardar voucher con paggoLinks · action:"voucher".
        console.log(`[paggoWebhook] PAGO EXITOSO order=${orderId} monto=${amount}`);
        break;
      }

      case "LINK_WRONG_PAYMENT": {
        const errorMessage = data.errorMessage;
        // await base44.entities.Order.update(orderId, { status: "failed" });
        console.log(
          `[paggoWebhook] PAGO FALLIDO order=${orderId} motivo=${errorMessage}`,
        );
        break;
      }

      case "LINK_REVERSED_SUCCESS": {
        const reason = data.reversalReason;
        // await base44.entities.Order.update(orderId, { status: "reversed" });
        console.log(`[paggoWebhook] PAGO REVERTIDO order=${orderId} motivo=${reason}`);
        break;
      }

      default:
        console.log("[paggoWebhook] evento no manejado:", type);
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

/** Reconfirma el estado del link llamando a la API de Paggo. */
async function confirmStatusViaApi(linkId, eventType) {
  try {
    const res = await fetch(`${PAGGO_API}/center/transactions/links/${linkId}`, {
      headers: { "X-API-KEY": Deno.env.get("PAGGO_API_KEY") },
    });
    if (!res.ok) return false;
    const body = await res.json();
    const status = String(body?.result?.status || "").toLowerCase();
    if (eventType === "LINK_PAYED_SUCCESS") return status.includes("pagad");
    // Para otros eventos no bloqueamos por estado.
    return true;
  } catch {
    return false;
  }
}
