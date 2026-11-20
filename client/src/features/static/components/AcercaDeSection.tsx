import { Route, Sofa, Waypoints } from 'lucide-react';

const valores = [
  { Icono: Sofa, titulo: 'Eliges tu asiento', texto: 'Ves el bus por dentro y reservas el asiento exacto, sin colas ni papeleo en el terminal.' },
  { Icono: Waypoints, titulo: 'Combinas empresas', texto: 'Si no hay un bus directo, armamos el viaje con tramos de distintas empresas.' },
  { Icono: Route, titulo: 'Horarios que calzan', texto: 'Solo mostramos conexiones donde llegas antes de que salga el siguiente bus.' },
];

// Sección del inicio: "Acerca de nosotros"
const AcercaDeSection = () => (
  <section id="acerca-de" className="py-16">
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-bold leading-tight tracking-tight">Acerca de Reserbus</h2>
        <p className="mt-4 max-w-[34rem] text-[1.1rem] leading-relaxed text-tinta-suave">
          Reserbus es una plataforma de reserva de pasajes de bus. Elige un destino, una fecha y un asiento: nosotros buscamos el resto.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {valores.map(({ Icono, titulo, texto }) => (
          <div key={titulo} className="vidrio rounded-3xl p-6">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-brillo"><Icono className="h-5 w-5" /></span>
            <h3 className="mb-2 font-display text-[1rem] font-bold">{titulo}</h3>
            <p className="text-[0.95rem] leading-relaxed text-tinta-suave">{texto}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AcercaDeSection;
