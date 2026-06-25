export interface QuotationData {
  contribuyente: string;
  regimen: string;
  activos: string;
  contabilidadCompleta: string;
  facturacion: string;
  tipoNegocio: string;
  certificador: string;
  nombre?: string;
  empresa?: string;
  whatsapp?: string;
  correo?: string;
}

export interface QuotationResult {
  total: number;
  breakdown: Array<{item: string;cost: number;note?: string;}>;
  warnings: string[];
}

export function calculateQuotation(data: QuotationData): QuotationResult {
  const breakdown: Array<{item: string;cost: number;note?: string;}> = [];
  const warnings: string[] = [];
  let total = 0;

  // Tipo de contribuyente
  if (data.contribuyente === 'individual') {
    breakdown.push({ item: 'Empresa o persona individual', cost: 250 });
    total += 250;
  } else if (data.contribuyente === 'sociedad') {
    breakdown.push({ item: 'Sociedad Anónima', cost: 500 });
    total += 500;
  }

  // Régimen de impuestos
  if (data.regimen === 'pequeño') {
    breakdown.push({ item: 'IVA Pequeño contribuyente 5%', cost: 0 });
  } else if (data.regimen === 'iva-isr-5-7') {
    breakdown.push({ item: 'IVA 12% + ISR 5-7%', cost: 150 });
    total += 150;
  } else if (data.regimen === 'iva-isr-25-iso') {
    breakdown.push({ item: 'IVA 12% + ISR 25% + ISO', cost: 250 });
    total += 250;
  } else if (data.regimen === 'no-se') {
    warnings.push(
      'Deberá contactar con un asesor para determinar el régimen más conveniente'
    );
  }

  // Monto de activos
  if (data.activos === 'menor-25k') {
    breakdown.push({
      item: 'Activos de Q0 a Q25,000',
      cost: 0,
      note: 'No es necesario llevar contabilidad completa'
    });
  } else if (data.activos === 'mayor-25k') {
    breakdown.push({ item: 'Activos mayores a Q25,000', cost: 0 });
  }

  // Contabilidad completa
  const needsFullAccounting =
  (data.regimen === 'iva-isr-5-7' || data.regimen === 'iva-isr-25-iso') &&
  data.activos === 'mayor-25k';

  if (data.contabilidadCompleta === 'si' || needsFullAccounting) {
    breakdown.push({
      item: 'Contabilidad completa (Obligatorio por ley)',
      cost: 250,
      note: 'Se utilizará el sistema Odoo'
    });
    total += 250;
  } else if (data.contabilidadCompleta === 'no' && !needsFullAccounting) {
    breakdown.push({
      item: 'Sin contabilidad completa',
      cost: 0,
      note: 'No es necesario llevar contabilidad completa ni utilizar Odoo'
    });
  }

  // Cantidad de facturación
  if (data.facturacion === '0-10') {
    breakdown.push({ item: 'Facturación: 0 a 10 al mes', cost: 0 });
  } else if (data.facturacion === '11-50') {
    breakdown.push({ item: 'Facturación: 11 a 50 al mes', cost: 100 });
    total += 100;
  } else if (data.facturacion === '51-100') {
    breakdown.push({ item: 'Facturación: 51 a 100 al mes', cost: 200 });
    total += 200;
  } else if (data.facturacion === 'mas-100') {
    breakdown.push({
      item: 'Facturación: Más de 100 al mes',
      cost: 300,
      note: 'Costo mínimo. Se definirá con un asesor'
    });
    total += 300;
  }

  // Tipo de negocio
  if (data.tipoNegocio === 'servicios') {
    breakdown.push({
      item: 'Servicios técnicos, profesionales o en general',
      cost: 0
    });
  } else if (data.tipoNegocio === 'compra-venta') {
    breakdown.push({
      item: 'Compra-venta de bienes',
      cost: 250,
      note: 'Incluye módulo de inventarios y cálculo de costo de ventas'
    });
    total += 250;
  }

  // Certificador
  if (data.certificador === 'si') {
    warnings.push(
      'El costo de implementación asciende a Q375 que se cobrará por separado, y el costo por DTE emitido es de Q0.20 a facturarse por separado.'
    );
  } else if (data.certificador === 'no') {
    warnings.push(
      'El certificador se puede implementar después. El costo dependerá de la cantidad de facturas a emitir al año, a cobrarse anualmente. Se deberá determinar con un asesor'
    );
  }

  return { total, breakdown, warnings };
}