import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../../components/layout/Header/Header';
import ReservaSteps from '../../components/ReservaSteps';
import ViajeDetalle from '../../components/ViajeDetalle';
import { ViajeReserva, codigoReserva, mensajeError } from '../../utils/ReservaUtil';

const boton = 'cursor-pointer rounded-lg border-0 px-8 py-3 text-[16px] disabled:cursor-not-allowed disabled:opacity-50';

// Ruta: /resumen/:id (VIAJERO). Resumen de la compra con el hold de 10 min; aquí se confirma o cancela.
function Resumen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeReserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restante, setRestante] = useState(0);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await axios.get<ViajeReserva>(`/api/viajes/${id}`);
      if (data.estado === 'CONFIRMADO') return navigate(`/reserva/${id}`, { replace: true });
      setViaje(data);
    } catch (e) { setError(mensajeError(e, 'No se encontró la reserva.')); }
  }, [id, navigate]);
  useEffect(() => { cargar(); }, [cargar]);

  // Cuenta regresiva del hold; al llegar a 0 se vuelve a pedir el estado (el server lo marca EXPIRADO)
  useEffect(() => {
    if (!viaje || viaje.estado !== 'PENDIENTE') return;
    const tick = () => {
      const s = Math.max(0, Math.floor((new Date(viaje.vence_en).getTime() - Date.now()) / 1000));
      setRestante(s);
      if (s === 0) cargar();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [viaje, cargar]);

  const accion = async (que: 'confirmar' | 'cancelar') => {
    if (que === 'cancelar' && !window.confirm('¿Cancelar esta reserva? Se liberarán los asientos.')) return;
    setOcupado(true); setError(null);
    try {
      await axios.post(`/api/viajes/${id}/${que}`);
      if (que === 'confirmar') navigate(`/reserva/${id}`);
      else navigate('/');
    } catch (e) { setError(mensajeError(e)); cargar(); }
    finally { setOcupado(false); }
  };

  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');

  return (
    <div>
      <Header />
      <ReservaSteps paso={3} />
      <main className="mx-auto max-w-[760px] px-6 pb-10">
        <h1 className="mb-2 text-[32px] font-bold text-brand">Resumen de tu compra</h1>
        {!viaje ? <p>{error ?? 'Cargando…'}</p> : (
          <>
            <p className="mb-4 text-[#555]">Reserva <strong>{codigoReserva(viaje.id)}</strong></p>
            {viaje.estado === 'PENDIENTE' ? (
              <p className="mb-4 rounded-lg bg-[#f6f6ff] p-3 text-brand">
                Tus asientos están retenidos por <strong>{mm}:{ss}</strong>. Confirma antes de que se acabe el tiempo.
              </p>
            ) : (
              <p className="mb-4 rounded-lg bg-red-50 p-3 font-bold text-red-600">
                {viaje.estado === 'EXPIRADO' ? 'El tiempo de reserva venció y los asientos se liberaron.' : 'Esta reserva fue cancelada.'}
              </p>
            )}
            <ViajeDetalle viaje={viaje} />
            {error && <p className="mb-3 font-bold text-red-600">{error}</p>}
            <div className="flex justify-center gap-4">
              {viaje.estado === 'PENDIENTE' ? (
                <>
                  <button className={`${boton} border-[1.5px] border-brand bg-white text-brand`} disabled={ocupado} onClick={() => accion('cancelar')}>Cancelar</button>
                  <button className={`${boton} bg-brand text-white`} disabled={ocupado || restante === 0} onClick={() => accion('confirmar')}>Confirmar reserva</button>
                </>
              ) : (
                <button className={`${boton} bg-brand text-white`} onClick={() => navigate('/')}>Buscar otro viaje</button>
              )}
            </div>
            <p className="mt-4 text-[13px] text-[#888]">El pago en línea aún no está habilitado: al confirmar, la reserva queda registrada directamente.</p>
          </>
        )}
      </main>
    </div>
  );
}

export default Resumen;
