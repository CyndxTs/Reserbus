import { ReactNode } from 'react';
import { AlertTriangle, CircleCheck, Info } from 'lucide-react';

const ESTILOS = {
  error: { clase: 'border-rose-200 bg-rose-50 text-rose-700', Icono: AlertTriangle },
  info: { clase: 'border-brand/20 bg-brand-soft/70 text-brand-dark', Icono: Info },
  ok: { clase: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icono: CircleCheck },
  alerta: { clase: 'border-senal/40 bg-senal-soft text-tinta', Icono: AlertTriangle },
};

// Mensaje en línea: explica qué pasó y qué hacer
const Aviso = ({ tipo = 'info', children }: { tipo?: keyof typeof ESTILOS; children: ReactNode }) => {
  const { clase, Icono } = ESTILOS[tipo];
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[0.95rem] font-medium ${clase}`}>
      <Icono className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export default Aviso;
