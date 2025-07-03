import React from 'react';
import { useNavigate } from 'react-router-dom';

import './AdminHome.css';
import { useClient } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';

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
          <img src="/Icon_Account.svg" alt="user-profile" className="profile-pic" />
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
        <h1 className="main-title left">Gestión de Usuarios</h1>

        <div className="button-group">
          <button className="primary-button" onClick={() => navigate('/admin/add-user')}>
            Añadir Usuario
          </button>
          <button className="primary-button" onClick={() => navigate('/admin/edit-user')}>
            Modificar Usuario
          </button>
          <button className="primary-button" onClick={() => navigate('/admin/delete-user')}>
            Eliminar Usuario
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;