import React, { useState, useEffect } from "react";
import { AdminForm } from "../components/AdminForm";
import { Alert } from "../components/Alert";

export const AdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admins`);
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      setMessage("Error cargando administradores");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${backendUrl}/api/admins/${editingId}`
        : `${backendUrl}/api/admins`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: "", email: "" });
        setEditingId(null);
        loadAdmins();
        setMessage(editingId ? "Admin actualizado" : "Admin creado");
      } else {
        setMessage("Error guardando admin");
      }
    } catch (error) {
      setMessage("Error guardando admin");
    }
    setLoading(false);
  }; const handleDelete = async (id) => {
    if (confirm("¿Eliminar este admin?")) {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admins/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          loadAdmins();
          setMessage("Admin eliminado");
        } else {
          setMessage("Error eliminando admin");
        }
      } catch (error) {
        setMessage("Error eliminando admin");
      }
      setLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setForm({ name: admin.name, email: admin.email });
    setEditingId(admin.id);
  };

  const handleNewAdmin = () => {
    setForm({ name: "", email: "" });
    setEditingId(null);
    setMessage("");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administradores</h2>
        <button
          className="btn btn-primary"
          onClick={handleNewAdmin}
        >
          <i className="fas fa-plus me-2"></i>
          Nuevo Administrador
        </button>
      </div>

      <Alert
        message={message}
      />

      <AdminForm
        form={form}
        setForm={setForm}
        isEditing={!!editingId}
        onSubmit={handleSubmit}
        onCancel={handleNewAdmin}
      />

      <div className="mt-4">
        <h4>Lista de Administradores</h4>
        {admins.length === 0 && !loading ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            No hay administradores registrados
          </div>
        ) : (
          <div className="list-group">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="mb-1">{admin.name}</h6>
                  <p className="mb-0 text-muted">
                    <i className="fas fa-envelope me-1"></i>
                    {admin.email}
                  </p>
                </div>
                <div>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(admin)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(admin.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
