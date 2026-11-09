import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

interface AddUserValues {
  email: string;
  nombres: string;
  apellidos: string;
  tipo: string;
  password: string;
  confirmPassword: string;
  estado: string;
}

const AddUserSchema = Yup.object().shape({
  email: Yup.string().email("Correo inválido").required("Campo requerido"),
  nombres: Yup.string().required("Campo requerido"),
  apellidos: Yup.string().required("Campo requerido"),
  tipo: Yup.string().required("Campo requerido"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("Campo requerido"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Campo requerido"),
  estado: Yup.string().oneOf(["ACTIVO", "INACTIVO"]).required(),
});

function AddUser() {
  const handleAddUser = async (
    values: AddUserValues,
    { setSubmitting, resetForm }: FormikHelpers<AddUserValues>
  ) => {
    try {
      const endpoint =
        values.tipo === "Cliente"
          ? "/api/viajeros"
          : values.tipo === "Empresa"
          ? "/api/empresas"
          : "/api/administradores";

      await axios.post(endpoint, {
        correo_electronico: values.email,
        nombres: values.nombres,
        apellidos: values.apellidos,
        contrasenia: values.password,
        estado: values.estado,
      });

      resetForm();
      alert("Usuario creado correctamente");
    } catch (e) {
      console.error("Error al crear usuario", e);
      alert("Error al crear usuario. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
        <h1 className="-mt-16 mb-10 self-start text-left text-[2rem] font-semibold">Añadir Usuario</h1>

        <Formik
          initialValues={{
            email: "",
            nombres: "",
            apellidos: "",
            tipo: "Cliente",
            password: "",
            confirmPassword: "",
            estado: "ACTIVO",
          }}
          validationSchema={AddUserSchema}
          onSubmit={handleAddUser}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="mx-auto my-8 w-full max-w-[480px] rounded-lg border border-[#ddd] bg-white p-8 shadow-[0_0_4px_rgba(0,0,0,0.05)]">
              <div className="mb-8 grid grid-cols-2 gap-6">
                <div className="col-span-full flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Correo Electrónico</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enviaremos sus tickets y detalles aquí"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-[0.85rem] text-red-600" />
                </div>

                <div className="flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Nombres</label>
                  <Field type="text" name="nombres" placeholder="Ingrese sus nombres" />
                  <ErrorMessage name="nombres" component="div" className="mt-1 text-[0.85rem] text-red-600" />
                </div>

                <div className="flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Apellidos</label>
                  <Field type="text" name="apellidos" placeholder="Ingrese sus apellidos" />
                  <ErrorMessage name="apellidos" component="div" className="mt-1 text-[0.85rem] text-red-600" />
                </div>

                <div className="flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Tipo de Usuario</label>
                  <Field as="select" name="tipo">
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Empresa">Empresa</option>
                  </Field>
                </div>

                <div className="flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Contraseña Temporal</label>
                  <Field type="password" name="password" placeholder="Ingrese su contraseña" />
                  <ErrorMessage name="password" component="div" className="mt-1 text-[0.85rem] text-red-600" />
                </div>

                <div className="flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Ingrese de nuevo la Contraseña</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Ingrese su contraseña"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-[0.85rem] text-red-600" />
                </div>

                <div className="col-span-full flex flex-col [&_label]:mb-[6px] [&_label]:font-semibold [&_:is(input,select)]:rounded-md [&_:is(input,select)]:border [&_:is(input,select)]:border-[#ccc] [&_:is(input,select)]:p-[10px] [&_:is(input,select)]:text-[0.95rem]">
                  <label>Estado</label>
                  <div className="mt-2 flex gap-8">
                    <label>
                      <Field type="radio" name="estado" value="ACTIVO" /> Activo
                    </label>
                    <label>
                      <Field type="radio" name="estado" value="INACTIVO" /> Inactivo
                    </label>
                  </div>
                </div>
              </div>

              <button
                className="mt-4 w-full cursor-pointer rounded-lg border-0 bg-brand p-3 text-[16px] text-white disabled:cursor-not-allowed disabled:bg-[#bda8f9]"
                type="submit"
                disabled={isSubmitting || !isValid}
              >
                Añadir Usuario
              </button>
            </Form>
          )}
        </Formik>
      </AdminLayout>
  );
}

export default AddUser;
