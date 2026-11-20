// Clases reutilizables del sistema de diseño (todo vive en className, sin SCSS).
export const btnPrimario =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-senal px-6 py-3.5 font-display text-[0.85rem] font-semibold text-tinta shadow-senal transition duration-200 hover:-translate-y-0.5 hover:bg-[#ff6e3a] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:translate-y-0';

export const btnSecundario =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand/25 bg-white/70 px-5 py-3 text-[0.95rem] font-semibold text-brand transition duration-200 hover:border-brand/50 hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50';

export const btnPeligro =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-white/80 px-5 py-3 text-[0.95rem] font-semibold text-rose-600 transition duration-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50';

export const btnTexto =
  'inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[0.95rem] font-semibold text-brand underline-offset-4 hover:underline';

export const campo =
  'w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-[1rem] text-tinta placeholder:text-tinta-suave/60 transition duration-200 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:bg-brand-soft/50 disabled:text-tinta-suave';

export const etiqueta = 'mb-1.5 block text-[0.85rem] font-semibold text-tinta-suave';

export const errorCampo = 'mt-1 text-[0.8rem] font-semibold text-rose-600';

export const panel =
  'rounded-3xl border border-brand/10 bg-white/85 shadow-[0_10px_40px_-14px_rgba(79,47,240,0.3)] backdrop-blur-xl';

export const titulo = 'font-display font-bold tracking-tight text-tinta';

export const chip =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brand/20 bg-white/80 px-3.5 py-1.5 text-[0.85rem] font-semibold text-tinta-suave transition duration-200 hover:border-brand/50 hover:text-brand';

export const chipActivo = 'border-brand bg-brand text-white hover:text-white';
