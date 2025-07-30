import { useEffect, useState } from "react";

export const UserGameFavoriteManager = () => {
  const [favorites, setFavorites] = useState([]);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ user_id: "", game_id: "" });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const loadFavorites = async () => {
    const res = await fetch(`${backendUrl}/api/favorites`);
    const data = await res.json();
    setFavorites(data);
  };

  const loadUsers = async () => {
    const res = await fetch(`${backendUrl}/api/users`);
    const data = await res.json();
    setUsers(data);
  };

  const loadGames = async () => {
    const res = await fetch(`${backendUrl}/api/games`);
    const data = await res.json();
    setGames(data);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.nickname : `Usuario #${userId}`;
  };

  const getGameName = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.name : `Juego #${gameId}`;
  };

  useEffect(() => {
    loadFavorites();
    loadUsers();
    loadGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${backendUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ user_id: "", game_id: "" });
      loadFavorites();
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/favorites/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      loadFavorites();
    }
  };

  return (
    <div className="container py-4">
      <h2>Favoritos de Usuarios</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Usuario:</label>
            <select
              className="form-select my-2"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              required
            >
              <option value="">Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nickname}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Juego:</label>
            <select
              className="form-select my-2"
              value={form.game_id}
              onChange={(e) => setForm({ ...form, game_id: e.target.value })}
              required
            >
              <option value="">Selecciona un juego</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-success mt-3">
          Añadir Favorito
        </button>
      </form>

      <ul className="list-group">
        {favorites.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{getUserName(item.user_id)}</strong> - {getGameName(item.game_id)}
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(item.id)}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </li>
        ))}
        {favorites.length === 0 && (
          <li className="list-group-item text-center text-muted">
            No hay favoritos registrados
          </li>
        )}
      </ul>
    </div>
  );
};
