// src/pages/ReservationManagement.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Empresa } from '../context/ClientContext';
import { useReserva } from '../context/ReservationContext';

const ReservationManagement = (
  { openModal, empresa }: 
  { openModal: (modal: string) => void; empresa: Empresa | null }
) => {
  
  // Hooks de Context
  const { 
    reservas, 
    fetchReservasByEmpresa, 
    loading, 
    error, 
    clearError 
  } = useReserva();

  // Estados para filtros
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [rutaFiltro, setRutaFiltro] = useState('');
  const [codigoFiltro, setCodigoFiltro] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [pasajeroFiltro, setPasajeroFiltro] = useState('');

  // Aplicar filtros a las reservas
  const reservasFiltradas = useMemo(() => {
    if (!Array.isArray(reservas)) return [];

    return reservas.filter(reserva => {
        // Convertir todo a minúsculas para búsqueda case-insensitive
        const searchTerm = (codigoFiltro || pasajeroFiltro).toLowerCase();
        const rutaTerm = rutaFiltro.toLowerCase();
        const fechaTerm = fechaFiltro;

        // Filtros
        const matches = {
        estado: estadoFiltro ? reserva.estado === estadoFiltro : true,
        ruta: rutaTerm ? (reserva.ruta || '').toLowerCase().includes(rutaTerm) : true,
        codigo: codigoFiltro ? reserva.id_reserva.toString().includes(searchTerm) : true,
        fecha: fechaTerm ? (reserva.fechaIda || '').includes(fechaTerm) : true,
        busqueda: searchTerm ? (
            reserva.id_reserva.toString().includes(searchTerm) ||
            (reserva.pasajero?.documento || '').toLowerCase().includes(searchTerm) ||
            `${reserva.pasajero?.nombres || ''} ${reserva.pasajero?.apellidos || ''}`
            .toLowerCase().includes(searchTerm) ||
            `${reserva.viajero?.nombres || ''} ${reserva.viajero?.apellidos || ''}`
            .toLowerCase().includes(searchTerm)
        ) : true
        };

        return matches.estado && matches.ruta && matches.codigo && 
            matches.fecha && matches.busqueda;
    });
  }, [reservas, estadoFiltro, rutaFiltro, codigoFiltro, fechaFiltro, pasajeroFiltro]);

  // Obtener rutas únicas para el filtro
  const rutasUnicas = useMemo(() => {
    if (!Array.isArray(reservas) || reservas.length === 0) return [];
    const rutas = reservas.map(r => r.ruta).filter(Boolean);
    return [...new Set(rutas)];
  }, [reservas]);

  // Mapear estados para mostrar en español
  const obtenerEstadoEnEspanol = (estado: string) => {
    const estadosMap: { [key: string]: string } = {
      'PAGO_PENDIENTE': 'Pendiente',
      'PAGADA': 'Confirmada',
      'COMPLETADA': 'Completada',
      'CANCELADA': 'Cancelada'
    };
    return estadosMap[estado] || estado;
  };

  // Obtener clase CSS para el estado
  const obtenerClaseEstado = (estado: string) => {
    const clasesMap: { [key: string]: string } = {
      'PAGO_PENDIENTE': 'pendiente',
      'PAGADA': 'confirmada',
      'COMPLETADA': 'completada',
      'CANCELADA': 'cancelada'
    };
    return clasesMap[estado] || 'pendiente';
  };

  // Cargar reservas de la empresa al montar el componente
  useEffect(() => {
    if (empresa?.id_empresa) {
      fetchReservasByEmpresa(empresa.id_empresa);
    }
  }, [empresa?.id_empresa]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setEstadoFiltro('');
    setRutaFiltro('');
    setCodigoFiltro('');
    setFechaFiltro('');
    setPasajeroFiltro('');
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <h1>Gestión de Reservas</h1>
        {/* <button className="primary-button" onClick={() => openModal('reserva')}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Nueva Reserva
        </button> */}
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="data-grid">
        {/* Filtros */}
        <div className="reservation-filters">
          <input 
            type="text" 
            placeholder="Buscar por código, DNI o pasajero..." 
            className="search-input" 
            value={codigoFiltro || pasajeroFiltro}
            onChange={(e) => {
              const value = e.target.value;
              // Si es numérico, buscar por código/DNI, si no por pasajero
              if (/^\d*$/.test(value)) {
                setCodigoFiltro(value);
                setPasajeroFiltro('');
              } else {
                setPasajeroFiltro(value);
                setCodigoFiltro('');
              }
            }}
          />
          
          <select 
            className="filter-select"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PAGADA">Confirmada</option>
            <option value="PAGO_PENDIENTE">Pendiente</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="COMPLETADA">Completada</option>
          </select>

          <input 
            type="date" 
            className="date-filter" 
            placeholder="Fecha" 
            value={fechaFiltro} 
            onChange={(e) => setFechaFiltro(e.target.value)}
          />

          <select 
            className="filter-select"
            value={rutaFiltro}
            onChange={(e) => setRutaFiltro(e.target.value)}
          >
            <option value="">Todas las rutas</option>
            {rutasUnicas.map(ruta => (
              <option key={ruta} value={ruta}>{ruta}</option>
            ))}
          </select>

          <button 
            className="secondary-button" 
            onClick={limpiarFiltros}
            title="Limpiar filtros"
          >
            Limpiar
          </button>
        </div>

        {/* Tabla de reservas */}
        <div className="data-table">
          <div className="table-header">
            <span>Viajero</span>
            <span>Ida</span>
            <span>Vuelta</span>
            <span>Estado</span>
            <span>Pago</span>
            <span>Bus</span>
          </div>

          {loading ? (
            <div className="loading-message">Cargando reservas...</div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="no-results">
              {!Array.isArray(reservas) || reservas.length === 0 ? 
                'No hay reservas registradas para esta empresa.' : 
                'No se encontraron reservas que coincidan con los filtros aplicados.'
              }
            </div>
          ) : (
            reservasFiltradas.map((reserva) => (
            <div key={reserva.id_reserva} className="table-row">
                <div className="passenger-info">
                    <span className="passenger-name">
                        {reserva.pasajero?.nombres} {reserva.pasajero?.apellidos}
                    </span>
                    <span className="passenger-dni">
                        {reserva.pasajero?.tipoDocumento || 'N/A'} {reserva.pasajero?.documento || 'N/A'}
                    </span>
                </div>
                <div className="datetime-info">
                    <span className="date-part">{reserva.fechaIda || 'N/A'}</span>
                    <span className="time-part">{reserva.horaIda || 'N/A'}</span>
                </div>
                <div className="datetime-info">
                    <span className="date-part">{reserva.fechaVuelta || 'N/A'}</span>
                    <span className="time-part">{reserva.horaVuelta || 'N/A'}</span>
                </div>
                <span className={`status ${obtenerClaseEstado(reserva.estado)}`}>
                {obtenerEstadoEnEspanol(reserva.estado)}
                </span>
                <span className="amount">
                S/ {Number(reserva.monto || 0).toFixed(2)}
                </span>
                <span className="amount">
                    {reserva.bus || 'N/A'}
                </span>
                {/* <div className="actions">
                <button className="action-view" onClick={() => openModal('detalleReserva')}>
                    Ver
                </button>
                <button className="action-edit" onClick={() => openModal('editarReserva')}>
                    Editar
                </button>
                </div> */}
            </div>
            ))
          )}
        </div>

        {/* Información adicional */}
        {!loading && reservasFiltradas.length > 0 && (
          <div className="table-footer">
            <span>
              Mostrando {reservasFiltradas.length} de {Array.isArray(reservas) ? reservas.length : 0} reservas
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement;