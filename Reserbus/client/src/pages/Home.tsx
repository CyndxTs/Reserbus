import { useClient } from '../context/ClientContext';
import { formattedClientName,SignInValues,SignUpValues } from '../util/ClientUtil';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { AxiosError } from 'axios';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { login,logout } = useClient();
  const { client, clientType } = useClient();
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [showSignUpModal, setShowSignUpModal] = useState<boolean>(false);
  const [sharedFormData, setSharedFormData] = useState<{ email: string }>({ email: '' });
  const closeModal = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
    setSharedFormData({ email: '' });
  }
  const SignInSchema = Yup.object().shape({
    email: Yup.string().email('Correo inválido').required('Campo requerido'),
    password: Yup.string().required('Campo requerido'),
  });
  const handleSignIn = async (
    values: SignInValues,
    { setSubmitting, setFieldError, setFieldValue }: FormikHelpers<SignInValues>
  ) => {
    const endpoints = [
      { url: '/api/viajeros/signin', clientType: 'VIAJERO' },
      { url: '/api/empresas/signin', clientType: 'EMPRESA' },
      { url: '/api/administradores/signin', clientType: 'ADMINISTRADOR' },
    ];
    try {
      for (const { url, clientType } of endpoints) {
        try {
          const response = await axios.post(url, {
            correo_electronico: values.email,
            contrasenia: values.password,
          });
          const clientData = response.data[clientType.toLowerCase()];
          login(clientData, clientType);
          if(clientType === 'VIAJERO') closeModal();
          else if(clientType === 'EMPRESA') navigate('/empresa');
          else if(clientType === 'ADMINISTRADOR') navigate('/admin');
          return;
        } catch (error) {
          const err = error as AxiosError<{ error: string }>;
          if (err.response?.status == 500) throw err;
        }
      }
      setFieldError('password','');
      setFieldValue('password','',false);
      setFieldError('email','Datos inválidos');
    } catch (e) {
      setFieldError('password', '');
      setFieldValue('password','',false);
      setFieldError('email','Error del servidor');
    } finally {
      setSubmitting(false);
    }
  };
  const SignUpSchema = Yup.object().shape({
    email: Yup.string().email('Correo inválido').required('Campo requerido'),
    password: Yup.string().min(6,'Minimo 6 caracteres').required('Campo requerido'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')],'Las contraseñas no coinciden')
      .required('Campo requerido'),
    nombres: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras').required('Campo requerido'),
    apellidos: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras').required('Campo requerido'),
    acceptedTerms: Yup.boolean()
      .oneOf([true], 'Debes aceptar los términos y condiciones'),
  });
  const handleSignUp = async (
    values: SignUpValues,
    { setSubmitting, setFieldError, setFieldValue }: FormikHelpers<SignUpValues>
  ) => {
    try {
      const response = await axios.post('/api/viajeros/signup', {
        correo_electronico: values.email,
        contrasenia: values.password,
        nombres: values.nombres,
        apellidos: values.apellidos,
      });
      const viajero = response.data.viajero;
      login(viajero,'VIAJERO');
      closeModal();
    } catch (e) {
      const error = e as AxiosError<{ error: string }>;
      if (error.response?.status === 409) setFieldError('email', 'Correo ya registrado');
      else setFieldError('email', 'Error del servidor');
      setFieldError('password', '');
      setFieldValue('password','',false);
      setFieldError('confirmPassword', '');
      setFieldValue('confirmPassword','',false);
    } finally {
      setSubmitting(false);
    }
  };
  const handleSignOut = () => {
    logout();
  };

  return (
    <div>
      {/* Barra de navegacion */}
      <div className="navbar">
        <div className="navbar-logo">
          <img src="/RB_LogoWhite.png" alt="icon-reserbus"/>
          <span>reserbus</span>
        </div>
        <div className="navbar-links">
          <button>Contacto</button>
          <button>Acerca de nosotros</button>
          <div className="client-menu-wrapper">
            <button className="open-modal-signin" onClick={() => { if(!client) setShowSignInModal(true); }}>
              {!client ? (
                <>
                  <span>Iniciar</span>
                  <img src="/Icon_Account.svg" alt="user-profile" className="profile-icon" />
                </>
              ) : (
                <>
                  <span className="client-name">{formattedClientName(client)}</span>
                </>
              )}
            </button>
            {client && (
              <div className="client-menu-ddl">
                <button>Cuenta</button>
                <button onClick={handleSignOut}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Slogan */}
      <div className="slogan">
        <div className="slogan-title">
          reserva fácil,<br />viaja fácil
        </div>
        <div className="slogan-subtitle">
          Llega a tu destino en el bus que necesites, cuando lo necesites y al mejor precio
        </div>
      </div>
      {/* Search */}
      <div className="search">
        <div className="search-item">
            <input type="text" placeholder="Desde"/>
        </div>
        <div className="search-item">
            <input type="text" placeholder="Hasta"/>
        </div>
        <div className="search-item">
            <input type="date"/>
        </div>
        <div className="search-item">
            <input type="date"/>
        </div>
        <div className="search-item">
            <input type="number" placeholder="Pasajeros"/>
        </div>
        <button>
          <img src="/Icon_Search.svg" alt="icon-search"/>
        </button>
      </div>
      {/* Features */}
      <div className="features">
        <div className="features-content">
          <img src="/ilustration_3.png" alt="ilustration" className="content-ilustration" />
          <div className="content-detail">
            <div className="detail-title">¡Un viaje a tu gusto!</div>
            <p>
              Reserbus te facilita el proceso de reservar un asiento sin esperar largas colas o papeleo.
              Reserva desde la comodidad de tu casa de la manera más rápida, práctica y segura.
            </p>
            <div className="detail-item">
              <img src="/Icon_Star.svg" alt="icon-star"/>
              <p>Elige entre las mejores empresas de transporte.</p>
            </div>
            <div className="detail-item">
              <img src="/Icon_Dollar.svg" alt="icon-dollar" className="icon-dollar"/>
              <p className="p-dollar">Usa el medio de pago que prefieras.</p>
            </div>
            <div className="detail-item">
              <img src="/Icon_Position.svg" alt="icon-position"/>
              <p>Rutas a más de 80 destinos en el país.</p>
            </div>
          </div>
        </div>
      </div>
      {/* SignInModal */}
      {showSignInModal && (
      <div className="modal-overlay" onClick={() => closeModal()}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal" onClick={() => closeModal()}>✖</button>
          <div className="advertisement-side">
            <img src="/RB_LogoWhite.png" alt="logo-icon" className="logo-icon"/>
            <div className="logo-title">Reserbus</div>
            <img src="/Illustration_1.png" alt="illustration" className="illustration"/>
          </div>
          <div className="form-side">
            <div className="title-signin">¡Todos a bordo!</div>
            <Formik
              initialValues={{ email: sharedFormData.email || '', password: '' }}
              validationSchema={SignInSchema}
              validateOnMount={true}
              onSubmit={handleSignIn}
            >
              {({isValid, values}) => (
                <Form className="form-signin">
                  <div className="text-field">
                    <div className="label-item">
                      <label htmlFor="email">Correo</label>
                      <ErrorMessage name="email" component="div" className="field-error"/>
                    </div>
                    <Field id="email" name="email" type="email"/>
                  </div>
                  <div className="text-field">
                    <div className="label-item">
                      <label htmlFor="password">Contraseña</label>
                      <ErrorMessage name="password" component="div" className="field-error"/>
                    </div>
                    <Field id="password" name="password" type="password"/>
                  </div>
                  <a href="#">¿Olvidó su contraseña?</a>
                  <button type="submit" className="submit-button" disabled = {!isValid}>Iniciar sesión</button>
                  <p>
                    ¿No tiene una cuenta?{' '}
                    <a
                      href="#"
                      onClick={() => {
                        setSharedFormData({ email: values.email });
                        setShowSignUpModal(true);
                        setShowSignInModal(false);
                      }}
                    >
                      ¡Regístrate!
                    </a>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      )}
      {/* SignUpModal */}
      {showSignUpModal && (
      <div className="modal-overlay" onClick={() => closeModal()}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal" onClick={() => closeModal()}>✖</button>
          <div className="form-side">
            <div className="title-signup">¡Regístrate y viaja sin límites!</div>
            <Formik
              initialValues={{
                email: sharedFormData.email || '',
                password: '',
                nombres: '',
                apellidos: '',
                confirmPassword: '',
                acceptedTerms: false,
              }}
              validationSchema={SignUpSchema}
              onSubmit={handleSignUp}
            >
              {({isValid, values}) => (
                <Form className="form-signup">
                  <div className="text-field">
                    <div className="label-item">
                      <label htmlFor="email">Correo electrónico</label>
                      <ErrorMessage name="email" component="div" className="field-error" />
                    </div>
                    <Field id="email" name="email" type="email" />
                  </div>
                  <div className="text-fields-row">
                    <div className="text-field">
                      <div className="label-item">
                        <label htmlFor="nombres">Nombres</label>
                        <ErrorMessage name="nombres" component="div" className="field-error" />
                      </div>
                      <Field id="nombres" name="nombres" type="text" />
                    </div>
                    <div className="text-field">
                      <div className="label-item">
                        <label htmlFor="apellidos">Apellidos</label>
                        <ErrorMessage name="apellidos" component="div" className="field-error" />
                      </div>
                      <Field id="apellidos" name="apellidos" type="text" />
                    </div>
                  </div>
                  <div className="text-field">
                    <div className="label-item">
                      <label htmlFor="password">Contraseña</label>
                      <ErrorMessage name="password" component="div" className="field-error" />
                    </div>
                    <Field id="password" name="password" type="password" />
                  </div>
                  <div className="text-field">
                    <div className="label-item">
                      <label htmlFor="confirmPassword">Confirmar contraseña</label>
                      <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                    </div>
                    <Field id="confirmPassword" name="confirmPassword" type="password" />
                  </div>
                  <div className="checkbox-field">
                    <Field type="checkbox" id="acceptedTerms" name="acceptedTerms" />
                    <label htmlFor="acceptedTerms">
                      Acepto los <a href="#">términos y condiciones</a>
                    </label>
                  </div>
                  <button type="submit" className="submit-button" disabled = {!values.acceptedTerms || !isValid}>Registrarse</button>
                  <p>
                    ¿Ya tiene una cuenta?{' '}
                    <a
                      href="#"
                      onClick={() => {
                        setSharedFormData({ email: values.email });
                        setShowSignInModal(true);
                        setShowSignUpModal(false);
                      }}
                    >
                      ¡Inicie sesión ya!
                    </a>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
          <div className="advertisement-side">
            <img src="/RB_LogoWhite.png" alt="logo-icon" className="logo-icon" />
            <div className="logo-title">Reserbus</div>
            <img src="/Illustration_2.png" alt="illustration" className="illustration" />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default Home;
