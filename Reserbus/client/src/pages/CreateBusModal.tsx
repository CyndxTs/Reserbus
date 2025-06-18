import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useBus } from '../context/BusContext';
import { CreateBusSchema, cantidadPisosOptions } from '../util/BusUtil';
import './CreateBusModal.css';



interface CreateBusModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  idEmpresa: Number;
}

const CreateBusModal = ({ onClose, onSuccess, idEmpresa  }: CreateBusModalProps) => {
  const { createBus, servicios, loading } = useBus();

  const initialValues = {
    placa: '',
    marca: '',
    modelo: '',
    cantidad_pisos: 1,
    id_empresa: 0,
    servicios: [] as number[]
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      console.log("Valores que se enviarán:", values);

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
      );
      
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
    <div className="modal-overlay-bus">
      <div className="modal-content-bus">
        <button className="close-bus-modal" onClick={onClose}>×</button>
        <h2 className="modal-title-bus">Registrar Nuevo Bus</h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={CreateBusSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, setFieldValue, isValid }) => (
            <Form className="bus-form">
              <div className="compact-input-group">
                <div className="compact-input-pair">
                  <div className="form-group-bus">
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

                  <div className="form-group-bus">
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
                </div>

                <div className="compact-input-pair">
                  <div className="form-group-bus">
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

                  <div className="form-group-bus">
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

              <div className="form-group-bus">
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

              <button 
                type="submit" 
                className="submit-button-bus"
                disabled={loading || !isValid}
              >
                {loading ? 'Registrando...' : 'Registrar Bus'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateBusModal;