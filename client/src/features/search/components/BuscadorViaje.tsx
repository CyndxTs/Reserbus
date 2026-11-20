import { ReactNode, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import { ArrowLeftRight, CalendarDays, ChevronDown, MapPin, Minus, Plus, Search, Users } from 'lucide-react';
import { MAX_PASAJEROS, SearchValues, Terminal, hoyLocal } from '../utils/BuscarViajeUtil';
import { btnPrimario, errorCampo } from '../../../lib/estilos';

const Schema = Yup.object().shape({
  origen: Yup.string().required('Elige el origen'),
  destino: Yup.string().required('Elige el destino').notOneOf([Yup.ref('origen')], 'Debe ser distinto al origen'),
  salida: Yup.string().required('Elige la fecha').test('no-pasada', 'La fecha ya pasó', (v) => !v || v >= hoyLocal()),
  pasajeros: Yup.number().min(1, 'Mínimo 1').max(MAX_PASAJEROS, `Máximo ${MAX_PASAJEROS}`).required('Requerido'),
});

const celda = 'group relative flex min-w-0 flex-col rounded-2xl px-4 pb-2 pt-3 transition hover:bg-brand-soft/60 focus-within:bg-brand-soft/60';
const rotulo = 'mb-0.5 flex items-center gap-1.5 text-[0.75rem] font-semibold text-tinta-suave [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:text-brand';
const control = 'w-full min-w-0 cursor-pointer appearance-none truncate border-0 bg-transparent p-0 pr-5 text-[1.02rem] font-semibold text-tinta focus:outline-none';

interface Props {
  terminales: Terminal[];
  inicial?: Partial<SearchValues>;
  enviando?: boolean;
  onBuscar: (v: SearchValues) => void | Promise<void>;
  extra?: ReactNode;
}

// Buscador con forma de pase de abordar: origen ⇄ destino, fecha, pasajeros
const BuscadorViaje = ({ terminales, inicial, enviando, onBuscar, extra }: Props) => {
  const grupos = useMemo(() => {
    const m = new Map<string, Terminal[]>();
    terminales.forEach((t) => {
      const k = t.Provincia?.nombre ?? 'Otros';
      m.set(k, [...(m.get(k) ?? []), t]);
    });
    return [...m.entries()];
  }, [terminales]);

  const opciones = (
    <>
      <option value="">Elige un terminal</option>
      {grupos.map(([prov, lista]) => (
        <optgroup key={prov} label={prov}>
          {lista.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </optgroup>
      ))}
    </>
  );

  return (
    <Formik<SearchValues>
      initialValues={{ origen: '', destino: '', salida: hoyLocal(), pasajeros: 1, ...inicial }}
      enableReinitialize
      validationSchema={Schema}
      onSubmit={async (v, { setSubmitting }) => { await onBuscar(v); setSubmitting(false); }}
    >
      {({ values, setFieldValue, isValid, isSubmitting }: FormikProps<SearchValues>) => (
        <Form noValidate className="vidrio rounded-[1.75rem] p-2.5">
          <div className="grid items-stretch gap-1.5 lg:grid-cols-[1.4fr_auto_1.4fr_1fr_0.9fr_auto]">
            <div className={celda}>
              <label htmlFor="origen" className={rotulo}><MapPin /> Origen</label>
              <Field as="select" id="origen" name="origen" className={control}>{opciones}</Field>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-4 h-4 w-4 text-tinta-suave" />
              <ErrorMessage name="origen" component="div" className={errorCampo} />
            </div>

            <button type="button" aria-label="Intercambiar origen y destino"
              onClick={() => { setFieldValue('origen', values.destino); setFieldValue('destino', values.origen); }}
              className="mx-auto my-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand/20 bg-white text-brand transition hover:rotate-180 hover:border-brand hover:bg-brand hover:text-white max-lg:-my-3 max-lg:rotate-90 max-lg:hover:rotate-[270deg]">
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className={celda}>
              <label htmlFor="destino" className={rotulo}><MapPin /> Destino</label>
              <Field as="select" id="destino" name="destino" className={control}>{opciones}</Field>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-4 h-4 w-4 text-tinta-suave" />
              <ErrorMessage name="destino" component="div" className={errorCampo} />
            </div>

            <div className={celda}>
              <label htmlFor="salida" className={rotulo}><CalendarDays /> Salida</label>
              <Field id="salida" name="salida" type="date" min={hoyLocal()} className={control} />
              <ErrorMessage name="salida" component="div" className={errorCampo} />
            </div>

            <div className={celda}>
              <span id="lbl-pasajeros" className={rotulo}><Users /> Pasajeros</span>
              <div className="flex items-center justify-between gap-2" role="group" aria-labelledby="lbl-pasajeros">
                <button type="button" aria-label="Menos pasajeros" disabled={values.pasajeros <= 1}
                  onClick={() => setFieldValue('pasajeros', values.pasajeros - 1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-brand/25 bg-white text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-display text-[1.05rem] font-bold" aria-live="polite">{values.pasajeros}</span>
                <button type="button" aria-label="Más pasajeros" disabled={values.pasajeros >= MAX_PASAJEROS}
                  onClick={() => setFieldValue('pasajeros', values.pasajeros + 1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-brand/25 bg-white text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <button type="submit" disabled={!isValid || isSubmitting || enviando} className={`${btnPrimario} min-h-14 lg:px-7`}>
              <Search className="h-5 w-5" /> {isSubmitting || enviando ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
          {extra}
        </Form>
      )}
    </Formik>
  );
};

export default BuscadorViaje;
