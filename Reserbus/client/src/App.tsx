import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext'; 
import { BusProvider } from './context/BusContext'; 
import Home from './pages/Home';
import EmpresaHome from './pages/EmpresaHome';
import AdminHome from './pages/AdminHome';
import SearchResults from './pages/SearchResults';

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
            <Route path="/resultados" element={<SearchResults />} />
          </Routes>
        </Router>
      </ClientProvider>
    </div>
  );
}

export default App;
