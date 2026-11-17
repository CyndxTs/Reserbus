import { useEffect, useState } from 'react';
import { SearchValues, Terminal } from '../../utils/BuscarViajeUtil';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import AcercaDeSection from '../../../static/components/AcercaDeSection';
import ContactoSection from '../../../static/components/ContactoSection';
import Header from '../../../../components/layout/Header/Header';

function Home() {
  const navigate = useNavigate();
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  useEffect(() => {
    axios.get<Terminal[]>('/api/terminales').then((r) => setTerminales(r.data)).catch(() => setTerminales([]));
  }, []);
  const nombreTerminal = (id: string) => terminales.find((t) => String(t.id) === id)?.nombre ?? id;
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
    setErrorBusqueda(null);
    try {
      const { data } = await axios.get('/api/busqueda', {
        params: { origen: values.origen, destino: values.destino, fecha: values.salida, pasajeros: values.pasajeros },
      });
      navigate('/resultados', {
        state: {
          resultados: data.resultados,
          parametros: {
            origen: nombreTerminal(values.origen),
            destino: nombreTerminal(values.destino),
            fecha_salida: values.salida,
            pasajeros: values.pasajeros,
          },
        },
      });
    } catch (e) {
      console.error('Error en la búsqueda:', e);
      setErrorBusqueda('No se pudo realizar la búsqueda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* componente Header */}
      <Header />
      {/* Slogan */}
      <div className="mt-5 p-5">
        <div className="text-[72px] font-bold text-brand">
          reserva fácil,<br />viaja fácil
        </div>
        <div className="mt-4 text-[24px] text-[#6a6a6a]">
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
      <Form className="mx-auto flex w-full max-w-[1250px] flex-wrap items-center gap-6 rounded-full bg-white px-8 py-[1.2rem] shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
        <div className="relative flex min-h-[90px] flex-col items-start">
          <label htmlFor="origen" className="mb-[5px] text-[14px] font-medium text-[#333]">Origen</label>
          <Field as="select" name="origen" className="min-w-[180px] rounded-xl border-2 border-[#ccc] p-3">
            <option value="">Seleccione...</option>
            {terminales.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Field>
          <ErrorMessage name="origen" component="div" className="relative -mt-2 h-5 self-center text-[12px] font-bold text-red-600" />
        </div>
        <div className="relative flex min-h-[90px] flex-col items-start">
          <label htmlFor="destino" className="mb-[5px] text-[14px] font-medium text-[#333]">Destino</label>
          <Field as="select" name="destino" className="min-w-[180px] rounded-xl border-2 border-[#ccc] p-3">
            <option value="">Seleccione...</option>
            {terminales.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Field>
          <ErrorMessage name="destino" component="div" className="relative -mt-2 h-5 self-center text-[12px] font-bold text-red-600" />
        </div>
        <div className="relative flex min-h-[90px] flex-col items-start">
          <label htmlFor="salida" className="mb-[5px] text-[14px] font-medium text-[#333]">Fecha de salida</label>
          <Field type="date" name="salida" className="min-w-[180px] rounded-xl border-2 border-[#ccc] p-3" />
          <ErrorMessage name="salida" component="div" className="relative -mt-2 h-5 self-center text-[12px] font-bold text-red-600" />
        </div>
        <div className="relative flex min-h-[90px] flex-col items-start">
          <label htmlFor="regreso" className="mb-[5px] text-[14px] font-medium text-[#333]">Fecha de retorno (opcional)</label>
          <Field type="date" name="regreso" className="min-w-[180px] rounded-xl border-2 border-[#ccc] p-3" />
          <ErrorMessage name="regreso" component="div" className="relative -mt-2 h-5 self-center text-[12px] font-bold text-red-600" />
        </div>
        <div className="relative flex min-h-[90px] flex-col items-start">
          <label htmlFor="pasajeros" className="mb-[5px] text-[14px] font-medium text-[#333]">Num. Pasajeros</label>
          <Field type="number" name="pasajeros" placeholder="Pasajeros" min="1" className="min-w-[180px] rounded-xl border-2 border-[#ccc] p-3" />
          <ErrorMessage name="pasajeros" component="div" className="relative -mt-2 h-5 self-center text-[12px] font-bold text-red-600" />
        </div>
        <button type="submit" className="cursor-pointer rounded-xl border-0 bg-brand px-4 py-3 text-[16px] text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!isValid}>
        <img src="/Icon_Search.svg" alt="icon-search" className="h-6 w-6"/>
        </button>
      </Form>
      )}
      </Formik>
      {errorBusqueda && <div className="mt-2 text-[14px] font-bold text-red-600">{errorBusqueda}</div>}

      {/* Features */}
      <div className="bg-white px-24 py-8">
        <div className="flex flex-row items-center gap-[120px]">
          <img src="/Ilustration_3.png" alt="ilustration" className="w-[400px] max-w-full" />
          <div className="flex flex-1 flex-col items-start gap-1">
            <div className="mb-2 text-[36px] font-bold">¡Un viaje a tu gusto!</div>
            <p className="my-5 text-justify text-[20px] text-[#6a6a6a]">
              Reserbus te facilita el proceso de reservar un asiento sin esperar largas colas o papeleo.
              Reserva desde la comodidad de tu casa de la manera más rápida, práctica y segura.
            </p>
            <div className="flex flex-row items-center gap-3">
              <img src="/Icon_Star.svg" alt="icon-star" className="h-9 w-9"/>
              <p className="my-5 text-justify text-[20px] text-[#6a6a6a]">Elige entre las mejores empresas de transporte.</p>
            </div>
            <div className="flex flex-row items-center gap-3">
              <img src="/Icon_Dollar.svg" alt="icon-dollar" className="-ml-2 h-[52px] w-[52px]"/>
              <p className="-ml-2 my-5 text-justify text-[20px] text-[#6a6a6a]">Usa el medio de pago que prefieras.</p>
            </div>
            <div className="flex flex-row items-center gap-3">
              <img src="/Icon_Position.svg" alt="icon-position" className="h-9 w-9"/>
              <p className="my-5 text-justify text-[20px] text-[#6a6a6a]">Rutas a más de 80 destinos en el país.</p>
            </div>
          </div>
        </div>
      </div>

      <AcercaDeSection />
      <ContactoSection />
    </div>
  );
}

export default Home;
