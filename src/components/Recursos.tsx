import React from 'react';
import { PlayCircleIcon, BookOpenIcon, ClockIcon, UsersIcon, StarIcon } from 'lucide-react';

interface RecursosProps {
  isDark: boolean;
  onOpen: (id: string) => void;
}

interface Course {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  available: boolean;
  badge?: string;
}

const courses: Course[] = [
  {
    id: 'pequeno-contribuyente',
    category: 'Impuestos',
    title: 'Declaración de Impuestos',
    subtitle: 'Pequeño Contribuyente',
    description:
      'Aprende a declarar el IVA como Pequeño Contribuyente: cálculo, formulario SAT-2046, libros contables y qué pasa si no declaras.',
    duration: '1h 30min',
    level: 'Básico-Intermedio',
    topics: [
      'Generalidades del régimen',
      'Límite Q500,000 anual',
      'Cálculo del 5% IVA',
      'Formulario SAT-2046',
      'LET Pequeño Contribuyente',
      'Multas y rectificaciones',
    ],
    available: true,
    badge: 'Nuevo',
  },
  {
    id: 'regimen-opcional',
    category: 'Impuestos',
    title: 'Régimen Opcional Simplificado',
    subtitle: 'ISR + IVA 12%',
    description:
      'Comprende cómo funciona el régimen opcional: ISR trimestral, IVA mensual, retenciones y cierre anual.',
    duration: '2h',
    level: 'Intermedio',
    topics: ['ISR trimestral', 'IVA 12%', 'Retenciones', 'Formularios SAT', 'Cierre anual'],
    available: false,
  },
  {
    id: 'fel-facturacion',
    category: 'Facturación',
    title: 'Facturación Electrónica FEL',
    subtitle: 'Emisión y Anulación',
    description:
      'Domina la facturación electrónica en línea: cómo emitir, anular, tipos de DTE y obligaciones del contribuyente.',
    duration: '1h',
    level: 'Básico',
    topics: ['Qué es FEL', 'Tipos de DTE', 'Emisión práctica', 'Anulación', 'Errores frecuentes'],
    available: false,
  },
  {
    id: 'planilla-igss',
    category: 'Recursos Humanos',
    title: 'Planilla e IGSS',
    subtitle: 'Liquidación Mensual',
    description:
      'Aprende a calcular la planilla, cuotas IGSS patronal y laboral, IRTRA, INTECAP y liquidaciones laborales.',
    duration: '1h 30min',
    level: 'Intermedio',
    topics: ['Cálculo de salarios', 'Cuotas IGSS', 'IRTRA e INTECAP', 'Aguinaldo y bono 14', 'Liquidaciones'],
    available: false,
  },
];

export function Recursos({ isDark, onOpen }: RecursosProps) {
  return (
    <section
      id="recursos"
      className={`py-24 relative ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{
              background: 'rgba(124,58,237,0.08)',
              borderColor: 'rgba(124,58,237,0.2)',
            }}>
            <BookOpenIcon size={14} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 tracking-wide uppercase">
              Recursos Educativos
            </span>
          </div>
          <h2
            className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Capacitaciones &amp;{' '}
            <span className="bg-gradient-to-r from-purple-500 to-violet-400 bg-clip-text text-transparent">
              Talleres
            </span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Conocimiento contable aplicable para estudiantes y profesionales. Talleres gratuitos
            de apoyo social para la carrera de Perito Contador.
          </p>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isDark={isDark}
              onOpen={onOpen}
            />
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12 reveal">
          <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Más talleres próximamente · Programa de apoyo educativo para institutos de la carrera Perito Contador
          </p>
        </div>
      </div>
    </section>
  );
}

function CourseCard({
  course, isDark, onOpen,
}: {
  course: Course;
  isDark: boolean;
  onOpen: (id: string) => void;
}) {
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.95)';

  return (
    <div
      className="reveal rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? '0 4px 32px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* Card top accent */}
      <div
        className="h-1 w-full"
        style={{
          background: course.available
            ? 'linear-gradient(90deg, #7c3aed, #10b981)'
            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      />

      <div className="p-6">
        {/* Category + badge row */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(124,58,237,0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            {course.category}
          </span>
          <div className="flex items-center gap-2">
            {course.badge && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #10b981)',
                  color: '#fff',
                }}
              >
                {course.badge}
              </span>
            )}
            {!course.available && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                }}
              >
                Próximamente
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-black leading-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {course.title}
        </h3>
        <p className="text-purple-400 font-semibold text-sm mb-3">{course.subtitle}</p>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {course.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5">
            <ClockIcon size={13} className="text-purple-400" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {course.duration}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <StarIcon size={13} className="text-emerald-400" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {course.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <UsersIcon size={13} className="text-sky-400" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gratuito
            </span>
          </div>
        </div>

        {/* Topics chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {course.topics.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        {course.available ? (
          <button
            onClick={() => onOpen(course.id)}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #10b981)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}
          >
            <PlayCircleIcon size={16} />
            Ver presentación
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
              cursor: 'not-allowed',
            }}
          >
            Próximamente disponible
          </div>
        )}
      </div>
    </div>
  );
}
