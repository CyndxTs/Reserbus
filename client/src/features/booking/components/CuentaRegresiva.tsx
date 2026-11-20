const TOTAL = 600;            // el hold dura 10 minutos
const R = 52;
const C = 2 * Math.PI * R;

// Anillo de tiempo del hold: violeta mientras sobra tiempo, naranja señal en el último minuto
const CuentaRegresiva = ({ restante }: { restante: number }) => {
  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');
  const urgente = restante <= 60;
  return (
    <div role="timer" aria-label={`Tiempo restante para confirmar: ${mm} minutos ${ss} segundos`} className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#e9e5ff" strokeWidth="9" />
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="9" strokeLinecap="round"
          stroke={urgente ? '#ff5a1f' : '#4f2ff0'} strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(restante, TOTAL) / TOTAL)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-[1.6rem] font-bold ${urgente ? 'text-senal-dark' : 'text-tinta'}`}>{mm}:{ss}</span>
        <span className="text-[0.7rem] font-semibold text-tinta-suave">asientos retenidos</span>
      </div>
    </div>
  );
};

export default CuentaRegresiva;
