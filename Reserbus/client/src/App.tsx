import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext'; // importa tu Provider
import Home from './pages/Home';
import EmpresaHome from './pages/EmpresaHome';
import AdminHome from './pages/AdminHome';

function App() {
  return (
    <div className="App">
      <ClientProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/empresa" element={<EmpresaHome />} />
            <Route path="/admin" element={<AdminHome />} />
          </Routes>
        </Router>
      </ClientProvider>
    </div>
  );
}

export default App;
