import axios from 'axios';

export interface ResultadoServicio {
  ok: boolean;
  pendiente?: boolean;   // true = el endpoint aún no existe en el server
  mensaje?: string;
}

// PUT /api/viajeros/me (ya existe en el server)
export async function actualizarPerfil(datos: { nombres: string; apellidos: string }): Promise<ResultadoServicio> {
  try {
    await axios.put('/api/viajeros/me', datos);
    return { ok: true };
  } catch {
    return { ok: false, mensaje: 'No se pudo guardar. Intenta de nuevo.' };
  }
}

// TODO(server): crear DELETE /api/viajeros/me (borrar/anonimizar el perfil y el usuario de Supabase Auth,
// y definir qué pasa con sus viajes). Cuando exista, reemplazar el cuerpo por:
//   await axios.delete('/api/viajeros/me'); await supabase.auth.signOut();
// Por ahora NO llama al server.
export async function eliminarCuenta(): Promise<ResultadoServicio> {
  return {
    ok: false,
    pendiente: true,
    mensaje: 'TODO: la eliminación de cuenta aún no está disponible (falta el endpoint DELETE /api/viajeros/me en el server).',
  };
}
