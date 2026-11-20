import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Armchair, Search as IconoBuscar, Ticket } from 'lucide-react';
import Pagina from '../../../../components/layout/Pagina';
import Hero3D from '../../../../components/three/Hero3D';
import Aviso from '../../../../components/ui/Aviso';
import BuscadorViaje from '../../components/BuscadorViaje';
import { listarTerminales } from '../../services/UbicacionService';
import { SearchValues, Terminal } from '../../utils/BuscarViajeUtil';
import AcercaDeSection from '../../../static/components/AcercaDeSection';
import ContactoSection from '../../../static/components/ContactoSection';

const pasos = [
  { Icono: IconoBuscar, titulo: 'Busca tu ruta', texto: 'Elige terminal de origen, destino y fecha. Te mostramos directos y combinaciones.' },
  { Icono: Armchair, titulo: 'Elige tu asiento', texto: 'Abre el mapa del bus y marca el asiento de cada pasajero. Lo retenemos 10 minutos.' },
  { Icono: Ticket, titulo: 'Confirma y listo', texto: 'Revisa el resumen y confirma. Tu código de reserva queda en Mis viajes.' },
];

function Home() {
  const navigate = useNavigate();
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [errorTerminales, setErrorTerminales] = useState(false);

  useEffect(() => {
    listarTerminales().then(setTerminales).catch(() => setErrorTerminales(true));
  }, []);

  // La búsqueda vive en la URL: así se puede recargar y cambiar de fecha desde los resultados
  const buscar = (v: SearchValues) => {
    const q = new URLSearchParams({ origen: v.origen, destino: v.destino, fecha: v.salida, pasajeros: String(v.pasajeros) });
    navigate(`/resultados?${q.toString()}`);
  };

  return (
    <Pagina>
      {/* HERO */}
      <section className="relative grid items-center gap-2 pb-6 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-12">
        <div className="relative z-10">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[1.04] tracking-tight">
            <span className="block text-tinta">Del terminal al destino,</span>
            <span className="block text-brand">con tu asiento ya elegido.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-[32rem] text-[1.15rem] leading-relaxed text-tinta-suave">
            Compara empresas, combina rutas cuando no hay bus directo y reserva en el mapa del bus.
          </motion.p>
        </div>
        <div className="relative h-[340px] sm:h-[440px] lg:h-[540px]">
          <Hero3D />
        </div>
      </section>

      {/* BUSCADOR */}
      <div className="relative z-10 -mt-4 lg:-mt-10">
        <BuscadorViaje terminales={terminales} onBuscar={buscar} />
        {errorTerminales && <div className="mt-4"><Aviso tipo="error">No pudimos cargar los terminales. Revisa tu conexión y recarga la página.</Aviso></div>}
      </div>

      {/* CÓMO FUNCIONA: es una secuencia real, por eso va numerada */}
      <section className="py-20">
        <h2 className="mb-10 max-w-[28rem] font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-bold leading-tight tracking-tight">Reservar toma tres pasos</h2>
        <ol className="relative m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          <div aria-hidden className="absolute left-[10%] right-[10%] top-7 hidden border-t-2 border-dashed border-brand/30 md:block" />
          {pasos.map(({ Icono, titulo, texto }, i) => (
            <li key={titulo} className="vidrio relative rounded-3xl p-6">
              <span className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-brillo">
                <Icono className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-senal font-display text-[0.7rem] font-bold text-tinta">{i + 1}</span>
              </span>
              <h3 className="mb-2 font-display text-[1.05rem] font-bold">{titulo}</h3>
              <p className="text-[0.98rem] leading-relaxed text-tinta-suave">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CONEXIONES: lo que diferencia a Reserbus */}
      <section className="vidrio grid items-center gap-10 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-tight tracking-tight">Un viaje, dos empresas</h2>
          <p className="mt-4 max-w-[30rem] text-[1.05rem] leading-relaxed text-tinta-suave">
            ¿Tu destino no tiene bus directo? Unimos el tramo de una empresa con el de otra en el terminal donde se cruzan, siempre con tiempo suficiente para el trasbordo.
          </p>
        </div>
        <svg viewBox="0 0 520 150" role="img" aria-label="Ejemplo: tramo de la empresa A hasta el terminal B y tramo de la empresa B hasta el terminal D" className="w-full">
          <line x1="40" y1="75" x2="260" y2="75" stroke="#4f2ff0" strokeWidth="6" strokeLinecap="round" />
          <line x1="260" y1="75" x2="480" y2="75" stroke="#ff5a1f" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 14" />
          {[[40, 'A'], [260, 'B'], [480, 'D']].map(([x, t]) => (
            <g key={t as string}>
              <circle cx={x as number} cy="75" r="16" fill="#fff" stroke="#1b1647" strokeWidth="3" />
              <text x={x as number} y="81" textAnchor="middle" fontFamily="Unbounded Variable, sans-serif" fontWeight="700" fontSize="15" fill="#1b1647">{t}</text>
            </g>
          ))}
          <text x="150" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="#4f2ff0">Empresa 1</text>
          <text x="370" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="#c93a07">Empresa 2</text>
          <text x="260" y="124" textAnchor="middle" fontSize="13" fontWeight="600" fill="#5d5890">Trasbordo en B</text>
        </svg>
      </section>

      <AcercaDeSection />
      <ContactoSection />
    </Pagina>
  );
}

export default Home;
