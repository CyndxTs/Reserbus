import axios from 'axios';
import { Terminal } from '../utils/BuscarViajeUtil';

let cache: Terminal[] | null = null;

// GET /api/terminales (la lista cambia poco: se guarda en memoria)
export async function listarTerminales(): Promise<Terminal[]> {
  if (cache) return cache;
  const { data } = await axios.get<Terminal[]>('/api/terminales');
  cache = data;
  return data;
}
