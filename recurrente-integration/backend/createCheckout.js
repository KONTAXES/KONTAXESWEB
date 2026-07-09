/**
 * ============================================================================
 *  RECURRENTE · Función Backend: Crear Checkout (sesión de pago)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *
 *  Qué hace:
 *   1. Recibe del frontend el monto, la descripción y (opcional) datos del cliente.
 *   2. Crea un "producto" con su precio en Recurrente.
 *   3. Crea un "checkout" y devuelve la `checkout_url`.
 *   4. El frontend redirige al cliente a esa URL para pagar con tarjeta / QR.
 *
 *  IMPORTANTE — Seguridad:
 *   - El X-SECRET-KEY NUNCA debe estar en el frontend. Solo aquí, en el backend.
 *   - Configura estas variables de entorno en Base44 (Settings → Environment):
 *       RECURRENTE_PUBLIC_KEY   = pk_live_xxx   (o pk_test_xxx en pruebas)
 *       RECURRENTE_SECRET_KEY   = sk_live_xxx   (o sk_test_xxx en pruebas)
 *       SITE_URL                = https://tudominio.com   (sin slash final)
 *
 *  ⚠️ Verifica en tu panel de Recurrente (Configuración → API Keys → "Ver Docs")
 *      los nombres EXACTOS de campos marcados con [VERIFICAR]. La estructura de
 *      abajo es la estándar documentada por Recurrente; solo cambian detalles de
 *      naming entre versiones.
 * ============================================================================
 */

const RECURRENTE_API = "https://app.recurrente.com/api";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-PUBLIC-KEY": Deno.env.get("RECURRENTE_PUBLIC_KEY"),
    "X-SECRET-KEY": Deno.env.get("RECURRENTE_SECRET_KEY"),
  };
}

/**
 * Crea un producto con un precio único (one_time) en Recurrente.
 * Devuelve el price_id que luego usa el checkout.
 */
async function createProduct({ name, description, amount, currency }) {
  const res = await fetch(`${RECURRENTE_API}/products`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      product: {
        name,
        description: description || name,
        // [VERIFICAR] Recurrente acepta el monto como decimal en string.
        // charge_type: "one_time" para pago único | "recurring" para suscripción.
        prices_attributes: [
          {
            charge_type: "one_time",
            amount_as_decimal: Number(amount).toFixed(2),
            currency: currency || "GTQ",
          },
        ],
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Recurrente /products falló (${res.status}): ${JSON.stringify(data)}`,
    );
  }

  // La respuesta trae el producto y su lista de precios.
  const priceId =
    data?.prices?.[0]?.id || data?.price?.id || data?.default_price_id;
  if (!priceId) {
    throw new Error(
      `No se encontró price_id en la respuesta: ${JSON.stringify(data)}`,
    );
  }
  return priceId;
}

/**
 * Crea el checkout a partir del price_id y devuelve la URL de pago.
 */
async function createCheckout({ priceId, successUrl, cancelUrl, metadata }) {
  const res = await fetch(`${RECURRENTE_API}/checkouts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Recurrente /checkouts falló (${res.status}): ${JSON.stringify(data)}`,
    );
  }

  return {
    id: data.id, // ej. "ch_xxx"
    checkoutUrl: data.checkout_url, // ej. https://app.recurrente.com/checkout-session/ch_xxx
  };
}

/**
 * Handler HTTP de Base44 (Deno.serve).
 * Espera un POST con JSON: { amount, description, currency?, orderId?, customer? }
 */
Deno.serve(async (req) => {
  // CORS básico (ajusta el origin a tu dominio en producción).
  const cors = {
    "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      amount,
      description,
      currency = "GTQ",
      orderId,
      customer,
    } = body || {};

    if (!amount || Number(amount) <= 0) {
      return new Response(
        JSON.stringify({ error: "El campo 'amount' es requerido y > 0" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const site = Deno.env.get("SITE_URL") || "";

    const priceId = await createProduct({
      name: description || "Pago KONTAXES",
      description,
      amount,
      currency,
    });

    const checkout = await createCheckout({
      priceId,
      successUrl: `${site}/pago-exitoso?order=${orderId || ""}`,
      cancelUrl: `${site}/pago-cancelado?order=${orderId || ""}`,
      metadata: {
        order_id: orderId || "",
        customer_email: customer?.email || "",
        customer_name: customer?.name || "",
      },
    });

    return new Response(JSON.stringify(checkout), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[createCheckout] error:", err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
