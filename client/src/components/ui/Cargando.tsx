// Pista con un bus-punto que viaja: reemplaza al "Cargando…" plano
const Cargando = ({ texto = 'Cargando…' }: { texto?: string }) => (
  <div role="status" className="flex flex-col items-center gap-4 py-16 text-tinta-suave">
    <div className="relative h-3 w-56">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-brand/20" />
      <span className="absolute top-0 h-3 w-3 animate-viaje rounded-full bg-senal shadow-senal" />
    </div>
    <span className="text-[0.95rem] font-semibold">{texto}</span>
  </div>
);

export default Cargando;
