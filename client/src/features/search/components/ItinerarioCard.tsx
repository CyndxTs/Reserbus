import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Repeat2 } from 'lucide-react';
import { Itinerario, formatoDuracion, hora, minutosLocal } from '../utils/BuscarViajeUtil';
import { soles } from '../../booking/utils/ReservaUtil';
import { btnPrimario } from '../../../lib/estilos';

interface Props { it: Itinerario; onElegir: (it: Itinerario) => void }

// Itinerario como boleto: datos a la izquierda, corte perforado, precio y acción a la derecha
const ItinerarioCard = ({ it, onElegir }: Props) => {
  const [abierto, setAbierto] = useState(false);
  const primera = it.secciones[0];
  const ultima = it.secciones[it.secciones.length - 1];
  const empresas = [...new Set(it.secciones.map((s) => s.empresa))];
  const ini = minutosLocal(it.salida_local);
  const total = Math.max(minutosLocal(it.llegada_local) - ini, 1);
  // Posición de cada trasbordo sobre la línea de tiempo (proporcional a la hora)
  const cortes = it.secciones.slice(1).map((s) => ((minutosLocal(s.salida_local) - ini) / total) * 100);

  return (
    <article className="vidrio relative overflow-hidden rounded-3xl">
      <div className="grid md:grid-cols-[1fr_auto_220px]">
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[0.9rem]">
            <span className="font-bold text-brand">{empresas.join(' + ')}</span>
            <span className="text-tinta-suave">· {primera.tipo_bus}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold ${it.trasbordos === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-soft text-brand-dark'}`}>
              {it.trasbordos === 0 ? 'Directo' : `${it.trasbordos} trasbordo${it.trasbordos > 1 ? 's' : ''}`}
            </span>
            {it.libres <= 5 && <span className="rounded-full bg-senal-soft px-2.5 py-0.5 text-[0.75rem] font-bold text-senal-dark">Quedan {it.libres}</span>}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="font-display text-[1.7rem] font-bold leading-none">{hora(it.salida_local)}</div>
              <div className="mt-1.5 max-w-[9rem] text-[0.85rem] text-tinta-suave">{primera.origen}</div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="text-[0.8rem] font-semibold text-tinta-suave">{formatoDuracion(it.duracion_min)}</span>
              <div className="relative h-0.5 w-full rounded-full bg-brand/25">
                <span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-brand bg-white" />
                {cortes.map((c, i) => (
                  <span key={i} title="Trasbordo" style={{ left: `${c}%` }} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-senal ring-4 ring-white" />
                ))}
                <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-brand" />
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-[1.7rem] font-bold leading-none">{hora(it.llegada_local)}</div>
              <div className="ml-auto mt-1.5 max-w-[9rem] text-[0.85rem] text-tinta-suave">{ultima.destino}</div>
            </div>
          </div>

          <button type="button" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)}
            className="mt-4 flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[0.85rem] font-semibold text-brand">
            {abierto ? 'Ocultar detalle' : 'Ver detalle del recorrido'}
            <ChevronDown className={`h-4 w-4 transition ${abierto ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* corte perforado */}
        <div aria-hidden className="mx-0 hidden border-l-2 border-dashed border-brand/25 md:block" />
        <div aria-hidden className="mx-5 border-t-2 border-dashed border-brand/25 md:hidden" />

        <div className="flex flex-row items-center justify-between gap-3 p-5 md:flex-col md:items-stretch md:justify-center sm:p-6">
          <div className="md:text-center">
            <div className="text-[0.8rem] text-tinta-suave">Desde</div>
            <div className="font-display text-[1.5rem] font-bold">{soles(it.precio_base)}</div>
            <div className="text-[0.8rem] text-tinta-suave">{it.libres} asientos libres</div>
          </div>
          <button type="button" className={btnPrimario} onClick={() => onElegir(it)}>Elegir asientos</button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <ol className="m-0 list-none border-t border-brand/10 px-5 py-4 sm:px-6">
              {it.secciones.map((s, i) => (
                <li key={s.tramos_programados.join('-')} className="relative pb-3 pl-6 last:pb-0">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-brand" />
                  {i < it.secciones.length - 1 && <span className="absolute left-[4px] top-4 h-[calc(100%-0.5rem)] w-0.5 bg-brand/20" />}
                  <div className="text-[0.95rem] font-semibold">{s.origen} → {s.destino} <span className="font-normal text-tinta-suave">· {hora(s.salida_local)} a {hora(s.llegada_local)}</span></div>
                  <div className="text-[0.85rem] text-tinta-suave">{s.empresa} · {s.tipo_bus} · Bus {s.placa} · {soles(s.precio_base)}</div>
                  {i < it.secciones.length - 1 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[0.8rem] font-semibold text-senal-dark"><Repeat2 className="h-3.5 w-3.5" /> Trasbordo en {s.destino}</div>
                  )}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default ItinerarioCard;
