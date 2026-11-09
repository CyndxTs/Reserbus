import { useState,useEffect } from 'react';
import { useClient,Empresa } from '../../../auth/ClientContext';
import { useNavigate } from 'react-router-dom';
import { formattedClientName } from '../../../auth/utils/ClientUtil';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Bus, useBus } from '../../BusContext';
import ConfirmModal from '../../../../components/ui/ConfirmModal/ConfirmModal';
import CreateBusModal from '../../components/CreateBusModal/CreateBusModal';
import Header from '../../../../components/layout/Header/Header';

// Clases Tailwind reutilizadas en esta pantalla (cada una equivale a un bloque del antiguo EmpresaHome.scss)
const navItemBase =
  'relative flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 p-3 text-left text-[0.95rem] font-medium transition-all duration-200 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0';
const navItemIdle =
  'bg-transparent text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]';
const navItemActive =
  'bg-[rgb(216,216,255)] text-brand';
const statInfo =
  '[&_h3]:m-0 [&_h3]:text-[2rem] [&_h3]:font-bold [&_h3]:text-[#1f2937] [&_p]:m-0 [&_p]:text-[0.9rem] [&_p]:text-[#6b7280]';
const statCard =
  'flex w-[85%] items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.15)]';
const statIcon =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white [&_svg]:h-8 [&_svg]:w-8 [&_img]:h-8 [&_img]:w-8';
const panel =
  'rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]';
const dashHeader =
  'grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-[#e5e7eb] py-3 text-[0.8rem] font-semibold uppercase tracking-[0.5px] text-[#6b7280]';
const dashRow =
  'grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-[#f3f4f6] py-3 text-[#374151] transition-colors duration-200 hover:bg-[#f9fafb]';
const actionBtn =
  'flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 font-medium text-[#374151] transition-all duration-200 hover:translate-x-1 hover:border-brand hover:bg-brand hover:text-white [&_svg]:h-4 [&_svg]:w-4';
const sectionHeader =
  'mb-8 flex items-center justify-between';
const primaryButton =
  'flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-[linear-gradient(135deg,#4d15f0_0%,#6366f1_100%)] px-6 py-3 text-[1rem] font-medium text-white shadow-[0_4px_6px_-1px_rgba(77,21,240,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-5px_rgba(77,21,240,0.4)] [&_svg]:h-[18px] [&_svg]:w-[18px]';
const dataGrid =
  'overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]';
const gridFilters =
  'flex gap-4 border-b border-[#e5e7eb] bg-[#f8fafc] p-6';
const searchInput =
  'rounded-lg border border-[#d1d5db] bg-white px-3 py-[10px] text-[0.9rem] transition-colors duration-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(77,21,240,0.1)] focus:outline-none min-w-[250px] flex-1';
const filterSelect =
  'rounded-lg border border-[#d1d5db] bg-white px-3 py-[10px] text-[0.9rem] transition-colors duration-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(77,21,240,0.1)] focus:outline-none min-w-[150px]';
const reservationFilters =
  'flex flex-wrap gap-4 border-b border-[#e5e7eb] bg-[#f8fafc] p-6 max-md:flex-col max-md:gap-3';
const searchInputRes =
  'rounded-lg border border-[#d1d5db] bg-white px-3 py-[10px] text-[0.9rem] transition-colors duration-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(77,21,240,0.1)] focus:outline-none min-w-[300px] flex-[2] max-md:min-w-0';
const filterSelectRes =
  'rounded-lg border border-[#d1d5db] bg-white px-3 py-[10px] text-[0.9rem] transition-colors duration-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(77,21,240,0.1)] focus:outline-none min-w-[160px]';
const dataHeader =
  'grid grid-cols-[1fr_1fr_1fr_1fr_120px_120px] gap-4 border-b-2 border-[#e5e7eb] bg-[#f8fafc] px-6 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.5px] text-[#6b7280] max-[480px]:grid-cols-[1fr_80px] max-[480px]:[&>span:nth-child(3)]:hidden max-[480px]:[&>span:nth-child(4)]:hidden max-[480px]:[&>span:nth-child(5)]:hidden';
const dataRow =
  'grid grid-cols-[1fr_1fr_1fr_1fr_120px_120px] items-center gap-4 border-b border-[#f3f4f6] px-6 py-4 text-[#374151] transition-colors duration-200 last:border-b-0 hover:bg-[#f9fafb] max-[480px]:grid-cols-[1fr_80px] max-[480px]:[&>span:nth-child(3)]:hidden max-[480px]:[&>span:nth-child(4)]:hidden max-[480px]:[&>span:nth-child(5)]:hidden';
const busPlate =
  'inline-block rounded-sm bg-[#f3f4f6] px-2 py-1 font-code font-bold text-[#1f2937]';
const actions =
  'flex gap-2';
const actionEdit =
  'cursor-pointer rounded-md border-0 bg-[#dbeafe] px-3 py-[6px] text-[0.8rem] font-medium text-[#1e40af] transition-all duration-200 hover:bg-[#3b82f6] hover:text-white';
const actionView =
  'cursor-pointer rounded-md border-0 bg-[#f3f4f6] px-3 py-[6px] text-[0.8rem] font-medium text-[#6b7280] transition-all duration-200 hover:bg-[#6b7280] hover:text-white';
const statusBase =
  'rounded-[20px] px-3 py-1 text-center text-[0.8rem] font-medium';
const statusCompleted = `${statusBase} bg-[#d1fae5] text-[#065f46]`;
const statusInProgress = `${statusBase} bg-[#dbeafe] text-[#1e40af]`;
const statusScheduled = `${statusBase} bg-[#fef3c7] text-[#92400e]`;
const statusActive = `${statusBase} inline-block bg-[#d1fae5] text-[#065f46]`;
const statusMaintenance = `${statusBase} inline-block bg-[#fef3c7] text-[#92400e]`;
const statusInactive = `${statusBase} inline-block bg-[#fee2e2] text-[#dc2626]`;
const statusRes =
  'inline-block rounded-lg px-3 py-1 text-center text-[0.8rem] font-medium text-white';
const statusConfirmada = `${statusRes} bg-[#048b65]`;
const statusPendiente = `${statusRes} bg-[#b04707]`;
const statusCancelada = `${statusRes} bg-[#d10c0c]`;
const statusCompletada = `${statusRes} bg-[#1c10bd]`;
const reservationCode =
  'inline-block rounded-md px-3 py-[6px] font-code text-[0.85rem] font-bold tracking-[0.5px] text-[#1f2937] max-md:px-2 max-md:py-1 max-md:text-[0.75rem] max-[480px]:px-[6px] max-[480px]:py-[3px] max-[480px]:text-[0.7rem]';
