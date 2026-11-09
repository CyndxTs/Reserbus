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

function App() {
  return (
    <div className="text-center">
      <ClientProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/empresa/*" element={
              <ProtectedRoute roles={['EMPRESA']}>
                <BusProvider>
                  <EmpresaRoutes />
                </BusProvider>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminHome /></ProtectedRoute>} />
            <Route path="/admin/add-user" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminAddUser /></ProtectedRoute>} />
            <Route path="/admin/edit-user" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminEditUser /></ProtectedRoute>} />
            <Route path="/admin/delete-user" element={<ProtectedRoute roles={['ADMINISTRADOR']}><AdminDeleteUser /></ProtectedRoute>} />
            <Route path="/resultados" element={<SearchResults />} />
            <Route path="/restablecer" element={<ResetPassword />} />
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
    </Routes>
  );
}

export default App;
