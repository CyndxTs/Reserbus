const valores = [
  { titulo: 'Reserva sin colas', texto: 'Elige tu asiento y reserva desde casa, sin papeleo ni esperas en el terminal.' },
  { titulo: 'Las mejores empresas', texto: 'Comparamos horarios y tarifas de empresas de transporte formales en un solo lugar.' },
  { titulo: 'Viaja a tu manera', texto: 'Combina rutas y empresas para llegar a tu destino de la forma más práctica.' },
];

// Sección del inicio: "Acerca de nosotros"
const AcercaDeSection = () => (
  <section id="acerca-de" className="mx-auto max-w-[960px] px-6 py-12 text-left">
    <h2 className="mb-4 text-[40px] font-bold text-brand">Acerca de nosotros</h2>
    <p className="mb-8 text-[20px] leading-relaxed text-[#6a6a6a]">
      Reserbus es una plataforma de reserva de pasajes de bus. Nuestro objetivo es que viajar por el país sea
      tan simple como elegir un destino, una fecha y un asiento.
    </p>
    <div className="grid gap-6 md:grid-cols-3">
      {valores.map((v) => (
        <div key={v.titulo} className="rounded-[22px] border-[1.5px] border-[#bbb] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="mb-2 text-[20px] font-bold text-brand">{v.titulo}</h3>
          <p className="text-[#444]">{v.texto}</p>
        </div>
      ))}
    </div>
  </section>
);

export default AcercaDeSection;
