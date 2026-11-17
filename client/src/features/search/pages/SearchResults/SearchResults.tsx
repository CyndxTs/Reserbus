import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDays,format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Itinerario, SearchParams, LocationState } from '../../utils/BuscarViajeUtil';
import Header from '../../../../components/layout/Header/Header';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<Itinerario[]>([]);
  const [parametros, setParametros] = useState<SearchParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  // Barra de fechas dinámica
  const renderDateBar = () => {
    if (!parametros?.fecha_salida) return null;
    const baseDate = new Date(parametros.fecha_salida + "T00:00:00");
    const days = [-3, -2, -1, 0, 1, 2, 3];
    return (
      <div className="mb-2 flex justify-center gap-3">
        {days.map((offset) => {
          const date = addDays(baseDate, offset);
          const isActive = offset === 0;
          const label = format(date, "EEE d", { locale: es });
          return (
            <button
              key={offset}
              className={`rounded-[10px] border-0 px-[18px] py-[10px] text-[1em] font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-brand text-white"
                  : "cursor-pointer bg-[#f6f6ff] text-brand hover:bg-[#835ef4] hover:text-white"
              }`}
              // onClick: aquí podrías cambiar la fecha de búsqueda si lo deseas
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const state = location.state as LocationState;
    if (state && state.resultados && state.parametros) {
      setViajes(state.resultados);
      setParametros(state.parametros);
      setLoading(false);
    } else {
      setError('No se encontraron resultados de búsqueda');
      setLoading(false);
    }
  }, [location]);

  // El server ya entrega la hora local del terminal: "YYYY-MM-DD HH:mm"
  const hora = (local: string) => (local ? local.slice(11, 16) : '--:--');

  // Formatea la duración en horas y minutos
  const formatDuracion = (minutos: number) => {
    if (!minutos || minutos <= 0) return "No disponible";
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${m}m`;
  };
  
  if (loading) {
    return <div>Cargando resultados...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Header />
      {/* Barra de pasos */}
      <div className="mb-4 mt-6 flex justify-center gap-10">
        <div className="border-b-[3px] border-brand text-center font-bold text-brand">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand text-[1.2em] font-bold bg-brand text-white">1</span><br /><span>Destino y fecha</span>
        </div>
        <div className="text-center text-[1.1em] font-medium text-[#bbb]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand text-[1.2em] font-bold mb-[6px] bg-white text-brand">2</span><br /><span>Selecciona tus asientos</span>
        </div>
        <div className="text-center text-[1.1em] font-medium text-[#bbb]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand text-[1.2em] font-bold mb-[6px] bg-white text-brand">3</span><br /><span>Realiza el pago</span>
        </div>
      </div>

      {/* Barra de fechas */}
      {renderDateBar()}

      <div>
        {parametros && (
          <div>
            <p className="my-4"><strong>Ruta:</strong> {parametros.origen} → {parametros.destino}</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-8 px-8 pb-8">
        {/* FILTROS */}
        <aside className="mt-2 w-[250px] pl-0 text-left text-[14px]">
          <h3 className="my-[1em] text-[1.17em] font-bold">Hora de salida</h3>
          <ul className="my-[1em] list-none pl-0">
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Nocturno (antes de 6 a. m.)</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Temprano (6 a. m. - 11 a. m.)</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Mediodía (11 a. m. - 5 p. m.)</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Tarde (después de 5 p. m.)</li>
          </ul>
          <h3 className="my-[1em] text-[1.17em] font-bold">Entretenimiento</h3>
          <ul className="my-[1em] list-none pl-0">
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Película</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Luz de lectura</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> TV</li>
          </ul>
          <h3 className="my-[1em] text-[1.17em] font-bold">Servicios</h3>
          <ul className="my-[1em] list-none pl-0">
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Baño</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> Aire acondicionado</li>
            <li className="my-[5px]"><input type="checkbox" className="mr-1.5" /> USB</li>
          </ul>
        </aside>
        {/* RESULTADOS */}
        <section className="flex-1">
          <div className="mb-[0.1rem] flex items-center justify-between px-8 py-2 text-left text-black">
            <div>Se encontraron {viajes.length} resultados</div>
            <div>
              Ordenar por:
              <select>
                <option value="">Seleccionar</option>
                <option value="precio">Precio</option>
                <option value="duracion">Duración</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {viajes.map((it, i) => {
              const primera = it.secciones[0];
              const ultima = it.secciones[it.secciones.length - 1];
              return (
                <div
                  className="mb-[1.2rem] flex flex-row items-center justify-between gap-8 rounded-[22px] border-[1.5px] border-[#bbb] bg-white px-8 py-[1.2rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  key={it.tramos_programados.join('-') || i}
                >
                  <div className="flex flex-[1.2] flex-col gap-[0.2rem]">
                    <div className="mb-2 text-[18px] font-bold text-brand">
                      {[...new Set(it.secciones.map((s) => s.empresa))].join(' + ')}
                    </div>
                    <div className="text-[14px] text-[#222]">{primera.tipo_bus}</div>
                    <div className="text-[13px] text-[#a678ff]">
                      {it.trasbordos === 0 ? 'Directo' : `${it.trasbordos} trasbordo${it.trasbordos > 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div className="flex flex-[2] items-center justify-center gap-10">
                    <div className="text-center">
                      <span className="text-[1.4rem] font-bold text-brand">{hora(it.salida_local)}</span>
                      <div className="text-[13px] text-[#444]">{primera.origen}</div>
                    </div>
                    <div className="text-center text-[1.5rem] text-[#222]">
                      <span>→</span>
                      <div className="text-[14px] text-[#777]">{formatDuracion(it.duracion_min)}</div>
                    </div>
                    <div className="text-center">
                      <span className="text-[1.4rem] font-bold text-brand">{hora(it.llegada_local)}</span>
                      <div className="text-[13px] text-[#444]">{ultima.destino}</div>
                    </div>
                  </div>
                  <div className="flex flex-[1.1] flex-col items-end gap-[0.3rem]">
                    <div className="text-[13px] text-[#444]">Desde:</div>
                    <div className="text-right text-[1.2rem] font-bold text-[#333]">S/ {it.precio_base.toFixed(2)}</div>
                    <button onClick={() => navigate('/reservar', { state: { itinerario: it, parametros } })} className="mt-[0.2rem] cursor-pointer rounded-[18px] border-[1.5px] border-brand bg-white px-[18px] py-1 font-semibold text-brand transition-colors duration-200 hover:bg-brand hover:text-white">Ver asientos</button>
                    <div className="text-[12px] text-[#888]">{it.libres} disponibles</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SearchResults;