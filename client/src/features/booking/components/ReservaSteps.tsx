// Barra de pasos del proceso de reserva (mismo estilo que la de resultados)
const PASOS = ['Destino y fecha', 'Selecciona tus asientos', 'Confirma tu reserva'];

const ReservaSteps = ({ paso }: { paso: 1 | 2 | 3 }) => (
  <div className="mb-4 mt-6 flex justify-center gap-10">
    {PASOS.map((texto, i) => {
      const activo = i + 1 <= paso;
      return (
        <div
          key={texto}
          className={`text-center ${activo ? 'border-b-[3px] border-brand font-bold text-brand' : 'text-[1.1em] font-medium text-[#bbb]'}`}
        >
          <span
            className={`mb-[6px] inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand text-[1.2em] font-bold ${
              activo ? 'bg-brand text-white' : 'bg-white text-brand'
            }`}
          >
            {i + 1}
          </span>
          <br />
          <span>{texto}</span>
        </div>
      );
    })}
  </div>
);

export default ReservaSteps;
