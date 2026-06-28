export type ServiceType =
  | 'contable'
  | 'admin-financiero'
  | 'auditoria'
  | 'consultoria-fiscal'
  | 'outsourcing'
  | 'odoo'
  | 'legales';

export type OdooSubtype = 'modulos-ktx' | 'acceso' | 'implementacion';
export type OutsourcingRole = 'auxiliar' | 'analista' | 'junior' | 'senior';
export type AccesoPlan = 'plan-1' | 'plan-5' | 'plan-10';
export type Contribuyente = 'individual' | 'sociedad';
export type Regimen = 'pequeño' | 'opcional' | 'general';
export type Alcance = 'servicios' | 'compra-venta';
export type CertFEL = 'ninguno' | 'odoo' | 'finanz-ia';

export interface QuotationData {
  serviceType: ServiceType | '';
  // Contable + Outsourcing
  contribuyente: Contribuyente | '';
  regimen: Regimen | '';
  activosMayor25k: boolean | null;
  alcance: Alcance | '';
  contabilidadCompleta: boolean | null;
  planillaIGSS: boolean | null;
  presentacionImpuestos: boolean | null;
  certFEL: CertFEL | '';
  whatsappFEL: boolean | null;
  // Outsourcing
  outsourcingRole: OutsourcingRole | '';
  // Odoo
  odooSubtype: OdooSubtype | '';
  implementacionChoice: 'acceso' | 'partner' | '';
  accesoPlan: AccesoPlan | '';
  accesoUsuariosAdicionales: number; // -1 = no respondido
  // Contact
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

// ── Labels ─────────────────────────────────────────────────────────────────

export const FORMS: Record<Regimen, number> = { pequeño: 1, opcional: 4, general: 4 };

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
  contable:             'Servicios Contables',
  'admin-financiero':   'Servicios Administrativos-Financieros',
  auditoria:            'Auditoría',
  'consultoria-fiscal': 'Consultoría y Asesoría Fiscal',
  outsourcing:          'Outsourcing',
  odoo:                 'Odoo',
  legales:              'Servicios Legales',
};

export const OUTSOURCING_ROLE_LABEL: Record<OutsourcingRole, string> = {
  auxiliar: 'Auxiliar Contable (Operativo)',
  analista: 'Analista Contable e Impuestos',
  junior:   'Contador Junior',
  senior:   'Contador Senior',
};

export const HOURLY_RATE: Record<OutsourcingRole, number> = {
  auxiliar: 30,
  analista: 40,
  junior:   50,
  senior:   60,
};

export const ACCESO_PLANS: Record<AccesoPlan, { label: string; total: number }> = {
  'plan-1':  { label: '1 empresa + 1 usuario',   total: 600  },
  'plan-5':  { label: '5 empresas + 1 usuario',  total: 900  },
  'plan-10': { label: '10 empresas + 1 usuario', total: 1100 },
};

export const PRICE_USUARIO_ADICIONAL = 150;

// ── KTX Modules ────────────────────────────────────────────────────────────

