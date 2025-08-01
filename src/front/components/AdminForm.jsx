import React from "react";

export const AdminForm = ({ form, setForm, onSubmit, onCancel, isEditing }) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5>{isEditing ? "Editar Administrador" : "Nuevo Administrador"}</h5>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            </div>
            <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className={`btn ${isEditing ? 'btn-warning' : 'btn-success'} me-2`}
            >
              {isEditing ? "Actualizar" : "Crear"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};