import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Pagina from '../../../../components/layout/Pagina';
import Aviso from '../../../../components/ui/Aviso';
import Cargando from '../../../../components/ui/Cargando';
import ConfirmModal from '../../../../components/ui/ConfirmModal/ConfirmModal';
import CuentaRegresiva from '../../components/CuentaRegresiva';
import ReservaSteps from '../../components/ReservaSteps';
import ViajeDetalle from '../../components/ViajeDetalle';
import { cancelarViaje, confirmarViaje, obtenerViaje } from '../../services/ViajeService';
import { ViajeReserva, codigoReserva, mensajeError, soles } from '../../utils/ReservaUtil';
import { btnPrimario, btnSecundario, titulo } from '../../../../lib/estilos';

// Ruta: /resumen/:id (VIAJERO). Resumen de la compra con el hold de 10 min; aquí se confirma o cancela.
function Resumen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeReserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restante, setRestante] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [pidiendoCancelar, setPidiendoCancelar] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const data = await obtenerViaje(id!);
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
    setOcupado(true); setError(null); setPidiendoCancelar(false);
    try {
      if (que === 'confirmar') { await confirmarViaje(id!); navigate(`/reserva/${id}`); }
      else { await cancelarViaje(id!); navigate('/'); }
    } catch (e) { setError(mensajeError(e)); cargar(); }
    finally { setOcupado(false); }
  };

  return (
    <Pagina ancho="max-w-[1080px]">
      <ReservaSteps paso={3} />
      {!viaje ? (error ? <Aviso tipo="error">{error}</Aviso> : <Cargando />) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <h1 className={`${titulo} mb-1 text-[clamp(1.5rem,3vw,2rem)]`}>Revisa tu reserva</h1>
            <p className="mb-6 text-tinta-suave">Código <strong className="text-tinta">{codigoReserva(viaje.id)}</strong></p>
            {viaje.estado !== 'PENDIENTE' && (
              <div className="mb-5"><Aviso tipo="error">{viaje.estado === 'EXPIRADO' ? 'El tiempo de reserva venció y los asientos se liberaron. Busca el viaje de nuevo para reservar.' : 'Esta reserva fue cancelada.'}</Aviso></div>
            )}
            <ViajeDetalle viaje={viaje} />
          </div>

          <aside className="vidrio rounded-3xl p-6 lg:sticky lg:top-24">
            {viaje.estado === 'PENDIENTE' ? (
              <>
                <CuentaRegresiva restante={restante} />
                <p className="mt-4 text-center text-[0.9rem] text-tinta-suave">Confirma antes de que se acabe el tiempo.</p>
              </>
            ) : null}
            <div className="my-5 flex items-center justify-between border-y-2 border-dashed border-brand/25 py-4">
              <span className="font-display text-[0.9rem] font-bold">Total</span>
              <span className="font-display text-[1.5rem] font-bold">{soles(viaje.total)}</span>
            </div>
            {error && <div className="mb-4"><Aviso tipo="error">{error}</Aviso></div>}
            <div className="flex flex-col gap-3">
              {viaje.estado === 'PENDIENTE' ? (
                <>
                  <button className={btnPrimario} disabled={ocupado || restante === 0} onClick={() => accion('confirmar')}>{ocupado ? 'Confirmando…' : 'Confirmar reserva'}</button>
                  <button className={btnSecundario} disabled={ocupado} onClick={() => setPidiendoCancelar(true)}>Cancelar reserva</button>
                </>
              ) : (
                <button className={btnPrimario} onClick={() => navigate('/')}>Buscar otro viaje</button>
              )}
            </div>
            <p className="mt-4 text-[0.8rem] leading-relaxed text-tinta-suave">El pago en línea aún no está habilitado: al confirmar, la reserva queda registrada directamente.</p>
          </aside>
        </div>
      )}
      {pidiendoCancelar && (
        <ConfirmModal title="¿Cancelar esta reserva?" message="Se liberarán los asientos y tendrás que buscar el viaje de nuevo." primaryButtonText="Sí, cancelar" secondaryButtonText="Volver"
          peligro onConfirm={() => accion('cancelar')} onCancel={() => setPidiendoCancelar(false)} />
      )}
    </Pagina>
  );
}

export default Resumen;
