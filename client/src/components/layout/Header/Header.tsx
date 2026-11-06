import { useState } from 'react';
import { useClient, Administrador, Empresa } from '../../../features/auth/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName } from '../../../features/auth/utils/ClientUtil';
import AuthModals, { AuthMode } from '../../../features/auth/components/AuthModals/AuthModals';
import './Header.scss';

export interface NavOption {
  label: string;
  path: string;
}

export interface HeaderProps {
  navOptions?: NavOption[];
}

const Header = ({ navOptions = [] }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { client, clientType, logout } = useClient();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authEmail, setAuthEmail] = useState('');

  const closeAuth = () => {
    setAuthMode(null);
    setAuthEmail('');
  };

  const switchAuth = (mode: AuthMode, email: string) => {
    setAuthEmail(email);
    setAuthMode(mode);
  };

  const handleSignOut = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleLogoClick = () => {
    switch (clientType) {
      case 'ADMINISTRADOR':
        navigate('/admin');
        break;
      case 'EMPRESA':
        navigate('/empresa');
        break;
      default:
        navigate('/');
    }
  };

  const handleClientOptionClick = () => {
    if (!client) {
      setAuthMode('signin');
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <div className="c-navbar">
      <div className="logo" onClick={handleLogoClick}>
        <img src="/RB_LogoWhite.png" alt="logo-icon" />
        <span>reserbus</span>
      </div>
      <div className="options">
        <div className='regular'>
          {navOptions.map((link, index) => (
            <button key={index} onClick={() => navigate(link.path)}>
              {link.label}
            </button>
          ))}
        </div>
        <div className="client">
          <button className="profile" onClick={handleClientOptionClick}>
            {!client ? (
              <>
                <span>Iniciar</span>
                <img src="/Icon_Account.svg" alt="icon-profile" className="icon-profile" />
              </>
            ) : (
              <>
                <span className="name">{formattedClientName(client)}</span>
                {clientType === 'EMPRESA' && (
                  <img src={(client as Empresa).logo_url || "/Icon_Account.svg"} alt="company-icon" className="company-icon" />
                )}
                {clientType === 'ADMINISTRADOR' && (
                  <img src={(client as Administrador).foto_url || "/Icon_Account.svg"} alt="admin-icon" className="admin-icon" />
                )}
              </>
            )}
          </button>
          {client && !isMenuOpen && (
            <div className="menu-ddl">
              {clientType === 'VIAJERO' && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/MyAccount');
                  }}
                >
                  Mis Viajes
                </button>
              )}
              <button onClick={handleSignOut}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
      <AuthModals
        mode={authMode}
        initialEmail={authEmail}
        onClose={closeAuth}
        onSwitch={switchAuth}
      />
    </div>
  );
};

export default Header;
