import { useState } from 'react';
import { useClient, Administrador, Empresa } from '../../../features/auth/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName } from '../../../features/auth/utils/ClientUtil';
import AuthModals, { AuthMode } from '../../../features/auth/components/AuthModals/AuthModals';

// Ítem del menú desplegable del perfil
const menuItem =
  'block w-full cursor-pointer border-t border-black/5 bg-transparent px-3 py-3 text-left text-[1rem] font-medium text-[#333] hover:bg-[#f5f5f5]';

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
    <div className="sticky top-0 z-[100] flex h-[108px] items-center justify-between bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="flex cursor-pointer flex-row items-center gap-3 p-[18px]" onClick={handleLogoClick}>
        <img src="/RB_LogoWhite.png" alt="logo-icon" className="h-20 w-20 rounded-full bg-brand" />
        <span className="-mt-3 ml-1 text-[48px] font-bold text-brand">reserbus</span>
      </div>
      <div className="flex h-full flex-row items-center">
        <div className="h-full">
          {navOptions.map((link, index) => (
            <button
              key={index}
              className="h-full cursor-pointer border-0 bg-transparent px-8 text-[1.5rem] font-medium transition-colors duration-200 hover:bg-[#f5f5f5]"
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="group relative inline-block h-full">
          <button
            className="flex h-full cursor-pointer flex-row items-center gap-3 border-0 bg-transparent px-6 text-[1.5rem] font-medium transition-colors duration-200 hover:bg-[#f5f5f5]"
            onClick={handleClientOptionClick}
          >
            {!client ? (
              <>
                <span>Iniciar</span>
                <img src="/Icon_Account.svg" alt="icon-profile" className="h-10 w-10 text-brand" />
              </>
            ) : (
              <>
                <span className="text-brand">{formattedClientName(client)}</span>
                {clientType === 'EMPRESA' && (
                  <img src={(client as Empresa).logo_url || "/Icon_Account.svg"} alt="company-icon" className="h-[70px] w-[70px]" />
                )}
                {clientType === 'ADMINISTRADOR' && (
                  <img src={(client as Administrador).foto_url || "/Icon_Account.svg"} alt="admin-icon" className="h-9 w-9" />
                )}
              </>
            )}
          </button>
          {client && !isMenuOpen && (
            <div className="absolute left-1/2 top-full z-[100] hidden w-[98%] min-w-[150px] -translate-x-1/2 flex-col overflow-hidden rounded-xl border-2 border-t-0 border-black/10 bg-white shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:flex">
              {clientType === 'VIAJERO' && (
                <button
                  className={menuItem}
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/MyAccount');
                  }}
                >
                  Mis Viajes
                </button>
              )}
              <button className={menuItem} onClick={handleSignOut}>Cerrar sesión</button>
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
