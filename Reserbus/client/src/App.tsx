import './App.scss';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext'; 
import { BusProvider } from './context/BusContext'; 
import EmpresaHome from './pages/EmpresaHome';
import AdminHome from './pages/AdminHome';
import AdminAddUser from './pages/AdminAddUser';
import AdminEditUser from './pages/AdminEditUser';
import AdminDeleteUser from './pages/AdminDeleteUser';
import SearchResults from './pages/SearchResults';
import Home from './pages/Home';

function App() {
  return (
    <div className="App">
      <ClientProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/empresa/*" element={
              <BusProvider>
                <EmpresaRoutes />
              </BusProvider>
            } />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/add-user" element={<AdminAddUser />} />
            <Route path="/admin/edit-user" element={<AdminEditUser />} />
            <Route path="/admin/delete-user" element={<AdminDeleteUser />} />
            <Route path="/resultados" element={<SearchResults />} />
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