import { useNavigate } from 'react-router-dom';
import Pagina from '../../../../components/layout/Pagina';
import { btnPrimario } from '../../../../lib/estilos';

function NotFound() {
  const navigate = useNavigate();
  return (
    <Pagina ancho="max-w-[720px]">
      <div className="py-24 text-center">
        <div className="bg-gradient-to-br from-brand to-[#9a8bff] bg-clip-text font-display text-[clamp(5rem,16vw,9rem)] font-bold leading-none text-transparent">404</div>
        <p className="my-6 text-[1.2rem] text-tinta-suave">Esta parada no existe o cambió de lugar.</p>
        <button className={btnPrimario} onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    </Pagina>
  );
}

export default NotFound;
