/**
 * ============================================================================
 *  PAGGO · Función Backend: Crear link de cobro
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *  Basado en la documentación oficial de Paggo API.
 *
 *  Qué hace:
 *   - Genera un LINK de cobro por un monto fijo. Paggo devuelve el id, la URL
 *     del link y su fecha de vencimiento, y lo envía por correo al cliente.
 *   - El link tiene vigencia de 3 días desde su creación.
 *   - Soporta `metadata`:
 *       · redirectUrl → a dónde se redirige al cliente tras pagar.
 *       · custom      → tus datos (ej. orderId) que REGRESAN en el webhook.
 *
 *  Seguridad:
 *   - El X-API-KEY NUNCA debe ir en el frontend. Solo aquí, en el backend.
 *   - Variables de entorno en Base44 (Settings → Environment):
 *       PAGGO_API_KEY = tu_api_key   (Panel de Paggo → Credenciales)
 *       SITE_URL      = https://tudominio.com   (sin slash final)
 *
 *  Confirmación del pago:
 *   - Configura el webhook (ver paggoWebhook.js) para recibir LINK_PAYED_SUCCESS.
 *   - Guarda el `id` que devuelve este endpoint junto a tu orden.
 * ============================================================================
 */

const PAGGO_API = "https://api.paggoapp.com/api";
const MIN_AMOUNT = 2; // Monto mínimo: Q2.00

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, cors);

  try {
    const body = await req.json();
    const {
      concept, // descripción / razón del cobro (requerido)
      amount, // monto en quetzales, ej. 150.00 (requerido, mínimo 2)
      customerName, // nombre del cliente
      email, // correo donde se enviará el link
      orderId, // tu id de orden → viaja en metadata.custom y vuelve en el webhook
      redirectUrl, // (opcional) a dónde redirigir tras el pago
      custom, // (opcional) objeto con datos extra (máx 20 claves / 1KB)
    } = body || {};

    // Validaciones.
    const faltan = [];
    if (!concept) faltan.push("concept");
    if (amount == null) faltan.push("amount");
    if (!customerName) faltan.push("customerName");
    if (!email) faltan.push("email");
    if (faltan.length) {
      return json({ error: `Campos requeridos: ${faltan.join(", ")}` }, 400, cors);
    }
    if (Number(amount) < MIN_AMOUNT) {
      return json({ error: `El monto mínimo es Q${MIN_AMOUNT.toFixed(2)}` }, 400, cors);
    }

    const site = Deno.env.get("SITE_URL") || "";

    // metadata.custom: tus datos de negocio que regresan en el webhook.
    const customData = { ...(custom || {}) };
    if (orderId) customData.orderId = orderId;

    const metadata = {};
    // redirectUrl explícito, o por defecto la página de éxito del sitio.
    metadata.redirectUrl = redirectUrl || (site ? `${site}/pago-exitoso` : undefined);
    if (Object.keys(customData).length) metadata.custom = customData;

    const res = await fetch(`${PAGGO_API}/center/transactions/create-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": Deno.env.get("PAGGO_API_KEY"),
      },
      body: JSON.stringify({
        concept,
        amount: Number(amount),
        customerName,
        email,
        metadata,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Paggo retorna el error en la key "error" (y "name").
      throw new Error(
        `Paggo create-link falló (${res.status}): ${
          data?.error || JSON.stringify(data)
        }`,
      );
    }

    // Respuesta: { message, result: { id, link, expirationDate } }
    return json(
      {
        id: data?.result?.id, // ← guárdalo junto a tu orden
        link: data?.result?.link,
        expirationDate: data?.result?.expirationDate,
      },
      200,
      cors,
    );
  } catch (err) {
    console.error("[paggoCreateLink] error:", err);
    return json({ error: String(err.message || err) }, 500, cors);
  }
});

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
