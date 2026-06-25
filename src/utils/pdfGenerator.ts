export interface QuotationPDFData {
  nombre?: string;
  empresa?: string;
  whatsapp?: string;
  correo?: string;
  breakdown: Array<{ item: string; cost: number; note?: string }>;
  total: number;
  warnings: string[];
  date: string;
  formSummary?: string[];
}

async function getLogoBase64(): Promise<string> {
  try {
    const res = await fetch('/K_V4-2.png');
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export async function generateQuotationPDF(data: QuotationPDFData): Promise<void> {
  const logo = await getLogoBase64();
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes para descargar el PDF');
    return;
  }

  const logoHtml = logo
    ? `<img src="${logo}" alt="KONTAXES" style="height:64px;width:auto;margin-bottom:8px;" />`
    : `<div style="font-size:28px;font-weight:900;color:#9333ea;letter-spacing:-1px;">KONTAXES</div>`;

  const clientRows = [
    data.nombre  ? `<tr><td class="lbl">Nombre</td><td>${data.nombre}</td></tr>`  : '',
    data.empresa ? `<tr><td class="lbl">Empresa</td><td>${data.empresa}</td></tr>` : '',
    data.whatsapp? `<tr><td class="lbl">WhatsApp</td><td>${data.whatsapp}</td></tr>`: '',
    data.correo  ? `<tr><td class="lbl">Correo</td><td>${data.correo}</td></tr>`   : '',
  ].filter(Boolean).join('');

  const summaryRows = (data.formSummary || [])
    .map(s => `<li>${s}</li>`)
    .join('');

  const breakdownRows = data.breakdown
    .map(item => `
      <tr>
        <td>${item.item}${item.note ? `<br/><span class="note">${item.note}</span>` : ''}</td>
        <td class="amount">Q ${item.cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
      </tr>`)
    .join('');

  const warningItems = data.warnings
    .map(w => `<div class="warning-item">⚠ ${w}</div>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Cotización KONTAXES — ${data.date}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;font-size:13px;line-height:1.5;}

    /* ── Header ── */
    .header{background:linear-gradient(135deg,#1a0533 0%,#2d1065 60%,#0f3460 100%);padding:36px 48px 28px;display:flex;align-items:center;justify-content:space-between;}
    .header-left{}
    .header-tagline{color:#c4b5fd;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;}
    .header-services{color:#a78bfa;font-size:11px;margin-top:6px;}
    .header-right{text-align:right;}
    .quote-number{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 16px;color:#fff;}
    .quote-number .label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#c4b5fd;}
    .quote-number .value{font-size:14px;font-weight:700;margin-top:2px;}

    /* ── Body ── */
    .body{padding:36px 48px;}

    /* ── Section titles ── */
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#9333ea;margin-bottom:10px;border-bottom:2px solid #f3e8ff;padding-bottom:6px;}

    /* ── Client info ── */
    .client-box{background:#faf5ff;border-left:4px solid #9333ea;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;}
    .client-box table{width:100%;border-collapse:collapse;}
    .client-box td{padding:4px 8px;font-size:12px;}
    .lbl{color:#7c3aed;font-weight:700;width:90px;}

    /* ── Summary list ── */
    .summary-box{background:#f8f9ff;border:1px solid #e0e7ff;border-radius:8px;padding:16px 20px;margin-bottom:24px;}
    .summary-box ul{list-style:none;padding:0;}
    .summary-box li{padding:5px 0;border-bottom:1px solid #ede9fe;font-size:12px;color:#374151;}
    .summary-box li:last-child{border-bottom:none;}
    .summary-box li::before{content:"✔";color:#7c3aed;margin-right:8px;font-size:11px;}

    /* ── Breakdown table ── */
    .breakdown-table{width:100%;border-collapse:collapse;margin-bottom:0;}
    .breakdown-table thead tr{background:linear-gradient(90deg,#7c3aed,#6d28d9);}
    .breakdown-table thead th{color:#fff;padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;}
    .breakdown-table thead th.amount{text-align:right;}
    .breakdown-table tbody tr{border-bottom:1px solid #ede9fe;}
    .breakdown-table tbody tr:nth-child(even){background:#faf5ff;}
    .breakdown-table tbody td{padding:10px 14px;font-size:12px;color:#374151;vertical-align:top;}
    .breakdown-table .note{font-size:11px;color:#9ca3af;font-style:italic;margin-top:2px;}
    .breakdown-table .amount{text-align:right;font-weight:600;color:#6d28d9;white-space:nowrap;}
    .total-row td{background:linear-gradient(90deg,#f5f3ff,#ede9fe)!important;padding:14px!important;font-weight:700!important;font-size:14px!important;border-top:2px solid #7c3aed!important;}
    .total-row .amount{color:#7c3aed!important;font-size:18px!important;}

    /* ── Warnings ── */
    .warnings-box{background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:20px;}
    .warning-item{font-size:12px;color:#92400e;padding:3px 0;}

    /* ── Disclaimer ── */
    .disclaimer{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin-top:20px;font-size:11px;color:#1e40af;line-height:1.6;}

    /* ── Footer ── */
    .footer{background:#1a0533;color:#c4b5fd;text-align:center;padding:20px 48px;font-size:11px;margin-top:32px;}
    .footer strong{color:#fff;}
    .footer-divider{border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;}

    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      .no-print{display:none;}
      @page{margin:0;}
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      ${logoHtml}
      <div class="header-tagline">De Números a Decisiones</div>
      <div class="header-services">Contabilidad · Impuestos · Asesoría · Consultoría</div>
    </div>
    <div class="header-right">
      <div class="quote-number">
        <div class="label">Cotización Estimada</div>
        <div class="value">${data.date}</div>
      </div>
    </div>
  </div>

  <div class="body">

    ${clientRows ? `
    <div class="section-title">Datos del Cliente</div>
    <div class="client-box">
      <table>${clientRows}</table>
    </div>` : ''}

    ${summaryRows ? `
    <div class="section-title">Servicios Incluidos</div>
    <div class="summary-box">
      <ul>${summaryRows}</ul>
    </div>` : ''}

    <div class="section-title">Desglose de Cotización</div>
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Concepto</th>
          <th class="amount">Monto Mensual</th>
        </tr>
      </thead>
      <tbody>
        ${breakdownRows}
        <tr class="total-row">
          <td>TOTAL MENSUAL ESTIMADO</td>
          <td class="amount">Q ${data.total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    ${warningItems ? `
    <div class="warnings-box">
      <div style="font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:6px;">Notas Importantes</div>
      ${warningItems}
    </div>` : ''}

    <div class="disclaimer">
      <strong>IMPORTANTE:</strong> Esta es una cotización estimada, NO un documento formal. Para formalizar el servicio se
      enviará la propuesta oficial, cotización formal y contrato de servicios profesionales.
      Los precios están en Quetzales (GTQ) e incluyen honorarios profesionales mensuales.
    </div>

  </div>

  <div class="footer">
    <strong>KONTAXES — Servicios Contables y Financieros</strong>
    <div class="footer-divider"></div>
    info@kontaxes.com &nbsp;·&nbsp; +502 3517-4713 &nbsp;·&nbsp; kontaxes.com
    <br/>
    <span style="font-size:10px;color:#a78bfa;margin-top:4px;display:block;">Potenciado por Odoo · IA (Claude) · FinanzIA · FELSimple</span>
  </div>

</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
}
