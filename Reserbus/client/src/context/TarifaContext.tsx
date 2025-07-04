import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface Tarifa {
  id_tarifa: number;
  precio: number;
  esta_habilitado: boolean;
  Viaje: {
    id_viaje: number;
    estado: string;
    instante_abordaje: string;
    instante_partida: string | null;
    instante_llegada: string | null;
    id_ruta: number;
    id_bus: number;
    id_empresa: number;
    esta_habilitado: boolean;
    Ruta: {
      id_ruta: number;
      distancia_de_recorrido: number;
      terminalOrigen: {
        nombre: string;
      };
      terminalDestino: {
        nombre: string;
      };
    };
  };
  TipoDeAsiento: {
    id_tipo_de_asiento: number;
    nombre: string;
    descripcion: string;
  };
}

interface TarifaContextProps {
  tarifas: Tarifa[];
  fetchTarifas: () => void;
  createTarifa: (data: any) => Promise<void>;
  updateTarifa: (id: number, data: any) => Promise<void>;
  deleteTarifa: (id: number) => Promise<void>;
  viajes: any[];
  tiposDeAsiento: any[];
  fetchViajes: () => void;
  fetchTiposDeAsiento: () => void;
}

const TarifaContext = createContext<TarifaContextProps>({} as TarifaContextProps);

export const useTarifa = () => useContext(TarifaContext);

export const TarifaProvider = ({ children }: { children: ReactNode }) => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [viajes, setViajes] = useState<any[]>([]);
  const [tiposDeAsiento, setTiposDeAsiento] = useState<any[]>([]);

  const fetchTarifas = async () => {
    const res = await axios.get('/api/tarifas');
    console.log('RESPUESTA TARIFAS:', res.data);
    setTarifas(res.data);
  };

  const fetchViajes = async () => {
    const res = await axios.get('/api/viajes');
    setViajes(res.data);
  };

  const fetchTiposDeAsiento = async () => {
    const res = await axios.get('/api/tipos-de-asiento');
    setTiposDeAsiento(res.data);
  };

  const createTarifa = async (data: { id_viaje: number, id_tipo_de_asiento: number, precio: number }) => {
    await axios.post('/api/tarifas', data);
    fetchTarifas();
  };

  const updateTarifa = async (id: number, data: { id_viaje: number, id_tipo_de_asiento: number, precio: number }) => {
    await axios.put(`/api/tarifas/${id}`, data);
    fetchTarifas();
  };

  const deleteTarifa = async (id: number) => {
    await axios.delete(`/api/tarifas/${id}`);
    fetchTarifas();
  };

  useEffect(() => {
    fetchTarifas();
    fetchViajes();
    fetchTiposDeAsiento();
  }, []);

  return (
    <TarifaContext.Provider value={{
      tarifas, fetchTarifas, createTarifa, updateTarifa, deleteTarifa,
      viajes, tiposDeAsiento, fetchViajes, fetchTiposDeAsiento
    }}>
      {children}
    </TarifaContext.Provider>
  );
};