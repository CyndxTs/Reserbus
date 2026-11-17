import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../../components/layout/Header/Header';
import ViajeDetalle from '../../components/ViajeDetalle';
import { ViajeReserva, codigoReserva, fechaHora, mensajeError } from '../../utils/ReservaUtil';

// Ruta: /reserva/:id (VIAJERO). Pantalla final: muestra el código de la reserva y su detalle.
function ReservaConfirmada() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeReserva | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const { data } = await axios.get<ViajeReserva>(`/api/viajes/${id}`);
      if (data.estado === 'PENDIENTE') return navigate(`/resumen/${id}`, { replace: true });
      setViaje(data);
    } catch (e) { setError(mensajeError(e, 'No se encontró la reserva.')); }
  }, [id, navigate]);
  useEffect(() => { cargar(); }, [cargar]);

  const cancelar = async () => {
    if (!window.confirm('¿Cancelar la reserva completa? Se liberarán los asientos.')) return;
    try { await axios.post(`/api/viajes/${id}/cancelar`); cargar(); }
    catch (e) { setError(mensajeError(e)); }
  };

  const ok = viaje?.estado === 'CONFIRMADO';
  return (
    <div>
      <Header navOptions={[{ label: 'Contacto', path: '/contacto' }, { label: 'Acerca de nosotros', path: '/acerca-de' }]} />
      <main className="mx-auto max-w-[760px] px-6 py-8">
        {!viaje ? <p>{error ?? 'Cargando…'}</p> : (
          <>
            <h1 className={`mb-2 text-[36px] font-bold ${ok ? 'text-brand' : 'text-red-600'}`}>
              {ok ? '¡Reserva confirmada!' : viaje.estado === 'CANCELADO' ? 'Reserva cancelada' : 'Reserva expirada'}
            </h1>
            <div className="mx-auto mb-6 w-fit rounded-2xl border-2 border-dashed border-brand bg-[#f6f6ff] px-10 py-4">
              <div className="text-[13px] text-[#777]">Código de reserva</div>
              <div className="text-[32px] font-bold tracking-widest text-brand">{codigoReserva(viaje.id)}</div>
            </div>
            <p className="mb-6 text-[#555]">
              Guarda este código: lo necesitarás para identificar tu reserva. También la encuentras en <strong>Mis viajes</strong>.
              {viaje.cancelado_en && <> Cancelada el {fechaHora(viaje.cancelado_en)}.</>}
            </p>
            <ViajeDetalle viaje={viaje} />
            {error && <p className="mb-3 font-bold text-red-600">{error}</p>}
            <div className="flex justify-center gap-4">
              <button className="cursor-pointer rounded-lg border-[1.5px] border-brand bg-white px-6 py-3 text-brand" onClick={() => navigate('/MyAccount')}>Mis viajes</button>
              <button className="cursor-pointer rounded-lg border-0 bg-brand px-6 py-3 text-white" onClick={() => navigate('/')}>Inicio</button>
              {ok && <button className="cursor-pointer rounded-lg border-[1.5px] border-red-600 bg-white px-6 py-3 text-red-600" onClick={cancelar}>Cancelar reserva</button>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ReservaConfirmada;
