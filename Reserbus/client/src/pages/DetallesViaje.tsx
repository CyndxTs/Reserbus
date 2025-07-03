import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DetallesViaje.css';
import Header from '../probando/Header';

type Tarifa = {
  id_tarifa: number;
  tipo: string;
  precio: number;
};

type ViajeDetalle = {
  id_viaje: number;
  abordaje: string;
  partida: string;
  llegada: string;
  duracion: number;
  origen: string;
  destino: string;
  empresa: string;
  placa_bus: string;
  servicios: string[];
  tarifas: Tarifa[];
};

const DetallesViaje = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeDetalle | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    const fetchViaje = async () => {
      try {
        const res = await axios.get(`/api/viajes/resultados/${id}`);
        setViaje(res.data);
      } catch (e) {
        console.error('Error al obtener el viaje:', e);
      }
    };
    fetchViaje();
  }, [id]);

  const toggleSeat = (seat: number) => {
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const formatHora = (fecha: string) => new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!viaje) return <div className="loading">Cargando viaje...</div>;

  return (
    <div className="detalles-container">
      <Header />
      <h2>Reserva de asientos</h2>
      <div className="detalles-layout">
        {/* SECCIÓN IZQUIERDA */}
        <div className="seccion-asientos">
          <div className="asientos-info">
            <strong>Asientos:</strong> {selectedSeats.join(', ') || 'Ninguno'}
            <button className="toggle-asientos">Seleccionar asientos ⌃</button>
          </div>

          <div className="bus">
            <div className="piso">Primer piso - Cama 140°</div>
            <div className="asientos-grid">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                <button
                  key={num}
                  className={`asiento ${selectedSeats.includes(num) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="piso">Segundo piso - Cama 120°</div>
            <div className="asientos-grid">
              {[13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40].map(num => (
                <button
                  key={num}
                  className={`asiento ${selectedSeats.includes(num) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-continuar"
            onClick={() => navigate('/informacion-pasajeros', { state: { viaje, selectedSeats } })}
            disabled={selectedSeats.length === 0}
          >
            Ir a información de pasajeros
          </button>
        </div>

        {/* SECCIÓN DERECHA */}
        <div className="seccion-detalle">
          <div className="box-itinerario">
            <h4>✓ ITINERARIO</h4>
            <p>
              <strong>{new Date(viaje.abordaje).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}</strong> &nbsp;
              {formatHora(viaje.abordaje)} — {formatHora(viaje.llegada)}
            </p>
            <p>{viaje.origen} — Terminal</p>
            <p>{viaje.destino} — Terminal</p>
            <p className="empresa">{viaje.empresa}</p>
            <p className="duracion">{(viaje.duracion / 60).toFixed(0)}h {(viaje.duracion % 60)}m</p>
          </div>

          <div className="box-compartir">
            <h4>¿Viajas con alguien?</h4>
            <p>Comparte los detalles de tu viaje con ellos ahora.</p>
            <button className="btn-compartir">Compartir detalles de ticket 🔗</button>
          </div>

          <div className="box-precio">
            <p>🎫 <strong>{selectedSeats.length} pasajero(s)</strong></p>
            <p>Valor de ticket: S/{viaje.tarifas[0]?.precio.toFixed(2)}</p>
            <p><strong>Total</strong> S/{(selectedSeats.length * viaje.tarifas[0]?.precio).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesViaje;
