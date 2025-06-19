import React, { useEffect, useState } from 'react';
import './SearchResults.css'; 
import { useClient } from '../context/ClientContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
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

  // Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  // Obtener el precio mínimo de las tarifas (versión simplificada)
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

  // Calcular duración del viaje
  const calcularDuracion = (viaje: Viaje) => {
    if (!viaje.instante_partida || !viaje.instante_llegada) return "Duración no disponible";
    
    const partida = new Date(viaje.instante_partida);
    const llegada = new Date(viaje.instante_llegada);
    const duracionMs = llegada.getTime() - partida.getTime();
    
    const horas = Math.floor(duracionMs / (1000 * 60 * 60));
    const minutos = Math.floor((duracionMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
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
      
      <div className="search-header">
        <h1>Resultados de búsqueda</h1>
        {parametros && (
          <div className="search-params">
            <p><strong>Ruta:</strong> {parametros.origen} → {parametros.destino}</p>
            <p><strong>Fecha:</strong> {new Date(parametros.fecha_salida).toLocaleDateString()}</p>
            <p><strong>Pasajeros:</strong> {parametros.pasajeros}</p>
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
          <div className="card-etiqueta">Cruz del Sur</div>
          <div className="card-info">
            <div className="horarios">
              <strong>{format(new Date(viaje.instante_abordaje), "hh:mm a")}</strong>
              <span>{viaje.ruta?.origen}</span>
            </div>
            <div className="duracion">
              {calcularDuracion(viaje)}
            </div>
            <div className="horarios">
              <strong>{format(new Date(viaje.instante_llegada), "hh:mm a")}</strong>
              <span>{viaje.ruta?.destino}</span>
            </div>
          </div>
          <div className="precio">
            <span>{getPrecioMinimo(viaje.tarifas)}</span>
            <small>20 disponibles</small>
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