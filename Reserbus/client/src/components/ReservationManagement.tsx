// src/pages/ReservationManagement.tsx
import { useEffect, useState } from 'react';
import { Empresa } from '../context/ClientContext';
import axios from 'axios';

interface Reserva {
  id_reserva: number;
  estado: string;
  id_viajero: number;
  id_viaje_ida: number;
  id_viaje_vuelta?: number;
  id_pago?: number;
  esta_habilitado: boolean;
  pasajero?: string;
  ruta?: string;
  fecha?: string;
  hora?: string;
}

const ReservationManagement = (
    { openModal, empresa }: { openModal: (modal: string) => void; empresa: Empresa | null }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  
  const fetchReservas = async () => {
    const res = await axios.get('/api/reservas');
    const enriched = res.data.filter((r: Reserva) => r.esta_habilitado).map((r: Reserva) => ({
      ...r,
      pasajero: 'Nombre Apellido', // Placeholder
      ruta: 'Lima → Cusco', // Placeholder
      fecha: '23 Jun 2025', // Placeholder
      hora: '21:45' // Placeholder
    }));
    setReservas(enriched);
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <div className="section-content">
      <div className="section-header">
        <h1>Gestión de Reservas</h1>
        <button className="primary-button" onClick={() => openModal('reserva')}>
          <svg viewBox="0 0 25 15" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Nueva Reserva
        </button>
      </div>

      <div className="data-grid">
        <div className="reservation-filters">
          <input type="text" placeholder="Buscar por código de reserva, pasajero..." className="search-input" />
          <select className="filter-select">
            <option>Todos los estados</option>
            <option>Confirmada</option>
            <option>Pendiente</option>
            <option>Cancelada</option>
            <option>Completada</option>
          </select>
          <input type="date" className="date-filter" placeholder="Fecha" />
          <select className="filter-select">
            <option>Todas las rutas</option>
            <option>Lima → Arequipa</option>
            <option>Arequipa → Cusco</option>
            <option>Lima → Trujillo</option>
            <option>Cusco → Lima</option>
          </select>
        </div>

        <div className="data-table">
          <div className="table-header">
            <span>DNI</span>
            <span>Pasajero</span>
            <span>Ruta</span>
            <span>Fecha/Hora</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {reservas.map((reserva) => (
            <div key={reserva.id_reserva} className="table-row">
              <span className="reservation-code">{reserva.id_viajero}</span>
              <div className="passenger-info">
                <span className="passenger-name">{reserva.pasajero}</span>
              </div>
              <div className="route-info">
                <span className="route-path">{reserva.ruta}</span>
                <span className="route-details">Bus XYZ - Asiento 8B</span>
              </div>
              <div className="datetime-info">
                <span className="date-part">{reserva.fecha}</span>
                <span className="time-part">{reserva.hora}</span>
              </div>
              <span className={`status ${reserva.estado.toLowerCase()}`}>{reserva.estado}</span>
              <div className="actions">
                <button className="action-edit">Editar</button>
                <button className="action-view">Ver</button>
              </div>
            </div>
          ))}
            <div className="table-row">
                <span className="reservation-code">55667788</span>
                <div className="passenger-info">
                <span className="passenger-name">Roberto Silva Torres</span>
                </div>
                <div className="route-info">
                <span className="route-path">Cusco → Lima</span>
                <span className="route-details">Bus GHI-012 - Asiento 20A</span>
                </div>
                <div className="datetime-info">
                <span className="date-part">22 Jun 2025</span>
                <span className="time-part">20:00</span>
                </div>
                <span className="status confirmada">Confirmada</span>
                <div className="actions">
                <button className="action-edit">Editar</button>
                <button className="action-view">Ver</button>
                </div>
            </div>
            
            <div className="table-row">
                <span className="reservation-code">99887766</span>
                <div className="passenger-info">
                <span className="passenger-name">Lucía Morales Castro</span>
                </div>
                <div className="route-info">
                <span className="route-path">Arequipa → Lima</span>
                <span className="route-details">Bus ABC-123 - Asiento 5B</span>
                </div>
                <div className="datetime-info">
                <span className="date-part">18 Jun 2025</span>
                <span className="time-part">14:00</span>
                </div>
                <span className="status cancelada">Cancelada</span>
                <div className="actions">
                <button className="action-edit">Editar</button>
                <button className="action-view">Ver</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;
