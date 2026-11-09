import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  tipo: "Cliente" | "Administrador" | "Empresa";
  fechaCreacion: string;
  fechaRol: string;
}

const EditUser: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const [viajerosRes, adminsRes, empresasRes] = await Promise.all([
          axios.get("/api/viajeros"),
          axios.get("/api/administradores"),
          axios.get("/api/empresas"),
        ]);

        const formatDate = (f: string | Date) =>
          new Date(f).toLocaleDateString("es-PE");

        const mapUsuarios = (arr: any[], tipo: Usuario["tipo"]): Usuario[] =>
          arr.map((u) => ({
            id: u.id,
            nombres: u.nombres ?? "",
            apellidos: u.apellidos ?? "",
            tipo,
            fechaCreacion: formatDate(u.createdAt ?? Date.now()),
            fechaRol: formatDate(u.updatedAt ?? Date.now()),
          }));

        setUsuarios([
          ...mapUsuarios(viajerosRes.data, "Cliente"),
          ...mapUsuarios(adminsRes.data, "Administrador"),
          ...mapUsuarios(empresasRes.data, "Empresa"),
        ]);
      } catch (err) {
        console.error("Error al obtener usuarios", err);
      }
    };

    fetchUsuarios();
  }, []);

  const handleEdit = (usuario: Usuario) =>
    navigate("/admin/add-user", { state: { usuario, modo: "editar" } });

  const filteredUsuarios = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombres} ${u.apellidos}`.toLowerCase();
    const terminoBusqueda = searchTerm.trim().toLowerCase();
    return nombreCompleto.includes(terminoBusqueda);
  });

  return (
    <AdminLayout>
        <h1 className="-mt-16 mb-4 self-start text-left text-[2rem] font-semibold">Modificar Usuario</h1>
        <div className="mb-6 flex w-full items-center justify-start gap-4">
          <input
            className="flex-[0_0_300px] rounded-md border border-[#ccc] px-[14px] py-[10px] text-[0.95rem]"
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredUsuarios.map((u) => (
                <tr key={`${u.tipo}-${u.id}`} className="[&:last-child_td]:border-b-0 [&_td]:border-b [&_td]:border-[#f0f0f0]">
                  <td className="px-4 py-3 text-left">{`${u.nombres} ${u.apellidos}`.trim()}</td>
                  <td className="px-4 py-3 text-left">{u.tipo}</td>
                  <td className="px-4 py-3 text-left">{u.fechaCreacion}</td>
                  <td className="px-4 py-3 text-left">{u.fechaRol}</td>
                  <td className="px-4 py-3 text-left text-[1.1rem]">
                    <span className="cursor-pointer transition-opacity duration-200 hover:opacity-70" onClick={() => handleEdit(u)}>
                      ✏️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
  );
};

export default EditUser;