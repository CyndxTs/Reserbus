import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminEditUser.css";

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
    <div className="admin-home">
      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <img src="/RB_LogoWhite.png" alt="icon-reserbus" className="logo" />
          <span className="brand-name">reserbus</span>
        </div>
        <div className="header-icons">
          <img src="/Icon_Account.svg" alt="user-profile" className="profile-pic" />
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <ul>
          <li className="active">Usuarios</li>
          <li>Roles</li>
          <li>Empresas</li>
          <li>Parámetros</li>
          <li>Reportes</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main className="main-content edit-user">
        <div className="breadcrumb">Gestión de Usuarios / Modificar Usuario</div>
        <h1 className="main-title left">Modificar Usuario</h1>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="filter-button">Filtros</button>
        </div>

        <div className="table-container">
          <table className="user-table">
            <thead>
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
                <tr key={`${u.tipo}-${u.id}`}>
                  <td>{`${u.nombres} ${u.apellidos}`.trim()}</td>
                  <td>{u.tipo}</td>
                  <td>{u.fechaCreacion}</td>
                  <td>{u.fechaRol}</td>
                  <td className="acciones">
                    <span className="edit-icon" onClick={() => handleEdit(u)}>
                      ✏️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default EditUser;