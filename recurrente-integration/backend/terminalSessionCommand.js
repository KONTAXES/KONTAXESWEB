/**
 * ============================================================================
 *  RECURRENTE · Función Backend: Terminal Session Command (cobro en POS físico)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *  Basado en la documentación oficial: "Terminal Sessions".
 *
 *  Qué hace:
 *   - Envía un cobro a una TERMINAL POS física de Recurrente. La terminal debe
 *     estar en "Modo espera". Tu sistema manda el monto y la terminal muestra
 *     automáticamente la pantalla de cobro para que el cliente pague con tarjeta.
 *
 *  Cuándo usar esto vs. checkout online:
 *   - Terminal Session  → cobro presencial en una terminal POS de Recurrente.
 *   - createCheckout     → cobro online desde el navegador (link/QR en la web).
 *
 *  Requisitos:
 *   - Terminal POS vinculada a la cuenta y en "Modo espera".
 *   - terminal_id (Dashboard → POS → clic en la terminal → ver ID, ej. trm_abc123).
 *
 *  Variables de entorno (Base44 → Settings → Environment):
 *     RECURRENTE_SECRET_KEY = sk_live_xxx   (o sk_test_xxx en pruebas)
 * ============================================================================
 */

const RECURRENTE_API = "https://app.recurrente.com/api";

Deno.serve(async (req) => {
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
      terminalId, // ID de la terminal POS (trm_xxx)
      amount, // monto en unidades (ej. 150.00). Se convierte a centavos.
      amountInCents, // alternativa: monto en centavos (ej. 15000)
      currency = "GTQ", // "GTQ" o "USD"
      externalId, // ID de tu orden (idempotencia)
    } = body || {};

    if (!terminalId) {
      return json({ error: "'terminalId' es requerido" }, 400, cors);
    }
    if (!externalId) {
      return json({ error: "'externalId' es requerido" }, 400, cors);
    }
    if (!amount && !amountInCents) {
      return json({ error: "Envía 'amount' o 'amountInCents'" }, 400, cors);
    }

    // Construir payload: enviar amount_in_cents O amount (no ambos).
    const payload = {
      terminal_id: terminalId,
      currency,
      external_id: externalId,
    };
    if (amountInCents != null) payload.amount_in_cents = Number(amountInCents);
    else payload.amount = Number(amount);

    const res = await fetch(`${RECURRENTE_API}/terminal_session_commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SECRET-KEY": Deno.env.get("RECURRENTE_SECRET_KEY"),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // 201 = comando nuevo creado. 200 = ya existía un comando activo con ese external_id.
    if (!res.ok) {
      throw new Error(
        `terminal_session_commands falló (${res.status}): ${JSON.stringify(data)}`,
      );
    }

    // Si status === "dispatched", la terminal ya levantó un comando previo con
    // ese external_id. Para un cobro nuevo, usa un external_id distinto.
    return json(
      {
        id: data.id,
        status: data.status, // pending | dispatched | consumed | superseded | failed
        terminalId: data.terminal_id,
        amountInCents: data.amount_in_cents,
        currency: data.currency,
        checkoutId: data.checkout_id,
        checkoutUrl: data.checkout_url,
        externalId: data.external_id,
        alreadyExisted: res.status === 200,
      },
      200,
      cors,
    );
  } catch (err) {
    console.error("[terminalSessionCommand] error:", err);
    return json({ error: String(err.message || err) }, 500, cors);
  }
});

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
