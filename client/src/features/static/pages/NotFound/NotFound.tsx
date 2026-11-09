import { useNavigate } from 'react-router-dom';
import Header from '../../../../components/layout/Header/Header';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-[640px] px-6 py-20">
        <div className="text-[96px] font-bold leading-none text-brand">404</div>
        <p className="my-6 text-[20px] text-[#6a6a6a]">Esta página no existe o fue movida.</p>
        <button className="cursor-pointer rounded-lg border-0 bg-brand px-6 py-3 text-[16px] text-white" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </main>
    </div>
  );
}

export default NotFound;
