// src/components/NewReservationModal.tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';

interface ReservationFormModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  reservaAEditar?: any | null;
}

const ReservationFormModal = ({ onClose, onSuccess, reservaAEditar }: ReservationFormModalProps) => {
  const isEditing = Boolean(reservaAEditar);

  const initialValues = isEditing ? {
    viaje: reservaAEditar.viaje || '',
    nombres: reservaAEditar.nombres || '',
    apellidos: reservaAEditar.apellidos || '',
    tipoDocumento: reservaAEditar.tipoDocumento || '',
    numeroDocumento: reservaAEditar.numeroDocumento || '',
    telefono: reservaAEditar.telefono || '',
    email: reservaAEditar.email || '',
    asientoPreferencia: reservaAEditar.asientoPreferencia || '',
    tipoPasajero: reservaAEditar.tipoPasajero || '',
    metodoPago: reservaAEditar.metodoPago || '',
    observaciones: reservaAEditar.observaciones || ''
  } : {
    viaje: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    email: '',
    asientoPreferencia: '',
    tipoPasajero: '',
    metodoPago: '',
    observaciones: ''
  };

  const validateReserva = (values: typeof initialValues) => {
    const errors: any = {};
    if (!values.viaje) errors.viaje = 'Debe seleccionar un viaje';
    if (!values.nombres) errors.nombres = 'Los nombres son obligatorios';
    else if (values.nombres.length < 2) errors.nombres = 'Mínimo 2 caracteres';
    if (!values.apellidos) errors.apellidos = 'Los apellidos son obligatorios';
    else if (values.apellidos.length < 2) errors.apellidos = 'Mínimo 2 caracteres';
    if (!values.tipoDocumento) errors.tipoDocumento = 'Seleccione tipo de documento';
    if (!values.numeroDocumento) errors.numeroDocumento = 'Campo requerido';
    else if (values.tipoDocumento === 'dni' && !/^\d{8}$/.test(values.numeroDocumento)) errors.numeroDocumento = 'DNI debe tener 8 dígitos';
    if (!values.telefono) errors.telefono = 'Campo requerido';
    else if (!/^\d{9}$/.test(values.telefono)) errors.telefono = 'Debe tener 9 dígitos';
    if (!values.email) errors.email = 'Campo requerido';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) errors.email = 'Formato inválido';
    if (!values.tipoPasajero) errors.tipoPasajero = 'Campo requerido';
    if (!values.metodoPago) errors.metodoPago = 'Campo requerido';
    return errors;
  };

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      if (isEditing) {
        console.log('Actualizando reserva:', values);
        // Aquí colocar lógica de update (axios.put/patch)
      } else {
        console.log('Creando nueva reserva:', values);
        // Aquí colocar lógica de create (axios.post)
      }

      setTimeout(() => {
        alert(isEditing ? 'Reserva actualizada' : 'Reserva creada');
        setSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error en submit reserva:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Reserva' : 'Crear Nueva Reserva'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <Formik initialValues={initialValues} validate={validateReserva} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="modal-form">
              <div className="form-group">
                <label htmlFor="viaje">Viaje Disponible</label>
                <Field as="select" name="viaje">
                  <option value="">Seleccionar viaje</option>
                  <option value="lima-arequipa">Lima → Arequipa - 20 Jun</option>
                </Field>
                <ErrorMessage name="viaje" component="div" className="field-error" />
              </div>
              <h3 className="section-title">Datos del Pasajero</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombres">Nombres</label>
                  <Field name="nombres" type="text" />
                  <ErrorMessage name="nombres" component="div" className="field-error" />
                </div>
                <div className="form-group">
                  <label htmlFor="apellidos">Apellidos</label>
                  <Field name="apellidos" type="text" />
                  <ErrorMessage name="apellidos" component="div" className="field-error" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipoDocumento">Tipo Documento</label>
                  <Field as="select" name="tipoDocumento">
                    <option value="">Seleccionar</option>
                    <option value="dni">DNI</option>
                    <option value="ce">Carné</option>
                    <option value="pasaporte">Pasaporte</option>
                  </Field>
                  <ErrorMessage name="tipoDocumento" component="div" className="field-error" />
                </div>
                <div className="form-group">
                  <label htmlFor="numeroDocumento">Número</label>
                  <Field name="numeroDocumento" type="text" />
                  <ErrorMessage name="numeroDocumento" component="div" className="field-error" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <Field name="telefono" type="text" />
                  <ErrorMessage name="telefono" component="div" className="field-error" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field name="email" type="email" />
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="asientoPreferencia">Asiento</label>
                  <Field as="select" name="asientoPreferencia">
                    <option value="">Sin preferencia</option>
                    <option value="ventana">Ventana</option>
                    <option value="pasillo">Pasillo</option>
                  </Field>
                </div>
                <div className="form-group">
                  <label htmlFor="tipoPasajero">Tipo</label>
                  <Field as="select" name="tipoPasajero">
                    <option value="">Seleccionar</option>
                    <option value="adulto">Adulto</option>
                    <option value="niño">Niño</option>
                    <option value="mayor">Adulto mayor</option>
                  </Field>
                  <ErrorMessage name="tipoPasajero" component="div" className="field-error" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="metodoPago">Pago</label>
                <Field as="select" name="metodoPago">
                  <option value="">Seleccionar</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </Field>
                <ErrorMessage name="metodoPago" component="div" className="field-error" />
              </div>
              <div className="form-group">
                <label htmlFor="observaciones">Observaciones</label>
                <Field as="textarea" name="observaciones" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isEditing ? 'Guardar Cambios' : 'Crear Reserva'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ReservationFormModal;
