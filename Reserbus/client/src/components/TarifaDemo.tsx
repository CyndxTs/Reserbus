import React, { useState } from 'react';
import { useTarifa } from '../context/TarifaContext';

const TarifaDemoForm: React.FC = () => {
  const {
    tarifas, viajes, tiposDeAsiento,
    createTarifa, updateTarifa, deleteTarifa
  } = useTarifa();
   
  // Para crear/editar
  const [form, setForm] = useState({
    id_tarifa: 0,
    id_viaje: '',
    id_tipo_de_asiento: '',
    precio: ''
  });

  const [editMode, setEditMode] = useState(false);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear tarifa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      await updateTarifa(form.id_tarifa, {
        id_viaje: Number(form.id_viaje),
        id_tipo_de_asiento: Number(form.id_tipo_de_asiento),
        precio: Number(form.precio)
      });
    } else {
      await createTarifa({
        id_viaje: Number(form.id_viaje),
        id_tipo_de_asiento: Number(form.id_tipo_de_asiento),
        precio: Number(form.precio)
      });
    }
    setForm({ id_tarifa: 0, id_viaje: '', id_tipo_de_asiento: '', precio: '' });
    setEditMode(false);
  };

  // Preparar edición
  const handleEdit = (tarifa: any) => {
    setForm({
      id_tarifa: tarifa.id_tarifa,
      id_viaje: tarifa.Viaje.id_viaje,
      id_tipo_de_asiento: tarifa.TipoDeAsiento.id_tipo_de_asiento,
      precio: tarifa.precio
    });
    setEditMode(true);
  };

  // Eliminar tarifa
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar esta tarifa?')) {
      await deleteTarifa(id);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>{editMode ? 'Editar' : 'Crear'} Tarifa</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Viaje:</label>
          <select name="id_viaje" value={form.id_viaje} onChange={handleChange} required>
            <option value="">Selecciona un viaje</option>
            {viajes.map((v: any) => (
                <option key={v.id_viaje} value={v.id_viaje}>
                {(v.Rutum?.terminalOrigen?.nombre || '¿?')} → {(v.Rutum?.terminalDestino?.nombre || '¿?')}
                </option>
            ))}
            </select>
        </div>
        <div>
          <label>Tipo de Asiento:</label>
          <select name="id_tipo_de_asiento" value={form.id_tipo_de_asiento} onChange={handleChange} required>
            <option value="">Selecciona tipo</option>
            {tiposDeAsiento.map((t: any) => (
              <option key={t.id_tipo_de_asiento} value={t.id_tipo_de_asiento}>
                {t.nombre} ({t.descripcion})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            required
            min={0}
          />
        </div>
        <button type="submit">{editMode ? 'Actualizar' : 'Crear'}</button>
        {editMode && (
          <button type="button" onClick={() => { setEditMode(false); setForm({ id_tarifa: 0, id_viaje: '', id_tipo_de_asiento: '', precio: '' }); }}>
            Cancelar
          </button>
        )}
      </form>

      <h3>Tarifas existentes</h3>
      <table border={1} cellPadding={4} style={{ width: '100%', marginTop: 20 }}>
        <thead>
          <tr>
            <th>Viaje</th>
            <th>Tipo de Asiento</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tarifas.map((tarifa: any) => (
            <tr key={tarifa.id_tarifa}>
              <td>
                {(tarifa.Viaje?.Rutum?.terminalOrigen?.nombre || '¿?')} → {(tarifa.Viaje?.Rutum?.terminalDestino?.nombre || '¿?')}
                </td>
              <td>
                {tarifa.TipoDeAsiento.nombre} <br />
                ({tarifa.TipoDeAsiento.descripcion})
              </td>
              <td>{tarifa.precio}</td>
              <td>
                <button onClick={() => handleEdit(tarifa)}>Editar</button>
                <button onClick={() => handleDelete(tarifa.id_tarifa)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TarifaDemoForm;