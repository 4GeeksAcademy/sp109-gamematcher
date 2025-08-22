import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const UserGameFavoriteManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const [favorites, setFavorites] = useState([]);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ user_id: "", game_id: "" });

  const abs = (url) => (!url ? "" : /^https?:\/\//i.test(url) ? url : `${backendUrl}/${String(url).replace(/^\/+/, "")}`);

  const platformIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("playstation")) return "fa-brands fa-playstation";
    if (n.includes("xbox")) return "fa-brands fa-xbox";
    if (n.includes("nintendo") || n.includes("switch")) return "fa-solid fa-gamepad";
    if (n.includes("pc") || n.includes("windows")) return "fa-solid fa-desktop";
    if (n.includes("mac")) return "fa-brands fa-apple";
    if (n.includes("linux")) return "fa-brands fa-linux";
    if (n.includes("android")) return "fa-brands fa-android";
    return "fa-solid fa-gamepad";
  };

  const loadFavorites = async () => {
    const res = await fetch(`${backendUrl}/api/favorites`);
    const data = await res.json();
    setFavorites(Array.isArray(data) ? data : []);
  };
  const loadUsers = async () => {
    const res = await fetch(`${backendUrl}/api/users`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };
  const loadGames = async () => {
    const res = await fetch(`${backendUrl}/api/games`);
    const data = await res.json();
    setGames(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadFavorites();
    loadUsers();
    loadGames();
  }, []);

  useEffect(() => {
    if (user?.role !== "admin" && user?.id) {
      setForm((f) => ({ ...f, user_id: String(user.id) }));
    }
  }, [user]);

  const userById = useMemo(() => {
    const m = new Map();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  const gameById = useMemo(() => {
    const m = new Map();
    games.forEach((g) => m.set(g.id, g));
    return m;
  }, [games]);

  const enrichGame = (gRaw) => {
    if (!gRaw) return null;
    const background_image =
      gRaw.image_url || gRaw.background_image ? abs(gRaw.image_url || gRaw.background_image) : "";
    const released =
      gRaw.release_date
        ? new Date(gRaw.release_date).getFullYear().toString()
        : (gRaw.released ? String(gRaw.released).slice(0, 4) : "");
    const genres =
      gRaw.genres && Array.isArray(gRaw.genres) ? gRaw.genres : gRaw.genres_names || [];
    const platforms =
      gRaw.platforms && Array.isArray(gRaw.platforms) ? gRaw.platforms : gRaw.platform_names || [];
    const rating = gRaw.rating || 0;

    return { id: gRaw.id, name: gRaw.name, background_image, released, rating, genres, platforms };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.game_id) return;

    const payload = {
      user_id: user?.role === "admin" ? parseInt(form.user_id, 10) : user.id,
      game_id: parseInt(form.game_id, 10),
    };

    const res = await fetch(`${backendUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm({
        user_id: user?.role === "admin" ? "" : String(user?.id || ""),
        game_id: "",
      });
      loadFavorites();
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation(); // no navegar al borrar
    const res = await fetch(`${backendUrl}/api/favorites/${id}`, { method: "DELETE" });
    if (res.ok) loadFavorites();
  };

  const filteredFavorites =
    user?.role === "admin" ? favorites : favorites.filter((f) => f.user_id === user?.id);

  const openDetail = (gameId) => {
    if (!gameId) return;
    navigate(`/dashboard/local-games/${gameId}`);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">User Favorites</h2>

      <form onSubmit={handleSubmit} className="glass-card p-3 p-md-4 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">User</label>
            {user?.role === "admin" ? (
              <select
                className="form-select"
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                required
              >
                <option value="">Select a user</option>
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
                <input type="hidden" value={form.user_id} />
              </>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Game</label>
            <select
              className="form-select"
              value={form.game_id}
              onChange={(e) => setForm({ ...form, game_id: e.target.value })}
              required
            >
              <option value="">Select a game</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-gradient btn-lg">
              + Add favorite
            </button>
          </div>
        </div>
      </form>

      <div className="row g-4">
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map((fav) => {
            const g = enrichGame(gameById.get(fav.game_id));
            const u = userById.get(fav.user_id);

            return (
              <div key={fav.id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card glass-card fav-card h-100 overflow-hidden fav-card--clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(g?.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDetail(g?.id)}
                >
                  {g?.background_image ? (
                    <div
                      className="fav-cover"
                      style={{ backgroundImage: `url('${g.background_image}')` }}
                      title={g?.name}
                    />
                  ) : (
                    <div className="fav-cover fav-cover--fallback d-flex align-items-center justify-content-center">
                      <i className="fa-solid fa-image fa-2x text-muted"></i>
                    </div>
                  )}

                  <div className="card-body d-flex flex-column">
                    <h5 className="mb-2 fav-title">{g?.name || "Unknown game"}</h5>

                    <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                      {!!g?.rating && g.rating > 0 && (
                        <span className="rating-chip">
                          <i className="fa-solid fa-star"></i>
                          {g.rating}
                        </span>
                      )}
                      {!!g?.released && (
                        <span className="chip soft">
                          <i className="fa-solid fa-calendar"></i>
                          {g.released}
                        </span>
                      )}
                    </div>

                    {g?.platforms && g.platforms.length > 0 && (
                      <div className="fav-platforms mb-2">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          {g.platforms.slice(0, 6).map((pName, idx) => (
                            <span key={`${pName}-${idx}`} className="pill-plat">
                              <i className={`${platformIcon(pName)} me-1`}></i>
                              {pName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {g?.genres && g.genres.length > 0 && (
                      <div className="mb-3">
                        {g.genres.slice(0, 4).map((genre, i) => (
                          <span key={`${genre}-${i}`} className="chip alt me-2 mb-2">
                            <i className="fa-solid fa-tags"></i>
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    {user?.role === "admin" && (
                      <div className="mt-auto mb-3">
                        <small className="text-muted">
                          <i className="fa-regular fa-user me-1"></i>
                          {u?.nickname || u?.name || `User ${fav.user_id}`}
                        </small>
                      </div>
                    )}

                    <div className="mt-auto d-grid">
                      <button
                        className="btn btn-outline-danger-soft"
                        onClick={(e) => handleDelete(fav.id, e)}
                        type="button"
                      >
                        <i className="fa-solid fa-trash me-2"></i>Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="text-center text-muted">No favorites found</div>
          </div>
        )}
      </div>
    </div>
  );
};


