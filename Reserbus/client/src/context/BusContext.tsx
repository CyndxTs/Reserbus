import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Tipos basados en tus modelos
export interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  esta_habilitado: boolean;
}

export interface BusServicio {
  id_bus: number;
  id_servicio: number;
  Servicio?: Servicio;
}

export interface Bus {
  id_bus: number;
  placa: string;
  marca: string;
  modelo: string;
  cantidad_pisos: number;
  id_empresa: number;
  esta_habilitado: boolean;
  servicios?: Servicio[];  
  Pisos?: Piso[];
}

interface Piso {
  id_piso: number;
  numero_piso: number;
  capacidad: number;
  id_bus: number;
}

interface BusContextType {
  buses: Bus[];
  servicios: Servicio[];
  currentBus: Bus | null;
  loading: boolean;
  error: string | null;
  
  // Funciones para buses
  fetchBuses: (idEmpresa: number) => Promise<void>;
  getBus: (idBus: number) => Promise<Bus>;
  createBus: (busData: Omit<Bus, 'id_bus'>, serviciosIds: number[]) => Promise<Bus>;
  updateBus: (idBus: number, busData: Partial<Bus>, serviciosIds?: number[]) => Promise<void>;
  deleteBus: (idBus: number) => Promise<void>;
  toggleBusStatus: (idBus: number) => Promise<void>;
  
  // Funciones para servicios
  fetchServicios: () => Promise<void>;
  getServiciosByBus: (idBus: number) => Promise<Servicio[]>;
  addServicioToBus: (idBus: number, idServicio: number) => Promise<void>;
  removeServicioFromBus: (idBus: number, idServicio: number) => Promise<void>;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

export const BusProvider = ({ children }: { children: ReactNode }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [currentBus, setCurrentBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar servicios al iniciar
  useEffect(() => {
    fetchServicios();
  }, []);

  // Funciones para buses
  const fetchBuses = async (idEmpresa: number) => {
  setLoading(true);
  try {
    const response = await axios.get(`/api/empresas/${idEmpresa}/buses`, {
      params: { 
        include: ['servicios', 'Pisos'] // Asegúrate de incluir esto
      }
    });
    setBuses(response.data);
  } finally {
    setLoading(false);
  }
};
  

 const getBus = async (idBus: number) => {
  setLoading(true);
  try {
    const response = await axios.get(`/api/buses/${idBus}`, {
      params: { include: ['servicios', 'Pisos'] }
    });
    setCurrentBus(response.data);
    return response.data;
  } finally {
    setLoading(false);
  }
};

  const createBus = async (busData: Omit<Bus, 'id_bus'>, serviciosIds: number[]) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/buses', {
        ...busData,
        servicios: serviciosIds
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      setBuses(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Error al crear bus';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async (idBus: number, busData: Partial<Bus>, serviciosIds?: number[]) => {
  setLoading(true);
  try {
    const payload = {
      ...busData,
      servicios: serviciosIds || [] // Asegura que siempre se envíe un array
    };

    const response = await axios.put(`/api/buses/${idBus}`, payload);
    
    // Actualiza el estado
    setBuses(prev => prev.map(bus => 
      bus.id_bus === idBus ? response.data : bus
    ));
    setCurrentBus(response.data);
    
    return response.data; // Devuelve los datos actualizados
  } finally {
    setLoading(false);
  }
};

  const deleteBus = async (idBus: number) => {
  setLoading(true);
  try {
    await axios.delete(`/api/buses/${idBus}`);

    // Opcional: refrescar lista completa
    setBuses(prev => prev.filter(bus => bus.id_bus !== idBus));

    setError(null);
  } catch (err) {
    setError('Error al eliminar el bus');
    console.error(err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  const toggleBusStatus = async (idBus: number) => {
    setLoading(true);
    try {
      const bus = buses.find(b => b.id_bus === idBus);
      if (!bus) throw new Error('Bus no encontrado');
      
      const response = await axios.patch(`/api/buses/${idBus}/status`, {
        esta_habilitado: !bus.esta_habilitado
      });
      
      setBuses(prev => prev.map(b => 
        b.id_bus === idBus ? { ...b, esta_habilitado: response.data.esta_habilitado } : b
      ));
      setError(null);
    } catch (err) {
      setError('Error al cambiar estado del bus');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funciones para servicios
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/servicios');
      setServicios(response.data);
      setError(null);
    } catch (err) {
      setError('Error al obtener los servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiciosByBus = async (idBus: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/buses/${idBus}/servicios`);
      return response.data;
    } catch (err) {
      setError('Error al obtener servicios del bus');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addServicioToBus = async (idBus: number, idServicio: number) => {
    setLoading(true);
    try {
      await axios.post(`/api/buses/${idBus}/servicios`, { id_servicio: idServicio });
      
      // Actualizar estado local
      const servicio = servicios.find(s => s.id_servicio === idServicio);
      if (servicio) {
        setCurrentBus(prev => prev ? {
          ...prev,
          BusServicios: [...(prev.servicios || []), { id_bus: idBus, id_servicio: idServicio, Servicio: servicio }]
        } : null);
      }
      
      setError(null);
    } catch (err) {
      setError('Error al añadir servicio al bus');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeServicioFromBus = async (idBus: number, idServicio: number) => {
    setLoading(true);
    try {
      await axios.delete(`/api/buses/${idBus}/servicios/${idServicio}`);
      
      // Actualizar estado local
      setCurrentBus(prev => prev ? {
        ...prev,
        BusServicios: (prev.servicios || []).filter(bs => bs.id_servicio !== idServicio)
      } : null);
      
      setError(null);
    } catch (err) {
      setError('Error al remover servicio del bus');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BusContext.Provider value={{
      buses,
      servicios,
      currentBus,
      loading,
      error,
      fetchBuses,
      getBus,
      createBus,
      updateBus,
      deleteBus,
      toggleBusStatus,
      fetchServicios,
      getServiciosByBus,
      addServicioToBus,
      removeServicioFromBus
    }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBus = (): BusContextType => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus debe usarse dentro de un BusProvider');
  }
  return context;
};