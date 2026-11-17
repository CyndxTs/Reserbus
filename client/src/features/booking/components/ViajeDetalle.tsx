import { ViajeReserva, fechaHora, soles } from '../utils/ReservaUtil';

const tarjeta = 'mb-6 rounded-[22px] border-[1.5px] border-[#bbb] bg-white p-6 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)]';

// Detalle de una reserva: tramos, pasajeros con sus asientos y total. Lo usan Resumen, Reserva confirmada y Mis viajes.
const ViajeDetalle = ({ viaje }: { viaje: ViajeReserva }) => (
  <>
    <section className={tarjeta}>
      <h2 className="mb-3 text-[22px] font-bold text-brand">Itinerario</h2>
      {viaje.tramos.map((t) => (
        <div key={t.id_tramo_programado} className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#eee] pb-3 last:border-0">
          <div>
            <div className="font-bold">{t.origen} → {t.destino}</div>
            <div className="text-[13px] text-[#777]">{t.empresa} · Bus {t.placa}</div>
          </div>
          <div className="text-right text-[14px] text-[#444]">
            <div>Sale: {fechaHora(t.salida_estimada)}</div>
            <div>Llega: {fechaHora(t.llegada_estimada)}</div>
          </div>
        </div>
      ))}
    </section>

    <section className={tarjeta}>
      <h2 className="mb-3 text-[22px] font-bold text-brand">Pasajeros y asientos</h2>
      {viaje.pasajeros.map((p) => (
        <div key={p.id} className="mb-4 border-b border-[#eee] pb-3 last:border-0">
          <div className="font-bold">{p.nombres} {p.apellidos} <span className="font-normal text-[#777]">· {p.tipo_documento} {p.numero_documento}</span></div>
          {p.asientos.map((a) => {
            const t = viaje.tramos.find((x) => x.id_tramo_programado === a.id_tramo_programado);
            return (
              <div key={a.id_tramo_programado} className="flex justify-between text-[14px] text-[#444]">
                <span>{t ? `${t.origen} → ${t.destino}` : `Tramo ${a.id_tramo_programado}`}: asiento <strong>{a.codigo_asiento}</strong> ({a.tipo_asiento})</span>
                <span>{soles(a.precio)}</span>
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex justify-between border-t-2 border-brand pt-3 text-[20px] font-bold">
        <span>Total</span><span>{soles(viaje.total)}</span>
      </div>
    </section>
  </>
);

export default ViajeDetalle;
