import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Header from '../../../../components/layout/Header/Header';

const navOptions = [
  { label: 'Contacto', path: '/contacto' },
  { label: 'Acerca de nosotros', path: '/acerca-de' },
];

const Schema = Yup.object().shape({
  nombre: Yup.string().required('Requerido'),
  email: Yup.string().email('Correo inválido').required('Requerido'),
  mensaje: Yup.string().min(10, 'Mínimo 10 caracteres').required('Requerido'),
});

const etiqueta = 'flex items-center justify-between text-left text-[16px] font-semibold text-[#6a6a6a]';
const errorCampo = 'text-[12px] font-bold text-red-600';
const input = 'w-full rounded-xl border-2 border-[#ccc] p-3';

function Contacto() {
  const [enviado, setEnviado] = useState(false);

  return (
    <div>
      <Header navOptions={navOptions} />
      <main className="mx-auto max-w-[640px] px-6 py-12 text-left">
        <h1 className="mb-2 text-[48px] font-bold text-brand">Contacto</h1>
        <p className="mb-8 text-[18px] text-[#6a6a6a]">¿Tienes dudas sobre una reserva? Escríbenos y te responderemos pronto.</p>

        {enviado ? (
          <div className="rounded-2xl bg-[#f6f6ff] p-6 text-[18px] text-brand">
            ¡Gracias! Recibimos tu mensaje.
          </div>
        ) : (
          <Formik
            initialValues={{ nombre: '', email: '', mensaje: '' }}
            validationSchema={Schema}
            onSubmit={(_values, { setSubmitting }) => {
              // TODO: conectar con un endpoint del server (POST /api/contacto)
              setEnviado(true);
              setSubmitting(false);
            }}
          >
            {({ isValid, dirty, isSubmitting }) => (
              <Form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className={etiqueta}><label htmlFor="nombre">Nombre</label><ErrorMessage name="nombre" component="div" className={errorCampo} /></div>
                  <Field id="nombre" name="nombre" className={input} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className={etiqueta}><label htmlFor="email">Correo</label><ErrorMessage name="email" component="div" className={errorCampo} /></div>
                  <Field id="email" name="email" type="email" className={input} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className={etiqueta}><label htmlFor="mensaje">Mensaje</label><ErrorMessage name="mensaje" component="div" className={errorCampo} /></div>
                  <Field id="mensaje" name="mensaje" as="textarea" rows={5} className={input} />
                </div>
                <button
                  type="submit"
                  disabled={!dirty || !isValid || isSubmitting}
                  className="cursor-pointer rounded-lg border-0 bg-brand p-3 text-[16px] text-white disabled:cursor-not-allowed disabled:bg-[#bda8f9]"
                >
                  Enviar mensaje
                </button>
              </Form>
            )}
          </Formik>
        )}
      </main>
    </div>
  );
}

export default Contacto;
