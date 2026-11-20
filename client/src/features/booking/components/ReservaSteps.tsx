import { Check } from 'lucide-react';

const PASOS = ['Ruta y fecha', 'Asientos', 'Confirmación'];

// Progreso del flujo de reserva: el paso actual lleva el color de señal
const ReservaSteps = ({ paso }: { paso: 1 | 2 | 3 }) => (
  <nav aria-label="Progreso de la reserva" className="mx-auto my-6 max-w-[620px]">
    <ol className="m-0 flex list-none items-center p-0">
      {PASOS.map((texto, i) => {
        const n = i + 1;
        const hecho = n < paso;
        const actual = n === paso;
        return (
          <li key={texto} className={`flex items-center ${i < PASOS.length - 1 ? 'flex-1' : ''}`} aria-current={actual ? 'step' : undefined}>
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[0.85rem] font-bold transition ${
                hecho ? 'bg-brand text-white' : actual ? 'bg-senal text-tinta shadow-senal' : 'border border-brand/25 bg-white text-tinta-suave'}`}>
                {hecho ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className={`hidden text-[0.9rem] font-semibold sm:block ${actual ? 'text-tinta' : 'text-tinta-suave'}`}>{texto}</span>
            </div>
            {i < PASOS.length - 1 && <div className={`mx-3 h-0.5 flex-1 rounded-full ${hecho ? 'bg-brand' : 'bg-brand/15'}`} />}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default ReservaSteps;
