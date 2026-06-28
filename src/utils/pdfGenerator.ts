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

async function getImageBase64(path: string): Promise<string> {
  try {
    const res = await fetch(path);
    if (!res.ok) return '';
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

function generateQuoteNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `COT-${y}-${m}-${d}-${h}-${min}`;
}

export async function generateQuotationPDF(data: QuotationPDFData): Promise<void> {
  const [logo, firma] = await Promise.all([
    getImageBase64('/K_white.png'),
    getImageBase64('/firma-kevin.png'),
  ]);

  const quoteNumber = generateQuoteNumber();

  const logoHtml = logo
    ? `<img src="${logo}" alt="KONTAXES" style="height:56px;width:auto;" />`
    : `<div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-1px;">KONTAXES</div>`;

  const clientRows = [
    data.nombre   ? `<tr><td class="lbl">Nombre</td><td>${data.nombre}</td></tr>`   : '',
    data.empresa  ? `<tr><td class="lbl">Empresa</td><td>${data.empresa}</td></tr>`  : '',
    data.whatsapp ? `<tr><td class="lbl">WhatsApp</td><td>${data.whatsapp}</td></tr>`: '',
    data.correo   ? `<tr><td class="lbl">Correo</td><td>${data.correo}</td></tr>`    : '',
  ].filter(Boolean).join('');

  const breakdownRows = data.breakdown.map(item => `
    <tr>
      <td>${item.item}${item.note ? `<br/><span class="note">${item.note}</span>` : ''}</td>
      <td class="amount">Q ${item.cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
    </tr>`).join('');

  const warningItems = data.warnings.map(w => `<div class="warning-item">⚠ ${w}</div>`).join('');

  const empresaPart = data.empresa ? ` de tu empresa <strong>${data.empresa}</strong>` : '';
  const contactParts: string[] = [];
  if (data.whatsapp) contactParts.push(`al número de teléfono <strong>${data.whatsapp}</strong>`);
  if (data.correo)   contactParts.push(`al correo <strong>${data.correo}</strong>`);
  const contactSentence = contactParts.length
    ? ` Podemos contactarte ${contactParts.join(' y ')} para continuar compartiendo información.`
    : '';
  const introPara = data.nombre ? `
    <div class="intro-para">
      Estimado(a) <strong>${data.nombre}</strong>, es un gusto presentarte una cotización estimada del
      costo de nuestros servicios profesionales para ser el aliado estratégico${empresaPart}.
      A continuación te compartimos el detalle de los servicios y los costos correspondientes estimados.${contactSentence}
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${quoteNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;font-size:13px;line-height:1.5;}

    /* ── Header full-bleed ── */
    .header{
      background:linear-gradient(135deg,#0f0a1e 0%,#1e0a4a 35%,#2d1065 65%,#0f3460 100%);
      padding:32px 48px 28px;
      position:relative;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:24px;
    }
    /* Decorative circles */
    .deco-circle-1{position:absolute;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(147,51,234,0.18),transparent 70%);top:-120px;right:160px;pointer-events:none;}
    .deco-circle-2{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%);bottom:-60px;right:40px;pointer-events:none;}
    .deco-circle-3{position:absolute;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%);top:10px;left:40%;pointer-events:none;}
    /* Grid dots overlay */
    .deco-grid{position:absolute;inset:0;pointer-events:none;opacity:0.06;
      background-image:radial-gradient(circle,#fff 1px,transparent 1px);
      background-size:18px 18px;}
    /* Diagonal accent bar */
    .deco-bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#7c3aed,#10b981,#7c3aed);opacity:0.7;}

    .header-left{position:relative;z-index:1;}
    .header-tagline{color:#c4b5fd;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin-top:5px;}
    .header-contact{color:#a78bfa;font-size:10px;margin-top:8px;line-height:1.7;}

    .header-right{position:relative;z-index:1;text-align:right;flex-shrink:0;}
    .quote-box{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:12px 18px;color:#fff;backdrop-filter:blur(4px);}
    .quote-box .q-label{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#c4b5fd;margin-bottom:4px;}
    .quote-box .q-number{font-size:13px;font-weight:700;letter-spacing:0.5px;color:#fff;}
    .quote-box .q-date{font-size:10px;color:#a78bfa;margin-top:3px;}

    /* ── Body ── */
    .body{padding:32px 48px;}

    /* ── Section titles ── */
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#7c3aed;margin-bottom:10px;border-bottom:2px solid #f3e8ff;padding-bottom:5px;}

    /* ── Intro paragraph ── */
    .intro-para{font-size:12px;color:#374151;line-height:1.75;margin-bottom:22px;padding:16px 20px;background:#faf5ff;border-left:4px solid #9333ea;border-radius:0 8px 8px 0;}

    /* ── Client info ── */
    .client-box{background:#faf5ff;border-left:4px solid #9333ea;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:22px;}
    .client-box table{width:100%;border-collapse:collapse;}
    .client-box td{padding:3px 8px;font-size:12px;}
    .lbl{color:#7c3aed;font-weight:700;width:90px;}

    /* ── Summary list ── */
    .summary-box{margin-bottom:14px;}
    .summary-box ul{list-style:none;padding:0;columns:2;column-gap:24px;}
    .summary-box li{padding:3px 0;font-size:11px;color:#374151;break-inside:avoid;}
    .summary-box li::before{content:"✔";color:#7c3aed;margin-right:6px;font-size:10px;}

    /* ── Breakdown table ── */
    .breakdown-table{width:100%;border-collapse:collapse;margin-bottom:0;}
    .breakdown-table thead tr{background:linear-gradient(90deg,#6d28d9,#5b21b6);}
    .breakdown-table thead th{color:#fff;padding:9px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;}
    .breakdown-table thead th.amount{text-align:right;}
    .breakdown-table tbody tr{border-bottom:1px solid #ede9fe;}
    .breakdown-table tbody tr:nth-child(even){background:#faf5ff;}
    .breakdown-table tbody td{padding:10px 14px;font-size:12px;color:#374151;vertical-align:top;}
    .breakdown-table .note{font-size:10px;color:#9ca3af;font-style:italic;margin-top:2px;}
    .breakdown-table .amount{text-align:right;font-weight:600;color:#6d28d9;white-space:nowrap;}
    .total-row td{background:linear-gradient(90deg,#f5f3ff,#ede9fe)!important;padding:13px 14px!important;font-weight:700!important;font-size:13px!important;border-top:2px solid #7c3aed!important;}
    .total-row .amount{color:#7c3aed!important;font-size:17px!important;}

    /* ── Warnings ── */
    .warnings-box{background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 18px;margin-top:18px;}
    .warning-item{font-size:11px;color:#92400e;padding:3px 0;}

    /* ── Disclaimer ── */
    .disclaimer{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-top:18px;font-size:11px;color:#1e40af;line-height:1.6;}

    /* ── Signature ── */
    .signature-section{margin-top:32px;padding-top:20px;border-top:1px solid #e0e7ff;page-break-inside:avoid;page-break-before:avoid;}
    .sig-block{display:inline-block;text-align:center;min-width:200px;}
    .sig-img{height:68px;width:auto;display:block;margin:0 auto 4px;}
    .sig-line{border-top:1px solid #374151;margin:4px 0;}
    .sig-name{font-weight:700;font-size:12px;color:#1a1a2e;margin-top:3px;}
    .sig-role{font-size:11px;color:#6d28d9;}
    .sig-company{font-size:10px;color:#6b7280;margin-top:1px;}

    /* ── Page breaks ── */
    .breakdown-section{page-break-inside:auto;}
    .client-section{page-break-inside:avoid;}
    .breakdown-table tbody tr{page-break-inside:avoid;}
    .total-row{page-break-inside:avoid;}

    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @page{size:letter;margin:0;}
      .body{padding:28px 48px;}
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="deco-grid"></div>
    <div class="deco-circle-1"></div>
    <div class="deco-circle-2"></div>
    <div class="deco-circle-3"></div>
    <div class="deco-bar"></div>

    <div class="header-left">
      ${logoHtml}
      <div class="header-tagline">De Números a Decisiones</div>
      <div class="header-contact">
        KONTAXES CONSULTORES, S.A.<br/>
        info@kontaxes.com &nbsp;·&nbsp; +502 3517 4713
      </div>
    </div>

    <div class="header-right">
      <div class="quote-box">
        <div class="q-label">Cotización Estimada</div>
        <div class="q-number">${quoteNumber}</div>
        <div class="q-date">${data.date}</div>
      </div>
    </div>
  </div>

  <div class="body">

    ${introPara}

    <div class="breakdown-section">
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
        <div style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:5px;">Notas Importantes</div>
        ${warningItems}
      </div>` : ''}
    </div>

    <div style="page-break-inside:avoid;">
    <div class="disclaimer">
      <strong>IMPORTANTE:</strong> Esta es una cotización estimada, NO un documento formal. Para formalizar el servicio se
      enviará la propuesta oficial, cotización formal y contrato de servicios profesionales.
      Los precios están en Quetzales (GTQ) e incluyen IVA.
    </div>

    <div class="signature-section">
      <div class="sig-block">
        ${firma ? `<img src="${firma}" alt="Firma" class="sig-img" />` : '<div style="height:68px;"></div>'}
        <div class="sig-line"></div>
        <div class="sig-name">Kevin A. Santos C.</div>
        <div class="sig-role">Gerente General</div>
        <div class="sig-company">KONTAXES CONSULTORES, S.A.</div>
      </div>
    </div>
    </div>

  </div>

</body>
</html>`;

  // Print via hidden iframe — no new tab opens
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:none;');
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || (iframe.contentWindow as Window).document;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow!.focus();
  setTimeout(() => {
    iframe.contentWindow!.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }, 500);
}
