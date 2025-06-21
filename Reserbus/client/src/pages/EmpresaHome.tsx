// pages/EmpresaHome.tsx
import React, { useState, useEffect } from 'react';
import './EmpresaHome.css';
import { useClient } from '../context/ClientContext';
import { Empresa } from '../context/ClientContext';
import CreateBusModal from '../modals/CreateBusModal';
import { Bus, useBus } from '../context/BusContext';
import ConfirmModal from '../modals/ConfirmModal';

function EmpresaHome() {
  const { client, clientType } = useClient();
  const [showBusModal, setShowBusModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const empresa = clientType === 'EMPRESA' ? client as Empresa : null;

  const { buses, fetchBuses } = useBus();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const { deleteBus } = useBus();
  const [busAEliminar, setBusAEliminar] = useState<Bus | null>(null);

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


  return (
    <div className="empresa-home">
      
      {/* ✅ Popup de éxito */}
      {showSuccessPopup && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}
       <header className="header">
        <div className="brand">
          <img src="/RB_LogoWhite.png" alt="Logo" className="logo" />
          <span className="brand-name">reserbus</span>
        </div>
        <nav className="nav-links">
          <a href="#">Horarios</a>
          <a href="#">Contacto</a>
          <a href="#">Acerca de nosotros</a>
        </nav>
        <div className="header-icons">
            <img src="/Icon_Account.svg" alt="user-profile" className="profile-pic" />
        </div>
      </header>

      <aside className="sidebar">
        <ul>
          <li className="active">Rutas</li>
          <li>Viajes</li>
          <li>Terminales</li>
        </ul>
      </aside>

      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-actions">
            <h1>Gestión de Buses</h1>
            <button 
              className="primary-button" 
              onClick={() => setShowBusModal(true)}
            >
              <span>+ </span>
              Añadir Bus
            </button>
          </div>
        </div>
        {/* Search Container */}
        <div className="search-container">
          <div className="search-input-container">
            <img className="search-icon" src="Search.svg" alt="Buscar" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por placa, marca o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="buses-count">
          {filteredBuses.length} {filteredBuses.length === 1 ? 'bus encontrado' : 'buses encontrados'}
        </p>
        {/* Bus Table Card */}
        <div className="table-card">
          {filteredBuses.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron buses</p>
            </div>
          ) : (
            <div className="bus-table">
              {/* Table Header */}
              <div className="table-header">
                <div className="header-cell placa-header">PLACA</div>
                <div className="header-cell modelo-header">MODELO/MARCA</div>
                <div className="header-cell pisos-header">PISOS</div>
                <div className="header-cell acciones-header">ACCIONES</div>
              </div>
              
              {/* Table Body */}
              <div className="table-body">
                {filteredBuses.map(bus => (
                  <div key={bus.id_bus} className="table-row">
                    <div className="table-cell placa-cell">
                      <span className="bus-placa">{bus.placa}</span>
                    </div>
                    <div className="table-cell modelo-cell">
                      <span className="bus-marca">{bus.marca}</span><span>/</span>
                      <span className="bus-modelo">{bus.modelo}</span>
                    </div>
                    <div className="table-cell pisos-cell">
                      {bus.cantidad_pisos} piso(s)
                    </div>
                    <div className="table-cell acciones-cell">
                      <div className="bus-actions">
                        <button 
                          className="action-button edit-button"
                          onClick={() => setSelectedBus(bus)}
                        >
                          <img src="Edit.png" alt="Editar" />
                        </button>
                        <button 
                          className="action-button delete-button"
                          onClick={() => setBusAEliminar(bus)}
                        >
                          <img src="Delete.png" alt="Eliminar" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Confirmación de eliminación de bus */}
        {busAEliminar && (
          <ConfirmModal
            title="Eliminar Bus"
            message={`¿Estás seguro de eliminar el bus ${busAEliminar.placa}?`}
            primaryButtonText="Sí, seguro"
            secondaryButtonText="Volver"
            onConfirm={async () => {
              await deleteBus(busAEliminar.id_bus);
              setBusAEliminar(null);
              if (empresa){
                fetchBuses(empresa.id_empresa);
                handleSuccess('delete');
              }
            }}
            onCancel={() => setBusAEliminar(null)}
          />
        )}

        {(showBusModal || selectedBus) && empresa && (
          <CreateBusModal
            onClose={() => {
              setShowBusModal(false);
              setSelectedBus(null);
            }}
            onSuccess={() => {
              setShowBusModal(false);
              setSelectedBus(null);
              setShowSuccessPopup(true);
              fetchBuses(empresa.id_empresa); // refresca la lista
              handleSuccess(selectedBus ? 'update' : 'create');
            }}
            idEmpresa={empresa.id_empresa}
            busAEditar={selectedBus}
          />
        )}
      </main>
    </div>
  );
}

export default EmpresaHome;