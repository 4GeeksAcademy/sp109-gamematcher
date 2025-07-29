import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Platforms = () => {
  const { store, dispatch } = useGlobalReducer();
  const [form, setForm] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const loadPlatforms = async () => {
    const res = await fetch(`${backendUrl}/api/platforms`);
    const data = await res.json();
    dispatch({ type: "set_platforms", payload: data });
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${backendUrl}/api/platforms/${editingId}`
      : `${backendUrl}/api/platforms`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", price: "" });
      setEditingId(null);
      loadPlatforms();
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/platforms/${id}`, { method: "DELETE" });
    if (res.ok) loadPlatforms();
  };

  const handleEdit = (platform) => {
    setForm({ name: platform.name, price: platform.price });
    setEditingId(platform.id);
  };

  return (
    <div className="container py-4">
      <h2>Platforms</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          className="form-control my-2"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <button className="btn btn-success" type="submit">
          {editingId ? "Actualizar Plataforma" : "Añadir Plataforma"}
        </button>
      </form>

      <ul className="list-group">
        {store.platforms.map((platform) => (
          <li key={platform.id} className="list-group-item d-flex gap-5 justify-content-between">
            <div className="d-flex flex-column gap-2">
              <div className="border rounded p-2 bg-light">
                <strong>{platform.name}</strong>
              </div>
              <div className="border rounded p-2 bg-light">
                {platform.price}
              </div>
            </div>
            <div className="d-flex flex-column gap-2 mb-2">
              <button className="btn btn-sm btn-warning me-2 mb-2" style={{ width: "40px", height: "40px" }} onClick={() => handleEdit(platform)}><i className="fa-solid fa-pen-to-square"></i></button>
              <button className="btn btn-sm btn-danger" style={{ width: "40px", height: "40px" }} onClick={() => handleDelete(platform.id)}><i className="fa-solid fa-trash"></i></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};