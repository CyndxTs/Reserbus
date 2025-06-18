import React from 'react';
import { useNavigate } from 'react-router-dom';

import './AdminHome.css';
import { useClient } from '../context/ClientContext';

function AdminHome() {
  const { client, clientType } = useClient();
  const navigate = useNavigate();
  const admin = clientType === 'ADMINISTRADOR' ? client : null;

  return (
    <div className="admin-home">
      <header className="header">
        <div className="brand">
          <img src="/RB_LogoWhite.png" alt="icon-reserbus" className="logo" />
          <span className="brand-name">reserbus</span>
        </div>
        <div className="header-icons">
          <img src="/RB_LogoWhite.png" alt="icon-reserbus" className="profile-icon"/>
        </div>
      </header>
      <aside className="sidebar">
        <ul>
          <li className="active">Usuarios</li>
          <li>Roles</li>
          <li>Empresas</li>
          <li>Parámetros</li>
          <li>Reportes</li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Gestión de Usuarios</h1>
        <button className="primary-button">Añadir Usuario</button>
        <button className="primary-button">Modificar Usuario</button>
        <button className="primary-button">Eliminar Usuario</button>
      
      </main>
    </div>
  );
}

export default AdminHome;
