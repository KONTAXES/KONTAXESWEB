const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

export interface EmailQuotationParams {
  nombre?: string;
  empresa?: string;
  whatsapp?: string;
  correo?: string;
  total: number;
  breakdown: Array<{ item: string; cost: number; note?: string }>;
  quoteNumber: string;
  date: string;
  blob: Blob;
  filename: string;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

function buildEmailHTML(p: EmailQuotationParams): string {
  const rows = p.breakdown.map(item => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid #ede9fe;font-size:12px;color:#374151;">
        ${item.item}${item.note ? `<br/><span style="font-size:10px;color:#9ca3af;font-style:italic;">${item.note}</span>` : ''}
      </td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede9fe;text-align:right;font-weight:600;font-size:12px;color:#6d28d9;white-space:nowrap;">
        Q ${item.cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
      </td>
    </tr>`).join('');

  const fields = [
    p.nombre   && `<tr><td style="color:#7c3aed;font-weight:700;padding:3px 8px;font-size:12px;width:90px;">Nombre</td><td style="padding:3px 8px;font-size:12px;">${p.nombre}</td></tr>`,
    p.empresa  && `<tr><td style="color:#7c3aed;font-weight:700;padding:3px 8px;font-size:12px;">Empresa</td><td style="padding:3px 8px;font-size:12px;">${p.empresa}</td></tr>`,
    p.whatsapp && `<tr><td style="color:#7c3aed;font-weight:700;padding:3px 8px;font-size:12px;">WhatsApp</td><td style="padding:3px 8px;font-size:12px;">${p.whatsapp}</td></tr>`,
    p.correo   && `<tr><td style="color:#7c3aed;font-weight:700;padding:3px 8px;font-size:12px;">Correo</td><td style="padding:3px 8px;font-size:12px;">${p.correo}</td></tr>`,
  ].filter(Boolean).join('');

  return `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#1a1a2e;">
  <div style="background:linear-gradient(135deg,#0f0a1e,#2d1065);padding:28px 36px;border-radius:10px 10px 0 0;">
    <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-1px;">KONTAXES</div>
    <div style="color:#c4b5fd;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">De Números a Decisiones</div>
  </div>
  <div style="background:#fff;border:1px solid #ede9fe;border-top:none;padding:28px 36px;border-radius:0 0 10px 10px;">
    <div style="background:#faf5ff;border-left:4px solid #9333ea;border-radius:0 6px 6px 0;padding:14px 18px;margin-bottom:20px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;margin-bottom:8px;">Nueva Cotización Estimada</div>
      <div style="font-size:13px;font-weight:700;color:#1a1a2e;">${p.quoteNumber}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">${p.date}</div>
    </div>

    ${fields ? `
    <div style="background:#faf5ff;border-left:4px solid #9333ea;border-radius:0 6px 6px 0;padding:12px 4px;margin-bottom:20px;">
      <table style="border-collapse:collapse;width:100%;">${fields}</table>
    </div>` : ''}

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #ede9fe;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:linear-gradient(90deg,#6d28d9,#5b21b6);">
          <th style="color:#fff;padding:9px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Concepto</th>
          <th style="color:#fff;padding:9px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Monto</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="background:linear-gradient(90deg,#f5f3ff,#ede9fe);">
          <td style="padding:13px 12px;font-weight:700;font-size:13px;">TOTAL MENSUAL ESTIMADO</td>
          <td style="padding:13px 12px;font-weight:700;font-size:17px;text-align:right;color:#7c3aed;">Q ${p.total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 14px;font-size:11px;color:#1e40af;line-height:1.6;margin-bottom:20px;">
      <strong>NOTA:</strong> Esta es una cotización estimada. La cotización formal y contrato se enviarán al formalizar el servicio. Los precios están en Quetzales (GTQ).
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:14px;font-size:10px;color:#9ca3af;">
      KONTAXES CONSULTORES, S.A. &nbsp;·&nbsp; info@kontaxes.com &nbsp;·&nbsp; +502 3517-4713
    </div>
  </div>
</div>`;
}

export async function sendQuotationEmail(params: EmailQuotationParams): Promise<void> {
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_BREVO_API_KEY;
  if (!apiKey) return;

  try {
    const base64 = await blobToBase64(params.blob);
    const html = buildEmailHTML(params);

    const adminRecipients = [
      { email: 'admin@kontaxes.com' },
      { email: 'info@kontaxes.com' },
    ];

    const body: Record<string, unknown> = {
      sender: {
        name: 'KONTAXES Cotizador',
        email: (import.meta as unknown as { env: Record<string, string> }).env?.VITE_BREVO_SENDER ?? 'info@kontaxes.com',
      },
      subject: `Cotización KONTAXES — ${params.quoteNumber}`,
      htmlContent: html,
      attachment: [{ content: base64, name: params.filename }],
    };

    if (params.correo && params.correo !== 'admin@kontaxes.com' && params.correo !== 'info@kontaxes.com') {
      body.to = [{ email: params.correo, name: params.nombre ?? undefined }];
      body.bcc = adminRecipients;
    } else {
      body.to = adminRecipients;
    }

    await fetch(BREVO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent fail — email is supplementary
  }
}
