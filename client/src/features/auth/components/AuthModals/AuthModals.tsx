import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useClient } from '../../ClientContext';
import { SignInValues, SignUpValues } from '../../utils/ClientUtil';

export type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthModalsProps {
  mode: AuthMode | null;
  initialEmail: string;
  onClose: () => void;
  onSwitch: (mode: AuthMode, email: string) => void;
}

const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Correo inválido').required('Requerido'),
  password: Yup.string().required('Requerido'),
});

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email('Correo inválido').required('Requerido'),
  password: Yup.string().min(6, 'Minimo 6 caracteres').required('Requerido'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Requerido'),
  nombres: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras').required('Requerido'),
  apellidos: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras').required('Requerido'),
  acceptedTerms: Yup.boolean().oneOf([true], 'Debes aceptar los términos y condiciones'),
});

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Correo inválido').required('Requerido'),
});

// Clases Tailwind reutilizadas dentro de los modales de autenticación
const tituloIn = 'mb-2 font-display text-[1.6rem] font-bold leading-tight tracking-tight text-tinta';
const tituloUp = 'mb-1 font-display text-[1.3rem] font-bold leading-tight tracking-tight text-tinta';
const campo = 'flex flex-col gap-1';
const etiqueta = 'flex items-center justify-between text-left text-[0.85rem] font-semibold text-tinta-suave';
const errorCampo = 'text-[0.75rem] font-semibold text-rose-600';
const inputIn = 'w-full rounded-xl border border-brand/20 bg-white px-3.5 py-2.5 text-[1rem] text-tinta transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15';
const inputUp = inputIn;
const enlace = 'text-right text-[0.9rem] font-semibold text-brand underline-offset-4 hover:underline';
const boton =
  'mt-2 cursor-pointer rounded-xl border-0 bg-senal px-5 py-3 font-display text-[0.85rem] font-semibold text-tinta shadow-senal transition hover:-translate-y-0.5 hover:bg-[#ff6e3a] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:translate-y-0';
const botonGoogle =
  'flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-xl border border-brand/20 bg-white px-4 py-2.5 text-[0.95rem] font-semibold text-tinta transition hover:border-brand/50 hover:bg-brand-soft/50';
const divisor =
  "flex items-center gap-3 text-[0.8rem] text-tinta-suave before:h-px before:flex-1 before:bg-brand/15 before:content-[''] after:h-px after:flex-1 after:bg-brand/15 after:content-['']";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

interface FrameProps {
  onClose: () => void;
  adOnLeft: boolean;
  illustration?: string;   // ya no se usa: el panel lateral es de gradiente (se conserva por compatibilidad)
  children: ReactNode;
}

// Panel lateral: gradiente índigo con la ruta del bus
const Lateral = () => (
  <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-8 text-white md:flex">
    <div className="flex items-center gap-3">
      <img src="/RB_LogoWhite.png" alt="" className="h-10 w-10 rounded-xl bg-white/15 p-0.5" />
      <span className="font-display text-[1.15rem] font-bold">reserbus</span>
    </div>
    <svg viewBox="0 0 240 200" aria-hidden className="my-6 w-full">
      <path d="M20 170 C 70 170, 60 100, 120 100 S 180 30, 220 30" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="20" cy="170" r="9" fill="#fff" />
      <circle cx="120" cy="100" r="9" fill="#fff" />
      <circle cx="220" cy="30" r="11" fill="#ff5a1f" />
    </svg>
    <p className="font-display text-[1.1rem] font-bold leading-snug">Tu asiento, tu ruta, sin colas.</p>
  </div>
);

const Frame = ({ onClose, adOnLeft, children }: FrameProps) => {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-tinta/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="relative flex max-h-[94vh] min-h-[480px] w-[860px] max-w-full animate-modal-in overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_90px_-24px_rgba(27,22,71,0.6)]" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Cerrar" className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-tinta-suave transition hover:bg-brand-soft" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        {adOnLeft && <Lateral />}
        <div className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto p-6 sm:p-9">{children}</div>
        {!adOnLeft && <Lateral />}
      </div>
    </div>
  );
};

