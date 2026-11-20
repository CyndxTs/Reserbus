import { EstadoViaje } from '../utils/ReservaUtil';

const ESTILOS: Record<EstadoViaje, { texto: string; clase: string; punto: string }> = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-senal-soft text-tinta', punto: 'bg-senal animate-pulso-senal' },
  CONFIRMADO: { texto: 'Confirmado', clase: 'bg-emerald-100 text-emerald-800', punto: 'bg-emerald-500' },
  CANCELADO: { texto: 'Cancelado', clase: 'bg-rose-100 text-rose-700', punto: 'bg-rose-500' },
  EXPIRADO: { texto: 'Expirado', clase: 'bg-slate-200 text-slate-600', punto: 'bg-slate-400' },
};

const EstadoBadge = ({ estado }: { estado: EstadoViaje }) => (
  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.78rem] font-bold ${ESTILOS[estado].clase}`}>
    <span className={`h-2 w-2 rounded-full ${ESTILOS[estado].punto}`} />
    {ESTILOS[estado].texto}
  </span>
);

export default EstadoBadge;
