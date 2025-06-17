import React from 'react';
import './EmpresaHome.css';
import { useClient } from '../context/ClientContext';

function EmpresaHome() {
  const { client, clientType } = useClient();

  const empresa = clientType === 'EMPRESA' ? client : null;

  return (
    <div className="empresa-home">
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
        <button className="primary-button">Añadir</button>
        <button className="primary-button">Modificar</button>
        <button className="primary-button">Eliminar</button>
      </main>
    </div>
  );
}

export default EmpresaHome;
