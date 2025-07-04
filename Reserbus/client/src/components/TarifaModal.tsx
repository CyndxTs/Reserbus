import React from 'react';
import { Tarifa, useTarifa } from '../context/TarifaContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { CreateTarifaSchema } from '../util/TarifaUtil';
import './TarifaModal.scss';

interface TarifaModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  tarifaAEditar?: Tarifa | null;
}

const TarifaModal = ({ onClose, onSuccess, tarifaAEditar }: TarifaModalProps) => {
  const {
    viajes,
    tiposDeAsiento,
    createTarifa,
    updateTarifa,
  } = useTarifa();

  const editMode = Boolean(tarifaAEditar);

  // Cambiado: toma los IDs de los objetos anidados
  const initialValues = {
    id_viaje: tarifaAEditar?.Viaje?.id_viaje?.toString() || '',
    id_tipo_de_asiento: tarifaAEditar?.TipoDeAsiento?.id_tipo_de_asiento?.toString() || '',
    precio: tarifaAEditar?.precio?.toString() || '',
  };

  const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    if (editMode && tarifaAEditar) {
      await updateTarifa(tarifaAEditar.id_tarifa, {
        id_viaje: Number(values.id_viaje),
        id_tipo_de_asiento: Number(values.id_tipo_de_asiento),
        precio: Number(values.precio)
      });
    } else {
      await createTarifa({
        id_viaje: Number(values.id_viaje),
        id_tipo_de_asiento: Number(values.id_tipo_de_asiento),
        precio: Number(values.precio),
      });
    }
    resetForm();
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editMode ? 'Editar Tarifa' : 'Crear Tarifa'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={CreateTarifaSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isValid }) => (
            <Form className="modal-form">
              <div className="form-group">
                <label htmlFor="id_viaje">Viaje Disponible</label>
                <Field as="select" name="id_viaje">
                  <option value="">Selecciona un viaje</option>
                  {viajes.map((v: any) => (
                    <option key={v.id_viaje} value={v.id_viaje}>
                      {(v.Rutum?.terminalOrigen?.nombre || '¿?')} → {(v.Rutum?.terminalDestino?.nombre || '¿?')}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="id_viaje" component="div" className="field-error" />
              </div>
              <div className="form-group">
                <label htmlFor="id_tipo_de_asiento">Tipo de Asiento</label>
                <Field as="select" name="id_tipo_de_asiento">
                  <option value="">Selecciona un tipo de asiento</option>
                  {tiposDeAsiento.map((tipo: any) => (
                    <option key={tipo.id_tipo_de_asiento} value={tipo.id_tipo_de_asiento}>
                      {tipo.nombre} ({tipo.descripcion})
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="id_tipo_de_asiento" component="div" className="field-error" />
              </div>
              <div className="form-group">
                <label htmlFor="precio">Precio</label>
                <Field
                  type="number"
                  name="precio"
                  min={0}
                  step={0.01}
                  placeholder="Ej: 50.00"
                />
                <ErrorMessage name="precio" component="div" className="field-error" />
              </div>
              <div className="modal-buttons">
                <button type="button" className="secondary-modal-button" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="primary-modal-button" disabled={!isValid}>
                  {editMode ? "Guardar" : "Crear"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
</div>
  );
};

export default TarifaModal;