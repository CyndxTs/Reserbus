import React, { useState, useEffect } from 'react';
import { Empresa } from '../context/ClientContext';
import { Bus, useBus } from '../context/BusContext';
import CreateBusModal from './CreateBusModal';
import ConfirmModal from './ConfirmModal';

interface BusManagementProps {
  empresa: Empresa | null;
}

const BusManagement: React.FC<BusManagementProps> = ({ empresa }) => {
  // Estados locales
  const [searchQuery, setSearchQuery] = useState("");
  const [showBusModal, setShowBusModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [busAEliminar, setBusAEliminar] = useState<Bus | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  // Hooks de Context
  const { buses, fetchBuses, deleteBus } = useBus();

  // -- EFFECTS
  // Cargar buses al montar el componente
  useEffect(() => {
    if (empresa && !hasFetched) {
      fetchBuses(empresa.id_empresa);
      setHasFetched(true);
    }
  }, [empresa, fetchBuses, hasFetched]);

  // Notificaciones de acciones (Ocultar popup después de 3 segundos)
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
        message = "Bus deshabilitado correctamente ✅";
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
        fetchBuses(empresa.id_empresa); 
      }
    } catch (error) {
      alert("Error al eliminar el bus.");
    }
  };

  // Funciones locales
  const openModal = (type: string) => {
    if (type === 'bus') {
      setShowBusModal(true);
    }
  };

  // Lógica de filtrado de buses
  const filteredBuses = buses.filter(bus => 
    bus.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.modelo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="section-content">
      {/* ✅ Popup de éxito */}
      {showSuccessPopup && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}
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
          <input 
            type="text" 
            placeholder="Buscar por placa, marca, modelo..." 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
          
          <div>
            {filteredBuses.map(bus => (
              <div key={bus.id_bus} className="table-row">
                <span className='bus-plate'>{bus.placa}</span>
                <span>{bus.marca} / {bus.modelo}</span>
                <span>2</span>
                <span>40</span>
                <span className="status active">Activo</span>
                <div className="actions">
                  <button 
                    className="action-edit"
                    onClick={() => setSelectedBus(bus)}
                  >
                    <img src="Edit.png" alt="Editar" />
                  </button>
                  <button 
                    className="action-delete"
                    onClick={() => setBusAEliminar(bus)}
                  >
                    <img src="Delete.png" alt="Eliminar" />
                  </button>
                </div>
              </div>
            ))}
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

      {/* Confirmación de eliminación de bus */}
        {busAEliminar && (
          <ConfirmModal
            title="Deshabilitar Bus"
            message={`¿Estás seguro de deshabilitar el bus ${busAEliminar.placa}?`}
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
      
      {/* Modal para crear/editar bus */}
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
    </div>
  );
};

export default BusManagement;