const infoCol =
  'flex flex-col gap-[2px] max-md:items-start';
const modalOverlay =
  'fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-black/60 p-8 backdrop-blur-[4px] max-md:items-start max-md:p-4 max-md:pt-8 max-[480px]:p-2 max-[480px]:pt-4';
const modalContent =
  'flex max-h-[90vh] w-full max-w-[650px] animate-modal-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-md:max-h-[95vh] max-md:rounded-xl max-[480px]:max-h-[98vh] max-[480px]:rounded-[10px]';
const modalHeader =
  'flex shrink-0 items-center justify-between rounded-t-2xl border-b border-[#e5e7eb] bg-[linear-gradient(135deg,#4d15f0_0%,#6366f1_100%)] px-10 pb-6 pt-8 text-white max-md:rounded-t-xl max-md:px-8 max-md:pb-5 max-md:pt-6 max-[480px]:rounded-t-[10px] max-[480px]:px-6 max-[480px]:pb-4 max-[480px]:pt-5';
const modalTitle =
  'm-0 text-[1.625rem] font-semibold tracking-[-0.025em] max-md:text-[1.375rem] max-[480px]:text-[1.25rem]';
const modalClose =
  'flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-0 bg-white/10 p-[10px] text-white transition-all duration-200 hover:scale-105 hover:bg-white/20 max-[480px]:h-9 max-[480px]:w-9 max-[480px]:p-2 [&_svg]:h-5 [&_svg]:w-5';
const modalForm =
  'flex-1 scroll-smooth overflow-y-auto p-10 max-md:p-8 max-[480px]:p-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:rounded-[3px] [&::-webkit-scrollbar-track]:bg-[#f1f5f9] [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb:hover]:bg-[#94a3b8]';
const formGroup =
  'mb-8 last:mb-4 max-md:mb-7 max-[480px]:mb-6 [&_label]:mb-3 [&_label]:block [&_label]:text-[0.9rem] [&_label]:font-semibold [&_label]:tracking-[-0.01em] [&_label]:text-[#1f2937] max-[480px]:[&_label]:mb-2 max-[480px]:[&_label]:text-[0.95rem] [&_:is(input,select,textarea)]:w-full [&_:is(input,select,textarea)]:rounded-[10px] [&_:is(input,select,textarea)]:border-2 [&_:is(input,select,textarea)]:border-[#e5e7eb] [&_:is(input,select,textarea)]:bg-[#fafbfc] [&_:is(input,select,textarea)]:px-2 [&_:is(input,select,textarea)]:py-[0.875rem] [&_:is(input,select,textarea)]:text-[0.9rem] [&_:is(input,select,textarea)]:leading-normal [&_:is(input,select,textarea)]:transition-all [&_:is(input,select,textarea)]:duration-200 [&_:is(input,select,textarea):focus]:-translate-y-px [&_:is(input,select,textarea):focus]:border-brand [&_:is(input,select,textarea):focus]:bg-white [&_:is(input,select,textarea):focus]:shadow-[0_0_0_4px_rgba(77,21,240,0.1)] [&_:is(input,select,textarea):focus]:outline-none [&_textarea]:min-h-[100px] [&_textarea]:resize-y max-[480px]:[&_:is(input,select,textarea)]:min-h-12 max-[480px]:[&_:is(input,select,textarea)]:rounded-lg max-[480px]:[&_:is(input,select,textarea)]:p-4 max-[480px]:[&_:is(input,select,textarea)]:text-[1rem]';
const formRow =
  'mb-8 grid grid-cols-2 gap-14 max-md:mb-7 max-md:grid-cols-1 max-md:gap-7';
const fieldError =
  'mt-2 flex items-center gap-2 rounded-md border border-l-4 border-[#fecaca] border-l-[#ef4444] bg-[#fef2f2] px-3 py-2 text-[0.875rem] text-[#ef4444] before:font-bold before:text-[#ef4444] before:content-[\'⚠\']';
const checkboxGroup =
  'mt-3 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 max-md:grid-cols-1 max-md:gap-3 max-[480px]:gap-2 max-[480px]:p-3';
const checkboxItem =
  'flex cursor-pointer items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition-all duration-200 hover:-translate-y-px hover:border-[#bfdbfe] hover:bg-[#f0f9ff] max-md:min-h-[60px] max-md:p-4 max-[480px]:min-h-[54px] max-[480px]:p-[0.875rem] [&_input[type=checkbox]]:m-0 [&_input[type=checkbox]]:h-[18px] [&_input[type=checkbox]]:w-[18px] [&_input[type=checkbox]]:cursor-pointer [&_input[type=checkbox]]:accent-brand max-[480px]:[&_input[type=checkbox]]:h-5 max-[480px]:[&_input[type=checkbox]]:w-5 [&_span]:text-[0.875rem] [&_span]:font-medium [&_span]:text-[#374151] max-[480px]:[&_span]:text-[0.95rem]';
const modalActions =
  'mt-6 flex shrink-0 justify-end gap-4 rounded-b-2xl border-t border-[#e5e7eb] bg-[#fafbfc] px-10 py-8 max-md:flex-col-reverse max-md:gap-3 max-md:px-8 max-md:py-6 max-[480px]:gap-3 max-[480px]:px-6 max-[480px]:py-5';
const btnPrimary =
  'relative min-w-[130px] cursor-pointer overflow-hidden rounded-[10px] border-0 bg-[linear-gradient(135deg,#4d15f0_0%,#6366f1_100%)] px-8 py-[0.875rem] text-[0.9rem] font-semibold tracking-[-0.01em] text-white shadow-[0_4px_12px_rgba(77,21,240,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#3d0fc7_0%,#5855e8_100%)] hover:shadow-[0_6px_20px_rgba(77,21,240,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(77,21,240,0.3)] disabled:cursor-not-allowed disabled:opacity-60 max-md:min-h-[50px] max-md:w-full max-md:px-8 max-md:py-4 max-md:text-[1rem] max-[480px]:min-h-[52px] max-[480px]:rounded-lg max-[480px]:p-4';
