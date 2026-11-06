import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useClient } from '../../ClientContext';
import { SignInValues, SignUpValues } from '../../utils/ClientUtil';
import './AuthModals.scss';

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

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

interface FrameProps {
  onClose: () => void;
  adOnLeft: boolean;
  illustration: string;
  children: ReactNode;
}

const Frame = ({ onClose, adOnLeft, illustration, children }: FrameProps) => {
  const ad = (
    <div className="ad-side">
      <img src="/RB_LogoWhite.png" alt="logo-icon" className="logo-icon" />
      <div className="logo-title">Reserbus</div>
      <img src={illustration} alt="illustration" className="illustration" />
    </div>
  );
  return (
    <div className="auth-modal">
      <div className="overlay" onClick={onClose}>
        <div className="content" onClick={(e) => e.stopPropagation()}>
          <button className="closer" onClick={onClose}>✖</button>
          {adOnLeft && ad}
          <div className="form-side">{children}</div>
          {!adOnLeft && ad}
        </div>
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
      else navigate('/');
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
        <div className="title">{notice.title}</div>
        <p className="notice">{notice.text}</p>
        <button type="button" className="submitter" onClick={close}>Entendido</button>
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
            <Form className="form-signin">
              <div className="title">¡Todos a bordo!</div>
              <button type="button" className="google-btn" onClick={() => signInWithGoogle()}>
                <GoogleIcon /> Continuar con Google
              </button>
              <div className="divider">o con tu correo</div>
              <div className="text-item">
                <div className="label">
                  <label htmlFor="email">Correo</label>
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>
                <Field id="email" name="email" type="email" />
              </div>
              <div className="text-item">
                <div className="label">
                  <label htmlFor="password">Contraseña</label>
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>
                <Field id="password" name="password" type="password" />
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); switchTo('forgot', values.email); }}>
                ¿Olvidó su contraseña?
              </a>
              <button type="submit" className="submitter" disabled={!isValid || isSubmitting}>
                Iniciar sesión
              </button>
              <p>
                ¿No tiene una cuenta?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); switchTo('signup', values.email); }}>
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
            <Form className="form-signup">
              <div className="title">¡Regístrate y viaja sin límites!</div>
              <button type="button" className="google-btn" onClick={() => signInWithGoogle()}>
                <GoogleIcon /> Registrarse con Google
              </button>
              <div className="divider">o con tu correo</div>
              <div className="text-item">
                <div className="label">
                  <label htmlFor="email">Correo electrónico</label>
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>
                <Field id="email" name="email" type="email" />
              </div>
              <div className="row-wrapper">
                <div className="text-item">
                  <div className="label">
                    <label htmlFor="nombres">Nombres</label>
                    <ErrorMessage name="nombres" component="div" className="field-error" />
                  </div>
                  <Field id="nombres" name="nombres" type="text" />
                </div>
                <div className="text-item">
                  <div className="label">
                    <label htmlFor="apellidos">Apellidos</label>
                    <ErrorMessage name="apellidos" component="div" className="field-error" />
                  </div>
                  <Field id="apellidos" name="apellidos" type="text" />
                </div>
              </div>
              <div className="text-item">
                <div className="label">
                  <label htmlFor="password">Contraseña</label>
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>
                <Field id="password" name="password" type="password" />
              </div>
              <div className="text-item">
                <div className="label">
                  <label htmlFor="confirmPassword">Confirmar contraseña</label>
                  <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                </div>
                <Field id="confirmPassword" name="confirmPassword" type="password" />
              </div>
              <div className="checkbox-item">
                <Field type="checkbox" id="acceptedTerms" name="acceptedTerms" />
                <label htmlFor="acceptedTerms">
                  Acepto los <a href="#">términos y condiciones</a>
                </label>
              </div>
              <button
                type="submit"
                className="submitter"
                disabled={!values.acceptedTerms || !isValid || isSubmitting}
              >
                Registrarse
              </button>
              <p>
                ¿Ya tiene una cuenta?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); switchTo('signin', values.email); }}>
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
          <Form className="form-signin">
            <div className="title">Recupera tu acceso</div>
            <p className="hint">
              Te enviaremos un enlace para restablecer tu contraseña. Si entraste con Google, también
              sirve para crear una contraseña y poder usar ambos métodos.
            </p>
            <div className="text-item">
              <div className="label">
                <label htmlFor="email">Correo</label>
                <ErrorMessage name="email" component="div" className="field-error" />
              </div>
              <Field id="email" name="email" type="email" />
            </div>
            <button type="submit" className="submitter" disabled={!isValid || isSubmitting}>
              Enviar enlace
            </button>
            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); switchTo('signin', values.email); }}>
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
