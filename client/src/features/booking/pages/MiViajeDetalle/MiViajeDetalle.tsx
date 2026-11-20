import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import Pagina from '../../../../components/layout/Pagina';
import Aviso from '../../../../components/ui/Aviso';
import Cargando from '../../../../components/ui/Cargando';
import ConfirmModal from '../../../../components/ui/ConfirmModal/ConfirmModal';
import BoardingPass from '../../components/BoardingPass';
import EstadoBadge from '../../components/EstadoBadge';
import ViajeDetalle from '../../components/ViajeDetalle';
import { descargarBoleto, enviarBoletoPorCorreo } from '../../services/BoletoService';
import { cancelarViaje, obtenerViaje } from '../../services/ViajeService';
import { ViajeReserva, codigoReserva, fechaHora, mensajeError } from '../../utils/ReservaUtil';
import { btnPeligro, btnPrimario, btnSecundario, btnTexto, titulo } from '../../../../lib/estilos';

// Ruta: /mis-viajes/:id (VIAJERO). Detalle de una reserva; aquí se puede cancelar.
function MiViajeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeReserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nota, setNota] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [pidiendo, setPidiendo] = useState(false);

  const cargar = useCallback(async () => {
    try { setViaje(await obtenerViaje(id!)); }
    catch (e) { setError(mensajeError(e, 'No se encontró la reserva.')); }
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);

  const cancelar = async () => {
    setPidiendo(false); setOcupado(true); setError(null);
    try { await cancelarViaje(id!); await cargar(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  };

  // Solo se cancela una reserva vigente que aún no salió
  const yaSalio = !!viaje?.tramos[0] && new Date(viaje.tramos[0].salida_estimada).getTime() <= Date.now();
  const cancelable = !!viaje && (viaje.estado === 'CONFIRMADO' || viaje.estado === 'PENDIENTE') && !yaSalio;

  return (
    <Pagina ancho="max-w-[760px]">
      <div className="py-8">
        <button className={`${btnTexto} mb-6`} onClick={() => navigate('/mis-viajes')}><ArrowLeft className="h-4 w-4" /> Volver a mis viajes</button>
        {!viaje ? (error ? <Aviso tipo="error">{error}</Aviso> : <Cargando />) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h1 className={`${titulo} text-[clamp(1.4rem,3.5vw,2rem)]`}>Reserva {codigoReserva(viaje.id)}</h1>
              <EstadoBadge estado={viaje.estado} />
            </div>
            {viaje.cancelado_en && <p className="mb-4 text-tinta-suave">Cancelada el {fechaHora(viaje.cancelado_en)}.</p>}
            <div className="mb-8"><BoardingPass viaje={viaje} vigente={viaje.estado === 'CONFIRMADO' || viaje.estado === 'PENDIENTE'} /></div>

            {viaje.estado === 'CONFIRMADO' && (
              <div className="mb-6 flex flex-wrap gap-3">
                <button className={btnSecundario} onClick={async () => setNota((await enviarBoletoPorCorreo(viaje.id)).mensaje)}><Mail className="h-4 w-4" /> Enviar a mi correo</button>
                <button className={btnSecundario} onClick={async () => setNota((await descargarBoleto(viaje.id)).mensaje)}><Download className="h-4 w-4" /> Descargar boleto</button>
              </div>
            )}
            {nota && <div className="mb-6"><Aviso tipo="info">{nota}</Aviso></div>}
            <ViajeDetalle viaje={viaje} />
            {error && <div className="mb-4"><Aviso tipo="error">{error}</Aviso></div>}
            <div className="flex flex-wrap gap-3">
              {viaje.estado === 'PENDIENTE' && !yaSalio && <button className={btnPrimario} onClick={() => navigate(`/resumen/${viaje.id}`)}>Continuar reserva</button>}
              {cancelable && <button className={btnPeligro} disabled={ocupado} onClick={() => setPidiendo(true)}>Cancelar reserva</button>}
            </div>
          </>
        )}
      </div>
      {pidiendo && (
        <ConfirmModal title="¿Cancelar la reserva completa?" message="Se liberarán todos los asientos de esta reserva. Esta acción no se puede deshacer."
          primaryButtonText="Sí, cancelar" secondaryButtonText="Volver" peligro onConfirm={cancelar} onCancel={() => setPidiendo(false)} />
      )}
    </Pagina>
  );
}

export default MiViajeDetalle;
