import * as Yup from 'yup';

export interface CreateTarifaValues {
  id_viaje: string;
  id_tipo_de_asiento: string;
  precio: string | number;
}

export const CreateTarifaSchema = Yup.object().shape({
  id_viaje: Yup.string()
    .required('Selecciona un viaje'),
  id_tipo_de_asiento: Yup.string()
    .required('Selecciona un tipo de asiento'),
  precio: Yup.number()
    .typeError('Debe ser un número')
    .min(0.01, 'Debe ser mayor a 0')
    .test('max-2-decimals', 'Máximo 2 decimales', value => 
      value !== undefined && /^\d+(\.\d{1,2})?$/.test(value.toString())
    )
    .required('Campo requerido'),
});