const btnSecondary =
  'relative min-w-[130px] cursor-pointer overflow-hidden rounded-[10px] border-2 border-[#e5e7eb] bg-white px-8 py-[0.875rem] text-[0.9rem] font-semibold tracking-[-0.01em] text-[#4b5563] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-px hover:border-[#d1d5db] hover:bg-[#f9fafb] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.05)] max-md:min-h-[50px] max-md:w-full max-md:px-8 max-md:py-4 max-md:text-[1rem] max-[480px]:min-h-[52px] max-[480px]:rounded-lg max-[480px]:p-4';

function EmpresaHome() {
  const { client, clientType, logout } = useClient();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const empresa = clientType === 'EMPRESA' ? client as Empresa : null;
  const [showBusModal, setShowBusModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { buses, fetchBuses } = useBus();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const { deleteBus } = useBus();
  const [busAEliminar, setBusAEliminar] = useState<Bus | null>(null);

  const openModal = (modalType: string) => {
    setModalOpen(modalType);
  };

  const closeModal = () => {
    setModalOpen(null);
  };

  // Cargar buses al montar el componente
  useEffect(() => {
    console.log("Empresa cargada", empresa)
    if (empresa) {
      fetchBuses(empresa.id_empresa);
      console.log("Buses cargados:", buses);
    }
  }, [empresa]);

  // Ocultar popup después de 3 segundos
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);
  const handleSuccess = (action: 'create' | 'update' | 'delete') => {
    let message = "";
    switch(action) {
      case 'create':
        message = "Bus creado correctamente ✅";
        break;
      case 'update':
        message = "Bus actualizado correctamente ✅";
        break;
      case 'delete':
        message = "Bus eliminado correctamente ✅";
        break;
    }
    setSuccessMessage(message);
    setShowSuccessPopup(true);
  };
  const handleEliminarBus = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este bus?")) return;

    try {
      await deleteBus(id);
      if(empresa) {
        fetchBuses(empresa.id_empresa); // refrescar la lista
      }
    } catch (error) {
      alert("Error al eliminar el bus.");
    }
  };

  // Filtrar información de buses (para el buscador)
  const filteredBuses = buses.filter(bus => 
    bus.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.modelo.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="mx-auto w-full max-w-[1080px]">
            <div className="mb-8 text-left">
              <h1 className="m-0 mb-2 text-[2.5rem] font-bold text-[#1f2937]">Panel de Control</h1>
              <p className="m-0 text-[1.1rem] text-[#6b7280]">Bienvenido, {(empresa as any)?.razon_social || formattedClientName(empresa)}</p>
            </div>
            
            <div className="mb-8 flex flex-row gap-4">
              <div className={statCard}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white [&_svg]:h-8 [&_svg]:w-8 [&_img]:h-8 [&_img]:w-8 bg-[linear-gradient(135deg,#3b82f6_0%,#1d4ed8_100%)]">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                  </svg>
                </div>
                <div className={statInfo}>
                  <h3>12</h3>
                  <p>Buses Activos</p>
                </div>
              </div>

              <div className={statCard}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white [&_svg]:h-8 [&_svg]:w-8 [&_img]:h-8 [&_img]:w-8 bg-[linear-gradient(135deg,#10b981_0%,#059669_100%)]">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
                  </svg>
                </div>
                <div className={statInfo}>
                  <h3>8</h3>
                  <p>Rutas Disponibles</p>
                </div>
              </div>

              <div className={statCard}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white [&_svg]:h-8 [&_svg]:w-8 [&_img]:h-8 [&_img]:w-8 bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)]">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div className={statInfo}>
                  <h3>45</h3>
                  <p>Viajes Programados</p>
                </div>
              </div>

              <div className={statCard}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white [&_svg]:h-8 [&_svg]:w-8 [&_img]:h-8 [&_img]:w-8 bg-[linear-gradient(135deg,#8b5cf6_0%,#7c3aed_100%)]">
                  <img src="/Icon_Dollar.svg" alt="revenue" />
                </div>
                <div className={statInfo}>
                  <h3>S/ 12,450</h3>
                  <p>Ingresos del Mes</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-8">
              <div className={panel}>
                <h2 className="m-0 mb-4 text-[1.25rem] font-semibold text-[#1f2937]">Viajes Recientes</h2>
                <div className="flex flex-col gap-2">
                  <div className={dashHeader}>
                    <span>Ruta</span>
                    <span>Fecha</span>
                    <span>Estado</span>
                    <span>Ocupación</span>
                  </div>
                  <div className={dashRow}>
                    <span>Lima - Arequipa</span>
                    <span>15 Jun 2025</span>
                    <span className={statusCompleted}>Finalizado</span>
                    <span>38/40</span>
                  </div>
                  <div className={dashRow}>
                    <span>Arequipa - Cusco</span>
                    <span>16 Jun 2025</span>
                    <span className={statusInProgress}>En Curso</span>
                    <span>42/45</span>
                  </div>
                  <div className={dashRow}>
                    <span>Lima - Trujillo</span>
                    <span>17 Jun 2025</span>
                    <span className={statusScheduled}>Programado</span>
                    <span>25/40</span>
                  </div>
                </div>
              </div>              <div className={panel}>
                <h2 className="m-0 mb-4 text-[1.25rem] font-semibold text-[#1f2937]">Acciones Rápidas</h2>
                <div className="flex flex-col gap-3">
                  <button className={actionBtn} onClick={() => openModal('viaje')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Programar Viaje
                  </button>
                  <button className={actionBtn} onClick={() => openModal('bus')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Registrar Bus
                  </button>                  <button className={actionBtn} onClick={() => openModal('ruta')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Nueva Ruta
                  </button>
                  <button className={actionBtn} onClick={() => openModal('reserva')}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9H9zM13 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2zM17 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2z"/>
                      <path d="M21 5V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1H1v2h1v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h18v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h1V5h-2z"/>
                    </svg>
                    Nueva Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        case 'buses':
        return (
          <div className="mx-auto w-full max-w-[1400px]">
            <div className={sectionHeader}>
              <h1 className="m-0 text-[2.5rem] font-bold text-[#1f2937]">Gestión de Buses</h1>
              <button className={primaryButton} onClick={() => openModal('bus')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nuevo Bus
              </button>
            </div>
            
            <div className={dataGrid}>
              <div className={gridFilters}>
                <input type="text" placeholder="Buscar por placa..." className={searchInput} />
                <select className={filterSelect}>
                  <option>Todos los estados</option>
                  <option>Activo</option>
                  <option>Mantenimiento</option>
                  <option>Inactivo</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <div className={dataHeader}>
                  <span>Placa</span>
                  <span>Marca/Modelo</span>
                  <span>Pisos</span>
                  <span>Asientos</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className={dataRow}>
                  <span className={busPlate}>ABC-123</span>
                  <span>Mercedes-Benz / Sprinter</span>
                  <span>2</span>
                  <span>40</span>
                  <span className={statusActive}>Activo</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={busPlate}>XYZ-456</span>
                  <span>Volvo / 9700</span>
                  <span>2</span>
                  <span>45</span>
                  <span className={statusMaintenance}>Mantenimiento</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={busPlate}>DEF-789</span>
                  <span>Scania / Irizar</span>
                  <span>1</span>
                  <span>35</span>
                  <span className={statusActive}>Activo</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={busPlate}>GHI-012</span>
                  <span>Mercedes-Benz / OH1526</span>
                  <span>2</span>
                  <span>42</span>
                  <span className={statusActive}>Activo</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        case 'rutas':
        return (
          <div className="mx-auto w-full max-w-[1400px]">            <div className={sectionHeader}>
              <h1 className="m-0 text-[2.5rem] font-bold text-[#1f2937]">Gestión de Rutas</h1>
              <button className={primaryButton} onClick={() => openModal('ruta')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nueva Ruta
              </button>
            </div>
            
            <div className={dataGrid}>
              <div className={gridFilters}>
                <input type="text" placeholder="Buscar ruta..." className={searchInput} />
                <select className={filterSelect}>
                  <option>Todas las rutas</option>
                  <option>Activas</option>
                  <option>Inactivas</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <div className={dataHeader}>
                  <span>Origen</span>
                  <span>Destino</span>
                  <span>Distancia</span>
                  <span>Duración</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className={dataRow}>
                  <span>Lima</span>
                  <span>Arequipa</span>
                  <span>1,009 km</span>
                  <span>14 hrs</span>
                  <span className={statusActive}>Activa</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Arequipa</span>
                  <span>Cusco</span>
                  <span>521 km</span>
                  <span>8 hrs</span>
                  <span className={statusActive}>Activa</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Lima</span>
                  <span>Trujillo</span>
                  <span>561 km</span>
                  <span>9 hrs</span>
                  <span className={statusActive}>Activa</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Cusco</span>
                  <span>Puno</span>
                  <span>389 km</span>
                  <span>6 hrs</span>
                  <span className={statusInactive}>Inactiva</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        case 'viajes':
        return (
          <div className="mx-auto w-full max-w-[1400px]">            <div className={sectionHeader}>
              <h1 className="m-0 text-[2.5rem] font-bold text-[#1f2937]">Gestión de Viajes</h1>
              <button className={primaryButton} onClick={() => openModal('viaje')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Programar Viaje
              </button>
            </div>
            
            <div className={dataGrid}>
              <div className={gridFilters}>
                <input type="text" placeholder="Buscar viaje..." className={searchInput} />
                <select className={filterSelect}>
                  <option>Todos los estados</option>
                  <option>Programado</option>
                  <option>En Curso</option>
                  <option>Finalizado</option>
                  <option>Cancelado</option>
                </select>
                <input type="date" className="rounded-lg border border-[#d1d5db] bg-white px-3 py-[10px] text-[0.9rem] transition-colors duration-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(77,21,240,0.1)] focus:outline-none min-w-[150px]" />
              </div>
              
              <div className="overflow-x-auto">
                <div className={dataHeader}>
                  <span>Ruta</span>
                  <span>Bus</span>
                  <span>Fecha/Hora</span>
                  <span>Ocupación</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className={dataRow}>
                  <span>Lima → Arequipa</span>
                  <span>ABC-123</span>
                  <span>20 Jun 2025 - 22:30</span>
                  <span className="font-semibold text-[#1f2937]">32/40</span>
                  <span className={statusScheduled}>Programado</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Arequipa → Lima</span>
                  <span>XYZ-456</span>
                  <span>21 Jun 2025 - 08:00</span>
                  <span className="font-semibold text-[#1f2937]">45/45</span>
                  <span className={statusInProgress}>En Curso</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Lima → Trujillo</span>
                  <span>DEF-789</span>
                  <span>18 Jun 2025 - 23:00</span>
                  <span className="font-semibold text-[#1f2937]">35/35</span>
                  <span className={statusCompleted}>Finalizado</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Cusco → Arequipa</span>
                  <span>GHI-012</span>
                  <span>22 Jun 2025 - 15:30</span>
                  <span className="font-semibold text-[#1f2937]">18/42</span>
                  <span className={statusScheduled}>Programado</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        case 'terminales':
        return (
          <div className="mx-auto w-full max-w-[1400px]">            <div className={sectionHeader}>
              <h1 className="m-0 text-[2.5rem] font-bold text-[#1f2937]">Gestión de Terminales</h1>
              <button className={primaryButton} onClick={() => openModal('terminal')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nuevo Terminal
              </button>
            </div>
            
            <div className={dataGrid}>
              <div className={gridFilters}>
                <input type="text" placeholder="Buscar terminal..." className={searchInput} />
                <select className={filterSelect}>
                  <option>Todas las ciudades</option>
                  <option>Lima</option>
                  <option>Arequipa</option>
                  <option>Cusco</option>
                  <option>Trujillo</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <div className={dataHeader}>
                  <span>Nombre</span>
                  <span>Ciudad</span>
                  <span>Dirección</span>
                  <span>Rutas</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className={dataRow}>
                  <span>Terminal Sur Lima</span>
                  <span>Lima</span>
                  <span>Av. Atocongo 1505, Villa María del Triunfo</span>
                  <span>5 rutas</span>
                  <span className={statusActive}>Activo</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Terminal Arequipa</span>
                  <span>Arequipa</span>
                  <span>Av. Andrés Avelino Cáceres s/n</span>
                  <span>3 rutas</span>
                  <span className={statusActive}>Activo</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Terminal Cusco</span>
                  <span>Cusco</span>
                  <span>Av. Vía de Evitamiento 429, Santiago</span>
                  <span>2 rutas</span>
                  <span className={statusActive}>Activo</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span>Terminal Trujillo</span>
                  <span>Trujillo</span>
                  <span>Panamericana Norte Km 559</span>
                  <span>1 ruta</span>
                  <span className={statusMaintenance}>Mantenimiento</span>                  
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        case 'reservas':
        return (
          <div className="mx-auto w-full max-w-[1400px]">
            <div className={sectionHeader}>
              <h1 className="m-0 text-[2.5rem] font-bold text-[#1f2937]">Gestión de Reservas</h1>
              <button className={primaryButton} onClick={() => openModal('reserva')}>
                <svg viewBox="0 0 25 15" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nueva Reserva
              </button>
            </div>
              <div className={dataGrid}>
              <div className={reservationFilters}>
                <input type="text" placeholder="Buscar por código de reserva, pasajero..." className={searchInputRes} />
                <select className={filterSelectRes}>
                  <option>Todos los estados</option>
                  <option>Confirmada</option>
                  <option>Pendiente</option>
                  <option>Cancelada</option>
                  <option>Completada</option>
                </select>
                <input type="date" className={filterSelectRes} placeholder="Fecha" />
                <select className={filterSelectRes}>
                  <option>Todas las rutas</option>
                  <option>Lima → Arequipa</option>
                  <option>Arequipa → Cusco</option>
                  <option>Lima → Trujillo</option>
                  <option>Cusco → Lima</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <div className={dataHeader}>
                  <span>DNI</span>
                  <span>Pasajero</span>
                  <span>Ruta</span>
                  <span>Fecha/Hora</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                
                <div className={dataRow}>
                  <span className={reservationCode}>12345678</span>
                  <div className={infoCol}>
                    <span className="font-semibold text-[#1f2937]">María González López</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">Lima → Arequipa</span>
                    <span className="text-[0.8rem] text-[#6b7280]">Bus ABC-123 - Asiento 15A</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">20 Jun 2025</span>
                    <span className="text-[0.8rem] font-semibold text-[#6b7280]">22:30</span>
                  </div>
                  <span className={statusConfirmada}>Confirmada</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={reservationCode}>87654321</span>
                  <div className={infoCol}>
                    <span className="font-semibold text-[#1f2937]">Carlos Mendoza Ruiz</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">Arequipa → Cusco</span>
                    <span className="text-[0.8rem] text-[#6b7280]">Bus XYZ-456 - Asiento 8B</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">21 Jun 2025</span>
                    <span className="text-[0.8rem] font-semibold text-[#6b7280]">08:00</span>
                  </div>
                  <span className={statusPendiente}>Pendiente</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={reservationCode}>11223344</span>
                  <div className={infoCol}>
                    <span className="font-semibold text-[#1f2937]">Ana Patricia Vega</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">Lima → Trujillo</span>
                    <span className="text-[0.8rem] text-[#6b7280]">Bus DEF-789 - Asiento 12C</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">19 Jun 2025</span>
                    <span className="text-[0.8rem] font-semibold text-[#6b7280]">15:30</span>
                  </div>
                  <span className={statusCompletada}>Completada</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={reservationCode}>55667788</span>
                  <div className={infoCol}>
                    <span className="font-semibold text-[#1f2937]">Roberto Silva Torres</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">Cusco → Lima</span>
                    <span className="text-[0.8rem] text-[#6b7280]">Bus GHI-012 - Asiento 20A</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">22 Jun 2025</span>
                    <span className="text-[0.8rem] font-semibold text-[#6b7280]">20:00</span>
                  </div>
                  <span className={statusConfirmada}>Confirmada</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={reservationCode}>99887766</span>
                  <div className={infoCol}>
                    <span className="font-semibold text-[#1f2937]">Lucía Morales Castro</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">Arequipa → Lima</span>
                    <span className="text-[0.8rem] text-[#6b7280]">Bus ABC-123 - Asiento 5B</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">18 Jun 2025</span>
                    <span className="text-[0.8rem] font-semibold text-[#6b7280]">14:00</span>
                  </div>
                  <span className={statusCancelada}>Cancelada</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
                
                <div className={dataRow}>
                  <span className={reservationCode}>44556677</span>
                  <div className={infoCol}>
                    <span className="font-semibold text-[#1f2937]">Fernando Díaz López</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">Lima → Cusco</span>
                    <span className="text-[0.8rem] text-[#6b7280]">Bus XYZ-456 - Asiento 18C</span>
                  </div>
                  <div className={infoCol}>
                    <span className="font-medium text-[#1f2937]">23 Jun 2025</span>
                    <span className="text-[0.8rem] font-semibold text-[#6b7280]">21:45</span>
                  </div>
                  <span className={statusPendiente}>Pendiente</span>
                  <div className={actions}>
                    <button className={actionEdit}>Editar</button>
                    <button className={actionView}>Ver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;    }
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    const renderModalContent = () => {
      switch (modalOpen) {
        case 'bus':
          return (
            <div className={modalContent}>
              <div className={modalHeader}>
                <h2 className={modalTitle}>Registrar Nuevo Bus</h2>
                <button className={modalClose} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className={modalForm}>
                <div className={formGroup}>
                  <label htmlFor="placa">Placa del Bus</label>
                  <input type="text" id="placa" name="placa" placeholder="ABC-123" required />
                </div>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="marca">Marca</label>
                    <select id="marca" name="marca" required>
                      <option value="">Seleccionar marca</option>
                      <option value="mercedes">Mercedes-Benz</option>
                      <option value="volvo">Volvo</option>
                      <option value="scania">Scania</option>
                      <option value="iveco">Iveco</option>
                    </select>
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="modelo">Modelo</label>
                    <input type="text" id="modelo" name="modelo" placeholder="Sprinter, 9700, etc." required />
                  </div>
                </div>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="pisos">Número de Pisos</label>
                    <select id="pisos" name="pisos" required>
                      <option value="">Seleccionar</option>
                      <option value="1">1 Piso</option>
                      <option value="2">2 Pisos</option>
                    </select>
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="asientos">Total de Asientos</label>
                    <input type="number" id="asientos" name="asientos" min="20" max="60" placeholder="40" required />
                  </div>
                </div>
                <div className={formGroup}>
                  <label htmlFor="año">Año de Fabricación</label>
                  <input type="number" id="año" name="año" min="2000" max="2025" placeholder="2023" required />
                </div>
                <div className={formGroup}>
                  <label htmlFor="caracteristicas">Características Adicionales</label>
                  <textarea id="caracteristicas" name="caracteristicas" rows={3} placeholder="Aire acondicionado, WiFi, baño, etc."></textarea>
                </div>
                <div className={modalActions}>
                  <button type="button" className={btnSecondary} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={btnPrimary}>Registrar Bus</button>
                </div>
              </form>
            </div>
          );

        case 'ruta':
          return (
            <div className={modalContent}>
              <div className={modalHeader}>
                <h2 className={modalTitle}>Crear Nueva Ruta</h2>
                <button className={modalClose} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className={modalForm}>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="origen">Ciudad de Origen</label>
                    <select id="origen" name="origen" required>
                      <option value="">Seleccionar origen</option>
                      <option value="lima">Lima</option>
                      <option value="arequipa">Arequipa</option>
                      <option value="cusco">Cusco</option>
                      <option value="trujillo">Trujillo</option>
                      <option value="chiclayo">Chiclayo</option>
                      <option value="piura">Piura</option>
                    </select>
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="destino">Ciudad de Destino</label>
                    <select id="destino" name="destino" required>
                      <option value="">Seleccionar destino</option>
                      <option value="lima">Lima</option>
                      <option value="arequipa">Arequipa</option>
                      <option value="cusco">Cusco</option>
                      <option value="trujillo">Trujillo</option>
                      <option value="chiclayo">Chiclayo</option>
                      <option value="piura">Piura</option>
                    </select>
                  </div>
                </div>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="distancia">Distancia (km)</label>
                    <input type="number" id="distancia" name="distancia" min="1" placeholder="500" required />
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="duracion">Duración Estimada (horas)</label>
                    <input type="number" id="duracion" name="duracion" min="1" max="24" step="0.5" placeholder="8" required />
                  </div>
                </div>
                <div className={formGroup}>
                  <label htmlFor="precio-base">Precio Base (S/)</label>
                  <input type="number" id="precio-base" name="precio-base" min="10" step="0.01" placeholder="80.00" required />
                </div>
                <div className={formGroup}>
                  <label htmlFor="terminal-origen">Terminal de Origen</label>
                  <select id="terminal-origen" name="terminal-origen" required>
                    <option value="">Seleccionar terminal</option>
                    <option value="terminal-sur">Terminal Sur Lima</option>
                    <option value="terminal-arequipa">Terminal Arequipa</option>
                    <option value="terminal-cusco">Terminal Cusco</option>
                  </select>
                </div>
                <div className={formGroup}>
                  <label htmlFor="terminal-destino">Terminal de Destino</label>
                  <select id="terminal-destino" name="terminal-destino" required>
                    <option value="">Seleccionar terminal</option>
                    <option value="terminal-sur">Terminal Sur Lima</option>
                    <option value="terminal-arequipa">Terminal Arequipa</option>
                    <option value="terminal-cusco">Terminal Cusco</option>
                  </select>
                </div>
                <div className={modalActions}>
                  <button type="button" className={btnSecondary} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={btnPrimary}>Crear Ruta</button>
                </div>
              </form>
            </div>
          );

        case 'viaje':
          return (
            <div className={modalContent}>
              <div className={modalHeader}>
                <h2 className={modalTitle}>Programar Nuevo Viaje</h2>
                <button className={modalClose} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className={modalForm}>
                <div className={formGroup}>
                  <label htmlFor="ruta-viaje">Ruta</label>
                  <select id="ruta-viaje" name="ruta-viaje" required>
                    <option value="">Seleccionar ruta</option>
                    <option value="lima-arequipa">Lima → Arequipa</option>
                    <option value="arequipa-cusco">Arequipa → Cusco</option>
                    <option value="lima-trujillo">Lima → Trujillo</option>
                    <option value="cusco-puno">Cusco → Puno</option>
                  </select>
                </div>
                <div className={formGroup}>
                  <label htmlFor="bus-viaje">Bus Asignado</label>
                  <select id="bus-viaje" name="bus-viaje" required>
                    <option value="">Seleccionar bus</option>
                    <option value="abc-123">ABC-123 - Mercedes-Benz Sprinter (40 asientos)</option>
                    <option value="xyz-456">XYZ-456 - Volvo 9700 (45 asientos)</option>
                    <option value="def-789">DEF-789 - Scania Irizar (35 asientos)</option>
                  </select>
                </div>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="fecha-viaje">Fecha de Viaje</label>
                    <input type="date" id="fecha-viaje" name="fecha-viaje" required />
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="hora-salida">Hora de Salida</label>
                    <input type="time" id="hora-salida" name="hora-salida" required />
                  </div>
                </div>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="precio-adulto">Precio Adulto (S/)</label>
                    <input type="number" id="precio-adulto" name="precio-adulto" min="10" step="0.01" placeholder="80.00" required />
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="precio-niño">Precio Niño (S/)</label>
                    <input type="number" id="precio-niño" name="precio-niño" min="5" step="0.01" placeholder="60.00" required />
                  </div>
                </div>
                <div className={formGroup}>
                  <label htmlFor="conductor">Conductor Principal</label>
                  <select id="conductor" name="conductor" required>
                    <option value="">Seleccionar conductor</option>
                    <option value="juan-perez">Juan Pérez - Licencia A3C</option>
                    <option value="maria-garcia">María García - Licencia A3C</option>
                    <option value="carlos-lopez">Carlos López - Licencia A3C</option>
                  </select>
                </div>
                <div className={modalActions}>
                  <button type="button" className={btnSecondary} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={btnPrimary}>Programar Viaje</button>
                </div>
              </form>
            </div>
          );

        case 'terminal':
          return (
            <div className={modalContent}>
              <div className={modalHeader}>
                <h2 className={modalTitle}>Registrar Nuevo Terminal</h2>
                <button className={modalClose} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <form className={modalForm}>
                <div className={formGroup}>
                  <label htmlFor="nombre-terminal">Nombre del Terminal</label>
                  <input type="text" id="nombre-terminal" name="nombre-terminal" placeholder="Terminal Norte Lima" required />
                </div>
                <div className={formGroup}>
                  <label htmlFor="ciudad-terminal">Ciudad</label>
                  <select id="ciudad-terminal" name="ciudad-terminal" required>
                    <option value="">Seleccionar ciudad</option>
                    <option value="lima">Lima</option>
                    <option value="arequipa">Arequipa</option>
                    <option value="cusco">Cusco</option>
                    <option value="trujillo">Trujillo</option>
                    <option value="chiclayo">Chiclayo</option>
                    <option value="piura">Piura</option>
                  </select>
                </div>
                <div className={formGroup}>
                  <label htmlFor="direccion-terminal">Dirección Completa</label>
                  <input type="text" id="direccion-terminal" name="direccion-terminal" placeholder="Av. Ejemplo 123, Distrito" required />
                </div>
                <div className={formRow}>
                  <div className={formGroup}>
                    <label htmlFor="telefono-terminal">Teléfono</label>
                    <input type="tel" id="telefono-terminal" name="telefono-terminal" placeholder="01-234-5678" />
                  </div>
                  <div className={formGroup}>
                    <label htmlFor="capacidad-andenes">Número de Andenes</label>
                    <input type="number" id="capacidad-andenes" name="capacidad-andenes" min="1" max="20" placeholder="5" required />
                  </div>
                </div>
                <div className={formGroup}>
                  <label htmlFor="servicios-terminal">Servicios Disponibles</label>
                  <div className={checkboxGroup}>
                    <label className={checkboxItem}>
                      <input type="checkbox" name="servicios" value="estacionamiento" />
                      <span>Estacionamiento</span>
                    </label>
                    <label className={checkboxItem}>
                      <input type="checkbox" name="servicios" value="cafeteria" />
                      <span>Cafetería</span>
                    </label>
                    <label className={checkboxItem}>
                      <input type="checkbox" name="servicios" value="baños" />
                      <span>Baños</span>
                    </label>
                    <label className={checkboxItem}>
                      <input type="checkbox" name="servicios" value="wifi" />
                      <span>WiFi</span>
                    </label>
                    <label className={checkboxItem}>
                      <input type="checkbox" name="servicios" value="sala-espera" />
                      <span>Sala de Espera</span>
                    </label>
                  </div>
                </div>                
                <div className={modalActions}>
                  <button type="button" className={btnSecondary} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={btnPrimary}>Registrar Terminal</button>
                </div>
              </form>
            </div>
          );        case 'reserva':
          // Valores iniciales del formulario
          const initialValues = {
            viaje: '',
            nombres: '',
            apellidos: '',
            tipoDocumento: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
            asientoPreferencia: '',
            tipoPasajero: '',
            metodoPago: '',
            observaciones: ''
          };

          // Función de validación
          const validateReserva = (values: any) => {
            const errors: any = {};

            // Validación de viaje
            if (!values.viaje) {
              errors.viaje = 'Debe seleccionar un viaje';
            }

            // Validación de nombres
            if (!values.nombres) {
              errors.nombres = 'Los nombres son obligatorios';
            } else if (values.nombres.length < 2) {
              errors.nombres = 'Los nombres deben tener al menos 2 caracteres';
            }

            // Validación de apellidos
            if (!values.apellidos) {
              errors.apellidos = 'Los apellidos son obligatorios';
            } else if (values.apellidos.length < 2) {
              errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
            }

            // Validación de tipo de documento
            if (!values.tipoDocumento) {
              errors.tipoDocumento = 'Debe seleccionar un tipo de documento';
            }

            // Validación de número de documento
            if (!values.numeroDocumento) {
              errors.numeroDocumento = 'El número de documento es obligatorio';
            } else if (values.tipoDocumento === 'dni' && !/^\d{8}$/.test(values.numeroDocumento)) {
              errors.numeroDocumento = 'El DNI debe tener 8 dígitos';
            } else if (values.tipoDocumento === 'ce' && values.numeroDocumento.length < 8) {
              errors.numeroDocumento = 'El carné de extranjería debe tener al menos 8 caracteres';
            } else if (values.tipoDocumento === 'pasaporte' && values.numeroDocumento.length < 6) {
              errors.numeroDocumento = 'El pasaporte debe tener al menos 6 caracteres';
            }

            // Validación de teléfono
            if (!values.telefono) {
              errors.telefono = 'El teléfono es obligatorio';
            } else if (!/^\d{9}$/.test(values.telefono)) {
              errors.telefono = 'El teléfono debe tener 9 dígitos';
            }

            // Validación de email
            if (!values.email) {
              errors.email = 'El email es obligatorio';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
              errors.email = 'Formato de email inválido';
            }

            // Validación de tipo de pasajero
            if (!values.tipoPasajero) {
              errors.tipoPasajero = 'Debe seleccionar el tipo de pasajero';
            }

            // Validación de método de pago
            if (!values.metodoPago) {
              errors.metodoPago = 'Debe seleccionar un método de pago';
            }

            return errors;
          };

          // Función para enviar el formulario
          const handleSubmitReserva = (values: any, { setSubmitting }: any) => {
            console.log('Datos de la reserva:', values);
            // Aquí iría la lógica para enviar los datos al servidor
            setTimeout(() => {
              alert('Reserva creada exitosamente');
              setSubmitting(false);
              closeModal();
            }, 1000);
          };

          return (
            <div className={modalContent}>
              <div className={modalHeader}>
                <h2 className={modalTitle}>Crear Nueva Reserva</h2>
                <button className={modalClose} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              <Formik
                initialValues={initialValues}
                validate={validateReserva}
                onSubmit={handleSubmitReserva}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className={modalForm}>
                    <div className={formGroup}>
                      <label htmlFor="viaje">Viaje Disponible</label>
                      <Field as="select" id="viaje" name="viaje">
                        <option value="">Seleccionar viaje</option>
                        <option value="lima-arequipa-20jun">Lima → Arequipa - 20 Jun 2025 22:30 (S/ 80.00)</option>
                        <option value="arequipa-cusco-21jun">Arequipa → Cusco - 21 Jun 2025 08:00 (S/ 65.00)</option>
                        <option value="lima-trujillo-22jun">Lima → Trujillo - 22 Jun 2025 15:30 (S/ 70.00)</option>
                        <option value="cusco-lima-23jun">Cusco → Lima - 23 Jun 2025 20:00 (S/ 85.00)</option>
                      </Field>
                      <ErrorMessage name="viaje" component="div" className={fieldError} />
                    </div>
                    
                    <h3 className="mb-4 mt-[1em] text-[1.1rem] font-bold text-[#1f2937]">Datos del Pasajero</h3>
                    
                    <div className={formRow}>
                      <div className={formGroup}>
                        <label htmlFor="nombres">Nombres</label>
                        <Field type="text" id="nombres" name="nombres" placeholder="María Elena" />
                        <ErrorMessage name="nombres" component="div" className={fieldError} />
                      </div>
                      <div className={formGroup}>
                        <label htmlFor="apellidos">Apellidos</label>
                        <Field type="text" id="apellidos" name="apellidos" placeholder="González López" />
                        <ErrorMessage name="apellidos" component="div" className={fieldError} />
                      </div>
                    </div>
                    
                    <div className={formRow}>
                      <div className={formGroup}>
                        <label htmlFor="tipoDocumento">Tipo de Documento</label>
                        <Field as="select" id="tipoDocumento" name="tipoDocumento">
                          <option value="">Seleccionar</option>
                          <option value="dni">DNI</option>
                          <option value="ce">Carné de Extranjería</option>
                          <option value="pasaporte">Pasaporte</option>
                        </Field>
                        <ErrorMessage name="tipoDocumento" component="div" className={fieldError} />
                      </div>
                      <div className={formGroup}>
                        <label htmlFor="numeroDocumento">Número de Documento</label>
                        <Field type="text" id="numeroDocumento" name="numeroDocumento" placeholder="12345678" />
                        <ErrorMessage name="numeroDocumento" component="div" className={fieldError} />
                      </div>
                    </div>
                    
                    <div className={formRow}>
                      <div className={formGroup}>
                        <label htmlFor="telefono">Teléfono</label>
                        <Field type="tel" id="telefono" name="telefono" placeholder="987654321" />
                        <ErrorMessage name="telefono" component="div" className={fieldError} />
                      </div>
                      <div className={formGroup}>
                        <label htmlFor="email">Email</label>
                        <Field type="email" id="email" name="email" placeholder="maria@email.com" />
                        <ErrorMessage name="email" component="div" className={fieldError} />
                      </div>
                    </div>
                    
                    <div className={formRow}>
                      <div className={formGroup}>
                        <label htmlFor="asientoPreferencia">Preferencia de Asiento</label>
                        <Field as="select" id="asientoPreferencia" name="asientoPreferencia">
                          <option value="">Sin preferencia</option>
                          <option value="ventana">Ventana</option>
                          <option value="pasillo">Pasillo</option>
                          <option value="primera-fila">Primera fila</option>
                        </Field>
                        <ErrorMessage name="asientoPreferencia" component="div" className={fieldError} />
                      </div>
                      <div className={formGroup}>
                        <label htmlFor="tipoPasajero">Tipo de Pasajero</label>
                        <Field as="select" id="tipoPasajero" name="tipoPasajero">
                          <option value="">Seleccionar</option>
                          <option value="adulto">Adulto</option>
                          <option value="niño">Niño (3-11 años)</option>
                          <option value="estudiante">Estudiante</option>
                          <option value="adulto-mayor">Adulto Mayor</option>
                        </Field>
                        <ErrorMessage name="tipoPasajero" component="div" className={fieldError} />
                      </div>
                    </div>
                    
                    <div className={formGroup}>
                      <label htmlFor="metodoPago">Método de Pago</label>
                      <Field as="select" id="metodoPago" name="metodoPago">
                        <option value="">Seleccionar método</option>
                        <option value="efectivo">Efectivo en terminal</option>
                        <option value="tarjeta">Tarjeta de crédito/débito</option>
                        <option value="transferencia">Transferencia bancaria</option>
                        <option value="yape">Yape/Plin</option>
                      </Field>
                      <ErrorMessage name="metodoPago" component="div" className={fieldError} />
                    </div>
                    
                    <div className={formGroup}>
                      <label htmlFor="observaciones">Observaciones</label>
                      <Field 
                        as="textarea"
                        id="observaciones" 
                        name="observaciones" 
                        placeholder="Información adicional, necesidades especiales, etc."
                      />
                      <ErrorMessage name="observaciones" component="div" className={fieldError} />
                    </div>
                    
                    <div className={modalActions}>
                      <button type="button" className={btnSecondary} onClick={closeModal}>Cancelar</button>
                      <button type="submit" className={btnPrimary} disabled={isSubmitting}>
                        {isSubmitting ? 'Creando...' : 'Crear Reserva'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className={modalOverlay} onClick={closeModal}>
        <div onClick={(e) => e.stopPropagation()}>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc]">
      <Header
        navOptions={[
          { label: 'Contacto', path: '/contacto' },
          { label: 'Acerca de nosotros', path: '/acerca-de' }
        ]}
      />
      <aside className="fixed left-0 top-[100px] z-0 h-[calc(100vh-70px)] w-[200px] border-r border-[#e5e7eb] bg-white">
        <nav className="flex flex-col gap-1 p-4">
          <button 
            className={`${navItemBase} ${activeSection === 'dashboard' ? navItemActive : navItemIdle}`}
            onClick={() => setActiveSection('dashboard')}
            title="Panel de Control"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <span className="overflow-hidden whitespace-nowrap text-[0.8125rem]">Panel de Control</span>
          </button>
          <button 
            className={`${navItemBase} ${activeSection === 'buses' ? navItemActive : navItemIdle}`}
            onClick={() => setActiveSection('buses')}
            title="Buses"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            <span className="overflow-hidden whitespace-nowrap text-[0.8125rem]">Buses</span>
          </button>
          <button 
            className={`${navItemBase} ${activeSection === 'rutas' ? navItemActive : navItemIdle}`}
            onClick={() => setActiveSection('rutas')}
            title="Rutas"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
            </svg>
            <span className="overflow-hidden whitespace-nowrap text-[0.8125rem]">Rutas</span>
          </button>
          <button 
            className={`${navItemBase} ${activeSection === 'viajes' ? navItemActive : navItemIdle}`}
            onClick={() => setActiveSection('viajes')}
            title="Viajes"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span className="overflow-hidden whitespace-nowrap text-[0.8125rem]">Viajes</span>
          </button>          <button 
            className={`${navItemBase} ${activeSection === 'terminales' ? navItemActive : navItemIdle}`}
            onClick={() => setActiveSection('terminales')}
            title="Terminales"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="overflow-hidden whitespace-nowrap text-[0.8125rem]">Terminales</span>
          </button>
          <button 
            className={`${navItemBase} ${activeSection === 'reservas' ? navItemActive : navItemIdle}`}
            onClick={() => setActiveSection('reservas')}
            title="Gestión de Reservas"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9H9zM13 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2zM17 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h-2z"/>
              <path d="M21 5V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1H1v2h1v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h18v.5c0 .28.22.5.5.5s.5-.22.5-.5V7h1V5h-2z"/>
            </svg>
            <span className="overflow-hidden whitespace-nowrap text-[0.8125rem]">Reservas</span>
          </button>
        </nav>
      </aside>
      <main className="ml-[13rem] -mt-5 flex min-h-[calc(100vh-70px)] w-[calc(100%-280px)] flex-col items-center p-8 transition-[margin,width,padding] duration-300">
        {renderMainContent()}
      </main>
      
      {renderModal()}
    </div>
  );
}

export default EmpresaHome;
