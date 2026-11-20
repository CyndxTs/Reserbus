import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { SearchX } from 'lucide-react';
import Pagina from '../../../../components/layout/Pagina';
import Aviso from '../../../../components/ui/Aviso';
import Cargando from '../../../../components/ui/Cargando';
import ReservaSteps from '../../../booking/components/ReservaSteps';
import BuscadorViaje from '../../components/BuscadorViaje';
import ItinerarioCard from '../../components/ItinerarioCard';
import { buscar, filtrarPorServicios, listarServicios } from '../../services/BusquedaService';
import { listarTerminales } from '../../services/UbicacionService';
import { mensajeError } from '../../../booking/utils/ReservaUtil';
import { FRANJAS, Franja, Itinerario, Orden, SearchValues, Servicio, Terminal, franjaDe, hoyLocal } from '../../utils/BuscarViajeUtil';
import { chip, chipActivo, titulo } from '../../../../lib/estilos';

const ORDENES: { id: Orden; texto: string }[] = [
  { id: 'llegada', texto: 'Llegada más temprana' },
  { id: 'precio', texto: 'Más barato' },
  { id: 'trasbordos', texto: 'Menos trasbordos' },
];

const subtitulo = 'mb-2 font-display text-[0.8rem] font-bold text-tinta';

