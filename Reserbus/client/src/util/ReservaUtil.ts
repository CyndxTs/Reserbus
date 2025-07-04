// Tipos TypeScript para Reservas
export interface Reserva {
  id_reserva: number;
  estado: 'PAGO_PENDIENTE' | 'PAGADA' | 'COMPLETADA' | 'CANCELADA';
  id_viajero: number;
  id_viaje_ida: number;
  id_viaje_vuelta?: number;
  id_pago?: number;
  esta_habilitado: boolean;
  // Relaciones asociadas (si se incluyen en el fetch)
  viajero?: {
    id_viajero: number;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    telefono?: string;
  };
  viajeIda?: {
    id_viaje: number;
    estado: string;
    instante_abordaje: string;
    ruta?: {
      id_ruta: number;
      origen: string;
      destino: string;
    };
    bus?: {
      id_bus: number;
      placa: string;
    };
  };
  pasajeros?: Array<{
    id_pasajero: number;
    nombres: string;
    apellidos: string;
    numero_documento: string;
    asiento?: {
      ubicacion: string;
    };
  }>;
}

export interface CreateReservaRequest {
  estado?: 'PAGO_PENDIENTE' | 'PAGADA' | 'COMPLETADA' | 'CANCELADA';
  id_viajero: number;
  id_viaje_ida: number;
  id_viaje_vuelta?: number;
  id_pago?: number;
  esta_habilitado?: boolean;
}

// Funciones para la API de Reservas
export const fetchReservas = async (): Promise<Reserva[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/reservas');
    if (!response.ok) {
      throw new Error('Error al obtener reservas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en fetchReservas:', error);
    throw error;
  }
};

export const createReserva = async (reservaData: CreateReservaRequest): Promise<Reserva> => {
  try {
    const response = await fetch('http://localhost:3001/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservaData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Error al crear reserva');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en createReserva:', error);
    throw error;
  }
};

// Funciones auxiliares para obtener viajeros y viajes (necesarios para el formulario)
export const fetchViajeros = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/viajeros');
    if (!response.ok) throw new Error('Error al obtener viajeros');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchViajeros:', error);
    throw error;
  }
};

export const fetchViajes = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/viajes');
    if (!response.ok) throw new Error('Error al obtener viajes');
    return await response.json();
  } catch (error) {
    console.error('Error en fetchViajes:', error);
    throw error;
  }
};

export const createViajero = async (viajeroData: {
  correo_electronico: string;
  contrasenia: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string;
}) => {
  try {
    const response = await fetch('http://localhost:3001/api/viajeros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viajeroData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Error al crear viajero');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en createViajero:', error);
    throw error;
  }
};
