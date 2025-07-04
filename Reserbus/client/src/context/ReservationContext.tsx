// src/context/ReservaContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface Reserva {
  id_reserva: number;
  estado: string;
  id_viajero: number;
  id_viaje_ida: number;
  id_viaje_vuelta?: number;
  id_pago?: number;
  esta_habilitado: boolean;
  pasajero?: string;
  ruta?: string;
  fecha?: string;
  hora?: string;
}

interface ReservaContextType {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
  fetchReservas: () => void;
  createReserva: (reservaData: Partial<Reserva>) => Promise<void>;
  updateReserva: (id: number, reservaData: Partial<Reserva>) => Promise<void>;
  deleteReserva: (id: number) => Promise<void>;
}

const ReservaContext = createContext<ReservaContextType>({} as ReservaContextType);

export const useReserva = () => useContext(ReservaContext);

export const ReservaProvider = ({ children }: { children: React.ReactNode }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reservas');
      const habilitadas = res.data.filter((r: Reserva) => r.esta_habilitado);
      setReservas(habilitadas);
    } catch (err: any) {
      setError('Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createReserva = async (reservaData: Partial<Reserva>) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/reservas', reservaData);
      setReservas(prev => [...prev, res.data]);
    } catch (err) {
      setError('Error al crear la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateReserva = async (id: number, reservaData: Partial<Reserva>) => {
    setLoading(true);
    try {
      const res = await axios.patch(`/api/reservas/${id}`, reservaData);
      setReservas(prev => prev.map(r => r.id_reserva === id ? res.data : r));
    } catch (err) {
      setError('Error al actualizar la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReserva = async (id: number) => {
    setLoading(true);
    try {
      await axios.patch(`/api/reservas/${id}`, { esta_habilitado: false });
      setReservas(prev => prev.filter(r => r.id_reserva !== id));
    } catch (err) {
      setError('Error al eliminar la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <ReservaContext.Provider
      value={{ reservas, loading, error, fetchReservas, createReserva, updateReserva, deleteReserva }}
    >
      {children}
    </ReservaContext.Provider>
  );
};
