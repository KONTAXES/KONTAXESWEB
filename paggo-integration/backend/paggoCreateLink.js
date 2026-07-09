/**
 * ============================================================================
 *  PAGGO · Función Backend: Crear link de cobro
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *  Basado en la documentación oficial de Paggo API.
 *
 *  Qué hace:
 *   - Genera un LINK de cobro por un monto fijo. Paggo devuelve la URL del link
 *     y su fecha de vencimiento, y además lo envía por correo al cliente.
 *   - El link tiene vigencia de 3 días desde su creación.
 *
 *  Seguridad:
 *   - El X-API-KEY NUNCA debe ir en el frontend. Solo aquí, en el backend.
 *   - Variable de entorno en Base44 (Settings → Environment):
 *       PAGGO_API_KEY = tu_api_key   (Panel de Paggo → sección Credenciales)
 *
 *  Nota importante:
 *   - Paggo NO usa webhooks. Para confirmar el pago se consulta el estado del
 *     link (ver paggoLinks.js → action "get"), hasta que quede "pagado".
 * ============================================================================
 */

const PAGGO_API = "https://api.paggoapp.com/api";

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
      amount, // monto en quetzales, ej. 150.00 (requerido, number)
      customerName, // nombre del cliente (requerido)
      email, // correo donde se enviará el link (requerido)
    } = body || {};

    // Validaciones mínimas.
    const faltan = [];
    if (!concept) faltan.push("concept");
    if (amount == null || Number(amount) <= 0) faltan.push("amount");
    if (!customerName) faltan.push("customerName");
    if (!email) faltan.push("email");
    if (faltan.length) {
      return json({ error: `Campos requeridos: ${faltan.join(", ")}` }, 400, cors);
    }

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
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Paggo retorna el error en la key "error" (y a veces "name").
      throw new Error(
        `Paggo create-link falló (${res.status}): ${
          data?.error || JSON.stringify(data)
        }`,
      );
    }

    // Respuesta: { message, result: { link, expirationDate } }
    return json(
      {
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
