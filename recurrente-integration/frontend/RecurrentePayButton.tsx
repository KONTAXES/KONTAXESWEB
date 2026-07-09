/**
 * ============================================================================
 *  RECURRENTE · Componente Frontend: Botón de Pago (React)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (frontend React).
 *
 *  Qué hace:
 *   - Llama a la función backend `createCheckout`, recibe la `checkout_url`
 *     y redirige al cliente a la pasarela de Recurrente para pagar.
 *
 *  Notas:
 *   - Aquí NO se usa ninguna llave secreta. Solo se llama a tu backend.
 *   - Ajusta `BACKEND_URL` a la ruta de tu función backend en Base44.
 *     En Base44 normalmente puedes invocar la función por su nombre; si usas
 *     el SDK, reemplaza el fetch por: base44.functions.createCheckout({...}).
 * ============================================================================
 */

import { useState } from "react";

// Ruta pública de tu función backend en Base44 (ajústala).
const BACKEND_URL = "/functions/createCheckout";

type Customer = { name?: string; email?: string };

interface RecurrentePayButtonProps {
  amount: number; // monto en quetzales, ej. 150.00
  description: string; // ej. "Plan Contabilidad Mensual"
  currency?: string; // por defecto GTQ
  orderId?: string; // tu id interno de orden (opcional pero recomendado)
  customer?: Customer;
  label?: string; // texto del botón
  className?: string;
}

export default function RecurrentePayButton({
  amount,
  description,
  currency = "GTQ",
  orderId,
  customer,
  label = "Pagar ahora",
  className = "",
}: RecurrentePayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, currency, orderId, customer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo crear el pago");
      if (!data?.checkoutUrl) throw new Error("Respuesta sin checkout_url");

      // Redirige a la pasarela de Recurrente.
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || "Error al procesar el pago");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className={
          className ||
          "inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? "Redirigiendo…" : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/*
 *  Ejemplo de uso:
 *
 *  <RecurrentePayButton
 *     amount={150}
 *     description="Plan Contabilidad Mensual"
 *     orderId="ORD-2026-001"
 *     customer={{ name: "Juan Pérez", email: "juan@correo.com" }}
 *     label="Pagar Q150.00"
 *  />
 */
