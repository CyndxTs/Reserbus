import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Mail } from 'lucide-react';
import Pagina from '../../../../components/layout/Pagina';
import Aviso from '../../../../components/ui/Aviso';
import Cargando from '../../../../components/ui/Cargando';
import BoardingPass from '../../components/BoardingPass';
import ViajeDetalle from '../../components/ViajeDetalle';
import { enviarBoletoPorCorreo, descargarBoleto } from '../../services/BoletoService';
import { obtenerViaje } from '../../services/ViajeService';
import { ViajeReserva, fechaHora, mensajeError } from '../../utils/ReservaUtil';
import { btnPrimario, btnSecundario, titulo } from '../../../../lib/estilos';

// Ruta: /reserva/:id (VIAJERO). Pantalla final: pase de abordar con el código de la reserva.
function ReservaConfirmada() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeReserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nota, setNota] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await obtenerViaje(id!);
      if (data.estado === 'PENDIENTE') return navigate(`/resumen/${id}`, { replace: true });
      setViaje(data);
    } catch (e) { setError(mensajeError(e, 'No se encontró la reserva.')); }
  }, [id, navigate]);
  useEffect(() => { cargar(); }, [cargar]);

  const ok = viaje?.estado === 'CONFIRMADO';
  return (
    <Pagina ancho="max-w-[760px]">
      <div className="py-8">
        {!viaje ? (error ? <Aviso tipo="error">{error}</Aviso> : <Cargando />) : (
          <>
            <h1 className={`${titulo} mb-2 text-center text-[clamp(1.6rem,4vw,2.4rem)]`}>
              {ok ? 'Reserva confirmada' : viaje.estado === 'CANCELADO' ? 'Reserva cancelada' : 'Reserva expirada'}
            </h1>
            <p className="mx-auto mb-8 max-w-[32rem] text-center text-tinta-suave">
              {ok ? 'Guarda tu código. También lo encuentras en Mis viajes.' : 'Esta reserva ya no está activa.'}
              {viaje.cancelado_en && <> Cancelada el {fechaHora(viaje.cancelado_en)}.</>}
            </p>
            <div className="mb-8"><BoardingPass viaje={viaje} vigente={ok} /></div>

            {ok && (
              <div className="mb-6 flex flex-wrap justify-center gap-3">
                <button className={btnSecundario} onClick={async () => setNota((await enviarBoletoPorCorreo(viaje.id)).mensaje)}><Mail className="h-4 w-4" /> Enviar a mi correo</button>
                <button className={btnSecundario} onClick={async () => setNota((await descargarBoleto(viaje.id)).mensaje)}><Download className="h-4 w-4" /> Descargar boleto</button>
              </div>
            )}
            {nota && <div className="mb-6"><Aviso tipo="info">{nota}</Aviso></div>}

            <ViajeDetalle viaje={viaje} />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className={btnSecundario} onClick={() => navigate('/mis-viajes')}>Ir a mis viajes</button>
              <button className={btnPrimario} onClick={() => navigate('/')}>Buscar otro viaje</button>
            </div>
          </>
        )}
      </div>
    </Pagina>
  );
}

export default ReservaConfirmada;
