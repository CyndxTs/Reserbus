import { PointerEvent, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { CircleDot, X } from 'lucide-react';
import { MapaAsientos as Mapa, soles } from '../utils/ReservaUtil';

interface Props {
  mapa: Mapa;
  elegido?: string;                              // asiento del pasajero activo en este tramo
  ocupadoPorOtro: (codigo: string) => number | null;   // índice (0-based) del pasajero que ya lo eligió
  onElegir: (codigo: string) => void;
  vista3d: boolean;
}

const base = 'relative flex h-11 w-11 items-center justify-center rounded-xl border text-[0.72rem] font-bold transition duration-150 [transform:translateZ(0)]';

// Bus visto desde arriba, inclinado en 3D. Cada asiento es un botón real (teclado y lector de pantalla).
const MapaAsientos = ({ mapa, elegido, ocupadoPorOtro, onElegir, vista3d }: Props) => {
  const reducir = useReducedMotion();
  const inclinar = vista3d && !reducir;
  const caja = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [32, 20]), { stiffness: 120, damping: 18 });

  const mover = (e: PointerEvent) => {
    const r = caja.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const rangoDe = (fila: number) => mapa.rangos.find((r) => fila >= r.fila_desde && fila <= r.fila_hasta);

  return (
    <div ref={caja} onPointerMove={inclinar ? mover : undefined} onPointerLeave={() => { px.set(0); py.set(0); }}
      className="flex justify-center overflow-x-auto py-4 [perspective:1500px]">
      <motion.div
        style={vista3d ? { rotateX: reducir ? 22 : rotX, rotateY: reducir ? 0 : rotY, transformStyle: 'preserve-3d' } : undefined}
        className="relative w-fit rounded-[2.5rem] border-2 border-brand/25 bg-gradient-to-b from-white to-brand-soft/70 px-6 pb-7 pt-5 shadow-[0_40px_60px_-30px_rgba(79,47,240,0.55)]">
        {/* Frente del bus */}
        <div className="mb-4 flex items-center justify-between gap-6 border-b-2 border-dashed border-brand/20 pb-3">
          <span className="flex items-center gap-2 text-[0.75rem] font-bold text-tinta-suave"><CircleDot className="h-4 w-4 text-brand" /> Conductor</span>
          <span className="text-[0.75rem] font-bold text-tinta-suave">Frente</span>
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: mapa.filas }, (_, f) => f + 1).map((fila) => {
            const r = rangoDe(fila);
            const ant = rangoDe(fila - 1);
            const nuevaZona = r && r.id_tipo_asiento !== ant?.id_tipo_asiento;
            return (
              <div key={fila}>
                {nuevaZona && (
                  <div className="mb-1.5 mt-2 flex items-center gap-2 text-[0.72rem] font-bold text-brand-dark first:mt-0">
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5">{r.nombre}{r.tarifa_extra > 0 ? ` · +${soles(r.tarifa_extra)}` : ''}</span>
                    <span className="h-px flex-1 bg-brand/15" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span aria-hidden className="w-5 text-right text-[0.7rem] font-semibold text-tinta-suave/70">{fila}</span>
                  {mapa.columnas.map((col, ci) => {
                    const codigo = `${fila}${col}`;
                    const ocupado = mapa.ocupados.includes(codigo);
                    const otro = ocupadoPorOtro(codigo);
                    const mio = elegido === codigo;
                    const estado = ocupado ? 'ocupado' : mio ? 'tu selección' : otro !== null ? `de otro pasajero` : 'libre';
                    const clase = ocupado ? 'cursor-not-allowed border-transparent bg-brand-soft/70 text-brand/30'
                      : mio ? '-translate-y-1 cursor-pointer border-senal-dark bg-senal text-tinta shadow-[0_6px_0_0_#c93a07,0_14px_22px_-6px_rgba(255,90,31,0.7)]'
                      : otro !== null ? 'cursor-not-allowed border-brand-dark bg-brand text-white shadow-[0_4px_0_0_#2f1ba8]'
                      : 'cursor-pointer border-brand/25 bg-white text-tinta-suave shadow-[0_4px_0_0_rgba(79,47,240,0.2)] hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-[0_6px_0_0_rgba(79,47,240,0.28)]';
                    return (
                      <span key={col} className="flex items-center gap-2">
                        {ci === mapa.pasillo_despues_de && <span aria-hidden className="w-7" />}
                        <button type="button" disabled={ocupado || otro !== null} aria-pressed={mio}
                          aria-label={`Asiento ${codigo}${r ? `, ${r.nombre}` : ''}, ${estado}`}
                          title={`${codigo}${r ? ` · ${r.nombre}` : ''}`}
                          onClick={() => onElegir(codigo)} className={`${base} ${clase}`}>
                          {ocupado ? <X className="h-4 w-4" /> : otro !== null ? `P${otro + 1}` : codigo}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t-2 border-dashed border-brand/20 pt-4 text-[0.75rem] font-semibold text-tinta-suave">
          <span className="flex items-center gap-1.5"><i className="h-3.5 w-3.5 rounded border border-brand/30 bg-white" /> Libre</span>
          <span className="flex items-center gap-1.5"><i className="h-3.5 w-3.5 rounded bg-senal" /> Tu selección</span>
          <span className="flex items-center gap-1.5"><i className="h-3.5 w-3.5 rounded bg-brand" /> Otro pasajero</span>
          <span className="flex items-center gap-1.5"><i className="h-3.5 w-3.5 rounded bg-brand-soft" /> Ocupado</span>
        </div>
      </motion.div>
    </div>
  );
};

export default MapaAsientos;
