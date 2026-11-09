import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const botonPrimario =
  'mb-4 block w-[300px] max-w-full cursor-pointer rounded-lg border-0 bg-brand p-4 text-[1rem] text-white transition-colors duration-200 hover:bg-brand-dark';

function AdminHome() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <h1 className="-mt-16 mb-10 self-start text-left text-[2rem] font-semibold">Gestión de Usuarios</h1>

      <div className="flex flex-col items-center gap-4">
        <button className={botonPrimario} onClick={() => navigate('/admin/add-user')}>
          Añadir Usuario
        </button>
        <button className={botonPrimario} onClick={() => navigate('/admin/edit-user')}>
          Modificar Usuario
        </button>
        <button className={botonPrimario} onClick={() => navigate('/admin/delete-user')}>
          Eliminar Usuario
        </button>
      </div>
    </AdminLayout>
  );
}

export default AdminHome;
