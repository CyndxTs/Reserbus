import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';

// Define tus interfaces igual que en BusContext
export interface Tarifa {
  id_tarifa: number;
  precio: number;
  esta_habilitado: boolean;
  Viaje: any;
  TipoDeAsiento: any;
}

interface TarifaContextType {
  tarifas: Tarifa[];
  viajes: any[];
  tiposDeAsiento: any[];
  loading: boolean;
  error: string | null;

  fetchTarifas: () => Promise<void>;
  createTarifa: (data: any) => Promise<Tarifa>;
  updateTarifa: (id: number, data: any) => Promise<void>;
  deleteTarifa: (id: number) => Promise<void>;
  fetchViajes: () => Promise<void>;
  fetchTiposDeAsiento: () => Promise<void>;
}

const TarifaContext = createContext<TarifaContextType | undefined>(undefined);

export const TarifaProvider = ({ children }: { children: ReactNode }) => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [viajes, setViajes] = useState<any[]>([]);
  const [tiposDeAsiento, setTiposDeAsiento] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tarifas al iniciar
  useEffect(() => {
    fetchTarifas();
    fetchViajes();
    fetchTiposDeAsiento();
  }, []);

  const fetchTarifas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tarifas');
      setTarifas(response.data);
    } catch (err) {
      setError('Error al cargar tarifas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTarifa = async (data: any) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/tarifas', data, {
        headers: { 'Content-Type': 'application/json' }
      });
      setTarifas(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      setError('Error al crear tarifa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTarifa = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/tarifas/${id}`, data);
      setTarifas(prev => prev.map(t => t.id_tarifa === id ? response.data : t));
    } catch (error) {
      setError('Error al actualizar tarifa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTarifa = async (id: number) => {
    setLoading(true);
    try {
      await axios.delete(`/api/tarifas/${id}`);
      setTarifas(prev => prev.filter(t => t.id_tarifa !== id));
    } catch (error) {
      setError('Error al eliminar tarifa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchViajes = useCallback(async () => {
    try {
      const response = await axios.get('/api/viajes');
      setViajes(response.data);
    } catch (err) {
      setError('Error al cargar viajes');
    }
  }, []);

  const fetchTiposDeAsiento = useCallback(async () => {
    try {
      const response = await axios.get('/api/tipos-de-asiento');
      setTiposDeAsiento(response.data);
    } catch (err) {
      setError('Error al cargar tipos de asiento');
    }
  }, []);

  return (
    <TarifaContext.Provider value={{
      tarifas,
      viajes,
      tiposDeAsiento,
      loading,
      error,
      fetchTarifas,
      createTarifa,
      updateTarifa,
      deleteTarifa,
      fetchViajes,
      fetchTiposDeAsiento,
    }}>
      {children}
    </TarifaContext.Provider>
  );
};

export const useTarifa = () => {
  const context = useContext(TarifaContext);
  if (!context) {
    throw new Error('useTarifa debe usarse dentro de un TarifaProvider');
  }
  return context;
};