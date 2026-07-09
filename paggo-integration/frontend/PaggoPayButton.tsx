/**
 * ============================================================================
 *  PAGGO · Componente Frontend: Botón de Pago (React)
 * ============================================================================
 *
 *  Plataforma destino: Base44 (frontend React).
 *
 *  Qué hace:
 *   - Llama a la función backend `paggoCreateLink`, recibe la URL del link de
 *     cobro y redirige al cliente a esa URL para pagar.
 *   - Paggo además envía el link al correo del cliente automáticamente.
 *
 *  Notas:
 *   - Aquí NO se usa la API KEY. Solo se llama a tu backend.
 *   - Ajusta `BACKEND_URL` a la ruta real de la función en Base44, o usa el SDK:
 *     base44.functions.paggoCreateLink({...}).
 * ============================================================================
 */

import { useState } from "react";

const BACKEND_URL = "/functions/paggoCreateLink";

interface PaggoPayButtonProps {
  amount: number; // monto en quetzales, ej. 150.00
  concept: string; // descripción del cobro
  customerName: string; // nombre del cliente
  email: string; // correo del cliente (recibe el link)
  label?: string;
  className?: string;
  /** Si true, redirige a la URL del link. Si false, solo la devuelve por onCreated. */
  redirect?: boolean;
  onCreated?: (data: { link: string; expirationDate: string }) => void;
}

export default function PaggoPayButton({
  amount,
  concept,
  customerName,
  email,
  label = "Generar link de pago",
  className = "",
  redirect = true,
  onCreated,
}: PaggoPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, concept, customerName, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo generar el link");
      if (!data?.link) throw new Error("Respuesta sin link de pago");

      onCreated?.(data);
      if (redirect) window.location.href = data.link;
    } catch (err: any) {
      setError(err?.message || "Error al generar el link");
    } finally {
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
          "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? "Generando…" : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/*
 *  Ejemplo de uso:
 *
 *  <PaggoPayButton
 *     amount={150}
 *     concept="Plan Contabilidad Mensual"
 *     customerName="Juan Pérez"
 *     email="juan@correo.com"
 *     label="Pagar Q150.00"
 *  />
 */
