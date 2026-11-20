import { Component, ReactNode, Suspense, lazy, useMemo } from 'react';
import { useReducedMotion } from 'motion/react';

// three.js pesa: se carga aparte para no frenar el primer render
const BusScene = lazy(() => import('./BusScene'));

const hayWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
};

class Limite extends Component<{ children: ReactNode; respaldo: ReactNode }, { fallo: boolean }> {
  state = { fallo: false };
  static getDerivedStateFromError() { return { fallo: true }; }
  componentDidCatch(e: Error) { console.warn('Escena 3D desactivada:', e.message); }
  render() { return this.state.fallo ? this.props.respaldo : this.props.children; }
}

// Respaldo sin WebGL: disco de gradiente con el anillo de ruta
const Respaldo = () => (
  <div aria-hidden className="flex h-full items-center justify-center">
    <div className="relative h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_30%,#8f7bff,#4f2ff0_60%,#2f1ba8)] shadow-brillo">
      <span className="absolute -right-1 top-1/2 h-4 w-4 rounded-full bg-senal shadow-senal" />
    </div>
  </div>
);

// Contenedor del bus 3D del inicio
const Hero3D = () => {
  const reducir = useReducedMotion();
  const ok = useMemo(hayWebGL, []);
  if (!ok) return <Respaldo />;
  return (
    <Limite respaldo={<Respaldo />}>
      <Suspense fallback={<Respaldo />}>
        <BusScene animado={!reducir} />
      </Suspense>
    </Limite>
  );
};

export default Hero3D;
