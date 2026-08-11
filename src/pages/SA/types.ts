export interface DatosSociedad {
  denominacion: string;
  objeto_social: string;
  capital_autorizado: string;
  capital_suscrito: string;
  capital_pagado: string;
  moneda: string;
  domicilio: string;
  plazo_duracion: string;
  ejercicio_contable: string;
}

export interface DatosSocio {
  id: string;
  nombre_completo: string;
  dpi: string;
  nit: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  nacionalidad: string;
  estado_civil: string;
  profesion: string;
  direccion: string;
  telefono: string;
  correo: string;
  num_acciones: string;
  valor_accion: string;
  cargo_junta: string; // '' | 'gerente' | 'presidente' | 'secretario' | 'tesorero' | 'vocal'
}

export interface JuntaDirectiva {
  gerente_general: string;
  presidente: string;
  secretario: string;
  tesorero: string;
  vocales: string;
}

export interface FormProgress {
  step: number;
  sociedad: Partial<DatosSociedad>;
  socios: DatosSocio[];
  junta: Partial<JuntaDirectiva>;
  notas_adicionales: string;
}

export const EMPTY_SOCIO = (): DatosSocio => ({
  id: crypto.randomUUID(),
  nombre_completo: '',
  dpi: '',
  nit: '',
  fecha_nacimiento: '',
  lugar_nacimiento: '',
  nacionalidad: 'Guatemalteca',
  estado_civil: '',
  profesion: '',
  direccion: '',
  telefono: '',
  correo: '',
  num_acciones: '',
  valor_accion: '',
  cargo_junta: '',
});

export const EMPTY_PROGRESS = (): FormProgress => ({
  step: 0,
  sociedad: {},
  socios: [EMPTY_SOCIO(), EMPTY_SOCIO()],
  junta: {},
  notas_adicionales: '',
});

export const STEPS = [
  { id: 0, label: 'Datos de la Sociedad',  icon: '🏢' },
  { id: 1, label: 'Socios',                icon: '👥' },
  { id: 2, label: 'Junta Directiva',       icon: '⚖️' },
  { id: 3, label: 'Revisión y Envío',      icon: '✅' },
];
