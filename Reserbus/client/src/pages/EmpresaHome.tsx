// pages/EmpresaHome.tsx
import React, { useState, useEffect } from 'react';
import './EmpresaHome.css';
import { useClient } from '../context/ClientContext';
import { Empresa } from '../context/ClientContext';
import CreateBusModal from '../pages/CreateBusModal';

function EmpresaHome() {
  const { client, clientType } = useClient();
  const [showBusModal, setShowBusModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const empresa = clientType === 'EMPRESA' ? client as Empresa : null;

  // Ocultar popup después de 3 segundos
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

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
        <button className="primary-button">Modificar</button>
        <button className="primary-button">Eliminar</button>

        {showBusModal && empresa && (
          <CreateBusModal 
            onClose={() => setShowBusModal(false)}
            onSuccess={() => {
              setShowBusModal(false); // Cierra el modal
              setShowSuccessPopup(true); // Muestra popup de éxito
            }}
             idEmpresa={empresa.id_empresa}
          />
        )}
      </main>
    </div>
  );
}

export default EmpresaHome;
