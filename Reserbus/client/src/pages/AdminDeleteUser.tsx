import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDeleteUser.css";

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
    <div className="admin-home">
      <header className="header">
        <div className="brand">
          <img src="/RB_LogoWhite.png" alt="icon-reserbus" className="logo" />
          <span className="brand-name">reserbus</span>
        </div>
        <div className="header-icons">
          <img src="/Icon_Account.svg" alt="user-profile" className="profile-pic" />
        </div>
      </header>

      <aside className="sidebar">
        <ul>
          <li className="active">Usuarios</li>
          <li>Roles</li>
          <li>Empresas</li>
          <li>Parámetros</li>
          <li>Reportes</li>
        </ul>
      </aside>

      <main className="main-content add-user">
        <div className="breadcrumb">Gestión de Usuarios / Eliminar Usuario</div>
        <h1 className="main-title left">Eliminar Usuario</h1>

        <div className="search-bar">
          <input type="text" placeholder="Buscar por nombre" />
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
              {usuarios.map((user) => (
                <tr key={`${user.ruta}-${user.id}`}>
                  <td>{user.nombre}</td>
                  <td>{user.tipo}</td>
                  <td>{user.fechaCreacion}</td>
                  <td>{user.fechaRol}</td>
                  <td className="acciones">
                    <span className="delete-icon" onClick={() => handleDelete(user)} style={{ cursor: "pointer", color: "red" }}>
                      🗑️
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
}

export default DeleteUser;
