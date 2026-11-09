import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';

interface AdminLayoutProps {
  children: ReactNode;
}

// Estructura común de las pantallas de administración: Header + barra lateral + contenido.
const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const itemInactivo = 'cursor-pointer py-4 text-[0.85rem] text-[#999] hover:font-bold hover:text-brand';

  return (
    <div className="flex h-screen flex-col">
      <Header
        navOptions={[
          { label: 'Contacto', path: '/contacto' },
          { label: 'Acerca de nosotros', path: '/acerca-de' },
        ]}
      />
      <aside className="fixed left-0 top-[80px] mt-7 h-[calc(100%-80px)] w-20 border-r border-[#eee] bg-white pt-2">
        <ul className="my-4 list-none p-0 text-center">
          <li className="cursor-pointer py-4 text-[0.85rem] font-bold text-brand">
            <button className="cursor-pointer border-0 bg-transparent text-center" onClick={() => navigate('/admin')}>
              Usuarios
            </button>
          </li>
          <li className={itemInactivo}>Roles</li>
          <li className={itemInactivo}>Empresas</li>
          <li className={itemInactivo}>Parámetros</li>
          <li className={itemInactivo}>Reportes</li>
        </ul>
      </aside>
      <main className="ml-[100px] mt-[60px] flex flex-col items-center p-8 text-center">{children}</main>
    </div>
  );
};

export default AdminLayout;
