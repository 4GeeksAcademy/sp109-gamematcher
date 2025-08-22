import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const UserGenrePreferenceList = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [userGenrePreferences, setUserGenrePreferences] = useState([]);
  const [formData, setFormData] = useState({ user_id: "", genre_id: "" });

  const genreById = useMemo(() => {
    const m = new Map();
    genres.forEach((g) => m.set(String(g.id), g));
    return m;
  }, [genres]);

  const genreByName = useMemo(() => {
    const m = new Map();
    genres.forEach((g) => m.set(String((g.name || "").toLowerCase().trim()), g));
    return m;
  }, [genres]);

  useEffect(() => {
    fetch(`${backendUrl}/api/users`).then(r=>r.json()).then(setUsers).catch(()=>setUsers([]));
    fetch(`${backendUrl}/api/genres`).then(r=>r.json()).then(setGenres).catch(()=>setGenres([]));
  }, []);

  useEffect(() => {
    if (user?.role !== "admin" && user?.id) {
      setFormData((f) => ({ ...f, user_id: String(user.id) }));
    }
  }, [user]);

  useEffect(() => {
    if (!formData.user_id) { setUserGenrePreferences([]); return; }
    loadPreferences(formData.user_id);
  }, [formData.user_id]);

  const loadPreferences = async (userId) => {
    try {
      const res = await fetch(`${backendUrl}/api/user-genre-preferences?user_id=${userId}`);
      if (!res.ok) throw 0;
      setUserGenrePreferences(await res.json());
    } catch { setUserGenrePreferences([]); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.genre_id) return;

    const userId = user?.role === "admin" ? parseInt(formData.user_id, 10) : user.id;

    const res = await fetch(`${backendUrl}/api/user-genre-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        genre_id: parseInt(formData.genre_id, 10),
      }),
    });

    if (res.ok) {
      setFormData((f) => ({ ...f, genre_id: "" }));
      loadPreferences(userId);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/user-genre-preferences/${id}`, { method: "DELETE" });
    if (res.ok) setUserGenrePreferences((prefs) => prefs.filter((p) => p.id !== id));
  };

  // ---------- helpers visuales ----------
  const abs = (url) => (!url ? "" : /^https?:\/\//i.test(url) ? url : `${backendUrl}/${String(url).replace(/^\/+/, "")}`);

  const catalogFromAssoc = (assoc) => {
    if (assoc.genre_id != null) {
      const byId = genreById.get(String(assoc.genre_id));
      if (byId) return byId;
    }
    if (assoc.genre_name) {
      const byName = genreByName.get(String(assoc.genre_name).toLowerCase().trim());
      if (byName) return byName;
    }
    return null;
  };

  const pickImage = (assoc) => {
    const fromAssoc = assoc.genre_image_url || assoc.image_url || assoc.image || null;
    if (fromAssoc) return abs(fromAssoc);
    const cat = catalogFromAssoc(assoc);
    if (cat) {
      const fromCat = cat.image_url || cat.icon_url || cat.logo_url || cat.image || null;
      if (fromCat) return abs(fromCat);
    }
    return "";
  };

  const iconFor = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("action")) return "fa-solid fa-bolt";
    if (n.includes("adventure")) return "fa-solid fa-compass";
    if (n.includes("rpg") || n.includes("role")) return "fa-solid fa-hat-wizard";
    if (n.includes("shooter")) return "fa-solid fa-crosshairs";
    if (n.includes("strategy")) return "fa-solid fa-chess-knight";
    if (n.includes("puzzle")) return "fa-solid fa-puzzle-piece";
    if (n.includes("racing")) return "fa-solid fa-car";
    if (n.includes("sports")) return "fa-solid fa-futbol";
    if (n.includes("simulation")) return "fa-solid fa-vial";
    if (n.includes("platform")) return "fa-solid fa-layer-group";
    return "fa-solid fa-gamepad";
  };

  const Thumb = ({ assoc }) => {
    const img = pickImage(assoc);
    const name = assoc.genre_name || "Genre";
    if (img) {
      return (
        <div
          className="pref-thumb"
          style={{ backgroundImage: `url('${img}')` }}
          title={name}
        />
      );
    }
    return (
      <div className="pref-thumb pref-thumb--fallback">
        <i className={`${iconFor(name)} pref-thumb__icon`} />
      </div>
    );
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3">Genre Preferences</h3>

      <form className="row g-2 mb-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          {user?.role === "admin" ? (
            <select name="user_id" className="form-select" value={formData.user_id} onChange={handleChange} required>
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nickname || u.name || `User ${u.id}`}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input type="text" className="form-control" value={user?.nickname || user?.name || `User ${user?.id}`} disabled />
              <input type="hidden" name="user_id" value={formData.user_id} />
            </>
          )}
        </div>

        <div className="col-md-6">
          <select name="genre_id" className="form-select" value={formData.genre_id} onChange={handleChange} required>
            <option value="">Select a genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 mt-2 d-grid">
          <button type="submit" className="btn btn-gradient btn-lg" disabled={!formData.user_id || !formData.genre_id}>
            + Add
          </button>
        </div>
      </form>

      <div className="row g-4">
        {userGenrePreferences.length > 0 ? (
          userGenrePreferences.map((assoc) => (
            <div key={assoc.id} className="col-12 col-md-6 col-lg-4">
              <div className="card glass-card pref-card h-100 overflow-hidden">
                <Thumb assoc={assoc} />
                <div className="card-body">
                  <h5 className="mb-3">{assoc.genre_name}</h5>
                  <button className="btn btn-outline-danger-soft w-100" onClick={() => handleDelete(assoc.id)} type="button">
                    <i className="fa-solid fa-trash me-2"></i>Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center text-muted">No preferences found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGenrePreferenceList;


