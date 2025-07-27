import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const GameManager = () => {
  const { store, dispatch } = useGlobalReducer();
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const loadGames = async () => {
    const res = await fetch(`${backendUrl}/api/games`);
    const data = await res.json();
    dispatch({ type: "set_games", payload: data });
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${backendUrl}/api/games/${editingId}`
      : `${backendUrl}/api/games`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", description: "" });
      setEditingId(null);
      loadGames();
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/games/${id}`, { method: "DELETE" });
    if (res.ok) loadGames();
  };

  const handleEdit = (game) => {
    setForm({ name: game.name, description: game.description });
    setEditingId(game.id);
  };

  return (
    <div className="container py-4">
      <h2>Game Manager</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="form-control my-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        ></textarea>
        <button className="btn btn-success" type="submit">
          {editingId ? "Actualizar Juego" : "Añadir Juego"}
        </button>
      </form>

      <ul className="list-group">
        {store.games.map((game) => (
          <li key={game.id} className="list-group-item d-flex gap-5 justify-content-between">
            <div>
              <strong>{game.name}</strong>
              <p className="mb-0">{game.description}</p>
            </div>
            <div className="d-flex flex-column gap-2 mb-2">
              <button className="btn btn-sm btn-warning me-2 mb-2" style={{ width: "40px", height: "40px" }} onClick={() => handleEdit(game)}><i className="fa-solid fa-pen-to-square"></i></button>
              <button className="btn btn-sm btn-danger" style={{ width: "40px", height: "40px" }} onClick={() => handleDelete(game.id)}><i className="fa-solid fa-trash"></i></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
