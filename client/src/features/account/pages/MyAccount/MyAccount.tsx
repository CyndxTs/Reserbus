import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViajeDetalle from '../../../booking/components/ViajeDetalle';
import { ViajeReserva, codigoReserva, fechaHora } from '../../../booking/utils/ReservaUtil';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Header from '../../../../components/layout/Header/Header';
import { useClient, Viajero } from '../../../auth/ClientContext';

const navOptions = [
  { label: 'Contacto', path: '/contacto' },
  { label: 'Acerca de nosotros', path: '/acerca-de' },
];

interface Values {
  nombres: string;
  apellidos: string;
}

const Schema = Yup.object().shape({
  nombres: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras').required('Requerido'),
  apellidos: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/, 'Solo letras'),
});

const tarjeta = 'mb-8 rounded-[22px] border-[1.5px] border-[#bbb] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]';
const subtitulo = 'mb-4 text-[24px] font-bold text-brand';
const etiqueta = 'flex items-center justify-between text-left text-[16px] font-semibold text-[#6a6a6a]';
const errorCampo = 'text-[12px] font-bold text-red-600';
const input = 'w-full rounded-xl border-2 border-[#ccc] p-3';
const boton =
  'cursor-pointer rounded-lg border-0 bg-brand px-6 py-3 text-[16px] text-white disabled:cursor-not-allowed disabled:bg-[#bda8f9]';

// Ruta: /MyAccount (solo VIAJERO). Perfil editable + acceso para crear/cambiar contraseña.
function MyAccount() {
  const { client, sendPasswordReset, refreshProfile } = useClient();
  const viajero = client as Viajero;
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeReserva[] | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  useEffect(() => {
    axios.get<ViajeReserva[]>('/api/viajes/mios').then((r) => setViajes(r.data)).catch(() => setViajes([]));
  }, []);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [avisoPass, setAvisoPass] = useState<string | null>(null);

  const handleSubmit = async (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
    setMensaje(null);
    try {
      await axios.put('/api/viajeros/me', {
        nombres: values.nombres.trim(),
        apellidos: values.apellidos.trim(),
      });
      await refreshProfile();
      setMensaje({ tipo: 'ok', texto: 'Datos actualizados.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Sirve igual para quien entró con Google y quiere definir una contraseña
  const handlePassword = async () => {
    const res = await sendPasswordReset(viajero.correo_electronico);
    setAvisoPass(res.ok
      ? `Te enviamos un enlace a ${viajero.correo_electronico} para crear o cambiar tu contraseña.`
      : res.error ?? 'No se pudo enviar el correo.');
  };

  return (
    <div>
      <Header navOptions={navOptions} />
      <main className="mx-auto max-w-[760px] px-6 py-10 text-left">
        <h1 className="mb-8 text-[40px] font-bold text-brand">Mi cuenta</h1>

        <section className={tarjeta}>
          <h2 className={subtitulo}>Mis datos</h2>
          <p className="mb-4 text-[#6a6a6a]">Correo: <strong>{viajero.correo_electronico}</strong></p>
          <Formik<Values>
            enableReinitialize
            initialValues={{
              nombres: viajero.nombres ?? '',
              apellidos: viajero.apellidos ?? '',
            }}
            validationSchema={Schema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty, isSubmitting }) => (
              <Form className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <div className={etiqueta}><label htmlFor="nombres">Nombres</label><ErrorMessage name="nombres" component="div" className={errorCampo} /></div>
                  <Field id="nombres" name="nombres" className={input} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className={etiqueta}><label htmlFor="apellidos">Apellidos</label><ErrorMessage name="apellidos" component="div" className={errorCampo} /></div>
                  <Field id="apellidos" name="apellidos" className={input} />
                </div>
                <div className="flex items-center gap-4 md:col-span-2">
                  <button type="submit" className={boton} disabled={!dirty || !isValid || isSubmitting}>Guardar cambios</button>
                  {mensaje && (
                    <span className={mensaje.tipo === 'ok' ? 'text-green-700' : 'text-red-600'}>{mensaje.texto}</span>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </section>

        <section className={tarjeta}>
          <h2 className={subtitulo}>Seguridad</h2>
          <p className="mb-4 text-[#6a6a6a]">
            Si entraste con Google no tienes contraseña. Puedes crear una para usar también tu correo.
          </p>
          <button className={boton} onClick={handlePassword}>Crear / cambiar contraseña</button>
          {avisoPass && <p className="mt-3 text-[#444]">{avisoPass}</p>}
        </section>

        <section className={tarjeta}>
          <h2 className={subtitulo}>Mis viajes</h2>
          {viajes === null ? <p className="text-[#6a6a6a]">Cargando…</p>
            : viajes.length === 0 ? <p className="text-[#6a6a6a]">Aún no tienes viajes reservados.</p>
            : viajes.map((v) => (
              <div key={v.id} className="mb-3 rounded-xl border border-[#ddd] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-brand">{codigoReserva(v.id)} <span className="ml-2 text-[12px] font-semibold text-[#555]">{v.estado}</span></div>
                    <div className="text-[14px] text-[#444]">{v.tramos[0]?.origen} → {v.tramos[v.tramos.length - 1]?.destino} · {v.tramos[0] && fechaHora(v.tramos[0].salida_estimada)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="cursor-pointer rounded-lg border-[1.5px] border-brand bg-white px-4 py-1 text-brand" onClick={() => setAbierto(abierto === v.id ? null : v.id)}>{abierto === v.id ? 'Ocultar' : 'Ver detalle'}</button>
                    {v.estado === 'PENDIENTE' && <button className="cursor-pointer rounded-lg border-0 bg-brand px-4 py-1 text-white" onClick={() => navigate(`/resumen/${v.id}`)}>Continuar</button>}
                  </div>
                </div>
                {abierto === v.id && <div className="mt-4"><ViajeDetalle viaje={v} /></div>}
              </div>
            ))}
        </section>
      </main>
    </div>
  );
}

export default MyAccount;
