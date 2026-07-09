/**
 * ============================================================================
 *  RECURRENTE · Función Backend: Crear Checkout online (sesión de pago web)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *  Basado en la documentación oficial de la API de Recurrente.
 *
 *  Qué hace:
 *   1. Recibe del frontend el/los ítem(s), monto y URLs de retorno.
 *   2. Crea un checkout en Recurrente con los ítems INLINE (un solo request).
 *   3. Devuelve la `checkout_url`.
 *   4. El frontend redirige al cliente a esa URL para pagar con tarjeta / QR.
 *
 *  IMPORTANTE — Seguridad:
 *   - El X-SECRET-KEY NUNCA debe estar en el frontend. Solo aquí, en el backend.
 *   - Variables de entorno en Base44 (Settings → Environment):
 *       RECURRENTE_SECRET_KEY = sk_live_xxx   (o sk_test_xxx en pruebas)
 *       SITE_URL              = https://tudominio.com   (sin slash final)
 *
 *  Montos:
 *   - `amount_in_cents` en centavos (ej. 15000 = Q150.00).
 *   - Mínimos por moneda: GTQ = 500 (Q5.00) · USD = 100 ($1.00).
 *
 *  Pruebas (Sandbox):
 *   - Usa llaves TEST (sk_test_...). Tarjeta de prueba: 4242 4242 4242 4242.
 *   - Los checkouts TEST muestran aviso "PRUEBA", tienen live_mode=false y
 *     NO disparan webhooks.
 * ============================================================================
 */

const RECURRENTE_API = "https://app.recurrente.com/api";

// Mínimos de monto por moneda (en centavos), según la documentación.
const MIN_CENTS = { GTQ: 500, USD: 100 };

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405, cors);
  }

  try {
    const body = await req.json();
    const {
      // Opción A: un solo cobro simple
      amount, // monto en unidades, ej. 150.00 (se convierte a centavos)
      amountInCents, // alternativa: monto ya en centavos, ej. 15000
      description = "Pago KONTAXES",
      quantity = 1,
      // Opción B: varios ítems (tiene prioridad si se envía)
      items, // [{ name, amountInCents|amount, currency, quantity }]
      currency = "GTQ",
      orderId,
      customer, // { name, email }
    } = body || {};

    // Construir la lista de items en el formato de Recurrente.
    let apiItems;
    if (Array.isArray(items) && items.length > 0) {
      apiItems = items.map((it) => ({
        name: it.name,
        amount_in_cents: toCents(it.amountInCents, it.amount),
        currency: it.currency || currency,
        quantity: it.quantity || 1,
      }));
    } else {
      const cents = toCents(amountInCents, amount);
      apiItems = [
        {
          name: description,
          amount_in_cents: cents,
          currency,
          quantity,
        },
      ];
    }

    // Validar mínimos por moneda.
    for (const it of apiItems) {
      const min = MIN_CENTS[it.currency] ?? 0;
      if (!it.amount_in_cents || it.amount_in_cents < min) {
        return json(
          {
            error: `Monto inválido para ${it.currency}: mínimo ${min} centavos`,
          },
          400,
          cors,
        );
      }
    }

    const site = Deno.env.get("SITE_URL") || "";

    const res = await fetch(`${RECURRENTE_API}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SECRET-KEY": Deno.env.get("RECURRENTE_SECRET_KEY"),
      },
      body: JSON.stringify({
        items: apiItems,
        success_url: `${site}/pago-exitoso?order=${orderId || ""}`,
        cancel_url: `${site}/pago-cancelado?order=${orderId || ""}`,
        // metadata te permite relacionar el pago con tu orden en el webhook.
        metadata: {
          order_id: orderId || "",
          external_id: orderId || "",
          customer_email: customer?.email || "",
          customer_name: customer?.name || "",
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Recurrente retorna el error bajo la key "error".
      throw new Error(
        `Recurrente /checkouts falló (${res.status}): ${
          data?.error || JSON.stringify(data)
        }`,
      );
    }

    return json(
      {
        id: data.id, // ej. "ch_xxx"
        checkoutUrl: data.checkout_url, // https://app.recurrente.com/checkout-session/ch_xxx
      },
      200,
      cors,
    );
  } catch (err) {
    console.error("[createCheckout] error:", err);
    return json({ error: String(err.message || err) }, 500, cors);
  }
});

/** Convierte a centavos (entero). Acepta centavos directos o unidades. */
function toCents(cents, units) {
  if (cents != null) return Math.round(Number(cents));
  if (units != null) return Math.round(Number(units) * 100);
  return 0;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
