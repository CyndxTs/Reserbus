import './Home.scss';
import { useClient } from '../context/ClientContext';
import { SearchValues } from '../util/BuscarViajeUtil';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Header from '../components/Header';

function Home() {
  const navigate = useNavigate();
  const SearchSchema = Yup.object().shape({
    origen: Yup.string().required('Campo requerido'),
    destino: Yup.string().required('Campo requerido'),
    salida: Yup.date().required('Fecha requerida'),
    regreso: Yup.date()
      .nullable()
      .notRequired()
      .when('salida', (salida, schema) => {
        // Solo aplicar min() si salida es una fecha válida
        return Array.isArray(salida) || !salida || isNaN(new Date(salida).getTime())
          ? schema
          : schema.min(salida, 'La fecha de regreso debe ser posterior a la de salida');
      }),
    pasajeros: Yup.number()
      .min(1, 'Mínimo 1 pasajero')
      .required('Campo requerido'),
  });

  const handleSearch = async (values: SearchValues, { setSubmitting, setFieldError }:FormikHelpers<SearchValues>) => {
    console.log("Formulario enviado con valores:", values);
    try {
      const searchParams = {
        origen: values.origen,
        destino: values.destino,
        fecha_salida: values.salida,
        fecha_regreso: values.regreso || null,
        pasajeros: values.pasajeros
      };
      const response = await axios.get('/api/viajes/buscar', { 
        params: searchParams 
      });
      navigate('/resultados', { 
        state: { 
          viajes: response.data.viajes,
          parametros: searchParams
        } 
      });
    } catch (e) {
      console.error('Error en la búsqueda:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-home">
      {/* componente Header */}
      <Header
        navOptions={[
          { label: 'Contacto', path: '/contacto' },
          { label: 'Acerca de nosotros', path: '/acerca-de' }
        ]}
      />
      {/* Slogan */}
      <div className="slogan">
        <div className="title">
          reserva fácil,<br />viaja fácil
        </div>
        <div className="subtitle">
          Llega a tu destino en el bus que necesites, cuando lo necesites y al mejor precio
        </div>
      </div>
      
      {/* Buscar viajes según parametros */}
      <Formik
        initialValues={{
        origen: '',
        destino: '',
        salida: '',
        regreso: '',
        pasajeros: 1,
        }}
        validationSchema={SearchSchema}
        onSubmit={handleSearch}
      >
      {({ isValid }) => (
      <Form className="search">
        <div className="text-item">
          <label htmlFor="origen" className="label">Origen</label>
          <Field type="text" name="origen" placeholder="Agregue su origen..." />
          <ErrorMessage name="origen" component="div" className="field-error" />
        </div>
        <div className="text-item">
          <label htmlFor="destino" className="label">Destino</label>
          <Field type="text" name="destino" placeholder="Agregue su destino..." />
          <ErrorMessage name="destino" component="div" className="field-error" />
        </div>
        <div className="date-item">
          <label htmlFor="salida" className="label">Fecha de salida</label>
          <Field type="date" name="salida" />
          <ErrorMessage name="salida" component="div" className="field-error" />
        </div>
        <div className="date-item">
          <label htmlFor="regreso" className="label">Fecha de retorno (opcional)</label>
          <Field type="date" name="regreso" />
          <ErrorMessage name="regreso" component="div" className="field-error" />
        </div>
        <div className="number-item">
          <label htmlFor="pasajeros" className="label">Num. Pasajeros</label>
          <Field type="number" name="pasajeros" placeholder="Pasajeros" min="1" />
          <ErrorMessage name="pasajeros" component="div" className="field-error" />
        </div>
        <button type="submit" className="submitter" disabled={!isValid}>
        <img src="/Icon_Search.svg" alt="icon-search"/>
        </button>
      </Form>
      )}
      </Formik>  

      {/* Features */}
      <div className="features">
        <div className="content">
          <img src="/ilustration_3.png" alt="ilustration" className="ilustration" />
          <div className="detail">
            <div className="title">¡Un viaje a tu gusto!</div>
            <p>
              Reserbus te facilita el proceso de reservar un asiento sin esperar largas colas o papeleo.
              Reserva desde la comodidad de tu casa de la manera más rápida, práctica y segura.
            </p>
            <div className="ft-item">
              <img src="/Icon_Star.svg" alt="icon-star"/>
              <p>Elige entre las mejores empresas de transporte.</p>
            </div>
            <div className="ft-item">
              <img src="/Icon_Dollar.svg" alt="icon-dollar" className="img-dollar"/>
              <p className="p-dollar">Usa el medio de pago que prefieras.</p>
            </div>
            <div className="ft-item">
              <img src="/Icon_Position.svg" alt="icon-position"/>
              <p>Rutas a más de 80 destinos en el país.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
