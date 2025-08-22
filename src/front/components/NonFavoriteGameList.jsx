// src/front/pages/NonFavoriteGameList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const NonFavoriteGameList = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [nonFavorites, setNonFavorites] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");

  // helper para URLs absolutas (sirve si el backend devuelve paths relativos)
  const abs = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (backendUrl || "").replace(/\/$/, "");
    return `${base}/${String(url).replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    fetch(`${backendUrl}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []));

    fetch(`${backendUrl}/api/games`)
      .then((res) => res.json())
      .then((data) => setGames(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (user?.id) setSelectedUserId(String(user.id));
  }, [user]);

  const loadNonFavorites = async (uid) => {
    const res = await fetch(`${backendUrl}/api/users/${uid}/non-favorites`);
    const data = await res.json();
    setNonFavorites(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!selectedUserId) return;
    loadNonFavorites(selectedUserId);
  }, [selectedUserId]);

  const handleAdd = async () => {
    if (!selectedUserId || !selectedGameId) return;

    const res = await fetch(`${backendUrl}/api/non-favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(selectedUserId, 10),
        game_id: parseInt(selectedGameId, 10),
      }),
    });

    if (res.ok) {
      setSelectedGameId("");
      loadNonFavorites(selectedUserId);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/non-favorites/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setNonFavorites((list) => list.filter((rel) => rel.id !== id));
    }
  };

  // mapas para nombre/imagen de juegos
  const gameById = useMemo(() => {
    const m = new Map();
    games.forEach((g) => m.set(g.id, g));
    return m;
  }, [games]);

  return (
    <div className="container my-4">
      <h3 className="mb-3">Banned Games</h3>

      {/* Selector de usuario */}
      <div className="glass-card p-3 p-md-4 mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">User</label>
            {user?.role === "admin" ? (
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nickname || u.name || `User ${u.id}`}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="text"
                  className="form-control"
                  value={user?.nickname || user?.name || `User ${user?.id}`}
                  disabled
                />
                <input type="hidden" value={selectedUserId} />
              </>
            )}
          </div>

          {/* Selector de juego y botón */}
          <div className="col-md-4">
            <label className="form-label">Game</label>
            <select
              className="form-select"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              disabled={!selectedUserId}
            >
              <option value="">Select game to ban</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button
              className="btn btn-gradient"
              onClick={handleAdd}
              disabled={!selectedUserId || !selectedGameId}
            >
              Ban game
            </button>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {!selectedUserId ? (
        <div className="alert alert-info">Select a user to manage banned games.</div>
      ) : nonFavorites.length === 0 ? (
        <div className="text-center text-muted py-4">No banned games yet.</div>
      ) : (
        <div className="row g-4">
          {nonFavorites.map((rel) => {
            const g = gameById.get(rel.game_id);
            const cover = abs(g?.image_url || g?.background_image);
            return (
              <div key={rel.id} className="col-12 col-sm-6 col-lg-4">
                <div className="card glass-card h-100 overflow-hidden">
                  {cover ? (
                    <div
                      className="fav-cover"
                      style={{ backgroundImage: `url('${cover}')` }}
                      title={g?.name}
                    />
                  ) : (
                    <div className="fav-cover fav-cover--fallback d-flex align-items-center justify-content-center">
                      <i className="fa-solid fa-image fa-2x text-muted"></i>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="mb-2 fav-title">{g?.name || rel.game_name || `Game #${rel.game_id}`}</h5>

                    {/* Chips simples (año si hay) */}
                    {(g?.release_date || g?.released) && (
                      <div className="mb-3">
                        <span className="chip soft">
                          <i className="fa-solid fa-calendar"></i>
                          {g.release_date
                            ? new Date(g.release_date).getFullYear()
                            : String(g.released).slice(0, 4)}
                        </span>
                      </div>
                    )}

                    <div className="mt-auto d-grid">
                      <button
                        className="btn btn-outline-danger-soft"
                        onClick={() => handleDelete(rel.id)}
                        type="button"
                      >
                        <i className="fa-solid fa-trash me-2"></i>
                        Remove ban
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NonFavoriteGameList;
