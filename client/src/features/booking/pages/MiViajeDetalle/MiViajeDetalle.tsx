import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../../components/layout/Header/Header';
import EstadoBadge from '../../components/EstadoBadge';
import ViajeDetalle from '../../components/ViajeDetalle';
import { ViajeReserva, codigoReserva, fechaHora, mensajeError } from '../../utils/ReservaUtil';

// Ruta: /mis-viajes/:id (VIAJERO). Detalle de una reserva; aquí se puede cancelar.
function MiViajeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeReserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await axios.get<ViajeReserva>(`/api/viajes/${id}`);
      setViaje(data);
    } catch (e) { setError(mensajeError(e, 'No se encontró la reserva.')); }
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);

  const cancelar = async () => {
    if (!window.confirm('¿Cancelar la reserva completa? Se liberarán los asientos.')) return;
    setOcupado(true); setError(null);
    try { await axios.post(`/api/viajes/${id}/cancelar`); await cargar(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  };

  // Solo se cancela una reserva vigente que aún no salió
  const yaSalio = !!viaje?.tramos[0] && new Date(viaje.tramos[0].salida_estimada).getTime() <= Date.now();
  const cancelable = !!viaje && (viaje.estado === 'CONFIRMADO' || viaje.estado === 'PENDIENTE') && !yaSalio;

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-[760px] px-6 py-10">
        <button className="mb-4 cursor-pointer border-0 bg-transparent text-[16px] text-brand underline" onClick={() => navigate('/mis-viajes')}>← Volver a mis viajes</button>
        {!viaje ? <p>{error ?? 'Cargando…'}</p> : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <h1 className="text-[32px] font-bold text-brand">Reserva {codigoReserva(viaje.id)}</h1>
              <EstadoBadge estado={viaje.estado} />
            </div>
            {viaje.cancelado_en && <p className="mb-4 text-[#555]">Cancelada el {fechaHora(viaje.cancelado_en)}.</p>}
            <ViajeDetalle viaje={viaje} />
            {error && <p className="mb-3 font-bold text-red-600">{error}</p>}
            <div className="flex justify-center gap-4">
              {viaje.estado === 'PENDIENTE' && !yaSalio && (
                <button className="cursor-pointer rounded-lg border-0 bg-brand px-6 py-3 text-white" onClick={() => navigate(`/resumen/${viaje.id}`)}>Continuar reserva</button>
              )}
              {cancelable && (
                <button className="cursor-pointer rounded-lg border-[1.5px] border-red-600 bg-white px-6 py-3 text-red-600 disabled:opacity-50" disabled={ocupado} onClick={cancelar}>
                  Cancelar reserva
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MiViajeDetalle;
