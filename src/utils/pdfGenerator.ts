export interface QuotationPDFData {
  nombre?: string;
  empresa?: string;
  whatsapp?: string;
  correo?: string;
  breakdown: Array<{item: string;cost: number;note?: string;}>;
  total: number;
  warnings: string[];
  date: string;
}

export function generateQuotationPDF(data: QuotationPDFData): void {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes para descargar el PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cotización KONTAXES</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #9333EA;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #9333EA;
          margin-bottom: 10px;
        }
        .tagline {
          font-size: 14px;
          color: #666;
          font-style: italic;
        }
        .contact-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .contact-info h3 {
          color: #9333EA;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .contact-item {
          font-size: 14px;
        }
        .contact-label {
          font-weight: bold;
          color: #555;
        }
        .quotation-details {
          margin-bottom: 30px;
        }
        .quotation-details h2 {
          color: #9333EA;
          margin-bottom: 20px;
          font-size: 24px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #9333EA;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .note {
          font-size: 12px;
          color: #666;
          font-style: italic;
          padding-left: 20px;
        }
        .total-row {
          background: #f0e6ff;
          font-weight: bold;
          font-size: 18px;
        }
        .total-row td {
          padding: 15px 12px;
          border-bottom: 3px solid #9333EA;
        }
        .warnings {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin-bottom: 20px;
        }
        .warnings h4 {
          color: #856404;
          margin-bottom: 10px;
        }
        .warning-item {
          font-size: 14px;
          color: #856404;
          margin-bottom: 8px;
          padding-left: 20px;
        }
        .disclaimer {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin-top: 30px;
          font-size: 13px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .footer-links {
          margin-top: 10px;
        }
        .footer-links a {
          color: #9333EA;
          text-decoration: none;
          margin: 0 10px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">KONTAXES</div>
        <div class="tagline">de números a decisiones</div>
        <p style="margin-top: 10px; font-size: 14px;">Contabilidad • Impuestos • Asesoría Financiera • Consultoría</p>
      </div>

      ${
  data.nombre || data.empresa ?
  `
      <div class="contact-info">
        <h3>Información del Cliente</h3>
        <div class="contact-grid">
          ${data.nombre ? `<div class="contact-item"><span class="contact-label">Nombre:</span> ${data.nombre}</div>` : ''}
          ${data.empresa ? `<div class="contact-item"><span class="contact-label">Empresa:</span> ${data.empresa}</div>` : ''}
          ${data.whatsapp ? `<div class="contact-item"><span class="contact-label">WhatsApp:</span> ${data.whatsapp}</div>` : ''}
          ${data.correo ? `<div class="contact-item"><span class="contact-label">Correo:</span> ${data.correo}</div>` : ''}
        </div>
      </div>
      ` :
  ''}

      <div class="quotation-details">
        <h2>Cotización de Servicios</h2>
        <p style="margin-bottom: 20px; color: #666;">Fecha: ${
  data.date}</p>

        ${
  data.warnings.length > 0 ?
  `
        <div class="warnings">
          <h4>⚠️ Notas Importantes</h4>
          ${data.warnings.map((w) => `<div class="warning-item">• ${w}</div>`).join('')}
        </div>
        ` :
  ''}

        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th style="text-align: right; width: 150px;">Monto Mensual</th>
            </tr>
          </thead>
          <tbody>
            ${
  data.breakdown.
  map(
    (item) => `
              <tr>
                <td>
                  ${item.item}
                  ${item.note ? `<div class="note">${item.note}</div>` : ''}
                </td>
                <td style="text-align: right;">Q ${item.cost.toFixed(2)}</td>
              </tr>
            `
  ).
  join('')}
            <tr class="total-row">
              <td>TOTAL MENSUAL APROXIMADO</td>
              <td style="text-align: right;">Q ${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="disclaimer">
        <strong>IMPORTANTE:</strong> Esta NO es una cotización formal, para mayor información contacta a un asesor. 
        Al momento de formalizar el servicio, se enviará la propuesta de servicios, la cotización formal, 
        y el contrato de servicios profesionales.
      </div>

      <div class="footer">
        <p><strong>KONTAXES</strong></p>
        <p>info@kontaxes.com • +502 3638-7717</p>
        <p style="margin-top: 10px; font-size: 11px;">Utilizando la tecnología y el profesionalismo</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}