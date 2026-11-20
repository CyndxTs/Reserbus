import { motion, useReducedMotion } from 'motion/react';
import { ViajeReserva, codigoReserva, diaCorto, horaCorta, soles } from '../utils/ReservaUtil';

// Código de barras decorativo, siempre igual para una misma reserva
const Barras = ({ id }: { id: number }) => {
  let x = 0;
  const barras = Array.from({ length: 46 }, (_, i) => {
    const w = 1 + Math.floor((((id + 7) * 9301 + i * 49297) % 233280) / 233280 * 3);
    const r = { x, w };
    x += w + 2;
    return r;
  });
  return (
    <svg viewBox={`0 0 ${x} 44`} className="h-11 w-full max-w-[260px]" aria-hidden preserveAspectRatio="none">
      {barras.map((b, i) => <rect key={i} x={b.x} y="0" width={b.w} height="44" fill="#1b1647" />)}
    </svg>
  );
};

// Pase de abordar. Al confirmar la reserva "se despliega" una sola vez.
const BoardingPass = ({ viaje, vigente = true }: { viaje: ViajeReserva; vigente?: boolean }) => {
  const reducir = useReducedMotion();
  const primero = viaje.tramos[0];
  const ultimo = viaje.tramos[viaje.tramos.length - 1];
  const empresas = [...new Set(viaje.tramos.map((t) => t.empresa))].join(' + ');
  const asientos = viaje.pasajeros.flatMap((p) => p.asientos.filter((a) => a.id_tramo_programado === primero?.id_tramo_programado).map((a) => a.codigo_asiento));

  return (
    <div className="[perspective:1400px]">
      <motion.article
        initial={reducir ? false : { rotateX: -80, opacity: 0, y: -30 }} animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.1 }} style={{ transformOrigin: 'top center' }}
        className={`overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-24px_rgba(79,47,240,0.55)] ${vigente ? '' : 'grayscale'}`}>
        <div className="bg-gradient-to-br from-brand to-brand-dark px-7 pb-8 pt-6 text-white">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-[1.05rem] font-bold">reserbus</span>
            <span className="font-display text-[0.9rem] font-bold tracking-widest text-white/90">{codigoReserva(viaje.id)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-[clamp(1.2rem,3vw,1.8rem)] font-bold leading-tight">{primero?.origen}</div>
              <div className="mt-1 text-[0.9rem] text-white/75">{primero && `${diaCorto(primero.salida_estimada)} · ${horaCorta(primero.salida_estimada)}`}</div>
            </div>
            <div aria-hidden className="relative h-0.5 flex-1 bg-white/35"><span className="absolute -top-1 right-0 h-2.5 w-2.5 rounded-full bg-senal" /></div>
            <div className="text-right">
              <div className="font-display text-[clamp(1.2rem,3vw,1.8rem)] font-bold leading-tight">{ultimo?.destino}</div>
              <div className="mt-1 text-[0.9rem] text-white/75">{ultimo && `${diaCorto(ultimo.llegada_estimada)} · ${horaCorta(ultimo.llegada_estimada)}`}</div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-brand/25 px-7 pb-7 pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><div className="text-[0.75rem] font-semibold text-tinta-suave">Empresa</div><div className="font-bold">{empresas}</div></div>
            <div><div className="text-[0.75rem] font-semibold text-tinta-suave">Pasajeros</div><div className="font-bold">{viaje.pasajeros.length}{viaje.tramos.length > 1 ? ` · ${viaje.tramos.length} tramos` : ''}</div></div>
            <div><div className="text-[0.75rem] font-semibold text-tinta-suave">Asientos {viaje.tramos.length > 1 ? '(primer tramo)' : ''}</div><div className="font-display font-bold">{asientos.join(' · ') || '—'}</div></div>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <Barras id={viaje.id} />
            <div className="text-right"><div className="text-[0.75rem] font-semibold text-tinta-suave">Total</div><div className="font-display text-[1.5rem] font-bold">{soles(viaje.total)}</div></div>
          </div>
        </div>
      </motion.article>
    </div>
  );
};

export default BoardingPass;
