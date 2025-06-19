// pages/EmpresaHome.tsx
import React, { useState, useEffect } from 'react';
import './EmpresaHome.css';
import { useClient } from '../context/ClientContext';
import { Empresa } from '../context/ClientContext';
import CreateBusModal from '../pages/CreateBusModal';
import { Bus, useBus } from '../context/BusContext';
import ConfirmModal from '../modals/ConfirmModal';

function EmpresaHome() {
  const { client, clientType } = useClient();
  const [showBusModal, setShowBusModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
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

  return (
    <div className="empresa-home">
      
      {/* ✅ Popup de éxito */}
      {showSuccessPopup && (
        <div className="success-popup">
          Bus creado correctamente ✅
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
        <h1>Gestión de Empresa</h1>
        <button 
          className="primary-button" 
          onClick={() => setShowBusModal(true)}
        >
          Añadir Bus
        </button>
        <ul>
          {buses.map(bus => (
            <li key={bus.id_bus}>
              {bus.placa} - {bus.marca} {bus.modelo} - {bus.cantidad_pisos} piso(s)
              <button onClick={() => setSelectedBus(bus)}>Editar</button>
              <button onClick={() => setBusAEliminar(bus)}>Eliminar</button>
            </li>
          ))}
        </ul>
        {busAEliminar && (
          <ConfirmModal
            message={`¿Estás seguro de eliminar el bus ${busAEliminar.placa}?`}
            onConfirm={async () => {
              await deleteBus(busAEliminar.id_bus);
              setBusAEliminar(null);
              if (empresa) fetchBuses(empresa.id_empresa);
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
