import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Bus, useBus } from '../../BusContext';
import { CreateBusSchema, cantidadPisosOptions } from '../../utils/BusUtil';

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
      <div className="relative max-h-[90vh] w-[450px] max-w-[90%] overflow-y-auto rounded-lg bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <button className="absolute right-[10px] top-[10px] cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[28px] text-[#333] transition-all duration-200 hover:scale-110 hover:bg-brand hover:text-white" onClick={onClose}>×</button>
        <h2 className="my-[15px] text-center text-[18px] font-bold text-[#333]">
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
            <Form className="flex flex-col gap-3">
              <div>
                <div className="flex w-full gap-[10px]">
                  <div className="flex flex-1 flex-col">
                    <label htmlFor="placa" className="mb-1 block text-[13px] font-semibold text-[#555]">Placa del Bus</label>
                    <Field
                      name="placa"
                      type="text"
                      placeholder="Ej: ABC-123"
                      className="box-border w-full rounded-[4px] border border-[#ddd] px-[10px] py-2 text-[13px] focus:border-brand focus:outline-none"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue("placa", e.target.value.toUpperCase())
                      }
                    />
                    <ErrorMessage
                      name="placa"
                      component="div"
                      className="mt-[2px] text-[11px] text-[#e74c3c]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <label htmlFor="marca" className="mb-1 block text-[13px] font-semibold text-[#555]">Marca</label>
                    <Field
                      name="marca"
                      type="text"
                      placeholder="Ej: Volvo"
                      className="box-border w-full rounded-[4px] border border-[#ddd] px-[10px] py-2 text-[13px] focus:border-brand focus:outline-none"
                    />
                    <ErrorMessage
                      name="marca"
                      component="div"
                      className="mt-[2px] text-[11px] text-[#e74c3c]"
                    />
                  </div>
                </div>

                <div className="flex w-full gap-[10px]">
                  <div className="flex flex-1 flex-col">
                    <label htmlFor="modelo" className="mb-1 block text-[13px] font-semibold text-[#555]">Modelo</label>
                    <Field
                      name="modelo"
                      type="text"
                      placeholder="Ej: 2023"
                      className="box-border w-full rounded-[4px] border border-[#ddd] px-[10px] py-2 text-[13px] focus:border-brand focus:outline-none"
                    />
                    <ErrorMessage
                      name="modelo"
                      component="div"
                      className="mt-[2px] text-[11px] text-[#e74c3c]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <label htmlFor="cantidad_pisos" className="mb-1 block text-[13px] font-semibold text-[#555]">Pisos</label>
                    <Field
                      as="select"
                      name="cantidad_pisos"
                      className="box-border w-full rounded-[4px] border border-[#ddd] px-[10px] py-2 text-[13px] focus:border-brand focus:outline-none"
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
                      className="mt-[2px] text-[11px] text-[#e74c3c]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col">
                <label className="mb-[6px] mt-2 block text-[13px] font-semibold text-[#555]">Servicios Disponibles</label>
                <div className="grid max-h-[180px] grid-cols-2 gap-2 overflow-y-auto p-[3px]">
                  {servicios.filter(s => s.esta_habilitado).map(servicio => (
                    <div key={servicio.id_servicio} className="flex items-center gap-[6px]">
                      <input
                        type="checkbox"
                        className="h-[14px] w-[14px] cursor-pointer accent-brand"
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
                      <label htmlFor={`servicio-${servicio.id_servicio}`} className="mb-1 block cursor-pointer text-[12px] font-semibold text-[#333]">
                        {servicio.nombre}
                      </label>
                    </div>
                  ))}
                </div>
                <ErrorMessage
                  name="servicios"
                  component="div"
                  className="mt-[2px] text-[11px] text-[#e74c3c]"
                />
              </div>

              <button 
                type="submit" 
                className="mt-3 h-[34px] cursor-pointer rounded-[4px] border-0 bg-brand p-2 text-[13px] font-semibold text-white enabled:hover:bg-[#3a10c0] disabled:cursor-not-allowed disabled:bg-[#bda8f9]"
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