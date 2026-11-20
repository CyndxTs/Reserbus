import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Ticket } from 'lucide-react';
import Pagina from '../../../../components/layout/Pagina';
import Aviso from '../../../../components/ui/Aviso';
import Cargando from '../../../../components/ui/Cargando';
import EstadoBadge from '../../components/EstadoBadge';
import { misViajes } from '../../services/ViajeService';
import { ViajeReserva, codigoReserva, diaCorto, horaCorta, soles } from '../../utils/ReservaUtil';
import { btnPrimario, btnSecundario, chip, chipActivo, titulo } from '../../../../lib/estilos';

type Pestana = 'proximos' | 'pasados' | 'cerrados';
const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: 'proximos', texto: 'Próximos' },
  { id: 'pasados', texto: 'Pasados' },
  { id: 'cerrados', texto: 'Cancelados y expirados' },
];

const pestanaDe = (v: ViajeReserva): Pestana => {
  if (v.estado === 'CANCELADO' || v.estado === 'EXPIRADO') return 'cerrados';
  const sale = v.tramos[0] ? new Date(v.tramos[0].salida_estimada).getTime() : Infinity;
  return sale > Date.now() ? 'proximos' : 'pasados';
};

// Ruta: /mis-viajes (VIAJERO). Un resumen por reserva; el detalle (y cancelar) está en /mis-viajes/:id
function MisViajes() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeReserva[] | null>(null);
  const [error, setError] = useState(false);
  const [pestana, setPestana] = useState<Pestana>('proximos');

  useEffect(() => { misViajes().then(setViajes).catch(() => setError(true)); }, []);

  const porPestana = useMemo(() => {
    const m: Record<Pestana, ViajeReserva[]> = { proximos: [], pasados: [], cerrados: [] };
    (viajes ?? []).forEach((v) => m[pestanaDe(v)].push(v));
    return m;
  }, [viajes]);
  const lista = porPestana[pestana];

  return (
    <Pagina ancho="max-w-[900px]">
      <div className="py-8">
        <h1 className={`${titulo} mb-6 text-[clamp(1.8rem,4vw,2.6rem)]`}>Mis viajes</h1>

        {error ? <Aviso tipo="error">No se pudieron cargar tus viajes. Recarga la página para intentar de nuevo.</Aviso>
          : viajes === null ? <Cargando />
          : viajes.length === 0 ? (
            <div className="vidrio flex flex-col items-center rounded-3xl px-6 py-16 text-center">
              <Ticket className="mb-4 h-10 w-10 text-brand" />
              <h2 className={`${titulo} mb-2 text-[1.3rem]`}>Aún no tienes viajes</h2>
              <p className="mb-6 text-tinta-suave">Cuando hagas una reserva, aparecerá aquí.</p>
              <button className={btnPrimario} onClick={() => navigate('/')}>Buscar viajes</button>
            </div>
          ) : (
            <>
              <div role="tablist" aria-label="Estado de tus viajes" className="mb-6 flex flex-wrap gap-2">
                {PESTANAS.map((p) => (
                  <button key={p.id} role="tab" aria-selected={pestana === p.id} onClick={() => setPestana(p.id)} className={`${chip} ${pestana === p.id ? chipActivo : ''}`}>
                    {p.texto} <span className="opacity-70">{porPestana[p.id].length}</span>
                  </button>
                ))}
              </div>
              {lista.length === 0 && <p className="py-10 text-center text-tinta-suave">No tienes viajes en esta lista.</p>}
              <div className="flex flex-col gap-4">
                {lista.map((v) => {
                  const primero = v.tramos[0];
                  const ultimo = v.tramos[v.tramos.length - 1];
                  const empresas = [...new Set(v.tramos.map((t) => t.empresa))].join(' + ');
                  return (
                    <article key={v.id} className="vidrio grid overflow-hidden rounded-3xl sm:grid-cols-[1fr_auto]">
                      <div className="p-5 sm:p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span className="font-display text-[0.85rem] font-bold text-brand">{codigoReserva(v.id)}</span>
                          <EstadoBadge estado={v.estado} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 font-display text-[1.2rem] font-bold">{primero?.origen} <ArrowRight className="h-5 w-5 text-brand" /> {ultimo?.destino}</div>
                        <div className="mt-2 text-[0.9rem] text-tinta-suave">
                          {primero && `${diaCorto(primero.salida_estimada)} · ${horaCorta(primero.salida_estimada)}`} · {empresas}
                        </div>
                        <div className="text-[0.9rem] text-tinta-suave">
                          {v.pasajeros.length} pasajero{v.pasajeros.length > 1 ? 's' : ''}{v.tramos.length > 1 && ` · ${v.tramos.length} tramos`}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-brand/25 p-5 sm:flex-col sm:items-end sm:justify-center sm:border-l-2 sm:border-t-0 sm:p-6">
                        <div className="font-display text-[1.3rem] font-bold">{soles(v.total)}</div>
                        <div className="flex gap-2">
                          {v.estado === 'PENDIENTE' && <button className={`${btnPrimario} !px-4 !py-2.5`} onClick={() => navigate(`/resumen/${v.id}`)}>Continuar</button>}
                          <button className={`${btnSecundario} !px-4 !py-2.5`} onClick={() => navigate(`/mis-viajes/${v.id}`)}>Ver detalle</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
      </div>
    </Pagina>
  );
}

export default MisViajes;
