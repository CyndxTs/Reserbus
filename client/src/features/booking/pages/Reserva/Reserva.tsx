import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Plus, Square, Trash2 } from 'lucide-react';
import Pagina from '../../../../components/layout/Pagina';
import Aviso from '../../../../components/ui/Aviso';
import Cargando from '../../../../components/ui/Cargando';
import AuthModals, { AuthMode } from '../../../auth/components/AuthModals/AuthModals';
import { useClient, Viajero } from '../../../auth/ClientContext';
import { Itinerario, LocationState, MAX_PASAJEROS, SearchParams } from '../../../search/utils/BuscarViajeUtil';
import ReservaSteps from '../../components/ReservaSteps';
import MapaAsientosVista from '../../components/MapaAsientos';
import { crearViaje, mapaDeAsientos } from '../../services/ViajeService';
import { MapaAsientos, PasajeroForm, TipoDocumento, mensajeError, soles } from '../../utils/ReservaUtil';
import { btnPrimario, btnSecundario, campo, titulo } from '../../../../lib/estilos';

const BORRADOR = 'reserbus_borrador';
const vacio = (): PasajeroForm => ({ nombres: '', apellidos: '', tipo_documento: 'DNI', numero_documento: '' });
const campoChico = `${campo} !rounded-xl !px-3 !py-2 !text-[0.92rem]`;

// El borrador sobrevive a un refresh o a la redirección de Google (sessionStorage)
function leerBorrador(state: Partial<LocationState> | null): { it: Itinerario; params: SearchParams } | null {
  if (state?.itinerario && state.parametros) {
    sessionStorage.setItem(BORRADOR, JSON.stringify({ it: state.itinerario, params: state.parametros }));
    return { it: state.itinerario, params: state.parametros };
  }
  try { return JSON.parse(sessionStorage.getItem(BORRADOR) || 'null'); } catch { return null; }
}

