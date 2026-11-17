import { useState } from 'react';
import { useClient } from '../../../features/auth/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName } from '../../../features/auth/utils/ClientUtil';
import AuthModals, { AuthMode } from '../../../features/auth/components/AuthModals/AuthModals';

// Ítem del menú desplegable del perfil
const menuItem =
  'block w-full cursor-pointer border-t border-black/5 bg-transparent px-3 py-3 text-left text-[1rem] font-medium text-[#333] hover:bg-[#f5f5f5]';

// Solo el logo a la izquierda y la cuenta a la derecha
const Header = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
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

  const ir = (path: string) => {
    setMenuAbierto(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    await logout();
    ir('/');
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
    if (!client) setAuthMode('signin');
    else setMenuAbierto(!menuAbierto);
  };

  return (
    <>
      <div className="sticky top-0 z-[100] flex h-[108px] items-center justify-between bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <div className="flex cursor-pointer flex-row items-center gap-3 p-[18px]" onClick={handleLogoClick}>
          <img src="/RB_LogoWhite.png" alt="logo-icon" className="h-20 w-20 rounded-full bg-brand" />
          <span className="-mt-3 ml-1 text-[48px] font-bold text-brand">reserbus</span>
        </div>
        <div className="group relative inline-block h-full" onMouseLeave={() => setMenuAbierto(false)}>
          <button
            className="flex h-full cursor-pointer flex-row items-center gap-3 border-0 bg-transparent px-6 text-[1.5rem] font-medium transition-colors duration-200 hover:bg-[#f5f5f5]"
            onClick={handleClientOptionClick}
          >
            {!client ? (
              <span>Iniciar</span>
            ) : (
              <span className="text-brand">{formattedClientName(client)}</span>
            )}
            <img src="/Icon_Account.svg" alt="icon-profile" className="h-10 w-10 text-brand" />
          </button>
          {client && (
            <div
              className={`absolute left-1/2 top-full z-[100] w-[98%] min-w-[170px] -translate-x-1/2 flex-col overflow-hidden rounded-xl border-2 border-t-0 border-black/10 bg-white shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:flex ${
                menuAbierto ? 'flex' : 'hidden'
              }`}
            >
              {clientType === 'VIAJERO' && (
                <>
                  <button className={menuItem} onClick={() => ir('/mi-cuenta')}>Mi cuenta</button>
                  <button className={menuItem} onClick={() => ir('/mis-viajes')}>Mis viajes</button>
                </>
              )}
              <button className={menuItem} onClick={handleSignOut}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
      {/* Fuera de la barra: así no altera su distribución al abrirse */}
      <AuthModals mode={authMode} initialEmail={authEmail} onClose={closeAuth} onSwitch={switchAuth} />
    </>
  );
};

export default Header;
