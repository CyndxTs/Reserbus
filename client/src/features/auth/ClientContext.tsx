import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode,
} from 'react';
import axios, { AxiosError } from 'axios';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { API_URL } from '../../lib/api';

// Perfiles tal como los devuelve el server (GET /api/auth/me). El correo NO está en la BD del
// proyecto (vive en auth.users), así que se agrega aquí desde la sesión de Supabase.
export interface Viajero {
  id: number;
  auth_id: string;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
}
// Trabajador de una empresa (ADMINISTRATIVO -> rol EMPRESA, CHOFER -> rol CHOFER)
export interface Empresa {
  id: number;
  auth_id: string;
  id_empresa: number;
  tipo: 'CHOFER' | 'ADMINISTRATIVO';
  correo_electronico: string;
  nombres: string;
  apellidos: string;
  activo: boolean;
  Empresa?: { id: number; nombre: string; activa: boolean };
}
export interface Administrador {
  id: number;
  auth_id: string;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
}

type ClientData = Viajero | Administrador | Empresa;
export type ClientType = 'VIAJERO' | 'EMPRESA' | 'CHOFER' | 'ADMINISTRADOR';

// El server devuelve rol ADMIN | EMPRESA | CHOFER | VIAJERO
const ROL_A_TIPO: Record<string, ClientType> = {
  ADMIN: 'ADMINISTRADOR',
  EMPRESA: 'EMPRESA',
  CHOFER: 'CHOFER',
  VIAJERO: 'VIAJERO',
};

interface Perfil { client: ClientData; clientType: ClientType }

type SignInResult = { ok: true; clientType: ClientType } | { ok: false; error: string };
type SignUpResult = { ok: boolean; needsConfirmation?: boolean; error?: string };

interface ClientContextType {
  client: ClientData | null;
  clientType: ClientType | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<SignInResult>;
  signInWithGoogle: () => Promise<void>;
  signUp: (v: { email: string; password: string; nombres: string; apellidos: string }) => Promise<SignUpResult>;
  sendPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Pide el perfil al server. Si la cuenta de Supabase (correo o Google) aún no tiene perfil,
// el server responde 403 SIN_PERFIL y se crea el de VIAJERO con POST /api/auth/registro.
async function fetchPerfil(session: Session): Promise<Perfil> {
  const headers = { Authorization: `Bearer ${session.access_token}` };
  let data;
  try {
    ({ data } = await axios.get(`${API_URL}/api/auth/me`, { headers }));
  } catch (e) {
    const err = e as AxiosError<{ codigo?: string }>;
    if (err.response?.status !== 403 || err.response.data?.codigo !== 'SIN_PERFIL') throw e;
    // Correo+contraseña: los nombres vienen del formulario (metadata). Google: el server los deduce del token.
    const meta = session.user.user_metadata ?? {};
    const body = meta.nombres ? { nombres: meta.nombres, apellidos: meta.apellidos ?? '' } : {};
    ({ data } = await axios.post(`${API_URL}/api/auth/registro`, body, { headers }));
  }
  const client = { ...data.perfil, correo_electronico: session.user.email ?? '' } as ClientData;
  return { client, clientType: ROL_A_TIPO[data.rol] ?? 'VIAJERO' };
}

const statusDe = (e: unknown) => (e as AxiosError).response?.status;

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<ClientData | null>(null);
  const [clientType, setClientType] = useState<ClientType | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const cache = useRef<{ token: string; promise: Promise<Perfil> } | null>(null);

  // Evita pedir /api/auth/me dos veces para el mismo token (login manual + listener, StrictMode)
  const loadProfile = useCallback((s: Session) => {
    if (cache.current?.token === s.access_token) return cache.current.promise;
    const promise = fetchPerfil(s);
    cache.current = { token: s.access_token, promise };
    promise.catch(() => {
      if (cache.current?.promise === promise) cache.current = null;
    });
    return promise;
  }, []);

  // 1) Sesión de Supabase (se restaura sola al refrescar la página)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    // Dentro del callback NO se llama a otras funciones de supabase (puede bloquearse)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSessionReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) Perfil (rol + datos) cuando cambia el usuario
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!sessionReady) return;
    if (!userId || !session) {
      setClient(null);
      setClientType(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadProfile(session)
      .then((p) => {
        if (cancelled) return;
        setClient(p.client);
        setClientType(p.clientType);
      })
      .catch(async (e) => {
        if (cancelled) return;
        setClient(null);
        setClientType(null);
        // cuenta inexistente o deshabilitada: cerramos la sesión de Supabase
        if (statusDe(e) === 401 || statusDe(e) === 403) await supabase.auth.signOut();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, sessionReady]);

  const signInWithPassword = async (email: string, password: string): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      const noConfirmado = error?.message?.toLowerCase().includes('not confirmed');
      return { ok: false, error: noConfirmado ? 'Confirma tu correo primero' : 'Datos inválidos' };
    }
    try {
      const p = await loadProfile(data.session);
      setClient(p.client);
      setClientType(p.clientType);
      return { ok: true, clientType: p.clientType };
    } catch (e) {
      if (statusDe(e) === 401 || statusDe(e) === 403) {
        await supabase.auth.signOut();
        return { ok: false, error: 'Cuenta no disponible' };
      }
      return { ok: false, error: 'Error del servidor' };
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  const signUp: ClientContextType['signUp'] = async ({ email, password, nombres, apellidos }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombres, apellidos }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      return { ok: false, error: /already|registered/i.test(error.message) ? 'Correo ya registrado' : 'Error del servidor' };
    }
    // Supabase no avisa si el correo ya existe (anti-enumeración): devuelve identities vacías
    if (data.user && data.user.identities?.length === 0) {
      return { ok: false, error: 'Correo ya registrado' };
    }
    return { ok: true, needsConfirmation: !data.session };
  };

  // Sirve también para que quien entró con Google CREE una contraseña
  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    return error ? { ok: false, error: 'No se pudo enviar el correo. Intenta en unos minutos.' } : { ok: true };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { ok: false, error: error.message } : { ok: true };
  };

  // Vuelve a pedir el perfil al server (p. ej. después de editar datos en "Mi cuenta")
  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const p = await fetchPerfil(data.session);
    cache.current = null;
    setClient(p.client);
    setClientType(p.clientType);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setClient(null);
    setClientType(null);
  };

  return (
    <ClientContext.Provider
      value={{
        client, clientType, loading,
        signInWithPassword, signInWithGoogle, signUp, sendPasswordReset, updatePassword, logout, refreshProfile,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient debe usarse dentro de un ClientProvider');
  }
  return context;
};