const AuthModals = ({ mode, initialEmail, onClose, onSwitch }: AuthModalsProps) => {
  const navigate = useNavigate();
  const { signInWithPassword, signInWithGoogle, signUp, sendPasswordReset } = useClient();
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(null);

  if (!mode) return null;

  const close = () => { setNotice(null); onClose(); };
  const switchTo = (m: AuthMode, email: string) => { setNotice(null); onSwitch(m, email); };

  const handleSignIn = async (
    values: SignInValues,
    { setSubmitting, setFieldError, setFieldValue }: FormikHelpers<SignInValues>
  ) => {
    const res = await signInWithPassword(values.email, values.password);
    if (res.ok) {
      close();
      if (res.clientType === 'EMPRESA') navigate('/empresa');
      else if (res.clientType === 'ADMINISTRADOR') navigate('/admin');
      else if (!window.location.pathname.startsWith('/reservar')) navigate('/');
    } else {
      setFieldValue('password', '', false);
      setFieldError('email', res.error);
    }
    setSubmitting(false);
  };

  const handleSignUp = async (
    values: SignUpValues,
    { setSubmitting, setFieldError, setFieldValue }: FormikHelpers<SignUpValues>
  ) => {
    const res = await signUp({
      email: values.email,
      password: values.password,
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
    });
    if (!res.ok) {
      setFieldError('email', res.error);
      setFieldValue('password', '', false);
      setFieldValue('confirmPassword', '', false);
    } else if (res.needsConfirmation) {
      setNotice({
        title: '¡Revisa tu correo!',
        text: `Te enviamos un enlace de confirmación a ${values.email}. Ábrelo para activar tu cuenta y luego inicia sesión.`,
      });
    } else {
      close();
    }
    setSubmitting(false);
  };

  const handleForgot = async (
    values: { email: string },
    { setSubmitting, setFieldError }: FormikHelpers<{ email: string }>
  ) => {
    const res = await sendPasswordReset(values.email);
    if (res.ok) {
      setNotice({
        title: '¡Listo!',
        text: 'Si el correo está registrado, te enviamos un enlace para crear o restablecer tu contraseña.',
      });
    } else {
      setFieldError('email', res.error);
    }
    setSubmitting(false);
  };

  if (notice) {
    return (
      <Frame onClose={close} adOnLeft={true} illustration="/Illustration_1.png">
        <div className={tituloIn}>{notice.title}</div>
        <p className="m-0 text-[1rem] leading-relaxed text-tinta-suave">{notice.text}</p>
        <button type="button" className={boton} onClick={close}>Entendido</button>
      </Frame>
    );
  }

  if (mode === 'signin') {
    return (
      <Frame onClose={close} adOnLeft={true} illustration="/Illustration_1.png">
        <Formik
          initialValues={{ email: initialEmail, password: '' }}
          validationSchema={SignInSchema}
          validateOnMount={true}
          onSubmit={handleSignIn}
        >
          {({ isValid, values, isSubmitting }) => (
            <Form className="flex flex-col gap-3">
              <div className={tituloIn}>¡Todos a bordo!</div>
              <button type="button" className={botonGoogle} onClick={() => signInWithGoogle()}>
                <GoogleIcon /> Continuar con Google
              </button>
              <div className={divisor}>o con tu correo</div>
              <div className={campo}>
                <div className={etiqueta}>
                  <label htmlFor="email">Correo</label>
                  <ErrorMessage name="email" component="div" className={errorCampo} />
                </div>
                <Field id="email" name="email" type="email" className={inputIn} />
              </div>
              <div className={campo}>
                <div className={etiqueta}>
                  <label htmlFor="password">Contraseña</label>
                  <ErrorMessage name="password" component="div" className={errorCampo} />
                </div>
                <Field id="password" name="password" type="password" className={inputIn} />
              </div>
              <a href="#" className={enlace} onClick={(e) => { e.preventDefault(); switchTo('forgot', values.email); }}>
                ¿Olvidó su contraseña?
              </a>
              <button type="submit" className={boton} disabled={!isValid || isSubmitting}>
                Iniciar sesión
              </button>
              <p className="my-2 text-[0.92rem] text-tinta-suave">
                ¿No tiene una cuenta?{' '}
                <a href="#" className="font-semibold text-brand underline-offset-4 hover:underline" onClick={(e) => { e.preventDefault(); switchTo('signup', values.email); }}>
                  ¡Regístrate!
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </Frame>
    );
  }

  if (mode === 'signup') {
    return (
      <Frame onClose={close} adOnLeft={false} illustration="/Illustration_2.png">
        <Formik
          initialValues={{
            email: initialEmail,
            password: '',
            nombres: '',
            apellidos: '',
            confirmPassword: '',
            acceptedTerms: false,
          }}
          validationSchema={SignUpSchema}
          onSubmit={handleSignUp}
        >
          {({ isValid, values, isSubmitting }) => (
            <Form className="flex flex-col gap-2">
              <div className={tituloUp}>¡Regístrate y viaja sin límites!</div>
              <button type="button" className={botonGoogle} onClick={() => signInWithGoogle()}>
                <GoogleIcon /> Registrarse con Google
              </button>
              <div className={divisor}>o con tu correo</div>
              <div className={campo}>
                <div className={etiqueta}>
                  <label htmlFor="email">Correo electrónico</label>
                  <ErrorMessage name="email" component="div" className={errorCampo} />
                </div>
                <Field id="email" name="email" type="email" className={inputUp} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={campo}>
                  <div className={etiqueta}>
                    <label htmlFor="nombres">Nombres</label>
                    <ErrorMessage name="nombres" component="div" className={errorCampo} />
                  </div>
                  <Field id="nombres" name="nombres" type="text" className={inputUp} />
                </div>
                <div className={campo}>
                  <div className={etiqueta}>
                    <label htmlFor="apellidos">Apellidos</label>
                    <ErrorMessage name="apellidos" component="div" className={errorCampo} />
                  </div>
                  <Field id="apellidos" name="apellidos" type="text" className={inputUp} />
                </div>
              </div>
              <div className={campo}>
                <div className={etiqueta}>
                  <label htmlFor="password">Contraseña</label>
                  <ErrorMessage name="password" component="div" className={errorCampo} />
                </div>
                <Field id="password" name="password" type="password" className={inputUp} />
              </div>
              <div className={campo}>
                <div className={etiqueta}>
                  <label htmlFor="confirmPassword">Confirmar contraseña</label>
                  <ErrorMessage name="confirmPassword" component="div" className={errorCampo} />
                </div>
                <Field id="confirmPassword" name="confirmPassword" type="password" className={inputUp} />
              </div>
              <div className="flex flex-row items-center gap-2 text-[0.9rem] text-tinta-suave">
                <Field type="checkbox" id="acceptedTerms" name="acceptedTerms" />
                <label htmlFor="acceptedTerms">
                  Acepto los <a href="#" className="font-semibold text-brand underline-offset-4 hover:underline">términos y condiciones</a>
                </label>
              </div>
              <button
                type="submit"
                className={boton}
                disabled={!values.acceptedTerms || !isValid || isSubmitting}
              >
                Registrarse
              </button>
              <p className="my-2 text-[0.92rem] text-tinta-suave">
                ¿Ya tiene una cuenta?{' '}
                <a href="#" className="font-semibold text-brand underline-offset-4 hover:underline" onClick={(e) => { e.preventDefault(); switchTo('signin', values.email); }}>
                  ¡Inicie sesión ya!
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </Frame>
    );
  }

  // mode === 'forgot'
  return (
    <Frame onClose={close} adOnLeft={true} illustration="/Illustration_1.png">
      <Formik
        initialValues={{ email: initialEmail }}
        validationSchema={ForgotSchema}
        validateOnMount={true}
        onSubmit={handleForgot}
      >
        {({ isValid, values, isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className={tituloIn}>Recupera tu acceso</div>
            <p className="m-0 text-[0.92rem] leading-relaxed text-tinta-suave">
              Te enviaremos un enlace para restablecer tu contraseña. Si entraste con Google, también
              sirve para crear una contraseña y poder usar ambos métodos.
            </p>
            <div className={campo}>
              <div className={etiqueta}>
                <label htmlFor="email">Correo</label>
                <ErrorMessage name="email" component="div" className={errorCampo} />
              </div>
              <Field id="email" name="email" type="email" className={inputIn} />
            </div>
            <button type="submit" className={boton} disabled={!isValid || isSubmitting}>
              Enviar enlace
            </button>
            <p className="my-2 text-[0.92rem] text-tinta-suave">
              <a href="#" className="font-semibold text-brand underline-offset-4 hover:underline" onClick={(e) => { e.preventDefault(); switchTo('signin', values.email); }}>
                Volver a iniciar sesión
              </a>
            </p>
          </Form>
        )}
      </Formik>
    </Frame>
  );
};

export default AuthModals;
