import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../../components/layout/Header/Header';
import AuthModals, { AuthMode } from '../../../auth/components/AuthModals/AuthModals';
import { useClient, Viajero } from '../../../auth/ClientContext';
import { Itinerario, LocationState, SearchParams } from '../../../search/utils/BuscarViajeUtil';
import ReservaSteps from '../../components/ReservaSteps';
import { MapaAsientos, PasajeroForm, TipoDocumento, mensajeError, soles } from '../../utils/ReservaUtil';

const BORRADOR = 'reserbus_borrador';
const MAX_PASAJEROS = 8;
const vacio = (): PasajeroForm => ({ nombres: '', apellidos: '', tipo_documento: 'DNI', numero_documento: '' });
const campo = 'w-full rounded-lg border-2 border-[#ccc] p-2 text-[14px]';

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
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authEmail, setAuthEmail] = useState('');

  const cargarMapas = useCallback(async () => {
    try {
      const res = await Promise.all(ids.map((id) => axios.get<MapaAsientos>(`/api/tramos-programados/${id}/asientos`)));
      setMapas(Object.fromEntries(res.map((r, i) => [ids[i], r.data])));
    } catch (e) { setError(mensajeError(e, 'No se pudo cargar el mapa de asientos.')); }
  }, [ids]);
  useEffect(() => { cargarMapas(); }, [cargarMapas]);

  if (!it || !borrador) {
    return (
      <div><Header />
        <p className="mt-10">No hay una búsqueda activa. <button className="cursor-pointer text-brand underline" onClick={() => navigate('/')}>Volver al inicio</button></p>
      </div>
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
  const tomadoPorOtro = (id: string, codigo: string, ip: number) =>
    Object.entries(sel[id] ?? {}).some(([k, v]) => Number(k) !== ip && v === codigo);

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
      if (!okDoc) return `Pasajero ${i + 1}: documento inválido${p.tipo_documento === 'DNI' ? ' (8 dígitos)' : ''}.`;
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
      const { data } = await axios.post('/api/viajes', {
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
    <div>
      <Header />
      <ReservaSteps paso={2} />
      <p className="my-2 text-[#444]"><strong>Ruta:</strong> {borrador.params.origen} → {borrador.params.destino} · {borrador.params.fecha_salida}</p>

      <div className="flex flex-wrap items-start gap-8 px-8 pb-8">
        {/* PASAJEROS */}
        <section className="w-[400px] text-left">
          <h2 className="mb-3 text-[22px] font-bold text-brand">Pasajeros</h2>
          {pasajeros.map((p, i) => (
            <div key={i} onClick={() => setActivo(i)}
              className={`mb-3 cursor-pointer rounded-2xl border-2 bg-white p-4 ${activo === i ? 'border-brand' : 'border-[#ddd]'}`}>
              <div className="mb-2 flex items-center justify-between font-bold">
                <span>Pasajero {i + 1}{i === 0 && viajero && <span className="ml-1 text-[12px] font-normal text-[#777]">(tú)</span>}{activo === i && <span className="ml-2 text-[12px] font-normal text-brand">(eligiendo asiento)</span>}</span>
                {pasajeros.length > 1 && !(i === 0 && viajero) && <button type="button" className="cursor-pointer border-0 bg-transparent text-[13px] text-red-600" onClick={(e) => { e.stopPropagation(); quitar(i); }}>Quitar</button>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={`${campo} ${bloqueado(i, 'nombres') ? 'bg-[#f3f3f3] text-[#777]' : ''}`} disabled={bloqueado(i, 'nombres')} placeholder="Nombres" value={p.nombres} onChange={(e) => cambiar(i, 'nombres', e.target.value)} />
                <input className={`${campo} ${bloqueado(i, 'apellidos') ? 'bg-[#f3f3f3] text-[#777]' : ''}`} disabled={bloqueado(i, 'apellidos')} placeholder="Apellidos" value={p.apellidos} onChange={(e) => cambiar(i, 'apellidos', e.target.value)} />
                <select className={campo} value={p.tipo_documento} onChange={(e) => cambiar(i, 'tipo_documento', e.target.value as TipoDocumento)}>
                  <option value="DNI">DNI</option><option value="CE">CE</option><option value="PASAPORTE">Pasaporte</option>
                </select>
                <input className={campo} placeholder="N.º de documento" value={p.numero_documento} onChange={(e) => cambiar(i, 'numero_documento', e.target.value.trim())} />
              </div>
              <div className="mt-2 text-[13px] text-[#555]">
                {ids.map((id) => <div key={id}>{etiquetaTramo(id)}: <strong>{sel[id]?.[i] ?? '—'}</strong></div>)}
              </div>
            </div>
          ))}
          <button type="button" className="cursor-pointer rounded-lg border-[1.5px] border-brand bg-white px-4 py-2 font-semibold text-brand disabled:opacity-50"
            disabled={pasajeros.length >= MAX_PASAJEROS} onClick={agregar}>+ Agregar pasajero</button>
        </section>

        {/* MAPA DE ASIENTOS */}
        <section className="min-w-[360px] flex-1">
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {ids.map((id, i) => (
              <button key={id} type="button" onClick={() => setTramo(i)}
                className={`cursor-pointer rounded-[10px] border-0 px-4 py-2 text-[14px] font-medium ${i === tramo ? 'bg-brand text-white' : 'bg-[#f6f6ff] text-brand'}`}>
                {etiquetaTramo(id)}
              </button>
            ))}
          </div>
          {!m ? <p>Cargando asientos…</p> : (
            <div className="mx-auto w-fit rounded-[22px] border-[1.5px] border-[#bbb] bg-white p-5">
              <div className="mb-3 text-[13px] text-[#777]">{m.tipo_bus} · Bus {m.placa} · {m.libres} libres</div>
              <div className="flex flex-col gap-2">
                {Array.from({ length: m.filas }, (_, f) => f + 1).map((fila) => {
                  const r = rangoDe(m, fila);
                  return (
                    <div key={fila} className="flex items-center gap-2">
                      <span className="w-5 text-right text-[12px] text-[#999]">{fila}</span>
                      {m.columnas.map((col, ci) => {
                        const codigo = `${fila}${col}`;
                        const ocupado = m.ocupados.includes(codigo);
                        const otro = tomadoPorOtro(idTramo, codigo, activo);
                        const mio = sel[idTramo]?.[activo] === codigo;
                        const clase = ocupado ? 'cursor-not-allowed bg-[#ddd] text-[#999]'
                          : mio ? 'bg-brand text-white'
                          : otro ? 'cursor-not-allowed bg-[#bda8f9] text-white'
                          : 'cursor-pointer bg-white hover:border-brand';
                        return (
                          <span key={col} className="flex items-center gap-2">
                            {ci === m.pasillo_despues_de && <span className="w-6" />}
                            <button type="button" disabled={ocupado || otro} title={`${codigo}${r ? ` · ${r.nombre}${r.tarifa_extra ? ` (+${soles(r.tarifa_extra)})` : ''}` : ''}`}
                              onClick={() => elegir(idTramo, codigo)}
                              className={`h-10 w-10 rounded-lg border-2 border-[#ccc] text-[12px] font-semibold ${clase}`}>{codigo}</button>
                          </span>
                        );
                      })}
                      <span className="ml-2 text-[11px] text-[#999]">{r?.nombre}{r && r.tarifa_extra > 0 ? ` +${soles(r.tarifa_extra)}` : ''}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-[#555]">
                <span><i className="mr-1 inline-block h-3 w-3 border-2 border-[#ccc] bg-white" />Libre</span>
                <span><i className="mr-1 inline-block h-3 w-3 bg-[#ddd]" />Ocupado</span>
                <span><i className="mr-1 inline-block h-3 w-3 bg-brand" />Tu selección</span>
                <span><i className="mr-1 inline-block h-3 w-3 bg-[#bda8f9]" />Otro pasajero</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* BARRA INFERIOR */}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-[#eee] bg-white px-8 py-4 shadow-[0_-2px_6px_rgba(0,0,0,0.06)]">
        <div className="text-left">
          <div className="text-[13px] text-[#777]">Total estimado ({pasajeros.length} pasajero{pasajeros.length > 1 ? 's' : ''})</div>
          <div className="text-[22px] font-bold">{soles(estimado)}</div>
        </div>
        <div className="flex-1 text-center text-[14px] font-bold text-red-600">{error}</div>
        {esViajero ? (
          <button className="cursor-pointer rounded-lg border-0 bg-brand px-8 py-3 text-[16px] text-white disabled:cursor-not-allowed disabled:bg-[#bda8f9]"
            disabled={enviando} onClick={continuar}>{enviando ? 'Reservando…' : 'Continuar'}</button>
        ) : (
          <button className="cursor-pointer rounded-lg border-0 bg-brand px-8 py-3 text-[16px] text-white disabled:bg-[#bda8f9]"
            disabled={loading} onClick={() => setAuthMode('signin')}>
            {clientType ? 'Solo los viajeros pueden reservar' : 'Inicia sesión para continuar'}
          </button>
        )}
      </div>
      <AuthModals mode={authMode} initialEmail={authEmail} onClose={() => { setAuthMode(null); setAuthEmail(''); }}
        onSwitch={(mode, email) => { setAuthEmail(email); setAuthMode(mode); }} />
    </div>
  );
}

export default Reserva;
