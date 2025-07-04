import './CreateBusModal.scss';
import '../pages/EmpresaHome.scss'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Bus, useBus } from '../context/BusContext';
import { CreateBusSchema, cantidadPisosOptions } from '../util/BusUtil';

interface CreateBusModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  idEmpresa: Number;
  busAEditar?: Bus | null;
}

const CreateBusModal = ({ onClose, onSuccess, idEmpresa, busAEditar  }: CreateBusModalProps) => {
  const { createBus, updateBus, servicios, loading } = useBus();

 const initialValues = busAEditar ? {
    placa: busAEditar.placa,
    marca: busAEditar.marca,
    modelo: busAEditar.modelo,
    cantidad_pisos: busAEditar.cantidad_pisos,
    id_empresa: busAEditar.id_empresa,
    servicios: busAEditar.servicios ? busAEditar.servicios.map(s => s.id_servicio) : []
  } : {
    placa: '',
    marca: '',
    modelo: '',
    cantidad_pisos: 1,
    id_empresa: Number(idEmpresa),
    servicios: []
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      console.log("Valores que se enviarán:", values);

      if (busAEditar) {
        console.log("Editando bus ID:", busAEditar.id_bus);
        await updateBus(busAEditar.id_bus, {
          placa: values.placa,
          marca: values.marca,
          modelo: values.modelo,
          cantidad_pisos: values.cantidad_pisos
        }, values.servicios);
        console.log("Bus actualizado correctamente");
      } else {

      await createBus(
        {
          placa: values.placa,
          marca: values.marca,
          modelo: values.modelo,
          cantidad_pisos:  Number(values.cantidad_pisos),
          id_empresa: Number(idEmpresa),
          esta_habilitado: true
        },
        values.servicios
      )};
      
      console.log("Bus creado");
    
      
      //onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error:", error);
    
    }
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{busAEditar ? 'Editar Bus' : 'Registrar Nuevo Bus'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <Formik
          className="modal-form"
          initialValues={initialValues}
          validationSchema={CreateBusSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, setFieldValue, isValid }) => (
            <Form className="modal-form">
              <div className="compact-input-group">
                  <div className="form-group">
                    <label htmlFor="placa">Placa del Bus</label>
                    <Field
                      name="placa"
                      type="text"
                      placeholder="Ej: ABC-123"
                      className="form-control-bus compact"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue("placa", e.target.value.toUpperCase())
                      }
                    />
                    <ErrorMessage
                      name="placa"
                      component="div"
                      className="error-message-bus"
                    />
                  </div>
                  <div className='form-row'>
                    <div className="form-group">
                      <label htmlFor="marca">Marca</label>
                      <Field
                        name="marca"
                        type="text"
                        placeholder="Ej: Volvo"
                        className="form-control-bus compact"
                      />
                      <ErrorMessage
                        name="marca"
                        component="div"
                        className="error-message-bus"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="modelo">Modelo</label>
                      <Field
                        name="modelo"
                        type="text"
                        placeholder="Ej: 2023"
                        className="form-control-bus compact"
                      />
                      <ErrorMessage
                        name="modelo"
                        component="div"
                        className="error-message-bus"
                      />
                    </div>
                  </div>              

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cantidad_pisos">Pisos</label>
                    <Field
                      as="select"
                      name="cantidad_pisos"
                      className="form-control-bus compact"
                    >
                      {cantidadPisosOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="cantidad_pisos"
                      component="div"
                      className="error-message-bus"
                    />
                  </div>
                  
                </div>
              </div>
              <div className="form-group">
                <label className="services-label">Servicios Disponibles</label>
                <div className="services-checkbox-grid">
                  {servicios.filter(s => s.esta_habilitado).map(servicio => (
                    <div key={servicio.id_servicio} className="checkbox-option-bus">
                      <input
                        type="checkbox"
                        id={`servicio-${servicio.id_servicio}`}
                        checked={values.servicios.includes(servicio.id_servicio)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue(
                              'servicios', 
                              [...values.servicios, servicio.id_servicio]
                            );
                          } else {
                            setFieldValue(
                              'servicios', 
                              values.servicios.filter(id => id !== servicio.id_servicio)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`servicio-${servicio.id_servicio}`}>
                        {servicio.nombre}
                      </label>
                    </div>
                  ))}
                </div>
                <ErrorMessage
                  name="servicios"
                  component="div"
                  className="error-message-bus"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading || !isValid}>
                  {loading ? 'Guardando...' : busAEditar ? 'Guardar Cambios' : 'Registrar Bus'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateBusModal;