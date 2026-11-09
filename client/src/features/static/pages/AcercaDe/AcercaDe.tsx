import Header from '../../../../components/layout/Header/Header';

const navOptions = [
  { label: 'Contacto', path: '/contacto' },
  { label: 'Acerca de nosotros', path: '/acerca-de' },
];

const valores = [
  { titulo: 'Reserva sin colas', texto: 'Elige tu asiento y paga desde casa, sin papeleo ni esperas en el terminal.' },
  { titulo: 'Las mejores empresas', texto: 'Comparamos horarios y tarifas de empresas de transporte formales en un solo lugar.' },
  { titulo: 'Pago a tu manera', texto: 'Usa el medio de pago que prefieras de forma rápida y segura.' },
];

function AcercaDe() {
  return (
    <div>
      <Header navOptions={navOptions} />
      <main className="mx-auto max-w-[960px] px-6 py-12 text-left">
        <h1 className="mb-4 text-[48px] font-bold text-brand">Acerca de nosotros</h1>
        <p className="mb-10 text-[20px] leading-relaxed text-[#6a6a6a]">
          Reserbus es una plataforma de reserva de pasajes de bus. Nuestro objetivo es que viajar por el país sea
          tan simple como elegir un destino, una fecha y un asiento.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {valores.map((v) => (
            <div key={v.titulo} className="rounded-[22px] border-[1.5px] border-[#bbb] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h2 className="mb-2 text-[20px] font-bold text-brand">{v.titulo}</h2>
              <p className="text-[#444]">{v.texto}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AcercaDe;
