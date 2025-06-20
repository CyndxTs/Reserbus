import React, { useState } from 'react';
import './EmpresaHome.css';
import { useClient } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName } from '../util/ClientUtil';

function EmpresaHome() {
  const { client, clientType, logout } = useClient();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  const empresa = clientType === 'EMPRESA' ? client : null;
  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const openModal = (modalType: string) => {
    setModalOpen(modalType);
  };

  const closeModal = () => {
    setModalOpen(null);
  };

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
                  </button>
                  <button className="action-btn" onClick={() => openModal('ruta')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Nueva Ruta
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        case 'buses':
        return (
          <div className="section-content">            <div className="section-header">
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
    <div className="empresa-home">
      <header className="header">
        <div className="brand">
          <img src="/RB_LogoWhite.png" alt="Logo" className="logo" />
          <span className="brand-name">reserbus</span>
          <span className="brand-subtitle">Empresas</span>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <div className="user-info">
              <img src="/Icon_Account.svg" alt="user-profile" className="profile-pic" />
              <span className="user-name">{(empresa as any)?.razon_social || formattedClientName(empresa)}</span>
            </div>
            <div className="user-dropdown">
              <button onClick={() => setActiveSection('perfil')}>Mi Perfil</button>
              <button onClick={() => setActiveSection('configuracion')}>Configuración</button>
              <button onClick={handleSignOut}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </header>      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-toggle">
          <button 
            className="toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              {sidebarCollapsed ? (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              ) : (
                <path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.42 19.58 7l-5 5 5 5L21 15.59z"/>
              )}
            </svg>
          </button>
        </div>
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
          </button>
          <button 
            className={activeSection === 'terminales' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('terminales')}
            title="Terminales"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="nav-text">Terminales</span>
          </button>
        </nav>
      </aside>      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderMainContent()}
      </main>
      
      {renderModal()}
    </div>
  );
}

export default EmpresaHome;
