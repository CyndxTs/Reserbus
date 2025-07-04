import './AdminHome.scss';
import { useClient } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function AdminHome() {
  const { client, clientType } = useClient();
  const navigate = useNavigate();

  const admin = clientType === 'ADMINISTRADOR' ? client : null;

  return (
    <div className="p-admin-home">
      <Header
        navOptions={[
          { label: 'Contacto', path: '/contacto' },
          { label: 'Acerca de nosotros', path: '/acerca-de' }
        ]}
      />
      <aside className="sidebar">
        <ul>
          <li className="active">
            <button onClick={ () => navigate('/admin') } >Usuarios</button>
          </li>
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