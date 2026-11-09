import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { ClientType, useClient } from '../../ClientContext';

interface ProtectedRouteProps {
  roles: ClientType[];
  children: ReactElement;
}

// Solo deja pasar a los roles indicados; el resto vuelve al inicio.
// (La seguridad real está en el server: esto solo evita pantallas que no corresponden.)
const ProtectedRoute = ({ roles, children }: ProtectedRouteProps) => {
  const { clientType, loading } = useClient();

  if (loading) return <div className="p-8 text-center">Cargando…</div>;
  if (!clientType || !roles.includes(clientType)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
