import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Header from '../../../../components/layout/Header/Header';
import { useClient } from '../../ClientContext';

interface Values { password: string; confirmPassword: string }

const Schema = Yup.object().shape({
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Requerido'),
});

// Clases reutilizadas (sin preflight todavía, por eso m-0 / box-border / border-0 explícitos)
const titulo = 'm-0 text-2xl font-bold text-brand';
const texto = 'm-0 text-gray-500';
const etiqueta = 'flex justify-between font-semibold text-gray-500';
const errorCampo = 'text-xs font-bold text-red-600';
const input =
  'box-border w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30';
const boton =
  'box-border cursor-pointer rounded-lg border-0 bg-brand py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

// Destino del enlace del correo ("Olvidó su contraseña"). Supabase abre una sesión
// temporal con ese enlace; aquí el usuario define su nueva contraseña.
const ResetPassword = () => {
  const navigate = useNavigate();
  const { client, clientType, loading, updatePassword } = useClient();
  const [done, setDone] = useState(false);

  const destino =
    clientType === 'EMPRESA' ? '/empresa' : clientType === 'ADMINISTRADOR' ? '/admin' : '/';

  const handleSubmit = async (values: Values, { setSubmitting, setFieldError }: FormikHelpers<Values>) => {
    const res = await updatePassword(values.password);
    if (res.ok) {
      setDone(true);
      setTimeout(() => navigate(destino), 1500);
    } else {
      setFieldError('password', res.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Header />
      <main className="flex justify-center px-4 py-16">
        <div className="box-border flex w-[420px] max-w-full flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
          {loading ? (
            <p className={texto}>Verificando enlace…</p>
          ) : !client ? (
            <>
              <h1 className={titulo}>Enlace inválido o vencido</h1>
              <p className={texto}>Solicita uno nuevo desde "¿Olvidó su contraseña?" al iniciar sesión.</p>
              <button className={boton} onClick={() => navigate('/')}>Ir al inicio</button>
            </>
          ) : done ? (
            <>
              <h1 className={titulo}>¡Contraseña actualizada!</h1>
              <p className={texto}>Ya puedes entrar con tu correo y contraseña. Te redirigimos…</p>
            </>
          ) : (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={Schema}
              validateOnMount={true}
              onSubmit={handleSubmit}
            >
              {({ isValid, isSubmitting }) => (
                <Form className="contents">
                  <h1 className={titulo}>Nueva contraseña</h1>
                  <p className={texto}>Define una contraseña para {client.correo_electronico}.</p>
                  <div className="flex flex-col gap-1">
                    <div className={etiqueta}>
                      <label htmlFor="password">Contraseña</label>
                      <ErrorMessage name="password" component="div" className={errorCampo} />
                    </div>
                    <Field id="password" name="password" type="password" className={input} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={etiqueta}>
                      <label htmlFor="confirmPassword">Confirmar contraseña</label>
                      <ErrorMessage name="confirmPassword" component="div" className={errorCampo} />
                    </div>
                    <Field id="confirmPassword" name="confirmPassword" type="password" className={input} />
                  </div>
                  <button type="submit" className={boton} disabled={!isValid || isSubmitting}>
                    Guardar contraseña
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </main>
    </>
  );
};

export default ResetPassword;
