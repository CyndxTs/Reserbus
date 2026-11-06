import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode,
} from 'react';
import axios, { AxiosError } from 'axios';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { API_URL } from '../../lib/api';

export interface Viajero {
  id_viajero: number;
  id_auth?: string;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string;
  avatar_url?: string;
  esta_habilitado: boolean;
}
export interface Empresa {
  id_empresa: number;
  id_auth?: string;
  correo_electronico: string;
  razon_social?: string;
  ruc?: string;
  descripcion?: string;
  logo_url?: string;
  esta_habilitado: boolean;
}
export interface Administrador {
  id_administrador: number;
  id_auth?: string;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
  foto_url?: string;
  fecha_nacimiento?: string;
  esta_habilitado: boolean;
}

type ClientData = Viajero | Administrador | Empresa;
export type ClientType = 'VIAJERO' | 'EMPRESA' | 'ADMINISTRADOR';

// El server devuelve rol ADMIN | EMPRESA | VIAJERO
const ROL_A_TIPO: Record<string, ClientType> = {
  ADMIN: 'ADMINISTRADOR',
  EMPRESA: 'EMPRESA',
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
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

async function fetchPerfil(accessToken: string): Promise<Perfil> {
  const { data } = await axios.get(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return { client: data.perfil as ClientData, clientType: ROL_A_TIPO[data.rol] ?? 'VIAJERO' };
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
    const promise = fetchPerfil(s.access_token);
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

  const logout = async () => {
    await supabase.auth.signOut();
    setClient(null);
    setClientType(null);
  };

  return (
    <ClientContext.Provider
      value={{
        client, clientType, loading,
        signInWithPassword, signInWithGoogle, signUp, sendPasswordReset, updatePassword, logout,
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
