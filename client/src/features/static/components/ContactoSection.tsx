import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { enviarMensaje } from '../services/ContactoService';
import Aviso from '../../../components/ui/Aviso';
import { btnPrimario, campo, errorCampo, etiqueta } from '../../../lib/estilos';

const Schema = Yup.object().shape({
  nombre: Yup.string().required('Escribe tu nombre'),
  email: Yup.string().email('Correo inválido').required('Escribe tu correo'),
  mensaje: Yup.string().min(10, 'Mínimo 10 caracteres').required('Escribe tu mensaje'),
});

// Sección del inicio (al final): "Contacto"
const ContactoSection = () => {
  const [respuesta, setRespuesta] = useState<string | null>(null);

  return (
    <section id="contacto" className="py-8">
      <div className="vidrio grid gap-10 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-tight">¿Dudas sobre una reserva?</h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-tinta-suave">Cuéntanos qué pasó y te respondemos por correo.</p>
        </div>
        <Formik
          initialValues={{ nombre: '', email: '', mensaje: '' }}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting }) => {
            const r = await enviarMensaje(values);
            setRespuesta(r.mensaje);
            setSubmitting(false);
          }}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="flex flex-col gap-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className={etiqueta}>Nombre</label>
                  <Field id="nombre" name="nombre" className={campo} />
                  <ErrorMessage name="nombre" component="div" className={errorCampo} />
                </div>
                <div>
                  <label htmlFor="email" className={etiqueta}>Correo</label>
                  <Field id="email" name="email" type="email" className={campo} />
                  <ErrorMessage name="email" component="div" className={errorCampo} />
                </div>
              </div>
              <div>
                <label htmlFor="mensaje" className={etiqueta}>Mensaje</label>
                <Field id="mensaje" name="mensaje" as="textarea" rows={4} className={campo} />
                <ErrorMessage name="mensaje" component="div" className={errorCampo} />
              </div>
              {respuesta && <Aviso tipo="info">{respuesta}</Aviso>}
              <button type="submit" disabled={!dirty || !isValid || isSubmitting} className={`${btnPrimario} self-start`}>Enviar mensaje</button>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
};

export default ContactoSection;
