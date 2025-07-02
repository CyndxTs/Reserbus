// src/components/Header.tsx
import { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { formattedClientName } from '../util/ClientUtil';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onOpenSignIn?: () => void; // Función opcional para abrir el modal de inicio de sesión
}

const Header = ({ onOpenSignIn }: HeaderProps) => {
  const navigate = useNavigate();
  const { client, clientType, logout } = useClient();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleSignOut = () => {
    logout();
    setMenuOpen(false);
  };
  
  const handleLogoClick = () => {
    navigate('/');
  };
  
  const handleClientMenuClick = () => {
    if (!client && onOpenSignIn) {
      onOpenSignIn();
    } else {
      setMenuOpen(!menuOpen);
    }
  };
  
  return (
    <div className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick}>
        <img src="/RB_LogoWhite.png" alt="icon-reserbus"/>
        <span>reserbus</span>
      </div>
      <div className="navbar-links">
        <button onClick={() => navigate('/contacto')}>Contacto</button>
        <button onClick={() => navigate('/acerca-de')}>Acerca de nosotros</button>
        <div className="client-menu-wrapper">
          <button 
            className="open-modal-signin" 
            onClick={handleClientMenuClick}
          >
            {!client ? (
              <>
                <span>Iniciar</span>
                <img src="/Icon_Account.svg" alt="user-profile" className="profile-icon" />
              </>
            ) : (
              <>
                <span className="client-name">{formattedClientName(client)}</span>
              </>
            )}
          </button>
          {client && menuOpen && (
            <div className="client-menu-ddl">
              <button onClick={() => {
                navigate('/cuenta');
                setMenuOpen(false);
              }}>
                Cuenta
              </button>
              <button onClick={handleSignOut}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;