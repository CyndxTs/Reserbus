import { Repeat2 } from 'lucide-react';
import { ViajeReserva, diaCorto, horaCorta, soles } from '../utils/ReservaUtil';

const tarjeta = 'vidrio mb-5 rounded-3xl p-5 sm:p-6';
const h2 = 'mb-4 font-display text-[1rem] font-bold text-tinta';

// Detalle de una reserva: recorrido, pasajeros con asientos y total. Lo usan Resumen, Confirmada y Mis viajes.
const ViajeDetalle = ({ viaje }: { viaje: ViajeReserva }) => (
  <>
    <section className={tarjeta}>
      <h2 className={h2}>Recorrido</h2>
      <ol className="m-0 list-none p-0">
        {viaje.tramos.map((t, i) => {
          const sig = viaje.tramos[i + 1];
          const espera = sig ? Math.round((new Date(sig.salida_estimada).getTime() - new Date(t.llegada_estimada).getTime()) / 60000) : 0;
          const cambia = sig && (sig.placa !== t.placa || sig.empresa !== t.empresa);
          return (
            <li key={t.id_tramo_programado} className="relative pb-5 pl-8 last:pb-0">
              <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-brand bg-white" />
              {sig && <span className="absolute left-[6px] top-6 h-[calc(100%-1rem)] w-0.5 bg-brand/20" />}
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <div className="text-[1.02rem] font-bold">{t.origen} → {t.destino}</div>
                <div className="text-[0.9rem] font-semibold text-tinta-suave">{diaCorto(t.salida_estimada)} · {horaCorta(t.salida_estimada)} a {horaCorta(t.llegada_estimada)}</div>
              </div>
              <div className="text-[0.85rem] text-tinta-suave">{t.empresa} · Bus {t.placa}</div>
              {cambia && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-senal-soft px-3 py-1 text-[0.78rem] font-bold text-tinta">
                  <Repeat2 className="h-3.5 w-3.5" /> Trasbordo en {t.destino}{espera > 0 ? `: espera de ${espera} min` : ''}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>

    <section className={tarjeta}>
      <h2 className={h2}>Pasajeros y asientos</h2>
      {viaje.pasajeros.map((p) => (
        <div key={p.id} className="mb-4 border-b border-brand/10 pb-4 last:mb-0 last:border-0 last:pb-0">
          <div className="font-bold">{p.nombres} {p.apellidos} <span className="font-normal text-tinta-suave">· {p.tipo_documento} {p.numero_documento}</span></div>
          <ul className="m-0 mt-2 list-none space-y-1.5 p-0">
            {p.asientos.map((a) => {
              const t = viaje.tramos.find((x) => x.id_tramo_programado === a.id_tramo_programado);
              return (
                <li key={a.id_tramo_programado} className="flex items-center justify-between gap-3 text-[0.92rem]">
                  <span className="flex items-center gap-2.5 text-tinta-suave">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-brand px-1.5 font-display text-[0.75rem] font-bold text-white">{a.codigo_asiento}</span>
                    {t ? `${t.origen} → ${t.destino}` : `Tramo ${a.id_tramo_programado}`} · {a.tipo_asiento}
                  </span>
                  <span className="font-semibold">{soles(a.precio)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-5 flex items-center justify-between border-t-2 border-dashed border-brand/25 pt-4">
        <span className="font-display text-[0.95rem] font-bold">Total</span>
        <span className="font-display text-[1.6rem] font-bold">{soles(viaje.total)}</span>
      </div>
    </section>
  </>
);

export default ViajeDetalle;
