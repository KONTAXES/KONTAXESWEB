/**
 * Generates a downloadable PDF for the Pequeño Contribuyente workshop.
 * Uses jspdf with a logo watermark on every page and note lines per section.
 */

async function loadImageAsDataUrl(path: string): Promise<string> {
  const blob = await fetch(path).then(r => r.blob());
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateWorkshopPDF(): Promise<void> {
  const { jsPDF } = await import('jspdf');

  // Load logos before building doc
  const [logoBlack, logoWhite] = await Promise.all([
    loadImageAsDataUrl('/K_black.png').catch(() => null),
    loadImageAsDataUrl('/K_white.png').catch(() => null),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const PW = 215.9;
  const PH = 279.4;
  const ML = 20;
  const MR = 20;
  const TW = PW - ML - MR;

  // ── Color palette ──────────────────────────────────────────────────────────
  const PURPLE: [number, number, number] = [124, 58, 237];
  const EMERALD: [number, number, number] = [16, 185, 129];
  const DARK: [number, number, number] = [15, 10, 30];
  const GRAY: [number, number, number] = [100, 100, 120];
  const LIGHT_GRAY: [number, number, number] = [230, 228, 240];

  // ── Logo watermark helper ─────────────────────────────────────────────────
  const addWatermark = (isDarkPage = false) => {
    const logoData = isDarkPage ? logoWhite : logoBlack;
    if (logoData) {
      const size = 130;
      const x = (PW - size) / 2;
      const y = (PH - size) / 2;
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
      doc.addImage(logoData, 'PNG', x, y, size, size);
      doc.restoreGraphicsState();
    } else {
      // Fallback: text watermark
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(72);
      doc.setTextColor(...PURPLE);
      doc.text('KONTAXES', PW / 2, PH / 2, { align: 'center', angle: 45 });
      doc.restoreGraphicsState();
    }
  };

  // ── Header helper ─────────────────────────────────────────────────────────
  const addHeader = (pageNum: number, total: number) => {
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PW, 14, 'F');
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, 4, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('KONTAXES', 8, 9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 170, 210);
    doc.text('Material de Apoyo — Declaración de Impuestos · Pequeño Contribuyente', 40, 9);
    doc.setTextColor(130, 120, 160);
    doc.text(`${pageNum} / ${total}`, PW - MR, 9, { align: 'right' });
  };

  // ── Footer helper ─────────────────────────────────────────────────────────
  const addFooter = () => {
    doc.setFillColor(245, 243, 252);
    doc.rect(0, PH - 10, PW, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('© KONTAXES CONSULTORES, S.A. · kontaxes.com · Material exclusivo para uso educativo', PW / 2, PH - 4, { align: 'center' });
  };

  // ── Section heading helper ────────────────────────────────────────────────
  const sectionHeading = (y: number, text: string): number => {
    doc.setFillColor(...PURPLE);
    doc.rect(ML, y, 3, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    doc.text(text, ML + 6, y + 5.5);
    return y + 12;
  };

  // ── Bullet helper ─────────────────────────────────────────────────────────
  const bullet = (y: number, text: string, indent = 0): number => {
    doc.setFillColor(...PURPLE);
    doc.circle(ML + indent + 1.5, y + 1.5, 0.9, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 35, 60);
    const lines = doc.splitTextToSize(text, TW - indent - 6) as string[];
    doc.text(lines, ML + indent + 5, y + 2.5);
    return y + lines.length * 5 + 2;
  };

  // ── Table helper ─────────────────────────────────────────────────────────
  const table = (
    y: number,
    headers: string[],
    rows: string[][],
    colWidths: number[],
  ): number => {
    const ROW_H = 7;
    const startX = ML;

    doc.setFillColor(...PURPLE);
    doc.rect(startX, y, TW, ROW_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    let cx = startX + 2;
    headers.forEach((h, i) => {
      doc.text(h, cx, y + 5);
      cx += colWidths[i];
    });
    y += ROW_H;

    rows.forEach((row, ri) => {
      doc.setFillColor(ri % 2 === 0 ? 248 : 255, ri % 2 === 0 ? 246 : 255, ri % 2 === 0 ? 255 : 255);
      doc.rect(startX, y, TW, ROW_H, 'F');
      doc.setDrawColor(...LIGHT_GRAY);
      doc.rect(startX, y, TW, ROW_H, 'S');
      doc.setFont('helvetica', ri === rows.length - 1 ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(40, 35, 60);
      cx = startX + 2;
      row.forEach((cell, i) => {
        doc.text(cell, cx, y + 5);
        cx += colWidths[i];
      });
      y += ROW_H;
    });
    return y + 4;
  };

  // ── Highlighted box ───────────────────────────────────────────────────────
  const infoBox = (y: number, text: string, color: [number, number, number] = PURPLE): number => {
    const lines = doc.splitTextToSize(text, TW - 12) as string[];
    const h = lines.length * 5.5 + 6;
    const bg: [number, number, number] = [
      Math.round(255 - (255 - color[0]) * 0.08),
      Math.round(255 - (255 - color[1]) * 0.08),
      Math.round(255 - (255 - color[2]) * 0.08),
    ];
    doc.setFillColor(...bg);
    doc.rect(ML, y, TW, h, 'F');
    doc.setDrawColor(...color);
    doc.setLineWidth(0.4);
    doc.rect(ML, y, TW, h, 'S');
    doc.setLineWidth(0.2);
    doc.setFillColor(...color);
    doc.rect(ML, y, 2.5, h, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 35, 60);
    doc.text(lines, ML + 6, y + 5);
    return y + h + 4;
  };

  // ── Note lines helper (for handwritten annotations) ───────────────────────
  const addNoteLines = (y: number, count = 4): number => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 170, 210);
    doc.text('Notas:', ML, y);
    y += 4;
    for (let i = 0; i < count; i++) {
      doc.setDrawColor(210, 205, 230);
      doc.setLineWidth(0.25);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(ML, y + 5, PW - MR, y + 5);
      doc.setLineDashPattern([], 0);
      y += 8;
    }
    return y + 2;
  };

  const TOTAL_PAGES = 8;
  let p = 1;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Cover
  // ═══════════════════════════════════════════════════════════════════════════
  // Cover has dark background — use white logo watermark
  addWatermark(true);

  // Cover gradient block (drawn over watermark so only subtle glow shows through)
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, PH, 'F');

  // Re-add watermark on top of dark fill at very low opacity
  if (logoWhite) {
    const size = 140;
    const x = (PW - size) / 2;
    const y_wm = (PH - size) / 2 + 10;
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
    doc.addImage(logoWhite, 'PNG', x, y_wm, size, size);
    doc.restoreGraphicsState();
  }

  // Large cover logo
  if (logoWhite) {
    const logoW = 38;
    const logoH = 38;
    doc.addImage(logoWhite, 'PNG', (PW - logoW) / 2, 28, logoW, logoH);
  }

  // Purple accent bar
  doc.setFillColor(...PURPLE);
  doc.rect(0, 85, 4, 55, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('Declaración de', PW / 2, 100, { align: 'center' });
  doc.text('Impuestos', PW / 2, 118, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(...EMERALD);
  doc.text('Pequeño Contribuyente', PW / 2, 134, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(160, 150, 200);
  doc.text('Taller de Apoyo Educativo para Perito Contador', PW / 2, 148, { align: 'center' });
  doc.text('Duración: 1h 30min · Nivel: Básico-Intermedio', PW / 2, 156, { align: 'center' });

  // Divider
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.5);
  doc.line(ML + 30, 165, PW - MR - 30, 165);

  // Topics summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(130, 120, 180);
  const topics = [
    'Generalidades', 'Límite de facturación anual',
    'Leyes y reglamentos', 'Cálculo de impuestos',
    'Formulario SAT-2046', 'Libros contables y LET',
    'Omisos y rectificaciones', 'Agencia Virtual SAT',
  ];
  topics.forEach((t, i) => {
    const col = i % 2 === 0 ? ML + 10 : PW / 2 + 5;
    const row = 175 + Math.floor(i / 2) * 9;
    doc.setFillColor(...EMERALD);
    doc.circle(col - 4, row - 1, 1.2, 'F');
    doc.text(t, col, row);
  });

  // KONTAXES brand footer on cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PURPLE);
  doc.text('KONTAXES', PW / 2, PH - 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 90, 140);
  doc.text('De Números a Decisiones · kontaxes.com', PW / 2, PH - 14, { align: 'center' });

  p++;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — Generalidades + Límite de Facturación
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  let y = 22;
  y = sectionHeading(y, '1. Generalidades del Pequeño Contribuyente');
  y = infoBox(y, '¿Quién es el Pequeño Contribuyente? Persona individual o jurídica cuyas ventas anuales no superan 125 salarios mínimos (~Q500,285 para 2026, Decreto 31-2024). Tributa únicamente IVA a tasa reducida del 5% sobre el total de ventas. Base legal: Decreto 27-92, Artículos 45-50 de la Ley del IVA.');

  y = bullet(y, 'No paga ISR por este régimen (impuesto sobre la renta separado)');
  y = bullet(y, 'Emite facturas FEL (Factura Electrónica en Línea) ante SAT');
  y = bullet(y, 'Declara mensualmente usando el Formulario SAT-2046');
  y = bullet(y, 'Plazo: hasta el último día calendario del mes siguiente');
  y = bullet(y, 'Ideal para comerciantes individuales, vendedores, prestadores de servicios pequeños');
  y = bullet(y, 'No lleva contabilidad completa obligatoria (solo libro de ventas)');

  y += 4;
  y = sectionHeading(y, '2. Límite de Facturación Anual');
  y = infoBox(y, 'Decreto 31-2024: el límite para permanecer en este régimen es 125 salarios mínimos anuales (~Q500,285 para 2026). Al superar este límite, el contribuyente DEBE cambiarse al Régimen Opcional Simplificado dentro de los 30 días siguientes.', EMERALD);

  y = table(y,
    ['Situación', 'Acción requerida'],
    [
      ['Ventas ≤ 125 salarios mínimos/año', 'Permanece como Pequeño Contribuyente'],
      ['Supera el límite en algún mes', 'Cambio de régimen en ese período'],
      ['No notifica el cambio', 'Multa + recargo por evasión'],
    ],
    [110, 66],
  );

  y = addNoteLines(y, 3);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — Marco Legal
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  y = 22;
  y = sectionHeading(y, '3. Leyes y Reglamentos');

  const laws = [
    {
      title: 'Decreto 27-92 — Ley del IVA',
      items: [
        'Arts. 45-50: Régimen del Pequeño Contribuyente, tasa 5%, obligación de declarar mensualmente',
        'La base imponible es el total de ventas (no se deducen compras ni gastos)',
      ],
    },
    {
      title: 'Decreto 31-2024 — Reforma Nov 2024',
      items: [
        'Modifica el límite anual de Q500,000 fijo a 125 salarios mínimos anuales (~Q500,285 para 2026)',
        'Actualización automática cada año según salario mínimo vigente',
      ],
    },
    {
      title: 'Reglamento del IVA (Acuerdo 311-97)',
      items: [
        'Plazos: hasta el último día calendario del mes siguiente al período declarado',
        'Ejemplo: IVA de abril → declarar hasta el 31 de mayo',
        'Establece la forma de llevar el libro electrónico de ventas (LET)',
      ],
    },
    {
      title: 'Código Tributario (Decreto 6-91)',
      items: [
        'Art. 58: Intereses resarcitorios sobre impuestos no pagados',
        'Art. 92: Mora y recargos por atraso en el pago',
        'Art. 94: Omiso — Q7.50 por día de atraso, máximo Q150 por declaración',
      ],
    },
    {
      title: 'Ley FEL — Resolución SAT-DSI-1069-2018',
      items: [
        'Obliga el uso de facturas electrónicas en línea (FEL)',
        'El SAT verifica las transacciones en tiempo real',
      ],
    },
  ];

  laws.forEach(law => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...PURPLE);
    doc.text(law.title, ML, y);
    y += 6;
    law.items.forEach(item => { y = bullet(y, item, 4); });
    y += 3;
  });

  y = addNoteLines(y, 3);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — Cálculo de Impuestos
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  y = 22;
  y = sectionHeading(y, '4. Cálculo de Impuestos IVA');

  // Formula box
  doc.setFillColor(30, 10, 70);
  doc.rect(ML, y, TW, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...EMERALD);
  doc.text('IVA A PAGAR  =  Total Ventas del Mes  ×  5%', PW / 2, y + 14, { align: 'center' });
  y += 28;

  y = infoBox(y, 'La base imponible es el TOTAL de ventas (con IVA incluido en el precio). No se deducen compras ni gastos. El 5% ya está incluido en el precio de venta.', PURPLE);

  y = sectionHeading(y, 'Ejemplo práctico — Octubre 2024');

  y = table(y,
    ['Factura', 'Cliente', 'Monto'],
    [
      ['F-001', 'Cliente A', 'Q 2,500.00'],
      ['F-002', 'Cliente B', 'Q 3,800.00'],
      ['F-003', 'Cliente C', 'Q 1,250.00'],
      ['F-004', 'Cliente D', 'Q 4,600.00'],
      ['F-005', 'Cliente E', 'Q 1,000.00'],
      ['TOTAL VENTAS', '', 'Q 13,150.00'],
      ['IVA A PAGAR (5%)', '', 'Q 657.50'],
    ],
    [50, 90, 36],
  );

  y = infoBox(y, 'Plazo de pago: hasta el 30 de noviembre 2024 (último día del mes siguiente). Formulario: SAT-2046 en portal.sat.gob.gt', EMERALD);

  y = addNoteLines(y, 4);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5 — Formulario SAT-2046
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  y = 22;
  y = sectionHeading(y, '5. Llenado del Formulario SAT-2046');

  const steps = [
    { n: '01', title: 'Ingresar a Agencia Virtual', desc: 'Portal: portal.sat.gob.gt → Iniciar sesión con NIT y contraseña' },
    { n: '02', title: 'Seleccionar Declaración', desc: 'Menú: Declaraciones → IVA → Pequeño Contribuyente → Formulario SAT-2046' },
    { n: '03', title: 'Ingresar período fiscal', desc: 'Seleccionar el mes y año que se está declarando (ej: Octubre 2024)' },
    { n: '04', title: 'Registrar total de ventas', desc: 'Casilla "Total de ventas y/o servicios": ingresar el monto total facturado en el período' },
    { n: '05', title: 'Verificar el IVA calculado', desc: 'El sistema calcula automáticamente el 5%. Verificar que coincida con tu cálculo manual' },
    { n: '06', title: 'Generar y pagar', desc: 'Generar número de autorización → Pagar en banco o en línea → Guardar comprobante' },
  ];

  steps.forEach(s => {
    doc.setFillColor(...PURPLE);
    doc.circle(ML + 4, y + 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(s.n, ML + 4, y + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(s.title, ML + 12, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    const descLines = doc.splitTextToSize(s.desc, TW - 16) as string[];
    doc.text(descLines, ML + 12, y + 8);
    y += descLines.length * 4.5 + 10;
  });

  y = addNoteLines(y, 4);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 6 — Libros contables y LET
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  y = 22;
  y = sectionHeading(y, '6. Libros Contables y LET');

  const halfW = TW / 2 - 4;

  // Libro de Ventas
  doc.setFillColor(248, 246, 255);
  doc.rect(ML, y, halfW, 80, 'F');
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, halfW, 80, 'S');
  doc.setFillColor(...PURPLE);
  doc.rect(ML, y, halfW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Libro de Ventas (Excel)', ML + halfW / 2, y + 5.5, { align: 'center' });
  let lY = y + 13;
  const libroItems = [
    'Columnas: Fecha, No. Factura', 'NIT cliente, Nombre cliente',
    'Monto venta, IVA 5%', 'Total del período',
    'Una fila por factura emitida', 'Guardar respaldo mensual',
    'Base para llenar SAT-2046',
  ];
  libroItems.forEach(item => {
    doc.setFillColor(...PURPLE);
    doc.circle(ML + 5, lY + 1.5, 0.8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 35, 60);
    doc.text(item, ML + 9, lY + 2.5);
    lY += 6;
  });

  // LET
  const rx = ML + halfW + 8;
  doc.setFillColor(245, 255, 250);
  doc.rect(rx, y, halfW, 80, 'F');
  doc.setDrawColor(...EMERALD);
  doc.rect(rx, y, halfW, 80, 'S');
  doc.setFillColor(...EMERALD);
  doc.rect(rx, y, halfW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('LET Pequeño Contribuyente', rx + halfW / 2, y + 5.5, { align: 'center' });
  lY = y + 13;
  const letItems = [
    'Libro Electrónico Tributario', 'Subido mensualmente a SAT',
    'Formato: plantilla SAT (.xls)', 'Descargable en Agencia Virtual',
    'Contiene: ventas, facturas', 'Requiere firma electrónica',
    'Plazo: igual que la declaración',
  ];
  letItems.forEach(item => {
    doc.setFillColor(...EMERALD);
    doc.circle(rx + 5, lY + 1.5, 0.8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 35, 60);
    doc.text(item, rx + 9, lY + 2.5);
    lY += 6;
  });
  y += 88;

  y = infoBox(y, 'El LET reemplaza los libros físicos sellados. La plantilla se descarga en portal.sat.gob.gt → Herramientas → LET Pequeño Contribuyente. Debe subirse el mismo mes en que vence la declaración.', EMERALD);

  y = addNoteLines(y, 4);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 7 — Omisos y Rectificaciones
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  y = 22;
  y = sectionHeading(y, '7. Omisos y Rectificaciones');

  y = infoBox(y, '¡ATENCIÓN! No presentar la declaración mensual a tiempo genera multas, intereses y mora automáticos. El SAT puede detectar omisos mediante el cruce de información FEL.', [239, 68, 68]);

  y = table(y,
    ['Concepto', 'Detalle', 'Base legal'],
    [
      ['Omiso (multa por día)', 'Q 7.50 por cada día de atraso · máximo Q 150 por declaración', 'Art. 94 C.T.'],
      ['Interés resarcitorio', 'Calculado sobre el impuesto no pagado, según tasa legal vigente', 'Art. 58 C.T.'],
      ['Mora / Recargo', 'Cargo adicional por el tiempo de retraso en el pago', 'Art. 92 C.T.'],
      ['Rectificación', 'Si declaraste mal, presentás una declaración rectificativa. Costo: Q 15.00', 'Art. 154 C.T.'],
    ],
    [48, 100, 28],
  );

  y = sectionHeading(y, 'Ejemplo — IVA de agosto Q 400, presentado 20 días tarde');
  y = table(y,
    ['Concepto', 'Cálculo', 'Total'],
    [
      ['Impuesto original', 'Base', 'Q 400.00'],
      ['Omiso (20 días × Q7.50)', 'Q7.50 × 20 = Q150 (máximo)', 'Q 150.00'],
      ['Intereses (aprox.)', 'Tasa legal sobre Q400', '~Q 8.00'],
      ['Mora (aprox.)', 'Recargo por atraso', '~Q 12.00'],
      ['TOTAL A PAGAR', '', 'Q 570.00'],
    ],
    [70, 80, 26],
  );

  y = infoBox(y, 'Una deuda de Q400 se convirtió en Q570 — Q170 extra que podías ahorrarte. Declarar a tiempo siempre es la mejor decisión. Recuerda: si quieres corregir una declaración ya presentada, el costo es Q15.', [239, 68, 68]);

  y = sectionHeading(y, 'Proceso de Rectificación');
  y = bullet(y, 'Agencia Virtual → Declaraciones → Rectificar → seleccionar el período a corregir');
  y = bullet(y, 'Si el nuevo impuesto es mayor, se calculan intereses desde la fecha original de vencimiento');
  y = bullet(y, 'El costo fijo de rectificar es Q 15.00');
  y = bullet(y, 'Si el nuevo impuesto es menor, puedes solicitar devolución o crédito al SAT');

  y = addNoteLines(y, 3);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 8 — Agencia Virtual + Caso Práctico
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  addWatermark(false);
  addHeader(p++, TOTAL_PAGES);
  addFooter();

  y = 22;
  y = sectionHeading(y, '8. Cómo buscar formularios en Agencia Virtual');

  const avSteps = [
    'Ingresar a portal.sat.gob.gt',
    'Iniciar sesión con NIT y contraseña (o acceso con PIN)',
    'Ir a "Declaraciones" → "Mis Declaraciones Enviadas"',
    'Filtrar por período fiscal (mes/año)',
    'Dar clic en "Ver" para ver el detalle o "Descargar" para obtener el PDF',
    'Para pagos: "Mis Pagos" → "Comprobantes de Pago"',
  ];
  avSteps.forEach((s, i) => { y = bullet(y, `${i + 1}. ${s}`); });

  y += 6;
  y = sectionHeading(y, 'Caso Práctico — Comercial San José, Noviembre 2024');

  y = infoBox(y, 'Instrucción: Con los datos de las siguientes facturas, calcular el IVA a pagar, completar el resumen del formulario SAT-2046 y determinar si hay multa si se presenta el 20 de diciembre.', PURPLE);

  y = table(y,
    ['No. Factura', 'Fecha', 'Cliente', 'Monto Venta'],
    [
      ['F-100', '05/Nov', 'Distribuidora Pérez', 'Q 8,500.00'],
      ['F-101', '10/Nov', 'Ferretería El Clavo', 'Q 3,200.00'],
      ['F-102', '15/Nov', 'Tienda La Esquina', 'Q 5,750.00'],
      ['F-103', '22/Nov', 'Librería Central', 'Q 2,100.00'],
      ['F-104', '28/Nov', 'Cliente Varios', 'Q 1,450.00'],
    ],
    [35, 25, 80, 36],
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PURPLE);
  doc.text('Preguntas para resolver en clase:', ML, y);
  y += 7;
  const questions = [
    '¿Cuál es el total de ventas del mes de noviembre?',
    '¿Cuánto es el IVA a pagar (5%)?',
    '¿La presentación del 20 de diciembre genera multa? ¿Por qué?',
    '¿Qué datos se ingresan en el formulario SAT-2046?',
    '¿Cuántos registros se incluirían en el LET de noviembre?',
  ];
  questions.forEach((q, i) => { y = bullet(y, `${i + 1}. ${q}`); });

  y = addNoteLines(y, 3);

  // ── Save ─────────────────────────────────────────────────────────────────
  doc.save('KONTAXES-Pequeno-Contribuyente-Material.pdf');
}
