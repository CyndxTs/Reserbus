import { ReactNode } from 'react';
import Header from './Header/Header';

// Fondo: aurora índigo + malla técnica. Va detrás del contenido (el contenedor es "isolate").
export const Fondo = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-brand/25 blur-[120px]" />
    <div className="absolute -right-32 top-24 h-[460px] w-[460px] rounded-full bg-[#8f7bff]/25 blur-[120px]" />
    <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-senal/10 blur-[130px]" />
    <div className="malla absolute inset-0" />
  </div>
);

const Pie = () => (
  <footer className="mt-24 border-t border-brand/10 px-6 py-8 text-[0.9rem] text-tinta-suave">
    <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
      <span className="font-display font-bold text-tinta">reserbus</span>
      <span>Proyecto académico PUCP. Los datos y usuarios son de prueba.</span>
    </div>
  </footer>
);

interface Props { children: ReactNode; ancho?: string; pie?: boolean }

// Estructura común de las pantallas del flujo principal
const Pagina = ({ children, ancho = 'max-w-[1280px]', pie = true }: Props) => (
  <div className="relative isolate min-h-screen bg-niebla text-left text-tinta">
    <Fondo />
    <Header />
    <main className={`mx-auto w-full ${ancho} px-4 sm:px-6`}>{children}</main>
    {pie && <Pie />}
  </div>
);

export default Pagina;
