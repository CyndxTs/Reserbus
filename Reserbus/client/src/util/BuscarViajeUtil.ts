export interface SearchValues {
  origen: string;
  destino: string;
  salida: string;
  regreso: string;
  pasajeros: number;
}

export interface Tarifa {
  id_tarifa: number;
  precio: number;
  tipo: string;
}

export interface Empresa {
  id_empresa: number;
  razon_social: string;
}

export interface Ruta {
  origen: string;
  destino: string;
  distancia: number;
}

export interface Viaje {
  id_viaje: number;
  estado: string;
  instante_abordaje: string;
  instante_partida: string;
  instante_llegada: string;
  duracion_estimada_minutos: number;
  empresa: Empresa;
  ruta: Ruta;
  tarifas: Tarifa[];
}

export interface SearchParams {
  origen: string;
  destino: string;
  fecha_salida: string;
  fecha_regreso: string | null;
  pasajeros: number;
}

export interface LocationState {
  viajes: Viaje[];
  parametros: SearchParams;
}