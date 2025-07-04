import "./AdminHome.scss";
import "./AdminAddUser.scss";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import axios from "axios";
import Header from "../components/Header";

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
  const navigate = useNavigate();
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
    <div className="p-admin-home">
      <Header
        navOptions={[
          { label: 'Contacto', path: '/contacto' },
          { label: 'Acerca de nosotros', path: '/acerca-de' }
        ]}
      />
      <aside className="sidebar">
        <ul>
          <li className="active">
            <button onClick={ () => navigate('/admin') } >Usuarios</button>
          </li>
          <li>Roles</li>
          <li>Empresas</li>
          <li>Parámetros</li>
          <li>Reportes</li>
        </ul>
      </aside>

      <main className="main-content add-user">
        <h1 className="main-title left">Añadir Usuario</h1>

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
            <Form className="form-card">
              <div className="form-grid">
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enviaremos sus tickets y detalles aquí"
                  />
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>

                <div className="form-group">
                  <label>Nombres</label>
                  <Field type="text" name="nombres" placeholder="Ingrese sus nombres" />
                  <ErrorMessage name="nombres" component="div" className="field-error" />
                </div>

                <div className="form-group">
                  <label>Apellidos</label>
                  <Field type="text" name="apellidos" placeholder="Ingrese sus apellidos" />
                  <ErrorMessage name="apellidos" component="div" className="field-error" />
                </div>

                <div className="form-group">
                  <label>Tipo de Usuario</label>
                  <Field as="select" name="tipo">
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Empresa">Empresa</option>
                  </Field>
                </div>

                <div className="form-group">
                  <label>Contraseña Temporal</label>
                  <Field type="password" name="password" placeholder="Ingrese su contraseña" />
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>

                <div className="form-group">
                  <label>Ingrese de nuevo la Contraseña</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Ingrese su contraseña"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                </div>

                <div className="form-group full">
                  <label>Estado</label>
                  <div className="radio-group">
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
                className="submit-button"
                type="submit"
                disabled={isSubmitting || !isValid}
              >
                Añadir Usuario
              </button>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
}

export default AddUser;
