import React, { createContext, useContext, useState, ReactNode } from 'react';
export interface Viajero {
  id_viajero: number;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string;
  esta_habilitado: boolean;
}
export interface Empresa {
  id_empresa: number;
  correo_electronico: string;
  razon_social?: string;
  ruc?: string;
  descripcion?: string;
  logo?: string;
  esta_habilitado: boolean;
}
export interface Administrador {
  id_administrador: number;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
  foto?:string;
  fecha_nacimiento?: string;
  esta_habilitado: boolean;
}
type ClientData = Viajero | Administrador | Empresa;
interface ClientContextType {
  client: ClientData | null;
  clientType: String | null;
  login: (data: ClientData, type: String) => void;
  logout: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<ClientData | null>(null);
  const [clientType, setClientType] = useState<String | null>(null);

  const login = (data: ClientData, type: String) => {
    setClient(data);
    setClientType(type);
  };

  const logout = () => {
    setClient(null);
    setClientType(null);
  };

  return (
    <ClientContext.Provider value={{ client, clientType, login, logout }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient debe usarse dentro de un ClientProvider');
  }
  return context;
};
