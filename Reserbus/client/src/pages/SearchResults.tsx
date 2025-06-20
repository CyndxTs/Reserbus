import React, { useEffect, useState } from 'react';
import './SearchResults.css'; 
import { useClient } from '../context/ClientContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDays,format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '../Components/Header';
import { Tarifa, Empresa, Ruta, Viaje, SearchParams, LocationState } from '../util/BuscarViajeUtil';

function SearchResults() {
  const { client, clientType } = useClient();
  const viajero = clientType === 'VIAJERO' ? client : null;
  const navigate = useNavigate();
  const location = useLocation();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [parametros, setParametros] = useState<SearchParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  


  
  // Barra de fechas dinámica
  const renderDateBar = () => {
    if (!parametros?.fecha_salida) return null;
    const baseDate = new Date(parametros.fecha_salida + "T00:00:00");
    const days = [-3, -2, -1, 0, 1, 2, 3];
    return (
      <div className="dates-bar">
        {days.map((offset) => {
          const date = addDays(baseDate, offset);
          const isActive = offset === 0;
          const label = format(date, "EEE d", { locale: es });
          return (
            <button
              key={offset}
              className={`date-btn${isActive ? " active" : ""}`}
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
    if (state && state.viajes && state.parametros) {
      setViajes(state.viajes);
      setParametros(state.parametros);
      setLoading(false);
    } else {
      setError('No se encontraron resultados de búsqueda');
      setLoading(false);
    }
  }, [location]);

  // Formatea la hora de inicio (24h)
  const getHoraInicio = (instante_abordaje: string) => {
    if (!instante_abordaje) return "--:--";
    const date = new Date(instante_abordaje);
    return format(date, "HH:mm");
  };

  // Calcula la hora de llegada sumando minutos a instante_abordaje
  const getHoraLlegada = (instante_abordaje: string, duracionMin: number) => {
    if (!instante_abordaje || !duracionMin) return "--:--";
    const inicio = new Date(instante_abordaje);
    // Si duracionMin es 0 o negativo, muestra la misma hora de inicio
    if (duracionMin <= 0) return format(inicio, "HH:mm");
    const llegada = new Date(inicio.getTime() + duracionMin * 60000);
    return format(llegada, "HH:mm");
  };

  // Formatea la duración en horas y minutos
  const formatDuracion = (minutos: number) => {
    if (!minutos || minutos <= 0) return "No disponible";
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${m}m`;
  };
  

  // Obtener el precio mínimo de las tarifas
  const getPrecioMinimo = (tarifas: Tarifa[]) => {
    if (!tarifas || tarifas.length === 0) return "No disponible";
    
    let minPrecio = Number.MAX_VALUE;
    for (const tarifa of tarifas) {
      if (tarifa.precio < minPrecio) {
        minPrecio = tarifa.precio;
      }
    }
    
    return `S/ ${minPrecio.toFixed(2)}`;
  };


  if (loading) {
    return <div className="loading">Cargando resultados...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="search-results">
      <Header />
      
      {/* Barra de pasos */}
      <div className="steps-bar">
      <div className="step active"><span className="step-circle">1</span><br /><span>Destino y fecha</span></div>
      <div className="step"><span className="step-circle">2</span><br /><span>Selecciona tus asientos</span></div>
      <div className="step"><span className="step-circle">3</span><br /><span>Realiza el pago</span></div>
      </div>

      {/* Barra de fechas */}
      {renderDateBar()}

      <div className="search-header">
        {parametros && (
          <div className="search-params">
            <p><strong>Ruta:</strong> {parametros.origen} → {parametros.destino}</p>
          </div>
        )}
      </div>

      <div className="results-layout">
  {/* FILTROS */}
  <aside className="filtros">
    <h3>Hora de salida</h3>
    <ul>
      <li><input type="checkbox" /> Nocturno (antes de 6 a. m.)</li>
      <li><input type="checkbox" /> Temprano (6 a. m. - 11 a. m.)</li>
      <li><input type="checkbox" /> Mediodía (11 a. m. - 5 p. m.)</li>
      <li><input type="checkbox" /> Tarde (después de 5 p. m.)</li>
    </ul>

    <h3>Entretenimiento</h3>
    <ul>
      <li><input type="checkbox" /> Película</li>
      <li><input type="checkbox" /> Luz de lectura</li>
      <li><input type="checkbox" /> TV</li>
    </ul>

    <h3>Servicios</h3>
    <ul>
      <li><input type="checkbox" /> Baño</li>
      <li><input type="checkbox" /> Aire acondicionado</li>
      <li><input type="checkbox" /> USB</li>
    </ul>
  </aside>

  {/* RESULTADOS */}
  <section className="resultados">
    <div className="resultados-header">
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

    <div className="viajes-list">
      {viajes.map((viaje) => (
        <div className="viaje-card" key={viaje.id_viaje}>
          <div className="card-empresa">
            <div className="empresa-nombre">{viaje.empresa?.razon_social || 'Empresa'}</div>
            <div className="servicio">Cama 160°/180°</div>
            <div className="ver-detalles">Ver detalles</div>
          </div>
          <div className="card-horarios">
            <div className="hora-salida">
              <span className="hora">{getHoraInicio(viaje.instante_abordaje)}</span>
              <div className="ciudad">{viaje.ruta?.origen}</div>
            </div>
            <div className="flecha-horario">
              <span className="arrow">→</span>
              <div className="duracion">{formatDuracion(viaje.duracion_estimada_minutos || 0)}</div>
            </div>
            <div className="hora-llegada">
              <span className="hora">{getHoraLlegada(viaje.instante_abordaje, viaje.duracion_estimada_minutos || 0)}</span>
              <div className="ciudad">{viaje.ruta?.destino}</div>
            </div>
          </div>
          <div className="card-precio">
            <div className="desde">Desde:</div>
            <div className="precio">{getPrecioMinimo(viaje.tarifas)}</div>
            <button className="btn-asientos">Ver asientos</button>
            <div className="disponibles">{viaje.tarifas.length > 0 ? '20 disponibles' : 'No disponibles'}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
</div>
    </div>
  );
}

export default SearchResults;