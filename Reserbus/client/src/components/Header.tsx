import { useState } from 'react';
import { useClient,Viajero, Administrador, Empresa } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName,SignInValues,SignUpValues } from '../util/ClientUtil';
import { SearchValues } from '../util/BuscarViajeUtil';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { AxiosError } from 'axios';
import './Header.scss';

export interface NavOption {
  label: string;
  path: string;
}

export interface HeaderProps {
  navOptions?: NavOption[];
}

const Header = ({ navOptions = [] }: HeaderProps) => {
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {client,clientType,login,logout } = useClient();
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [showSignUpModal, setShowSignUpModal] = useState<boolean>(false);
  const [sharedFormData, setSharedFormData] = useState<{ email: string }>({ email: '' });
  
  const closeModal = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
    setSharedFormData({ email: '' });
  }

  const SignInSchema = Yup.object().shape({
    email: Yup.string().email('Correo inválido').required('Requerido'),
    password: Yup.string().required('Requerido'),
  });

  const handleSignIn = async (
    values: SignInValues,
    { setSubmitting, setFieldError, setFieldValue }: FormikHelpers<SignInValues>
  ) => {
    const endpoints = [
      { url: `${API}/api/viajeros/signin`, clientType: 'VIAJERO' },
      { url: `${API}/api/empresas/signin`, clientType: 'EMPRESA' },
      { url: `${API}/api/administradores/signin`, clientType: 'ADMINISTRADOR' },
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
          closeModal();
          if(clientType === 'VIAJERO') navigate('/');
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
    email: Yup.string().email('Correo inválido').required('Requerido'),
    password: Yup.string().min(6,'Minimo 6 caracteres').required('Requerido'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')],'Las contraseñas no coinciden')
      .required('Requerido'),
    nombres: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras').required('Requerido'),
    apellidos: Yup.string().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras').required('Requerido'),
    acceptedTerms: Yup.boolean()
      .oneOf([true], 'Debes aceptar los términos y condiciones'),
  });

  const handleSignUp = async (
    values: SignUpValues,
    { setSubmitting, setFieldError, setFieldValue }: FormikHelpers<SignUpValues>
  ) => {
    try {
      const response = await axios.post(`${API}/api/viajeros/signup`, {
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
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleLogoClick = () => {
    if (!clientType) {
      navigate('/');
      return;
    }

    switch (clientType) {
      case 'ADMINISTRADOR':
        navigate('/admin');
        break;
      case 'EMPRESA':
        navigate('/empresa');
        break;
      default:
        navigate('/');
    }
  };

  const handleClientOptionClick = () => {
    if (!client) {
      setShowSignInModal(true);
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <div className="c-navbar">
      <div className="logo" onClick={handleLogoClick}>
        <img src="/RB_LogoWhite.png" alt="logo-icon" />
        <span>reserbus</span>
      </div>
      <div className="options">
        <div className='regular'>
          {navOptions.map((link, index) => (
            <button key={index} onClick={() => navigate(link.path)}>
              {link.label}
            </button>
          ))}
        </div>
        <div className="client">
          <button className="profile" onClick={handleClientOptionClick}>
            {!client ? (
              <>
                <span>Iniciar</span>
                <img src="/Icon_Account.svg" alt="icon-profile" className="icon-profile" />
              </>
            ) : (
              <>
                <span className="name">{formattedClientName(client)}</span>
                {clientType == 'EMPRESA' && (
                  <img  src= {(client as Empresa).logo ? (client as Empresa).logo : "/Icon_Account.svg"} alt="company-icon" className="company-icon" />
                )}
                {clientType == 'ADMINISTRADOR' && (
                  <img  src= {(client as Administrador).foto ? (client as Administrador).foto : "/Icon_Account.svg"} alt="admin-icon" className="admin-icon" />
                )}
              </>
            )}
          </button>
          {client && !isMenuOpen && (
            <div className="menu-ddl">
              {clientType == 'VIAJERO' && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/MyAccount');
                  }}
                >
                  Mis Viajes
                </button>
              )}
              <button onClick={handleSignOut}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
      {/* SignInModal */}
      {showSignInModal && (
      <div className='auth-modal'>
        <div className="overlay" onClick={() => closeModal()}>
          <div className="content" onClick={(e) => e.stopPropagation()}>
            <button className="closer" onClick={() => closeModal()}>✖</button>
            <div className="ad-side">
              <img src="/RB_LogoWhite.png" alt="logo-icon" className="logo-icon"/>
              <div className="logo-title">Reserbus</div>
              <img src="/Illustration_1.png" alt="illustration" className="illustration"/>
            </div>
            <div className="form-side">
              <Formik
                initialValues={{ email: sharedFormData.email || '', password: '' }}
                validationSchema={SignInSchema}
                validateOnMount={true}
                onSubmit={handleSignIn}
              >
              {({isValid, values}) => (
                <Form className="form-signin">
                  <div className="title">¡Todos a bordo!</div>
                  <div className="text-item">
                    <div className="label">
                      <label htmlFor="email">Correo</label>
                      <ErrorMessage name="email" component="div" className="field-error"/>
                    </div>
                    <Field id="email" name="email" type="email"/>
                  </div>
                  <div className="text-item">
                    <div className="label">
                      <label htmlFor="password">Contraseña</label>
                      <ErrorMessage name="password" component="div" className="field-error"/>
                    </div>
                    <Field id="password" name="password" type="password"/>
                  </div>
                  <a href="#">¿Olvidó su contraseña?</a>
                  <button type="submit" className="submitter" disabled = {!isValid}>Iniciar sesión</button>
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
      </div>
      )}
      {/* SignUpModal */}
      {showSignUpModal && (
      <div className='auth-modal'>
        <div className="overlay" onClick={() => closeModal()}>
          <div className="content" onClick={(e) => e.stopPropagation()}>
            <button className="closer" onClick={() => closeModal()}>✖</button>
            <div className="form-side">
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
                  <div className="title">¡Regístrate y viaja sin límites!</div>
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
                  <button type="submit" className="submitter" disabled = {!values.acceptedTerms || !isValid}>Registrarse</button>
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
          <div className="ad-side">
              <img src="/RB_LogoWhite.png" alt="logo-icon" className="logo-icon" />
              <div className="logo-title">Reserbus</div>
              <img src="/Illustration_2.png" alt="illustration" className="illustration" />
          </div>
          </div>
      </div>
    </div>
    )}
    </div>
  );
};

export default Header;
