/**
 * ============================================================================
 *  RECURRENTE · Función Backend: Webhook (confirmación de pago)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (Backend Function - Deno)
 *
 *  Qué hace:
 *   - Recibe los eventos que Recurrente envía cuando cambia el estado de un pago
 *     (ej. pago exitoso). Verifica la firma para asegurar que el evento es real
 *     y luego actualiza tu registro/orden (marcar como PAGADO, enviar correo, etc.).
 *
 *  Por qué es necesario:
 *   - NUNCA confíes solo en la redirección a success_url para dar por pagado un
 *     pedido (el usuario puede cerrar la pestaña o falsear la URL). El webhook es
 *     la fuente de verdad del pago.
 *
 *  Configuración en el panel de Recurrente:
 *   - Ve a Configuración → Webhooks (o Desarrolladores → Webhooks).
 *   - Endpoint URL: https://<tu-backend-base44>/recurrenteWebhook
 *   - Copia el "Signing Secret" (empieza con whsec_...) y guárdalo como
 *     variable de entorno en Base44:
 *       RECURRENTE_WEBHOOK_SECRET = whsec_xxx
 *
 *  ⚠️ Recurrente firma los webhooks con el esquema de Svix. Los encabezados y el
 *      cálculo HMAC de abajo son el estándar de Svix. [VERIFICAR] en tu panel el
 *      nombre exacto del evento de pago exitoso (ej. "payment_intent.succeeded").
 * ============================================================================
 */

/** Verifica la firma Svix del webhook usando el secreto whsec_... */
async function verifySvixSignature({ payload, headers, secret }) {
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // El secreto viene como "whsec_<base64>"; se usa solo la parte base64 como clave.
  const secretBytes = Uint8Array.from(
    atob(secret.replace(/^whsec_/, "")),
    (c) => c.charCodeAt(0),
  );

  // Contenido a firmar: "<id>.<timestamp>.<body-crudo>"
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

  // El header puede traer varias firmas separadas por espacio: "v1,<sig> v1,<sig2>"
  const passed = svixSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .some((sig) => sig === expected);

  return passed;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  // IMPORTANTE: usar el cuerpo CRUDO (texto) para verificar la firma.
  const rawBody = await req.text();
  const secret = Deno.env.get("RECURRENTE_WEBHOOK_SECRET");

  try {
    const ok = await verifySvixSignature({
      payload: rawBody,
      headers: req.headers,
      secret,
    });

    if (!ok) {
      console.warn("[webhook] firma inválida");
      return new Response("Firma inválida", { status: 401 });
    }

    // Estructura real del evento de Recurrente:
    // { "event": "payment_intent.succeeded",
    //   "data": { "checkout": { "id", "metadata": { "external_id", ... } },
    //             "amount_in_cents", "currency" } }
    const evt = JSON.parse(rawBody);
    const type = evt.event;
    const data = evt.data || {};
    const metadata = data?.checkout?.metadata || {};
    // Usamos external_id (o order_id) para relacionar el pago con tu orden.
    const orderId = metadata.external_id || metadata.order_id;
    console.log("[webhook] evento recibido:", type, "order:", orderId);

    // ------------------------------------------------------------------
    //  Maneja aquí los eventos que te importan.
    // ------------------------------------------------------------------
    switch (type) {
      case "payment_intent.succeeded": {
        const amountInCents = data?.amount_in_cents;
        // TODO (Base44): actualiza tu entidad de Órdenes/Pagos.
        //   await base44.entities.Order.update(orderId, { status: "paid" });
        //   await enviarCorreoConfirmacion(...);
        console.log(
          `[webhook] PAGO EXITOSO order=${orderId} monto_centavos=${amountInCents}`,
        );
        break;
      }

      case "payment_intent.failed": {
        console.log(`[webhook] pago fallido order=${orderId}`);
        // await base44.entities.Order.update(orderId, { status: "failed" });
        break;
      }

      default:
        console.log("[webhook] evento no manejado:", type);
    }

    // Responde 200 rápido para que Recurrente no reintente.
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[webhook] error:", err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
