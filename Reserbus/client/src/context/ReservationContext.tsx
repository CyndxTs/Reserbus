// src/context/ReservationContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export interface Reserva {
  id_reserva: number;
  estado: string;
  id_viajero: number;
  id_viaje_ida: number;
  id_viaje_vuelta?: number;
  id_pago?: number;
  esta_habilitado: boolean;
  
  // Datos del viajero (usuario registrado)
  viajero?: {
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
  };
  
  // Datos del primer pasajero
  pasajero?: {
    nombres: string;
    apellidos: string;
    tipoDocumento: string; // DNI, Pasaporte, etc.
    documento: string;
    asiento: string;
  };
  
  // Datos del viaje
  ruta?: string;
  fechaIda?: string;
  horaIda?: string;
  fechaVuelta?: string;
  horaVuelta?: string;
  bus?: string;
  
  // Información de pago
  monto?: number;
  metodo_pago?: string;
  
  // Cantidad de pasajeros
  cantidad_pasajeros?: number;
  
  // Información completa para detalles
  detalles?: {
    viaje_ida: any;
    viaje_vuelta?: any;
    pago?: any;
  };
}

interface ReservaContextType {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
  fetchReservas: () => Promise<void>;
  fetchReservasByEmpresa: (idEmpresa: number) => Promise<void>;
  createReserva: (reservaData: Partial<Reserva>) => Promise<void>;
  updateReserva: (id: number, reservaData: Partial<Reserva>) => Promise<void>;
  deleteReserva: (id: number) => Promise<void>;
  clearError: () => void;
}

const ReservaContext = createContext<ReservaContextType>({} as ReservaContextType);

export const useReserva = () => useContext(ReservaContext);

export const ReservaProvider = ({ children }: { children: React.ReactNode }) => {
  // Inicializar reservas como array vacío explícitamente
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/reservas');
      // Asegurar que siempre sea un array
      const data = Array.isArray(res.data) ? res.data : [];
      const habilitadas = data.filter((r: Reserva) => r.esta_habilitado);
      setReservas(habilitadas);
    } catch (err: any) {
      setError('Error al cargar reservas');
      console.error('Error fetchReservas:', err);
      setReservas([]); // Asegurar que reservas sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const fetchReservasByEmpresa = useCallback(async (idEmpresa: number) => {
    if (!idEmpresa) {
      setError('ID de empresa requerido');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/empresas/${idEmpresa}/reservas`);
      
      // Asegurar que siempre tengamos un array
      const data = Array.isArray(res.data) ? res.data : [];
      const habilitadas = data.filter((r: Reserva) => r.esta_habilitado);
      
      setReservas(habilitadas);
    } catch (err: any) {
      setError('Error al cargar reservas de la empresa');
      console.error('Error fetchReservasByEmpresa:', err);
      setReservas([]); // Asegurar que reservas sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  const createReserva = async (reservaData: Partial<Reserva>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/reservas', reservaData);
      // Asegurar que tengamos un array antes de hacer spread
      setReservas(prev => Array.isArray(prev) ? [...prev, res.data] : [res.data]);
    } catch (err: any) {
      setError('Error al crear la reserva');
      console.error('Error createReserva:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReserva = async (id: number, reservaData: Partial<Reserva>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.patch(`/api/reservas/${id}`, reservaData);
      // Asegurar que tengamos un array antes de hacer map
      setReservas(prev => Array.isArray(prev) ? 
        prev.map(r => r.id_reserva === id ? res.data : r) : 
        [res.data]
      );
    } catch (err: any) {
      setError('Error al actualizar la reserva');
      console.error('Error updateReserva:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReserva = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/api/reservas/${id}`, { esta_habilitado: false });
      // Asegurar que tengamos un array antes de hacer filter
      setReservas(prev => Array.isArray(prev) ? 
        prev.filter(r => r.id_reserva !== id) : 
        []
      );
    } catch (err: any) {
      setError('Error al eliminar la reserva');
      console.error('Error deleteReserva:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReservaContext.Provider value={{ 
      reservas, 
      loading, 
      error, 
      fetchReservas,
      fetchReservasByEmpresa, 
      createReserva, 
      updateReserva, 
      deleteReserva,
      clearError
    }}>
      {children}
    </ReservaContext.Provider>
  );
};