export const KTX_MODULES = [
  { name: 'Liquidación de Gastos',         url: 'https://apps.odoo.com/apps/modules/19.0/ktx_expense_management' },
  { name: 'Caja Chica',                    url: 'https://apps.odoo.com/apps/modules/19.0/ktx_petty_cash'         },
  { name: 'Importación Masiva XML-SAT-FEL-GT', url: 'https://apps.odoo.com/apps/modules/19.0/ktx_mass_import'   },
  { name: 'Asignación Masiva',             url: 'https://apps.odoo.com/apps/modules/19.0/ktx_mass_update'        },
  { name: 'Impresión de Cheques',          url: 'https://apps.odoo.com/apps/modules/19.0/ktx_check_print'        },
  { name: 'Reportería Fiscal SAT-GT',      url: 'https://apps.odoo.com/apps/modules/19.0/ktx_satgt_reports'      },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Contable ───────────────────────────────────────────────────────────────

const BASE_PRICES: Record<Contribuyente, Record<Regimen, number>> = {
  individual: { pequeño: 250, opcional: 450, general: 550  },
  sociedad:   { pequeño: 750, opcional: 950, general: 1050 },
};

export function calculateQuotation(data: QuotationData): QuotationResult {
  const breakdown: BreakdownItem[] = [];
  const notes: string[] = [];
  let total = 0;

  if (!data.contribuyente || !data.regimen) return { total: 0, breakdown: [], notes: [] };

  const contrib = data.contribuyente as Contribuyente;
  const reg     = data.regimen as Regimen;
  const obligatoria = isContabilidadObligatoria(data);
  const incluyeContabilidad = obligatoria || data.contabilidadCompleta === true;

  const base = BASE_PRICES[contrib][reg];
  breakdown.push({
    item: `Servicio contable — ${CONTRIB_LABEL[contrib]} · ${REGIMEN_LABEL[reg]}`,
    cost: base,
    note: incluyeContabilidad ? 'Incluye libros contables' : 'Incluye libro de compras y ventas',
  });
  total += base;

  if (data.alcance === 'compra-venta') {
    const isIndividualPequeno = contrib === 'individual' && reg === 'pequeño';
    if (!(isIndividualPequeno && !incluyeContabilidad)) {
      const costCV = isIndividualPequeno ? 250 : 500;
      breakdown.push({
        item: 'Alcance compra-venta — sistema de inventarios y costo de ventas',
        cost: costCV,
        note: 'Control de inventarios, costo de ventas y conciliación de mercancías',
      });
      total += costCV;
    }
  }

  if (incluyeContabilidad) {
    breakdown.push({
      item: `Contabilidad completa${obligatoria ? ' — obligatoria por ley' : ''}`,
      cost: 500,
      note: obligatoria
        ? 'Obligatoria según normativa vigente. Catálogo de cuentas, asientos y estados financieros.'
        : 'Catálogo de cuentas, asientos contables y estados financieros básicos.',
    });
    total += 500;
  }

  if (incluyeContabilidad && data.planillaIGSS === true) {
    breakdown.push({
      item: 'Elaboración de planilla e IGSS',
      cost: 250,
      note: 'Control contable y generación de reportes SAT-IGSS. No incluye realizar los desembolsos.',
    });
    total += 250;
  }

  if (data.presentacionImpuestos === true) {
    const numForms = FORMS[reg];
    const pricePerForm = contrib === 'individual' ? 50 : 100;
    const costImp = numForms * pricePerForm;
    breakdown.push({
      item: 'Presentación de impuestos',
      cost: costImp,
      note: reg === 'pequeño'
        ? 'Declaración mensual de IVA 5%'
        : reg === 'opcional'
        ? 'IVA mensual · ISR anual · ISR retenciones proveedores · ISR retenciones empleados · otros aplicables'
        : 'IVA mensual · ISR trimestral · ISO trimestral · ISR anual · ISR retenciones proveedores · ISR retenciones empleados · otros aplicables',
    });
    total += costImp;
  }

  if (data.whatsappFEL === true) {
    breakdown.push({
      item: 'Emisión de facturas por WhatsApp',
      cost: 50,
      note: 'Factura electrónica certificada directamente desde WhatsApp en segundos',
    });
    total += 50;
  }

  if (data.certFEL === 'odoo') {
    notes.push('Certificador FEL: Q375 de implementación (cobro único, facturado por separado) + Q0.20 por DTE emitido, facturado mensualmente por separado.');
  } else if (data.certFEL === 'finanz-ia') {
    notes.push('Certificador FEL: Q0.20 por DTE emitido, facturado mensualmente por separado. Sin costo de implementación adicional.');
  }

  return { total, breakdown, notes };
}

// ── Outsourcing ────────────────────────────────────────────────────────────

const BASE_HOURS: Record<Contribuyente, Record<Regimen, number>> = {
  individual: { pequeño: 20, opcional: 35, general: 45 },
  sociedad:   { pequeño: 30, opcional: 50, general: 65 },
};

export function calculateOutsourcingQuotation(data: QuotationData): QuotationResult {
  if (!data.contribuyente || !data.regimen || !data.outsourcingRole)
    return { total: 0, breakdown: [], notes: [] };

  const contrib = data.contribuyente as Contribuyente;
  const reg     = data.regimen as Regimen;
  const role    = data.outsourcingRole as OutsourcingRole;
  const rate    = HOURLY_RATE[role];
  const obligatoria = isContabilidadObligatoria(data);
  const incluyeContabilidad = obligatoria || data.contabilidadCompleta === true;

  let hours = BASE_HOURS[contrib][reg];

  if (data.alcance === 'compra-venta') {
    const isIndPequeno = contrib === 'individual' && reg === 'pequeño';
    if (isIndPequeno && incluyeContabilidad) hours += 8;
    else if (!isIndPequeno) hours += 15;
  }

  if (incluyeContabilidad) hours += 20;
  if (data.planillaIGSS === true) hours += 10;
  if (data.presentacionImpuestos === true) hours += FORMS[reg] * 3;
  if (data.whatsappFEL === true) hours += 2;

  const laborCost  = hours * rate;
  const supervision = 800;

  const breakdown: BreakdownItem[] = [
    {
      item: `Personal tercerizado — ${OUTSOURCING_ROLE_LABEL[role]}`,
      cost: laborCost,
      note: `${hours} horas/mes × Q${rate}/hr`,
    },
    {
      item: 'Supervisión mensual (4 visitas)',
      cost: supervision,
      note: '1 visita semanal × Q200 c/u',
    },
  ];

  return { total: laborCost + supervision, breakdown, notes: [] };
}

// ── Acceso SaaS ────────────────────────────────────────────────────────────

export function calculateAccesoQuotation(data: QuotationData): QuotationResult {
  if (!data.accesoPlan) return { total: 0, breakdown: [], notes: [] };

  const plan = ACCESO_PLANS[data.accesoPlan];
  const breakdown: BreakdownItem[] = [
    { item: `Plan ${plan.label}`, cost: plan.total },
  ];
  let total = plan.total;

  if (data.accesoUsuariosAdicionales > 0) {
    const extraCost = data.accesoUsuariosAdicionales * PRICE_USUARIO_ADICIONAL;
    breakdown.push({
      item: `Usuarios adicionales (${data.accesoUsuariosAdicionales})`,
      cost: extraCost,
      note: `Q${PRICE_USUARIO_ADICIONAL}/usuario × ${data.accesoUsuariosAdicionales} usuario(s)`,
    });
    total += extraCost;
  }

  return {
    total,
    breakdown,
    notes: [
      'Servicio SaaS: derecho de uso y acceso a nuestra base de datos Odoo V19 Enterprise. ' +
      'No es una implementación propia del cliente — incluye acceso a nuestros módulos preinstalados. ' +
      'Módulos adicionales se desarrollan con costo separado.',
    ],
  };
}

// ── Helpers para WA / email ────────────────────────────────────────────────

export function buildFormSummary(data: QuotationData): string[] {
  const lines: string[] = [];

  if (data.serviceType === 'outsourcing' && data.outsourcingRole) {
    lines.push(OUTSOURCING_ROLE_LABEL[data.outsourcingRole as OutsourcingRole]);
  }

  if (data.serviceType === 'odoo' && data.accesoPlan) {
    const p = ACCESO_PLANS[data.accesoPlan as AccesoPlan];
    lines.push(`Plan ${p.label}`);
    if (data.accesoUsuariosAdicionales > 0)
      lines.push(`${data.accesoUsuariosAdicionales} usuario(s) adicional(es)`);
    return lines;
  }

  if (data.contribuyente) lines.push(CONTRIB_LABEL[data.contribuyente as Contribuyente]);
  if (data.regimen) lines.push(REGIMEN_LABEL[data.regimen as Regimen]);
  if (data.activosMayor25k === true)  lines.push('Activos mayores a Q25,000');
  if (data.activosMayor25k === false) lines.push('Activos hasta Q25,000');
  if (data.alcance === 'servicios')    lines.push('Negocio de servicios');
  if (data.alcance === 'compra-venta') lines.push('Compra-venta de bienes');
  const obligatoria = isContabilidadObligatoria(data);
  if (obligatoria || data.contabilidadCompleta === true) lines.push('Contabilidad completa');
  if (data.planillaIGSS === true) lines.push('Elaboración de planilla e IGSS');
  if (data.presentacionImpuestos === true) {
    const reg = data.regimen as Regimen;
    const taxDetail =
      reg === 'pequeño'  ? 'IVA 5% mensual' :
      reg === 'opcional' ? 'IVA mensual · ISR anual · ISR retenciones proveedores · ISR retenciones empleados' :
                           'IVA mensual · ISR trimestral · ISO trimestral · ISR anual · ISR retenciones proveedores · ISR retenciones empleados';
    lines.push(`Presentación de impuestos — ${taxDetail}`);
  }
  if (data.certFEL === 'odoo' || data.certFEL === 'finanz-ia') lines.push('Certificador FEL');
  if (data.certFEL === 'ninguno')  lines.push('Sin certificador FEL por ahora');
  if (data.whatsappFEL === true)   lines.push('Facturas por WhatsApp');
  return lines;
}

export function buildWAText(data: QuotationData, result: QuotationResult): string {
  const summary = buildFormSummary(data);
  const clientLine = data.nombre
    ? `*${data.nombre}*${data.empresa ? ` — ${data.empresa}` : ''}`
    : '';
  const serviceLabel = data.serviceType ? SERVICE_LABEL[data.serviceType as ServiceType] : '';
  const parts = [
    `👋 Hola KONTAXES, acabo de generar mi cotización estimada de ${serviceLabel}:`,
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
    '📎 Adjunto el PDF con el desglose completo.',
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
