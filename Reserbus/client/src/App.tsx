import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext'; // importa tu Provider
import Home from './pages/Home';
import EmpresaHome from './pages/EmpresaHome';
import AdminHome from './pages/AdminHome';
import AdminAddUser from './pages/AdminAddUser';
import AdminEditUser from './pages/AdminEditUser';
import AdminDeleteUser from './pages/AdminDeleteUser';

function App() {
  return (
    <div className="App">
      <ClientProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/empresa" element={<EmpresaHome />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/add-user" element={<AdminAddUser />} />
            <Route path="/admin/edit-user" element={<AdminEditUser />} />
            <Route path="/admin/delete-user" element={<AdminDeleteUser />} />
          </Routes>
        </Router>
      </ClientProvider>
    </div>
  );
}

export default App;

