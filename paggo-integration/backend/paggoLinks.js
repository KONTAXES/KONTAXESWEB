/**
 * ============================================================================
 *  PAGGO · Función Backend: Consultar y gestionar links de cobro
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *
 *  Una sola función que cubre las operaciones de lectura/gestión de la API de
 *  Paggo, seleccionadas por el campo "action" del cuerpo:
 *
 *    action: "list"     → GET  /center/transactions/links            (lista)
 *    action: "get"      → GET  /center/transactions/links/:id        (estado)
 *    action: "voucher"  → GET  /center/transactions/links/:id/voucher (PDF)
 *    action: "cancel"   → POST /center/transactions/links/:id/cancel  (cancelar)
 *
 *  Uso típico:
 *   - "get": consulta el estado de un link para saber si ya fue "pagado"
 *     (Paggo no tiene webhooks, así que se confirma por consulta/polling).
 *   - "voucher": obtiene la URL de descarga del comprobante (solo si está pagado).
 *   - "cancel": cancela un link que aún esté "pendiente".
 *
 *  Variable de entorno en Base44:
 *     PAGGO_API_KEY = tu_api_key
 * ============================================================================
 */

const PAGGO_API = "https://api.paggoapp.com/api";

function apiHeaders() {
  return { "X-API-KEY": Deno.env.get("PAGGO_API_KEY") };
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, cors);

  try {
    const { action, linkId } = (await req.json()) || {};

    switch (action) {
      case "list": {
        const r = await fetch(`${PAGGO_API}/center/transactions/links`, {
          headers: apiHeaders(),
        });
        return passthrough(r, cors);
      }

      case "get": {
        if (!linkId) return json({ error: "'linkId' es requerido" }, 400, cors);
        const r = await fetch(
          `${PAGGO_API}/center/transactions/links/${linkId}`,
          { headers: apiHeaders() },
        );
        // result: { id, name, status, date, expirationDate, paymentDate, amount, link }
        return passthrough(r, cors);
      }

      case "voucher": {
        if (!linkId) return json({ error: "'linkId' es requerido" }, 400, cors);
        const r = await fetch(
          `${PAGGO_API}/center/transactions/links/${linkId}/voucher`,
          { headers: apiHeaders() },
        );
        // result: { url, expiresAt }  (solo si el link está pagado)
        return passthrough(r, cors);
      }

      case "cancel": {
        if (!linkId) return json({ error: "'linkId' es requerido" }, 400, cors);
        const r = await fetch(
          `${PAGGO_API}/center/transactions/links/${linkId}/cancel`,
          { method: "POST", headers: apiHeaders() },
        );
        return passthrough(r, cors);
      }

      default:
        return json(
          { error: "action inválida. Usa: list | get | voucher | cancel" },
          400,
          cors,
        );
    }
  } catch (err) {
    console.error("[paggoLinks] error:", err);
    return json({ error: String(err.message || err) }, 500, cors);
  }
});

/** Reenvía la respuesta de Paggo (mismo status + JSON) al cliente. */
async function passthrough(res, cors) {
  const data = await res.json().catch(() => ({}));
  return json(data, res.status, cors);
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
