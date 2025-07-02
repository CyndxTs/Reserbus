import { Bus, Servicio } from '../context/BusContext';
import * as Yup from 'yup';


// Tipos para formularios

//Crear Buses
export interface CreateBusValues {
  placa: string;
  marca: string;
  modelo: string;
  cantidad_pisos: number;
  id_empresa: number;
  servicios: number[];
}
//Actualizar Buses
export interface UpdateBusValues {
  placa?: string;
  marca?: string;
  modelo?: string;
  cantidad_pisos?: number;
  servicios?: number[];
}

// Esquemas de validación
export const CreateBusSchema = Yup.object().shape({
  placa: Yup.string()
    .matches(/^[A-Z]{3}-\d{3}$/, 'Formato de placa inválido. Use el formato ABC-123')
    .required('Campo requerido'),
  marca: Yup.string()
    .max(60, 'Máximo 60 caracteres')
    .required('Campo requerido'),
  modelo: Yup.string()
    .max(60, 'Máximo 60 caracteres')
    .required('Campo requerido'),
  cantidad_pisos: Yup.number()
    .min(1, 'Mínimo 1 piso')
    .max(3, 'Máximo 3 pisos')
    .required('Campo requerido'),
  servicios: Yup.array()
    .of(Yup.number())
    .min(1, 'Seleccione al menos un servicio')
});

export const ServicioSchema = Yup.object().shape({
  nombre: Yup.string()
    .max(20, 'Máximo 20 caracteres')
    .required('Campo requerido'),
  descripcion: Yup.string()
    .max(60, 'Máximo 60 caracteres')
    .nullable()
});

// Funciones utilitarias
export function formatBusInfo(bus: Bus): string {
  return `${bus.marca} ${bus.modelo} (${bus.placa}) - ${bus.cantidad_pisos} piso${bus.cantidad_pisos > 1 ? 's' : ''}`;
}

export function getServiciosNames(servicios: Servicio[]): string {
  return servicios.map(s => s.nombre).join(', ');
}

export function prepareBusData(values: CreateBusValues | UpdateBusValues) {
  const baseData = {
    placa: values.placa,
    marca: values.marca,
    modelo: values.modelo,
    cantidad_pisos: values.cantidad_pisos,
    id_empresa: 1
  };

  if ('servicios' in values && values.servicios) {
    return {
      ...baseData,
      servicios: values.servicios
    };
  }

  return baseData;
}

// Opciones para formularios
export const cantidadPisosOptions = [1, 2, 3].map(num => ({
  value: num,
  label: `${num} piso${num > 1 ? 's' : ''}`
}));