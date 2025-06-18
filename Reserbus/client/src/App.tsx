import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext'; // importa tu Provider
import Home from './pages/Home';
import EmpresaHome from './pages/EmpresaHome';
import AdminHome from './pages/AdminHome';
import { BusProvider } from './context/BusContext'; 


function App() {
  return (
    <div className="App">
      <ClientProvider>
        <Router>
      
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminHome />} />
            
            <Route path="/empresa/*" element={
              <BusProvider>
                <EmpresaRoutes />
              </BusProvider>
            } />
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