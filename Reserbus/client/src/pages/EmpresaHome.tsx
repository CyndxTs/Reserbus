import './EmpresaHome.scss';
import { useState,useEffect } from 'react';
import { useClient,Empresa } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName } from '../util/ClientUtil';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Bus, useBus } from '../context/BusContext';
import ConfirmModal from '../components/ConfirmModal';
import CreateBusModal from '../components/CreateBusModal';
import Header from '../components/Header';

function EmpresaHome() {
  const { client, clientType, logout } = useClient();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const empresa = clientType === 'EMPRESA' ? client as Empresa : null;
  const [showBusModal, setShowBusModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { buses, fetchBuses } = useBus();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const { deleteBus } = useBus();
  const [busAEliminar, setBusAEliminar] = useState<Bus | null>(null);

  const openModal = (modalType: string) => {
    setModalOpen(modalType);
  };

  const closeModal = () => {
    setModalOpen(null);
  };

  // Cargar buses al montar el componente
  useEffect(() => {
    console.log("Empresa cargada", empresa)
    if (empresa) {
      fetchBuses(empresa.id_empresa);
      console.log("Buses cargados:", buses);
    }
  }, [empresa]);

  // Ocultar popup después de 3 segundos
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);
  const handleSuccess = (action: 'create' | 'update' | 'delete') => {
    let message = "";
    switch(action) {
      case 'create':
        message = "Bus creado correctamente ✅";
        break;
      case 'update':
        message = "Bus actualizado correctamente ✅";
        break;
      case 'delete':
        message = "Bus eliminado correctamente ✅";
        break;
    }
    setSuccessMessage(message);
    setShowSuccessPopup(true);
  };
  const handleEliminarBus = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este bus?")) return;

    try {
      await deleteBus(id);
      if(empresa) {
        fetchBuses(empresa.id_empresa); // refrescar la lista
      }
    } catch (error) {
      alert("Error al eliminar el bus.");
    }
  };

  // Filtrar información de buses (para el buscador)
  const filteredBuses = buses.filter(bus => 
    bus.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.modelo.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard">
            <div className="dashboard-header">
              <h1>Panel de Control</h1>
              <p className="empresa-name">Bienvenido, {(empresa as any)?.razon_social || formattedClientName(empresa)}</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon buses">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>12</h3>
                  <p>Buses Activos</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon routes">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>8</h3>
                  <p>Rutas Disponibles</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon trips">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>45</h3>
                  <p>Viajes Programados</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon revenue">
                  <img src="/Icon_Dollar.svg" alt="revenue" />
                </div>
                <div className="stat-info">
                  <h3>S/ 12,450</h3>
                  <p>Ingresos del Mes</p>
                </div>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="recent-trips">
                <h2>Viajes Recientes</h2>
                <div className="trips-table">
                  <div className="table-header">
                    <span>Ruta</span>
                    <span>Fecha</span>
                    <span>Estado</span>
                    <span>Ocupación</span>
                  </div>
                  <div className="table-row">
                    <span>Lima - Arequipa</span>
                    <span>15 Jun 2025</span>
                    <span className="status completed">Finalizado</span>
                    <span>38/40</span>
                  </div>
                  <div className="table-row">
                    <span>Arequipa - Cusco</span>
                    <span>16 Jun 2025</span>
                    <span className="status in-progress">En Curso</span>
                    <span>42/45</span>
                  </div>
                  <div className="table-row">
                    <span>Lima - Trujillo</span>
                    <span>17 Jun 2025</span>
                    <span className="status scheduled">Programado</span>
                    <span>25/40</span>
                  </div>
                </div>
              </div>              <div className="quick-actions">
                <h2>Acciones Rápidas</h2>
                <div className="action-buttons">
                  <button className="action-btn" onClick={() => openModal('viaje')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Programar Viaje
                  </button>
                  <button className="action-btn" onClick={() => openModal('bus')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Registrar Bus
                  </button>                  <button className="action-btn" onClick={() => openModal('ruta')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Nueva Ruta
                  </button>
                  <button className="action-btn" onClick={() => openModal('reserva')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9H9zM13 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2zM17 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2z"/>
                      <path d="M21 5V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1H1v2h1v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h18v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h1V5h-2z"/>
                    </svg>
                    Nueva Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        case 'buses':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>Gestión de Buses</h1>
              <button className="primary-button" onClick={() => openModal('bus')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nuevo Bus
              </button>
            </div>
            
            <div className="data-grid">
              <div className="grid-filters">
                <input type="text" placeholder="Buscar por placa..." className="search-input" />
                <select className="filter-select">
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Mantenimiento</option>
                  <option>Inactivo</option>
                </select>
              </div>
              
              <div className="data-table">
                <div className="table-header">
                  <span>Placa</span>
                  <span>Marca/Modelo</span>
                  <span>Pisos</span>
                  <span>Asientos</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className="table-row">
                  <span className="bus-plate">ABC-123</span>
                  <span>Mercedes-Benz / Sprinter</span>
                  <span>2</span>
                  <span>40</span>
                  <span className="status active">Activo</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span className="bus-plate">XYZ-456</span>
                  <span>Volvo / 9700</span>
                  <span>2</span>
                  <span>45</span>
                  <span className="status maintenance">Mantenimiento</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span className="bus-plate">DEF-789</span>
                  <span>Scania / Irizar</span>
                  <span>1</span>
                  <span>35</span>
                  <span className="status active">Activo</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span className="bus-plate">GHI-012</span>
                  <span>Mercedes-Benz / OH1526</span>
                  <span>2</span>
                  <span>42</span>
                  <span className="status active">Activo</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        case 'rutas':
        return (
          <div className="section-content">            <div className="section-header">
              <h1>Gestión de Rutas</h1>
              <button className="primary-button" onClick={() => openModal('ruta')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nueva Ruta
              </button>
            </div>
            
            <div className="data-grid">
              <div className="grid-filters">
                <input type="text" placeholder="Buscar ruta..." className="search-input" />
                <select className="filter-select">
                  <option>Todas las rutas</option>
                  <option>Activas</option>
                  <option>Inactivas</option>
                </select>
              </div>
              
              <div className="data-table">
                <div className="table-header">
                  <span>Origen</span>
                  <span>Destino</span>
                  <span>Distancia</span>
                  <span>Duración</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className="table-row">
                  <span>Lima</span>
                  <span>Arequipa</span>
                  <span>1,009 km</span>
                  <span>14 hrs</span>
                  <span className="status active">Activa</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Arequipa</span>
                  <span>Cusco</span>
                  <span>521 km</span>
                  <span>8 hrs</span>
                  <span className="status active">Activa</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Lima</span>
                  <span>Trujillo</span>
                  <span>561 km</span>
                  <span>9 hrs</span>
                  <span className="status active">Activa</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Cusco</span>
                  <span>Puno</span>
                  <span>389 km</span>
                  <span>6 hrs</span>
                  <span className="status inactive">Inactiva</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        case 'viajes':
        return (
          <div className="section-content">            <div className="section-header">
              <h1>Gestión de Viajes</h1>
              <button className="primary-button" onClick={() => openModal('viaje')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Programar Viaje
              </button>
            </div>
            
            <div className="data-grid">
              <div className="grid-filters">
                <input type="text" placeholder="Buscar viaje..." className="search-input" />
                <select className="filter-select">
                  <option>Todos los estados</option>
                  <option>Programado</option>
                  <option>En Curso</option>
                  <option>Finalizado</option>
                  <option>Cancelado</option>
                </select>
                <input type="date" className="date-filter" />
              </div>
              
              <div className="data-table">
                <div className="table-header">
                  <span>Ruta</span>
                  <span>Bus</span>
                  <span>Fecha/Hora</span>
                  <span>Ocupación</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className="table-row">
                  <span>Lima → Arequipa</span>
                  <span>ABC-123</span>
                  <span>20 Jun 2025 - 22:30</span>
                  <span className="ocupacion">32/40</span>
                  <span className="status scheduled">Programado</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Arequipa → Lima</span>
                  <span>XYZ-456</span>
                  <span>21 Jun 2025 - 08:00</span>
                  <span className="ocupacion">45/45</span>
                  <span className="status in-progress">En Curso</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Lima → Trujillo</span>
                  <span>DEF-789</span>
                  <span>18 Jun 2025 - 23:00</span>
                  <span className="ocupacion">35/35</span>
                  <span className="status completed">Finalizado</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Cusco → Arequipa</span>
                  <span>GHI-012</span>
                  <span>22 Jun 2025 - 15:30</span>
                  <span className="ocupacion">18/42</span>
                  <span className="status scheduled">Programado</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        case 'terminales':
        return (
          <div className="section-content">            <div className="section-header">
              <h1>Gestión de Terminales</h1>
              <button className="primary-button" onClick={() => openModal('terminal')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nuevo Terminal
              </button>
            </div>
            
            <div className="data-grid">
              <div className="grid-filters">
                <input type="text" placeholder="Buscar terminal..." className="search-input" />
                <select className="filter-select">
                  <option>Todas las ciudades</option>
                  <option>Lima</option>
                  <option>Arequipa</option>
                  <option>Cusco</option>
                  <option>Trujillo</option>
                </select>
              </div>
              
              <div className="data-table">
                <div className="table-header">
                  <span>Nombre</span>
                  <span>Ciudad</span>
                  <span>Dirección</span>
                  <span>Rutas</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className="table-row">
                  <span>Terminal Sur Lima</span>
                  <span>Lima</span>
                  <span>Av. Atocongo 1505, Villa María del Triunfo</span>
                  <span>5 rutas</span>
                  <span className="status active">Activo</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Terminal Arequipa</span>
                  <span>Arequipa</span>
                  <span>Av. Andrés Avelino Cáceres s/n</span>
                  <span>3 rutas</span>
                  <span className="status active">Activo</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Terminal Cusco</span>
                  <span>Cusco</span>
                  <span>Av. Vía de Evitamiento 429, Santiago</span>
                  <span>2 rutas</span>
                  <span className="status active">Activo</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span>Terminal Trujillo</span>
                  <span>Trujillo</span>
                  <span>Panamericana Norte Km 559</span>
                  <span>1 ruta</span>
                  <span className="status maintenance">Mantenimiento</span>                  
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        case 'reservas':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>Gestión de Reservas</h1>
              <button className="primary-button" onClick={() => openModal('reserva')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
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
                
                <div className="table-row">
                  <span className="reservation-code">12345678</span>
                  <div className="passenger-info">
                    <span className="passenger-name">María González López</span>
                  </div>
                  <div className="route-info">
                    <span className="route-path">Lima → Arequipa</span>
                    <span className="route-details">Bus ABC-123 - Asiento 15A</span>
                  </div>
                  <div className="datetime-info">
                    <span className="date-part">20 Jun 2025</span>
                    <span className="time-part">22:30</span>
                  </div>
                  <span className="status confirmada">Confirmada</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span className="reservation-code">87654321</span>
                  <div className="passenger-info">
                    <span className="passenger-name">Carlos Mendoza Ruiz</span>
                  </div>
                  <div className="route-info">
                    <span className="route-path">Arequipa → Cusco</span>
                    <span className="route-details">Bus XYZ-456 - Asiento 8B</span>
                  </div>
                  <div className="datetime-info">
                    <span className="date-part">21 Jun 2025</span>
                    <span className="time-part">08:00</span>
                  </div>
                  <span className="status pendiente">Pendiente</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
                <div className="table-row">
                  <span className="reservation-code">11223344</span>
                  <div className="passenger-info">
                    <span className="passenger-name">Ana Patricia Vega</span>
                  </div>
                  <div className="route-info">
                    <span className="route-path">Lima → Trujillo</span>
                    <span className="route-details">Bus DEF-789 - Asiento 12C</span>
                  </div>
                  <div className="datetime-info">
                    <span className="date-part">19 Jun 2025</span>
                    <span className="time-part">15:30</span>
                  </div>
                  <span className="status completada">Completada</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
                
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
                
                <div className="table-row">
                  <span className="reservation-code">44556677</span>
                  <div className="passenger-info">
                    <span className="passenger-name">Fernando Díaz López</span>
                  </div>
                  <div className="route-info">
                    <span className="route-path">Lima → Cusco</span>
                    <span className="route-details">Bus XYZ-456 - Asiento 18C</span>
                  </div>
                  <div className="datetime-info">
                    <span className="date-part">23 Jun 2025</span>
                    <span className="time-part">21:45</span>
                  </div>
                  <span className="status pendiente">Pendiente</span>
                  <div className="actions">
                    <button className="action-edit">Editar</button>
                    <button className="action-view">Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;    }
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    const renderModalContent = () => {
      switch (modalOpen) {
        case 'bus':
          return (
            <div className="modal-content">
              <div className="modal-header">
                <h2>Registrar Nuevo Bus</h2>
                <button className="modal-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className="modal-form">
                <div className="form-group">
                  <label htmlFor="placa">Placa del Bus</label>
                  <input type="text" id="placa" name="placa" placeholder="ABC-123" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="marca">Marca</label>
                    <select id="marca" name="marca" required>
                      <option value="">Seleccionar marca</option>
                      <option value="mercedes">Mercedes-Benz</option>
                      <option value="volvo">Volvo</option>
                      <option value="scania">Scania</option>
                      <option value="iveco">Iveco</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="modelo">Modelo</label>
                    <input type="text" id="modelo" name="modelo" placeholder="Sprinter, 9700, etc." required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pisos">Número de Pisos</label>
                    <select id="pisos" name="pisos" required>
                      <option value="">Seleccionar</option>
                      <option value="1">1 Piso</option>
                      <option value="2">2 Pisos</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="asientos">Total de Asientos</label>
                    <input type="number" id="asientos" name="asientos" min="20" max="60" placeholder="40" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="año">Año de Fabricación</label>
                  <input type="number" id="año" name="año" min="2000" max="2025" placeholder="2023" required />
                </div>
                <div className="form-group">
                  <label htmlFor="caracteristicas">Características Adicionales</label>
                  <textarea id="caracteristicas" name="caracteristicas" rows={3} placeholder="Aire acondicionado, WiFi, baño, etc."></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-primary">Registrar Bus</button>
                </div>
              </form>
            </div>
          );

        case 'ruta':
          return (
            <div className="modal-content">
              <div className="modal-header">
                <h2>Crear Nueva Ruta</h2>
                <button className="modal-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="origen">Ciudad de Origen</label>
                    <select id="origen" name="origen" required>
                      <option value="">Seleccionar origen</option>
                      <option value="lima">Lima</option>
                      <option value="arequipa">Arequipa</option>
                      <option value="cusco">Cusco</option>
                      <option value="trujillo">Trujillo</option>
                      <option value="chiclayo">Chiclayo</option>
                      <option value="piura">Piura</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="destino">Ciudad de Destino</label>
                    <select id="destino" name="destino" required>
                      <option value="">Seleccionar destino</option>
                      <option value="lima">Lima</option>
                      <option value="arequipa">Arequipa</option>
                      <option value="cusco">Cusco</option>
                      <option value="trujillo">Trujillo</option>
                      <option value="chiclayo">Chiclayo</option>
                      <option value="piura">Piura</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="distancia">Distancia (km)</label>
                    <input type="number" id="distancia" name="distancia" min="1" placeholder="500" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="duracion">Duración Estimada (horas)</label>
                    <input type="number" id="duracion" name="duracion" min="1" max="24" step="0.5" placeholder="8" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="precio-base">Precio Base (S/)</label>
                  <input type="number" id="precio-base" name="precio-base" min="10" step="0.01" placeholder="80.00" required />
                </div>
                <div className="form-group">
                  <label htmlFor="terminal-origen">Terminal de Origen</label>
                  <select id="terminal-origen" name="terminal-origen" required>
                    <option value="">Seleccionar terminal</option>
                    <option value="terminal-sur">Terminal Sur Lima</option>
                    <option value="terminal-arequipa">Terminal Arequipa</option>
                    <option value="terminal-cusco">Terminal Cusco</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="terminal-destino">Terminal de Destino</label>
                  <select id="terminal-destino" name="terminal-destino" required>
                    <option value="">Seleccionar terminal</option>
                    <option value="terminal-sur">Terminal Sur Lima</option>
                    <option value="terminal-arequipa">Terminal Arequipa</option>
                    <option value="terminal-cusco">Terminal Cusco</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-primary">Crear Ruta</button>
                </div>
              </form>
            </div>
          );

        case 'viaje':
          return (
            <div className="modal-content">
              <div className="modal-header">
                <h2>Programar Nuevo Viaje</h2>
                <button className="modal-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className="modal-form">
                <div className="form-group">
                  <label htmlFor="ruta-viaje">Ruta</label>
                  <select id="ruta-viaje" name="ruta-viaje" required>
                    <option value="">Seleccionar ruta</option>
                    <option value="lima-arequipa">Lima → Arequipa</option>
                    <option value="arequipa-cusco">Arequipa → Cusco</option>
                    <option value="lima-trujillo">Lima → Trujillo</option>
                    <option value="cusco-puno">Cusco → Puno</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="bus-viaje">Bus Asignado</label>
                  <select id="bus-viaje" name="bus-viaje" required>
                    <option value="">Seleccionar bus</option>
                    <option value="abc-123">ABC-123 - Mercedes-Benz Sprinter (40 asientos)</option>
                    <option value="xyz-456">XYZ-456 - Volvo 9700 (45 asientos)</option>
                    <option value="def-789">DEF-789 - Scania Irizar (35 asientos)</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fecha-viaje">Fecha de Viaje</label>
                    <input type="date" id="fecha-viaje" name="fecha-viaje" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hora-salida">Hora de Salida</label>
                    <input type="time" id="hora-salida" name="hora-salida" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="precio-adulto">Precio Adulto (S/)</label>
                    <input type="number" id="precio-adulto" name="precio-adulto" min="10" step="0.01" placeholder="80.00" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="precio-niño">Precio Niño (S/)</label>
                    <input type="number" id="precio-niño" name="precio-niño" min="5" step="0.01" placeholder="60.00" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="conductor">Conductor Principal</label>
                  <select id="conductor" name="conductor" required>
                    <option value="">Seleccionar conductor</option>
                    <option value="juan-perez">Juan Pérez - Licencia A3C</option>
                    <option value="maria-garcia">María García - Licencia A3C</option>
                    <option value="carlos-lopez">Carlos López - Licencia A3C</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-primary">Programar Viaje</button>
                </div>
              </form>
            </div>
          );

        case 'terminal':
          return (
            <div className="modal-content">
              <div className="modal-header">
                <h2>Registrar Nuevo Terminal</h2>
                <button className="modal-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className="modal-form">
                <div className="form-group">
                  <label htmlFor="nombre-terminal">Nombre del Terminal</label>
                  <input type="text" id="nombre-terminal" name="nombre-terminal" placeholder="Terminal Norte Lima" required />
                </div>
                <div className="form-group">
                  <label htmlFor="ciudad-terminal">Ciudad</label>
                  <select id="ciudad-terminal" name="ciudad-terminal" required>
                    <option value="">Seleccionar ciudad</option>
                    <option value="lima">Lima</option>
                    <option value="arequipa">Arequipa</option>
                    <option value="cusco">Cusco</option>
                    <option value="trujillo">Trujillo</option>
                    <option value="chiclayo">Chiclayo</option>
                    <option value="piura">Piura</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="direccion-terminal">Dirección Completa</label>
                  <input type="text" id="direccion-terminal" name="direccion-terminal" placeholder="Av. Ejemplo 123, Distrito" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono-terminal">Teléfono</label>
                    <input type="tel" id="telefono-terminal" name="telefono-terminal" placeholder="01-234-5678" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="capacidad-andenes">Número de Andenes</label>
                    <input type="number" id="capacidad-andenes" name="capacidad-andenes" min="1" max="20" placeholder="5" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="servicios-terminal">Servicios Disponibles</label>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input type="checkbox" name="servicios" value="estacionamiento" />
                      <span>Estacionamiento</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" name="servicios" value="cafeteria" />
                      <span>Cafetería</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" name="servicios" value="baños" />
                      <span>Baños</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" name="servicios" value="wifi" />
                      <span>WiFi</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" name="servicios" value="sala-espera" />
                      <span>Sala de Espera</span>
                    </label>
                  </div>
                </div>                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-primary">Registrar Terminal</button>
                </div>
              </form>
            </div>
          );        case 'reserva':
          // Valores iniciales del formulario
          const initialValues = {
            viaje: '',
            nombres: '',
            apellidos: '',
            tipoDocumento: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
            asientoPreferencia: '',
            tipoPasajero: '',
            metodoPago: '',
            observaciones: ''
          };

          // Función de validación
          const validateReserva = (values: any) => {
            const errors: any = {};

            // Validación de viaje
            if (!values.viaje) {
              errors.viaje = 'Debe seleccionar un viaje';
            }

            // Validación de nombres
            if (!values.nombres) {
              errors.nombres = 'Los nombres son obligatorios';
            } else if (values.nombres.length < 2) {
              errors.nombres = 'Los nombres deben tener al menos 2 caracteres';
            }

            // Validación de apellidos
            if (!values.apellidos) {
              errors.apellidos = 'Los apellidos son obligatorios';
            } else if (values.apellidos.length < 2) {
              errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
            }

            // Validación de tipo de documento
            if (!values.tipoDocumento) {
              errors.tipoDocumento = 'Debe seleccionar un tipo de documento';
            }

            // Validación de número de documento
            if (!values.numeroDocumento) {
              errors.numeroDocumento = 'El número de documento es obligatorio';
            } else if (values.tipoDocumento === 'dni' && !/^\d{8}$/.test(values.numeroDocumento)) {
              errors.numeroDocumento = 'El DNI debe tener 8 dígitos';
            } else if (values.tipoDocumento === 'ce' && values.numeroDocumento.length < 8) {
              errors.numeroDocumento = 'El carné de extranjería debe tener al menos 8 caracteres';
            } else if (values.tipoDocumento === 'pasaporte' && values.numeroDocumento.length < 6) {
              errors.numeroDocumento = 'El pasaporte debe tener al menos 6 caracteres';
            }

            // Validación de teléfono
            if (!values.telefono) {
              errors.telefono = 'El teléfono es obligatorio';
            } else if (!/^\d{9}$/.test(values.telefono)) {
              errors.telefono = 'El teléfono debe tener 9 dígitos';
            }

            // Validación de email
            if (!values.email) {
              errors.email = 'El email es obligatorio';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
              errors.email = 'Formato de email inválido';
            }

            // Validación de tipo de pasajero
            if (!values.tipoPasajero) {
              errors.tipoPasajero = 'Debe seleccionar el tipo de pasajero';
            }

            // Validación de método de pago
            if (!values.metodoPago) {
              errors.metodoPago = 'Debe seleccionar un método de pago';
            }

            return errors;
          };

          // Función para enviar el formulario
          const handleSubmitReserva = (values: any, { setSubmitting }: any) => {
            console.log('Datos de la reserva:', values);
            // Aquí iría la lógica para enviar los datos al servidor
            setTimeout(() => {
              alert('Reserva creada exitosamente');
              setSubmitting(false);
              closeModal();
            }, 1000);
          };

          return (
            <div className="modal-content">
              <div className="modal-header">
                <h2>Crear Nueva Reserva</h2>
                <button className="modal-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              <Formik
                initialValues={initialValues}
                validate={validateReserva}
                onSubmit={handleSubmitReserva}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="modal-form">
                    <div className="form-group">
                      <label htmlFor="viaje">Viaje Disponible</label>
                      <Field as="select" id="viaje" name="viaje">
                        <option value="">Seleccionar viaje</option>
                        <option value="lima-arequipa-20jun">Lima → Arequipa - 20 Jun 2025 22:30 (S/ 80.00)</option>
                        <option value="arequipa-cusco-21jun">Arequipa → Cusco - 21 Jun 2025 08:00 (S/ 65.00)</option>
                        <option value="lima-trujillo-22jun">Lima → Trujillo - 22 Jun 2025 15:30 (S/ 70.00)</option>
                        <option value="cusco-lima-23jun">Cusco → Lima - 23 Jun 2025 20:00 (S/ 85.00)</option>
                      </Field>
                      <ErrorMessage name="viaje" component="div" className="field-error" />
                    </div>
                    
                    <h3 style={{marginBottom: '1rem', color: '#1f2937', fontSize: '1.1rem'}}>Datos del Pasajero</h3>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nombres">Nombres</label>
                        <Field type="text" id="nombres" name="nombres" placeholder="María Elena" />
                        <ErrorMessage name="nombres" component="div" className="field-error" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="apellidos">Apellidos</label>
                        <Field type="text" id="apellidos" name="apellidos" placeholder="González López" />
                        <ErrorMessage name="apellidos" component="div" className="field-error" />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="tipoDocumento">Tipo de Documento</label>
                        <Field as="select" id="tipoDocumento" name="tipoDocumento">
                          <option value="">Seleccionar</option>
                          <option value="dni">DNI</option>
                          <option value="ce">Carné de Extranjería</option>
                          <option value="pasaporte">Pasaporte</option>
                        </Field>
                        <ErrorMessage name="tipoDocumento" component="div" className="field-error" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="numeroDocumento">Número de Documento</label>
                        <Field type="text" id="numeroDocumento" name="numeroDocumento" placeholder="12345678" />
                        <ErrorMessage name="numeroDocumento" component="div" className="field-error" />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <Field type="tel" id="telefono" name="telefono" placeholder="987654321" />
                        <ErrorMessage name="telefono" component="div" className="field-error" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <Field type="email" id="email" name="email" placeholder="maria@email.com" />
                        <ErrorMessage name="email" component="div" className="field-error" />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="asientoPreferencia">Preferencia de Asiento</label>
                        <Field as="select" id="asientoPreferencia" name="asientoPreferencia">
                          <option value="">Sin preferencia</option>
                          <option value="ventana">Ventana</option>
                          <option value="pasillo">Pasillo</option>
                          <option value="primera-fila">Primera fila</option>
                        </Field>
                        <ErrorMessage name="asientoPreferencia" component="div" className="field-error" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="tipoPasajero">Tipo de Pasajero</label>
                        <Field as="select" id="tipoPasajero" name="tipoPasajero">
                          <option value="">Seleccionar</option>
                          <option value="adulto">Adulto</option>
                          <option value="niño">Niño (3-11 años)</option>
                          <option value="estudiante">Estudiante</option>
                          <option value="adulto-mayor">Adulto Mayor</option>
                        </Field>
                        <ErrorMessage name="tipoPasajero" component="div" className="field-error" />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="metodoPago">Método de Pago</label>
                      <Field as="select" id="metodoPago" name="metodoPago">
                        <option value="">Seleccionar método</option>
                        <option value="efectivo">Efectivo en terminal</option>
                        <option value="tarjeta">Tarjeta de crédito/débito</option>
                        <option value="transferencia">Transferencia bancaria</option>
                        <option value="yape">Yape/Plin</option>
                      </Field>
                      <ErrorMessage name="metodoPago" component="div" className="field-error" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="observaciones">Observaciones</label>
                      <Field 
                        as="textarea"
                        id="observaciones" 
                        name="observaciones" 
                        placeholder="Información adicional, necesidades especiales, etc."
                      />
                      <ErrorMessage name="observaciones" component="div" className="field-error" />
                    </div>
                    
                    <div className="modal-actions">
                      <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                      <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Creando...' : 'Crear Reserva'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div onClick={(e) => e.stopPropagation()}>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="p-empresa-home">
      <Header
        navOptions={[
          { label: 'Contacto', path: '/contacto' },
          { label: 'Acerca de nosotros', path: '/acerca-de' }
        ]}
      />
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <button 
            className={activeSection === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('dashboard')}
            title="Panel de Control"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <span className="nav-text">Panel de Control</span>
          </button>
          <button 
            className={activeSection === 'buses' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('buses')}
            title="Buses"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            <span className="nav-text">Buses</span>
          </button>
          <button 
            className={activeSection === 'rutas' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('rutas')}
            title="Rutas"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
            </svg>
            <span className="nav-text">Rutas</span>
          </button>
          <button 
            className={activeSection === 'viajes' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('viajes')}
            title="Viajes"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span className="nav-text">Viajes</span>
          </button>          <button 
            className={activeSection === 'terminales' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('terminales')}
            title="Terminales"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="nav-text">Terminales</span>
          </button>
          <button 
            className={activeSection === 'reservas' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('reservas')}
            title="Gestión de Reservas"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9H9zM13 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2zM17 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2z"/>
              <path d="M21 5V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1H1v2h1v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h18v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h1V5h-2z"/>
            </svg>
            <span className="nav-text">Reservas</span>
          </button>
        </nav>
      </aside>
      <main className="main-content">
        {renderMainContent()}
      </main>
      
      {renderModal()}
    </div>
  );
}

export default EmpresaHome;
