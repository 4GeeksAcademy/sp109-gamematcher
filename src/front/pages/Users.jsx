import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Users = () => {
  const { store, dispatch } = useGlobalReducer();
  const [form, setForm] = useState({ nickname: "", email: "", password: "" });
  const [editingId, setEditingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const loadUsers = async () => {
    const res = await fetch(`${backendUrl}/api/users`);
    const data = await res.json();
    dispatch({ type: "set_users", payload: data });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${backendUrl}/api/users/${editingId}`
      : `${backendUrl}/api/users`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ nickname: "", email: "", password: "" });
      setEditingId(null);
      loadUsers();
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (res.ok) {
        console.log("Usuario eliminado correctamente");
        loadUsers();
      } else {
        const error = await res.json();
        console.error("Error del servidor:", error);
        alert("Error al eliminar usuario: " + error.message);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("Error de conexión con el servidor");
    }
  };

  const handleEdit = (user) => {
    setForm({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });
    setEditingId(user.id);
  };

  return (
    <div className="container py-4">
      <h2>User Manager</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Nickname"
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          required
        />
        <input
          type="email"
          className="form-control my-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="text"
          className="form-control my-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn btn-success" type="submit">
          {editingId ? "Update User" : "Add User"}
        </button>
      </form>

      <ul className="list-group">
        {store.users?.map((user) => (
          <li key={user.id} className="list-group-item d-flex gap-5 justify-content-between">
            <div>
              <strong>{user.nickname}</strong>
              <p className="mb-1"><strong>Email:</strong> {user.email}</p>
              <p className="mb-0"><strong>Password:</strong> {user.password}</p>
            </div>
            <div className="d-flex flex-column gap-2 mb-2">
              <button
                className="btn btn-sm btn-warning"
                style={{ width: "40px", height: "40px" }}
                onClick={() => handleEdit(user)}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                className="btn btn-sm btn-danger"
                style={{ width: "40px", height: "40px" }}
                onClick={() => handleDelete(user.id)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