// Ruta: /resultados?origen=&destino=&fecha=&pasajeros=&orden=
function SearchResults() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const origen = sp.get('origen') ?? '';
  const destino = sp.get('destino') ?? '';
  const fecha = sp.get('fecha') ?? '';
  const pasajeros = Math.max(Number(sp.get('pasajeros')) || 1, 1);
  const orden = (ORDENES.some((o) => o.id === sp.get('orden')) ? sp.get('orden') : 'llegada') as Orden;

  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [viajes, setViajes] = useState<Itinerario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [franjas, setFranjas] = useState<Franja[]>([]);
  const [soloDirectos, setSoloDirectos] = useState(false);
  const [empresaSel, setEmpresaSel] = useState<string | null>(null);
  const [serviciosSel, setServiciosSel] = useState<string[]>([]);
  const [avisoServicios, setAvisoServicios] = useState<string | null>(null);

  useEffect(() => {
    listarTerminales().then(setTerminales).catch(() => setTerminales([]));
    listarServicios().then(setServicios).catch(() => setServicios([]));
  }, []);

  const cargar = useCallback(async () => {
    setViajes(null); setError(null);
    try { setViajes(await buscar({ origen, destino, fecha, pasajeros, orden })); }
    catch (e) { setError(mensajeError(e, 'No se pudo realizar la búsqueda.')); }
  }, [origen, destino, fecha, pasajeros, orden]);
  useEffect(() => { if (origen && destino && fecha) cargar(); }, [cargar, origen, destino, fecha]);

  const nombre = (id: string) => terminales.find((t) => String(t.id) === id)?.nombre ?? '…';
  const cambiar = (cambios: Record<string, string>) => {
    const n = new URLSearchParams(sp);
    Object.entries(cambios).forEach(([k, v]) => n.set(k, v));
    setSp(n);
  };

  const empresas = useMemo(() => [...new Set((viajes ?? []).flatMap((v) => v.secciones.map((s) => s.empresa)))], [viajes]);
  const visibles = useMemo(() => (viajes ?? []).filter((v) =>
    (!franjas.length || franjas.includes(franjaDe(v.salida_local))) &&
    (!soloDirectos || v.trasbordos === 0) &&
    (!empresaSel || v.secciones.some((s) => s.empresa === empresaSel))), [viajes, franjas, soloDirectos, empresaSel]);

  const alternarServicio = async (s: string) => {
    const sig = serviciosSel.includes(s) ? serviciosSel.filter((x) => x !== s) : [...serviciosSel, s];
    setServiciosSel(sig);
    const r = await filtrarPorServicios(sig);
    setAvisoServicios(r.mensaje);
  };

  if (!origen || !destino || !fecha) return <Navigate to="/" replace />;

  const elegir = (it: Itinerario) =>
    navigate('/reservar', { state: { itinerario: it, parametros: { origen: it.secciones[0].origen, destino: it.secciones[it.secciones.length - 1].destino, fecha_salida: fecha, pasajeros } } });

  const base = new Date(`${fecha}T00:00:00`);
  const dias = [-3, -2, -1, 0, 1, 2, 3].map((o) => addDays(base, o)).filter((d) => format(d, 'yyyy-MM-dd') >= hoyLocal());
  const inicial: Partial<SearchValues> = { origen, destino, salida: fecha, pasajeros };

  return (
    <Pagina>
      <ReservaSteps paso={1} />
      <BuscadorViaje terminales={terminales} inicial={inicial}
        onBuscar={(v) => cambiar({ origen: v.origen, destino: v.destino, fecha: v.salida, pasajeros: String(v.pasajeros) })} />

      {/* Fechas cercanas */}
      <div role="group" aria-label="Fechas cercanas" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {dias.map((d) => {
          const iso = format(d, 'yyyy-MM-dd');
          const activo = iso === fecha;
          return (
            <button key={iso} type="button" aria-pressed={activo} onClick={() => cambiar({ fecha: iso })}
              className={`flex min-w-[76px] cursor-pointer flex-col items-center rounded-2xl border px-3 py-2 transition ${activo ? 'border-brand bg-brand text-white shadow-brillo' : 'border-brand/15 bg-white/80 text-tinta hover:border-brand/50'}`}>
              <span className={`text-[0.75rem] font-semibold ${activo ? 'text-white/80' : 'text-tinta-suave'}`}>{format(d, 'EEE', { locale: es })}</span>
              <span className="font-display text-[1.05rem] font-bold">{format(d, 'd')}</span>
              <span className={`text-[0.75rem] ${activo ? 'text-white/80' : 'text-tinta-suave'}`}>{format(d, 'MMM', { locale: es })}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        {/* FILTROS */}
        <aside className="vidrio rounded-3xl p-5 lg:sticky lg:top-24" aria-label="Filtros">
          <div className="mb-5">
            <h2 className={subtitulo}>Hora de salida</h2>
            <div className="flex flex-wrap gap-2">
              {FRANJAS.map((f) => {
                const on = franjas.includes(f.id);
                return (
                  <button key={f.id} type="button" aria-pressed={on} title={f.rango}
                    onClick={() => setFranjas(on ? franjas.filter((x) => x !== f.id) : [...franjas, f.id])}
                    className={`${chip} ${on ? chipActivo : ''}`}>{f.nombre}</button>
                );
              })}
            </div>
          </div>
          <div className="mb-5">
            <h2 className={subtitulo}>Tipo de viaje</h2>
            <button type="button" aria-pressed={soloDirectos} onClick={() => setSoloDirectos((v) => !v)} className={`${chip} ${soloDirectos ? chipActivo : ''}`}>Solo directos</button>
          </div>
          {empresas.length > 1 && (
            <div className="mb-5">
              <h2 className={subtitulo}>Empresa</h2>
              <div className="flex flex-wrap gap-2">
                {empresas.map((e) => (
                  <button key={e} type="button" aria-pressed={empresaSel === e} onClick={() => setEmpresaSel(empresaSel === e ? null : e)} className={`${chip} ${empresaSel === e ? chipActivo : ''}`}>{e}</button>
                ))}
              </div>
            </div>
          )}
          {servicios.length > 0 && (
            <div>
              <h2 className={subtitulo}>Servicios</h2>
              <div className="flex flex-wrap gap-2">
                {servicios.map((s) => {
                  const on = serviciosSel.includes(s.nombre);
                  return <button key={s.id} type="button" aria-pressed={on} onClick={() => alternarServicio(s.nombre)} className={`${chip} ${on ? chipActivo : ''}`}>{s.nombre}</button>;
                })}
              </div>
              {avisoServicios && <div className="mt-3 text-[0.8rem] font-semibold text-tinta-suave">{avisoServicios}</div>}
            </div>
          )}
        </aside>

        {/* RESULTADOS */}
        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className={`${titulo} text-[1.3rem]`}>{nombre(origen)} a {nombre(destino)}</h1>
              {viajes && <p className="mt-1 text-[0.95rem] text-tinta-suave">{visibles.length} opción{visibles.length === 1 ? '' : 'es'} para {pasajeros} pasajero{pasajeros > 1 ? 's' : ''}</p>}
            </div>
            <div role="group" aria-label="Ordenar por" className="flex flex-wrap gap-2">
              {ORDENES.map((o) => (
                <button key={o.id} type="button" aria-pressed={orden === o.id} onClick={() => cambiar({ orden: o.id })} className={`${chip} ${orden === o.id ? chipActivo : ''}`}>{o.texto}</button>
              ))}
            </div>
          </div>

          {error ? <Aviso tipo="error">{error} <button className="ml-2 cursor-pointer border-0 bg-transparent p-0 font-bold underline" onClick={cargar}>Reintentar</button></Aviso>
            : viajes === null ? <Cargando texto="Buscando los mejores viajes…" />
            : visibles.length === 0 ? (
              <div className="vidrio flex flex-col items-center rounded-3xl px-6 py-14 text-center">
                <SearchX className="mb-4 h-10 w-10 text-brand" />
                <h2 className={`${titulo} text-[1.2rem]`}>{viajes.length ? 'Ningún viaje cumple tus filtros' : 'No hay viajes para esta fecha'}</h2>
                <p className="mt-2 max-w-[26rem] text-tinta-suave">{viajes.length ? 'Quita algún filtro para ver más opciones.' : 'Prueba con otro día de la barra de fechas o cambia el origen y el destino.'}</p>
              </div>
            ) : (
              <motion.div className="flex flex-col gap-4" initial="oculto" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
                {visibles.map((it, i) => (
                  <motion.div key={it.tramos_programados.join('-') || i} variants={{ oculto: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }}>
                    <ItinerarioCard it={it} onElegir={elegir} />
                  </motion.div>
                ))}
              </motion.div>
            )}
        </section>
      </div>
    </Pagina>
  );
}

export default SearchResults;
