import { EstadoViaje } from '../utils/ReservaUtil';

const ESTILOS: Record<EstadoViaje, { texto: string; clase: string }> = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-[#fff8e1] text-[#6a5200]' },
  CONFIRMADO: { texto: 'Confirmado', clase: 'bg-green-100 text-green-800' },
  CANCELADO: { texto: 'Cancelado', clase: 'bg-red-100 text-red-700' },
  EXPIRADO: { texto: 'Expirado', clase: 'bg-[#eee] text-[#555]' },
};

const EstadoBadge = ({ estado }: { estado: EstadoViaje }) => (
  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${ESTILOS[estado].clase}`}>{ESTILOS[estado].texto}</span>
);

export default EstadoBadge;