// Ruta: /reservar. Elegir asientos por tramo y datos de los pasajeros (se pueden agregar más).
function Reserva() {
  const navigate = useNavigate();
  const location = useLocation();
  const { client, clientType, loading } = useClient();
  const viajero = clientType === 'VIAJERO' ? (client as Viajero) : null;
  const borrador = useMemo(() => leerBorrador(location.state as Partial<LocationState> | null), [location.state]);
  const it = borrador?.it ?? null;
  const ids = useMemo(() => (it?.tramos_programados ?? []).map(String), [it]);

  const [mapas, setMapas] = useState<Record<string, MapaAsientos>>({});
  const [pasajeros, setPasajeros] = useState<PasajeroForm[]>(() =>
    Array.from({ length: Math.min(borrador?.params.pasajeros || 1, MAX_PASAJEROS) }, vacio));
  const [sel, setSel] = useState<Record<string, Record<number, string>>>({});   // sel[idTP][idxPasajero] = "12A"
  // El pasajero #1 es siempre el viajero logeado: sus datos se cargan solos y no se editan aquí
  useEffect(() => {
    if (viajero) setPasajeros((ps) => ps.map((p, i) => (i === 0 ? { ...p, nombres: viajero.nombres ?? '', apellidos: viajero.apellidos ?? '' } : p)));
  }, [viajero?.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [activo, setActivo] = useState(0);
  const [tramo, setTramo] = useState(0);
  const [vista3d, setVista3d] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authEmail, setAuthEmail] = useState('');

  const cargarMapas = useCallback(async () => {
    try {
      const res = await Promise.all(ids.map((id) => mapaDeAsientos(id)));
      setMapas(Object.fromEntries(res.map((r, i) => [ids[i], r])));
    } catch (e) { setError(mensajeError(e, 'No se pudo cargar el mapa de asientos.')); }
  }, [ids]);
  useEffect(() => { cargarMapas(); }, [cargarMapas]);

  if (!it || !borrador) {
    return (
      <Pagina ancho="max-w-[640px]">
        <div className="py-24 text-center">
          <h1 className={`${titulo} mb-3 text-[1.6rem]`}>No hay una búsqueda activa</h1>
          <p className="mb-6 text-tinta-suave">Elige un viaje en los resultados para ver sus asientos.</p>
          <button className={btnPrimario} onClick={() => navigate('/')}>Buscar un viaje</button>
        </div>
      </Pagina>
    );
  }

  const bloqueado = (i: number, c: 'nombres' | 'apellidos') => i === 0 && !!viajero && !!(viajero[c] ?? '').trim();
  const seccionDe = (id: string) => it.secciones.find((s) => s.tramos_programados.map(String).includes(id));
  const etiquetaTramo = (id: string) => {
    const s = seccionDe(id);
    const n = s ? s.tramos_programados.length : 1;
    const pos = s ? s.tramos_programados.map(String).indexOf(id) + 1 : 1;
    return s ? `${s.empresa}: ${s.origen} → ${s.destino}${n > 1 ? ` (tramo ${pos}/${n})` : ''}` : `Tramo ${id}`;
  };
  const rangoDe = (m: MapaAsientos, fila: number) => m.rangos.find((r) => fila >= r.fila_desde && fila <= r.fila_hasta);
  // Índice del pasajero (distinto al activo) que ya eligió ese asiento en el tramo; null si nadie
  const tomadoPor = (id: string, codigo: string, ip: number): number | null => {
    const e = Object.entries(sel[id] ?? {}).find(([k, v]) => Number(k) !== ip && v === codigo);
    return e ? Number(e[0]) : null;
  };

  const elegir = (id: string, codigo: string) => {
    setError(null);
    setSel((prev) => {
      const sig = { ...prev };
      const actual = prev[id]?.[activo];
      if (actual === codigo) { sig[id] = { ...(prev[id] ?? {}) }; delete sig[id][activo]; return sig; }
      // mismo bus: se aplica el asiento a los demás tramos de la sección si está libre ahí
      const hermanos = (seccionDe(id)?.tramos_programados ?? [id]).map(String);
      for (const h of hermanos) {
        const m = mapas[h];
        if (!m || m.ocupados.includes(codigo) || (h !== id && Object.entries(prev[h] ?? {}).some(([k, v]) => Number(k) !== activo && v === codigo))) continue;
        sig[h] = { ...(sig[h] ?? {}), [activo]: codigo };
      }
      return sig;
    });
  };

  const extra = (id: string, codigo: string) => {
    const m = mapas[id]; const r = m && rangoDe(m, parseInt(codigo, 10));
    return r ? r.tarifa_extra : 0;
  };
  const extras = Object.entries(sel).reduce((s, [id, porP]) => s + Object.values(porP).reduce((a, c) => a + extra(id, c), 0), 0);
  const estimado = it.precio_base * pasajeros.length + extras;

  const validar = (): string | null => {
    const docs = new Set<string>();
    for (let i = 0; i < pasajeros.length; i++) {
      const p = pasajeros[i];
      if (!p.nombres.trim() || !p.apellidos.trim()) return `Pasajero ${i + 1}: completa nombres y apellidos.`;
      const okDoc = p.tipo_documento === 'DNI' ? /^\d{8}$/.test(p.numero_documento) : /^[A-Za-z0-9]{6,20}$/.test(p.numero_documento);
      if (!okDoc) return `Pasajero ${i + 1}: documento inválido${p.tipo_documento === 'DNI' ? ' (el DNI tiene 8 dígitos)' : ''}.`;
      const k = `${p.tipo_documento}-${p.numero_documento}`;
      if (docs.has(k)) return 'Hay pasajeros con el mismo documento.';
      docs.add(k);
      if (ids.some((id) => !sel[id]?.[i])) return `Pasajero ${i + 1}: falta elegir asiento en todos los tramos.`;
    }
    return null;
  };

  const cambiar = (i: number, c: keyof PasajeroForm, v: string) =>
    setPasajeros((ps) => ps.map((p, j) => (j === i ? { ...p, [c]: v } : p)));
  const agregar = () => { if (pasajeros.length < MAX_PASAJEROS) { setPasajeros((ps) => [...ps, vacio()]); setActivo(pasajeros.length); } };
  const quitar = (i: number) => {
    setPasajeros((ps) => ps.filter((_, j) => j !== i));
    setSel((prev) => Object.fromEntries(Object.entries(prev).map(([id, porP]) => [id,
      Object.fromEntries(Object.entries(porP).filter(([k]) => Number(k) !== i).map(([k, v]) => [Number(k) > i ? Number(k) - 1 : Number(k), v]))])));
    setActivo(0);
  };

  const continuar = async () => {
    const problema = validar();
    if (problema) return setError(problema);
    setEnviando(true); setError(null);
    try {
      const data = await crearViaje({
        tramos_programados: ids.map(Number),
        pasajeros: pasajeros.map((p, i) => ({
          ...p,
          nombres: (i === 0 && viajero ? viajero.nombres || p.nombres : p.nombres).trim(),
          apellidos: (i === 0 && viajero ? viajero.apellidos || p.apellidos : p.apellidos).trim(),
          asientos: Object.fromEntries(ids.map((id) => [id, sel[id][i]])),
        })),
      });
      sessionStorage.removeItem(BORRADOR);
      navigate(`/resumen/${data.id}`);
    } catch (e) {
      setError(mensajeError(e));
      cargarMapas();      // por si alguien tomó un asiento mientras tanto
    } finally { setEnviando(false); }
  };

  const idTramo = ids[tramo];
  const m = mapas[idTramo];
  const esViajero = clientType === 'VIAJERO';

  return (
    <Pagina>
      <ReservaSteps paso={2} />
      <p className="mb-6 text-center text-[0.98rem] text-tinta-suave">
        <strong className="text-tinta">{borrador.params.origen} → {borrador.params.destino}</strong> · {borrador.params.fecha_salida}
      </p>

      <div className="grid items-start gap-6 pb-28 lg:grid-cols-[380px_1fr]">
        {/* PASAJEROS */}
        <section aria-label="Pasajeros">
          <h2 className={`${titulo} mb-3 text-[1.05rem]`}>Pasajeros</h2>
          {pasajeros.map((p, i) => (
            <div key={i} onClick={() => setActivo(i)}
              className={`mb-3 cursor-pointer rounded-3xl border-2 bg-white/85 p-4 transition ${activo === i ? 'border-senal shadow-[0_10px_30px_-12px_rgba(255,90,31,0.5)]' : 'border-brand/10 hover:border-brand/30'}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2.5 font-bold">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl font-display text-[0.8rem] font-bold ${activo === i ? 'bg-senal text-tinta' : 'bg-brand text-white'}`}>P{i + 1}</span>
                  {i === 0 && viajero ? 'Tú' : `Pasajero ${i + 1}`}
                  {activo === i && <span className="text-[0.75rem] font-semibold text-senal-dark">eligiendo asiento</span>}
                </span>
                {pasajeros.length > 1 && !(i === 0 && viajero) && (
                  <button type="button" aria-label={`Quitar pasajero ${i + 1}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-rose-600 transition hover:bg-rose-50"
                    onClick={(e) => { e.stopPropagation(); quitar(i); }}><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input aria-label={`Nombres del pasajero ${i + 1}`} className={campoChico} disabled={bloqueado(i, 'nombres')} placeholder="Nombres" value={p.nombres} onChange={(e) => cambiar(i, 'nombres', e.target.value)} />
                <input aria-label={`Apellidos del pasajero ${i + 1}`} className={campoChico} disabled={bloqueado(i, 'apellidos')} placeholder="Apellidos" value={p.apellidos} onChange={(e) => cambiar(i, 'apellidos', e.target.value)} />
                <select aria-label={`Tipo de documento del pasajero ${i + 1}`} className={campoChico} value={p.tipo_documento} onChange={(e) => cambiar(i, 'tipo_documento', e.target.value as TipoDocumento)}>
                  <option value="DNI">DNI</option><option value="CE">CE</option><option value="PASAPORTE">Pasaporte</option>
                </select>
                <input aria-label={`Número de documento del pasajero ${i + 1}`} className={campoChico} placeholder="N.º de documento" value={p.numero_documento} onChange={(e) => cambiar(i, 'numero_documento', e.target.value.trim())} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ids.map((id) => (
                  <span key={id} className={`rounded-lg px-2.5 py-1 text-[0.75rem] font-semibold ${sel[id]?.[i] ? 'bg-brand-soft text-brand-dark' : 'bg-niebla text-tinta-suave'}`}>
                    {ids.length > 1 ? `${seccionDe(id)?.origen ?? ''} → ${seccionDe(id)?.destino ?? ''}: ` : 'Asiento: '}<strong>{sel[id]?.[i] ?? 'sin elegir'}</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className={btnSecundario} disabled={pasajeros.length >= MAX_PASAJEROS} onClick={agregar}>
            <Plus className="h-4 w-4" /> Agregar pasajero
          </button>
        </section>

        {/* MAPA DE ASIENTOS */}
        <section aria-label="Mapa de asientos" className="vidrio min-w-0 rounded-[2rem] p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {ids.map((id, i) => (
                <button key={id} type="button" aria-pressed={i === tramo} onClick={() => setTramo(i)}
                  className={`cursor-pointer rounded-xl border px-3.5 py-2 text-[0.85rem] font-semibold transition ${i === tramo ? 'border-brand bg-brand text-white' : 'border-brand/20 bg-white/80 text-brand hover:border-brand/50'}`}>
                  {etiquetaTramo(id)}
                </button>
              ))}
            </div>
            <button type="button" aria-pressed={vista3d} onClick={() => setVista3d((v) => !v)} className={`${btnSecundario} !px-3.5 !py-2 !text-[0.85rem]`}>
              {vista3d ? <Square className="h-4 w-4" /> : <Box className="h-4 w-4" />} {vista3d ? 'Vista plana' : 'Vista 3D'}
            </button>
          </div>
          {!m ? (error ? null : <Cargando texto="Cargando asientos…" />) : (
            <>
              <div className="text-center text-[0.85rem] font-semibold text-tinta-suave">{m.tipo_bus} · Bus {m.placa} · {m.libres} libres</div>
              <MapaAsientosVista mapa={m} vista3d={vista3d} elegido={sel[idTramo]?.[activo]}
                ocupadoPorOtro={(c) => tomadoPor(idTramo, c, activo)} onElegir={(c) => elegir(idTramo, c)} />
            </>
          )}
        </section>
      </div>

      {/* BARRA INFERIOR */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6">
        <div className="vidrio mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl px-5 py-3">
          <div>
            <div className="text-[0.78rem] font-semibold text-tinta-suave">Total estimado · {pasajeros.length} pasajero{pasajeros.length > 1 ? 's' : ''}</div>
            <div className="font-display text-[1.5rem] font-bold leading-tight">{soles(estimado)}</div>
          </div>
          <div className="min-w-0 flex-1">{error && <Aviso tipo="error">{error}</Aviso>}</div>
          {esViajero ? (
            <button className={btnPrimario} disabled={enviando} onClick={continuar}>{enviando ? 'Reservando…' : 'Continuar'}</button>
          ) : (
            <button className={btnPrimario} disabled={loading || !!clientType} onClick={() => setAuthMode('signin')}>
              {clientType ? 'Solo los viajeros pueden reservar' : 'Inicia sesión para continuar'}
            </button>
          )}
        </div>
      </div>
      <AuthModals mode={authMode} initialEmail={authEmail} onClose={() => { setAuthMode(null); setAuthEmail(''); }}
        onSwitch={(mode, email) => { setAuthEmail(email); setAuthMode(mode); }} />
    </Pagina>
  );
}

export default Reserva;
