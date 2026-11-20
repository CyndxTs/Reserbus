import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, LogOut, Ticket, UserRound } from 'lucide-react';
import { useClient } from '../../../features/auth/ClientContext';
import { formattedClientName } from '../../../features/auth/utils/ClientUtil';
import AuthModals, { AuthMode } from '../../../features/auth/components/AuthModals/AuthModals';
import { btnPrimario } from '../../../lib/estilos';

const item =
  'flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-[0.95rem] font-semibold text-tinta transition hover:bg-brand-soft [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-brand';

// Barra flotante de vidrio: logo a la izquierda, cuenta a la derecha
const Header = () => {
  const navigate = useNavigate();
  const { client, clientType, logout } = useClient();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera o con Escape
  useEffect(() => {
    if (!menuAbierto) return;
    const fuera = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuAbierto(false); };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla); };
  }, [menuAbierto]);

  const ir = (path: string) => { setMenuAbierto(false); navigate(path); };
  const handleSignOut = async () => { await logout(); ir('/'); };
  const handleLogoClick = () => {
    if (clientType === 'ADMINISTRADOR') navigate('/admin');
    else if (clientType === 'EMPRESA') navigate('/empresa');
    else navigate('/');
  };
  const nombre = client ? formattedClientName(client) : '';

  return (
    <>
      <header className="sticky top-0 z-[100] px-3 pt-3 sm:px-6">
        <div className="vidrio mx-auto flex h-16 max-w-[1280px] items-center justify-between rounded-2xl px-3 sm:px-5">
          <button type="button" onClick={handleLogoClick} className="flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0" aria-label="Ir al inicio de Reserbus">
            <img src="/RB_LogoWhite.png" alt="" className="h-10 w-10 rounded-xl bg-brand p-0.5 shadow-brillo" />
            <span className="font-display text-[1.35rem] font-bold tracking-tight text-tinta">reserbus</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {clientType === 'VIAJERO' && (
              <button type="button" onClick={() => ir('/mis-viajes')} className="hidden cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent px-3 py-2 text-[0.95rem] font-semibold text-tinta-suave transition hover:bg-brand-soft hover:text-brand sm:flex">
                <Ticket className="h-4 w-4" /> Mis viajes
              </button>
            )}
            {!client ? (
              <>
                <button type="button" onClick={() => setAuthMode('signup')} className="hidden cursor-pointer rounded-xl border-0 bg-transparent px-3 py-2 text-[0.95rem] font-semibold text-tinta-suave transition hover:text-brand sm:block">
                  Crear cuenta
                </button>
                <button type="button" onClick={() => setAuthMode('signin')} className={`${btnPrimario} !rounded-xl !px-5 !py-2.5`}>
                  Iniciar sesión
                </button>
              </>
            ) : (
              <div ref={menuRef} className="relative">
                <button type="button" aria-haspopup="menu" aria-expanded={menuAbierto} onClick={() => setMenuAbierto((v) => !v)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-brand/15 bg-white/80 py-1.5 pl-1.5 pr-3 transition hover:border-brand/40">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-[0.8rem] font-bold text-white">
                    {(nombre[0] || '?').toUpperCase()}
                  </span>
                  <span className="max-w-[110px] truncate text-[0.95rem] font-semibold text-tinta">{nombre}</span>
                  <ChevronDown className={`h-4 w-4 text-tinta-suave transition ${menuAbierto ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {menuAbierto && (
                    <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
                      className="vidrio absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-56 origin-top-right rounded-2xl p-1.5">
                      {clientType === 'VIAJERO' && (
                        <>
                          <button role="menuitem" className={item} onClick={() => ir('/mi-cuenta')}><UserRound /> Mi cuenta</button>
                          <button role="menuitem" className={item} onClick={() => ir('/mis-viajes')}><Ticket /> Mis viajes</button>
                        </>
                      )}
                      <button role="menuitem" className={item} onClick={handleSignOut}><LogOut /> Cerrar sesión</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Fuera de la barra para no alterar su distribución al abrirse */}
      <AuthModals mode={authMode} initialEmail={authEmail} onClose={() => { setAuthMode(null); setAuthEmail(''); }}
        onSwitch={(mode, email) => { setAuthEmail(email); setAuthMode(mode); }} />
    </>
  );
};

export default Header;
