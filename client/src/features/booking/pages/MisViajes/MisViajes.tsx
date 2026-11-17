import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../../components/layout/Header/Header';
import EstadoBadge from '../../components/EstadoBadge';
import { ViajeReserva, codigoReserva, fechaHora, soles } from '../../utils/ReservaUtil';

// Ruta: /mis-viajes (VIAJERO). Un resumen por reserva; el detalle (y cancelar) está en /mis-viajes/:id
function MisViajes() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeReserva[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get<ViajeReserva[]>('/api/viajes/mios').then((r) => setViajes(r.data)).catch(() => setError(true));
  }, []);

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-[860px] px-6 py-10 text-left">
        <h1 className="mb-8 text-[40px] font-bold text-brand">Mis viajes</h1>

        {error ? (
          <p className="font-bold text-red-600">No se pudieron cargar tus viajes. Intenta de nuevo.</p>
        ) : viajes === null ? (
          <p className="text-[#6a6a6a]">Cargando…</p>
        ) : viajes.length === 0 ? (
          <div className="rounded-[22px] border-[1.5px] border-dashed border-[#bbb] bg-white p-12 text-center">
            <div className="mb-2 text-[28px] font-bold text-brand">Aún no tienes viajes</div>
            <p className="mb-6 text-[18px] text-[#6a6a6a]">Cuando hagas una reserva, aparecerá aquí.</p>
            <button className="cursor-pointer rounded-lg border-0 bg-brand px-8 py-3 text-[16px] text-white" onClick={() => navigate('/')}>
              Buscar viajes
            </button>
          </div>
        ) : (
          viajes.map((v) => {
            const primero = v.tramos[0];
            const ultimo = v.tramos[v.tramos.length - 1];
            const empresas = [...new Set(v.tramos.map((t) => t.empresa))].join(' + ');
            return (
              <article key={v.id} className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-[1.5px] border-[#bbb] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-[18px] font-bold text-brand">{codigoReserva(v.id)}</span>
                    <EstadoBadge estado={v.estado} />
                  </div>
                  <div className="text-[20px] font-bold">{primero?.origen} → {ultimo?.destino}</div>
                  <div className="text-[14px] text-[#555]">
                    {primero && `Sale: ${fechaHora(primero.salida_estimada)}`} · {empresas}
                  </div>
                  <div className="text-[14px] text-[#555]">
                    {v.pasajeros.length} pasajero{v.pasajeros.length > 1 ? 's' : ''}
                    {v.tramos.length > 1 && ` · ${v.tramos.length} tramos`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-[22px] font-bold">{soles(v.total)}</div>
                  <div className="flex gap-2">
                    {v.estado === 'PENDIENTE' && (
                      <button className="cursor-pointer rounded-lg border-0 bg-brand px-4 py-2 text-white" onClick={() => navigate(`/resumen/${v.id}`)}>Continuar</button>
                    )}
                    <button className="cursor-pointer rounded-lg border-[1.5px] border-brand bg-white px-4 py-2 font-semibold text-brand" onClick={() => navigate(`/mis-viajes/${v.id}`)}>Ver detalle</button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
}

export default MisViajes;
