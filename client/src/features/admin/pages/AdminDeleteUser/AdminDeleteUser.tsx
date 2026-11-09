import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

interface Usuario {
  id: number;
  nombre: string;
  tipo: string;
  fechaCreacion: string;
  fechaRol: string;
  ruta: string; // Ruta de la API para eliminar
}

function DeleteUser() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const [resViaj, resEmp, resAdmin] = await Promise.all([
          axios.get("/api/viajeros"),
          axios.get("/api/empresas"),
          axios.get("/api/administradores"),
        ]);

        const formatFecha = (fecha: string | Date) =>
          new Date(fecha).toLocaleDateString("es-PE");

        const usuariosFormateados: Usuario[] = [
          ...resViaj.data.map((u: any) => ({
            id: u.id,
            nombre: `${u.nombres} ${u.apellidos}`,
            tipo: "Cliente",
            fechaCreacion: formatFecha(u.createdAt),
            fechaRol: formatFecha(u.updatedAt),
            ruta: "viajeros",
          })),
          ...resEmp.data.map((u: any) => ({
            id: u.id,
            nombre: `${u.nombres} ${u.apellidos}`,
            tipo: "Empresa",
            fechaCreacion: formatFecha(u.createdAt),
            fechaRol: formatFecha(u.updatedAt),
            ruta: "empresas",
          })),
          ...resAdmin.data.map((u: any) => ({
            id: u.id,
            nombre: `${u.nombres} ${u.apellidos}`,
            tipo: "Administrador",
            fechaCreacion: formatFecha(u.createdAt),
            fechaRol: formatFecha(u.updatedAt),
            ruta: "administradores",
          })),
        ];

        setUsuarios(usuariosFormateados);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };

    fetchUsuarios();
  }, []);

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${usuario.nombre}?`)) return;

    try {
      await axios.delete(`/api/${usuario.ruta}/${usuario.id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario.");
    }
  };

  return (
    <AdminLayout>
        <h1 className="-mt-16 mb-4 self-start text-left text-[2rem] font-semibold">Eliminar Usuario</h1>

        <div className="mb-6 flex w-full items-center justify-start gap-4">
          <input
            className="flex-[0_0_300px] rounded-md border border-[#ccc] px-[14px] py-[10px] text-[0.95rem]"
            type="text"
            placeholder="Buscar por nombre"
          />
          <button className="cursor-pointer rounded-md border-0 bg-[#eee] px-[14px] py-[10px] text-[0.95rem]">Filtros</button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full overflow-hidden rounded-lg border-collapse bg-white text-[0.95rem]">
            <thead className="bg-[#f8f8f8] font-bold [&_th]:border-b [&_th]:border-[#f0f0f0] [&_th]:px-4 [&_th]:py-3 [&_th]:text-left">
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Fecha de creación</th>
                <th>Rol Created Date</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={`${user.ruta}-${user.id}`} className="[&:last-child_td]:border-b-0 [&_td]:border-b [&_td]:border-[#f0f0f0]">
                  <td className="px-4 py-3 text-left">{user.nombre}</td>
                  <td className="px-4 py-3 text-left">{user.tipo}</td>
                  <td className="px-4 py-3 text-left">{user.fechaCreacion}</td>
                  <td className="px-4 py-3 text-left">{user.fechaRol}</td>
                  <td className="px-4 py-3 text-left text-[1.1rem]">
                    <span className="cursor-pointer text-red-600 transition-opacity duration-200 hover:opacity-70" onClick={() => handleDelete(user)}>
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
  );
}

export default DeleteUser;
