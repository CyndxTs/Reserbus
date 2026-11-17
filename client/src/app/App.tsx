import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClientProvider } from '../features/auth/ClientContext';
import { BusProvider } from '../features/company/BusContext';
import ProtectedRoute from '../features/auth/components/ProtectedRoute/ProtectedRoute';
import EmpresaHome from '../features/company/pages/EmpresaHome/EmpresaHome';
import AdminHome from '../features/admin/pages/AdminHome/AdminHome';
import AdminAddUser from '../features/admin/pages/AdminAddUser/AdminAddUser';
import AdminEditUser from '../features/admin/pages/AdminEditUser/AdminEditUser';
import AdminDeleteUser from '../features/admin/pages/AdminDeleteUser/AdminDeleteUser';
import SearchResults from '../features/search/pages/SearchResults/SearchResults';
import ResetPassword from '../features/auth/pages/ResetPassword/ResetPassword';
import Home from '../features/search/pages/Home/Home';
import MyAccount from '../features/account/pages/MyAccount/MyAccount';
import Reserva from '../features/booking/pages/Reserva/Reserva';
import Resumen from '../features/booking/pages/Resumen/Resumen';
import ReservaConfirmada from '../features/booking/pages/ReservaConfirmada/ReservaConfirmada';
import MisViajes from '../features/booking/pages/MisViajes/MisViajes';
import MiViajeDetalle from '../features/booking/pages/MiViajeDetalle/MiViajeDetalle';
import NotFound from '../features/static/pages/NotFound/NotFound';

function App() {
  return (
    <div className="text-center">
      <ClientProvider>
        <Router>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/resultados" element={<SearchResults />} />
            <Route path="/restablecer" element={<ResetPassword />} />

            <Route path="/reservar" element={<Reserva />} />

            {/* VIAJERO */}
            <Route path="/resumen/:id" element={<ProtectedRoute roles={['VIAJERO']}><Resumen /></ProtectedRoute>} />
            <Route path="/reserva/:id" element={<ProtectedRoute roles={['VIAJERO']}><ReservaConfirmada /></ProtectedRoute>} />
            <Route path="/mi-cuenta" element={<ProtectedRoute roles={['VIAJERO']}><MyAccount /></ProtectedRoute>} />
            <Route path="/mis-viajes" element={<ProtectedRoute roles={['VIAJERO']}><MisViajes /></ProtectedRoute>} />
            <Route path="/mis-viajes/:id" element={<ProtectedRoute roles={['VIAJERO']}><MiViajeDetalle /></ProtectedRoute>} />

            {/* EMPRESA */}
            <Route path="/empresa/*" element={
              <ProtectedRoute roles={['EMPRESA']}>
                <BusProvider>
                  <EmpresaRoutes />
                </BusProvider>
              </ProtectedRoute>
            } />

            {/* ADMINISTRADOR */}
            <Route path="/admin" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminHome /></ProtectedRoute>} />
            <Route path="/admin/add-user" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminAddUser /></ProtectedRoute>} />
            <Route path="/admin/edit-user" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminEditUser /></ProtectedRoute>} />
            <Route path="/admin/delete-user" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminDeleteUser /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ClientProvider>
    </div>
  );
}

function EmpresaRoutes() {
  return (
    <Routes>
      <Route index element={<EmpresaHome />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
