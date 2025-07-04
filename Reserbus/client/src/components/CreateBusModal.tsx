import './CreateBusModal.scss';
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
    <div className="modal-overlay-bus">
      <div className="modal-content-bus">
        <button className="close-bus-modal" onClick={onClose}>×</button>
        <h2 className="modal-title-bus">
          {busAEditar ? 'Editar Bus' : 'Registrar Nuevo Bus'}
        </h2>
        
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
                {loading ? 'Guardando...' : busAEditar ? 'Guardar Cambios' : 'Registrar Bus'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateBusModal;