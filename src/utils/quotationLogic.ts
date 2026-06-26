export type ServiceType =
  | 'contable'
  | 'auditoria'
  | 'outsourcing'
  | 'modulos-odoo'
  | 'implementacion-odoo';

export type Contribuyente = 'individual' | 'sociedad';
export type Regimen = 'pequeño' | 'opcional' | 'general';
export type Alcance = 'servicios' | 'compra-venta';
export type CertFEL = 'ninguno' | 'odoo' | 'finanz-ia';

export interface QuotationData {
  serviceType: ServiceType | '';
  contribuyente: Contribuyente | '';
  regimen: Regimen | '';
  activosMayor25k: boolean | null;
  alcance: Alcance | '';
  contabilidadCompleta: boolean | null;
  presentacionImpuestos: boolean | null;
  certFEL: CertFEL | '';
  whatsappFEL: boolean | null;
  nombre?: string;
  empresa?: string;
  whatsapp?: string;
  correo?: string;
}

export interface BreakdownItem {
  item: string;
  cost: number;
  note?: string;
}

export interface QuotationResult {
  total: number;
  breakdown: BreakdownItem[];
  notes: string[];
}

const BASE_PRICES: Record<Contribuyente, Record<Regimen, number>> = {
  individual: { pequeño: 250, opcional: 450, general: 550 },
  sociedad:   { pequeño: 750, opcional: 950, general: 1050 },
};

export const FORMS: Record<Regimen, number> = { pequeño: 1, opcional: 2, general: 4 };

export const REGIMEN_LABEL: Record<Regimen, string> = {
  pequeño:  'Pequeño Contribuyente (IVA 5%)',
  opcional: 'IVA 12% + ISR Opcional 5–7%',
  general:  'IVA 12% + ISR Sobre Utilidades 25%',
};

export const CONTRIB_LABEL: Record<Contribuyente, string> = {
  individual: 'Persona / Comerciante Individual',
  sociedad:   'Sociedad / Empresa (Persona Jurídica)',
};

export const SERVICE_LABEL: Record<ServiceType, string> = {
  contable:              'Servicios Contables',
  auditoria:             'Auditoría',
  outsourcing:           'Outsourcing',
  'modulos-odoo':        'Módulos Odoo',
  'implementacion-odoo': 'Implementación Odoo',
};

export function isContabilidadObligatoria(
  data: Pick<QuotationData, 'contribuyente' | 'regimen' | 'activosMayor25k'>
): boolean {
  if (!data.contribuyente || !data.regimen) return false;
  if (data.contribuyente !== 'sociedad') return false;
  if (data.regimen === 'opcional' || data.regimen === 'general') return true;
  if (data.regimen === 'pequeño' && data.activosMayor25k === true) return true;
  return false;
}

export function needsActivosQuestion(
  data: Pick<QuotationData, 'contribuyente' | 'regimen'>
): boolean {
  return data.contribuyente === 'sociedad' && data.regimen === 'pequeño';
}

export function calculateQuotation(data: QuotationData): QuotationResult {
  const breakdown: BreakdownItem[] = [];
  const notes: string[] = [];
  let total = 0;

  if (!data.contribuyente || !data.regimen) return { total: 0, breakdown: [], notes: [] };

  const contrib = data.contribuyente as Contribuyente;
  const reg     = data.regimen as Regimen;

  const base = BASE_PRICES[contrib][reg];
  const obligatoria = isContabilidadObligatoria(data);
  const tieneContabilidad = obligatoria || data.contabilidadCompleta === true;

  breakdown.push({
    item: `Servicio contable — ${CONTRIB_LABEL[contrib]} · ${REGIMEN_LABEL[reg]}`,
    cost: base,
    note: tieneContabilidad
      ? 'Incluye estados financieros básicos y libros contables'
      : 'Incluye libro de compras y ventas',
  });
  total += base;

  if (data.alcance === 'compra-venta') {
    breakdown.push({
      item: 'Alcance compra-venta — sistema de inventarios y costo de ventas',
      cost: 500,
      note: 'Control de inventarios, costo de ventas y conciliación de mercancías',
    });
    total += 500;
  }

  if (tieneContabilidad) {
    breakdown.push({
      item: `Contabilidad completa con FinanzIA${obligatoria ? ' — obligatoria por ley' : ''}`,
      cost: 500,
      note: obligatoria
        ? 'Obligatoria según normativa vigente. Catálogo de cuentas, asientos y estados financieros.'
        : 'Catálogo de cuentas, asientos contables y estados financieros en FinanzIA.',
    });
    total += 500;
  }

  if (data.presentacionImpuestos === true) {
    const numForms = FORMS[reg];
    const costImp  = numForms * 100;
    const formLabel = numForms === 1 ? '1 formulario' : `${numForms} formularios`;
    breakdown.push({
      item: `Presentación de impuestos (${formLabel})`,
      cost: costImp,
      note: reg === 'pequeño'
        ? 'Declaración mensual de IVA 5% (Formulario 2046)'
        : reg === 'opcional'
        ? 'IVA mensual (F2000) + ISR trimestral (F2189)'
        : 'IVA mensual (F2000) + ISR trimestral (F2189) + ISO (F2189) + Cierre anual',
    });
    total += costImp;
  }

  if (data.whatsappFEL === true) {
    breakdown.push({
      item: 'FELSimple — Emisión de facturas por WhatsApp',
      cost: 50,
      note: 'Factura electrónica certificada directamente desde WhatsApp en segundos',
    });
    total += 50;
  }

  if (data.certFEL === 'odoo') {
    notes.push(
      'Certificador FEL vía Odoo (CORPOSISTEMAS, S.A.): Q375 de implementación (cobro único, facturado por separado) + Q0.20 por DTE emitido, facturado mensualmente por separado.'
    );
  } else if (data.certFEL === 'finanz-ia') {
    notes.push(
      'Certificador FEL vía FinanzIA: Q0.20 por DTE emitido, facturado mensualmente por separado. Sin costo de implementación adicional.'
    );
  }

  return { total, breakdown, notes };
}

export function buildFormSummary(data: QuotationData): string[] {
  const lines: string[] = [];
  if (data.contribuyente) lines.push(CONTRIB_LABEL[data.contribuyente as Contribuyente]);
  if (data.regimen) lines.push(REGIMEN_LABEL[data.regimen as Regimen]);
  if (data.activosMayor25k === true)  lines.push('Activos mayores a Q25,000');
  if (data.activosMayor25k === false) lines.push('Activos hasta Q25,000');
  if (data.alcance === 'servicios')    lines.push('Negocio de servicios');
  if (data.alcance === 'compra-venta') lines.push('Compra-venta de bienes (inventarios y costos)');
  const obligatoria = isContabilidadObligatoria(data);
  if (obligatoria || data.contabilidadCompleta === true)
    lines.push('Contabilidad completa con FinanzIA');
  if (data.presentacionImpuestos === true)
    lines.push(`Presentación de impuestos (${FORMS[data.regimen as Regimen]} formulario(s))`);
  if (data.certFEL === 'odoo')      lines.push('Certificador FEL vía Odoo (CORPOSISTEMAS, S.A.)');
  if (data.certFEL === 'finanz-ia') lines.push('Certificador FEL vía FinanzIA');
  if (data.certFEL === 'ninguno')   lines.push('Sin certificador FEL por ahora');
  if (data.whatsappFEL === true)    lines.push('FELSimple — Facturas por WhatsApp (+Q50/mes)');
  return lines;
}

export function buildWAText(data: QuotationData, result: QuotationResult): string {
  const summary = buildFormSummary(data);
  const clientLine = data.nombre
    ? `*${data.nombre}*${data.empresa ? ` — ${data.empresa}` : ''}`
    : '';
  const parts = [
    '👋 Hola KONTAXES, acabo de generar mi cotización estimada:',
    clientLine,
    '',
    '📋 *Servicios seleccionados:*',
    ...summary.map(s => `• ${s}`),
    '',
    `💰 *Total mensual estimado: Q ${result.total.toLocaleString('es-GT')}.00*`,
    '',
    ...(result.notes.length > 0
      ? ['📌 *Notas:*', ...result.notes.map(n => `ℹ ${n}`), '']
      : []),
    '¿Podemos agendar una llamada para confirmar los detalles?',
  ].filter(Boolean);
  return encodeURIComponent(parts.join('\n'));
}

export function buildEmailBody(data: QuotationData, result: QuotationResult): string {
  const summary = buildFormSummary(data);
  const parts = [
    'Estimado equipo de KONTAXES,',
    '',
    'He generado la siguiente cotización estimada desde su sitio web:',
    '',
    'Datos del solicitante:',
    data.nombre   ? `Nombre: ${data.nombre}`     : '',
    data.empresa  ? `Empresa: ${data.empresa}`   : '',
    data.whatsapp ? `WhatsApp: ${data.whatsapp}` : '',
    data.correo   ? `Correo: ${data.correo}`     : '',
    '',
    'Servicios:',
    ...summary.map(s => `• ${s}`),
    '',
    `Total mensual estimado: Q ${result.total.toLocaleString('es-GT')}.00`,
    '',
    ...(result.notes.length > 0
      ? ['Notas adicionales:', ...result.notes.map(n => `- ${n}`), '']
      : []),
    'Quedo a la espera de su contacto.',
    data.nombre || '',
  ].filter(l => l !== undefined);
  return encodeURIComponent(parts.join('\n'));
}
