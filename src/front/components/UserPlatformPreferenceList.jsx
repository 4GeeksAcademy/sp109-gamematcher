import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const UserPlatformPreferenceList = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [userPlatformPreferences, setUserPlatformPreferences] = useState([]);
  const [formData, setFormData] = useState({ user_id: "", platform_id: "" });

  const platformById = useMemo(() => {
    const m = new Map();
    platforms.forEach((p) => m.set(String(p.id), p));
    return m;
  }, [platforms]);

  const platformByName = useMemo(() => {
    const m = new Map();
    platforms.forEach((p) => m.set(String((p.name || "").toLowerCase().trim()), p));
    return m;
  }, [platforms]);

  useEffect(() => {
    fetch(`${backendUrl}/api/users`).then(r=>r.json()).then(setUsers).catch(()=>setUsers([]));
    fetch(`${backendUrl}/api/platforms`).then(r=>r.json()).then(setPlatforms).catch(()=>setPlatforms([]));
  }, []);

  useEffect(() => {
    if (user?.role !== "admin" && user?.id) {
      setFormData((f) => ({ ...f, user_id: String(user.id) }));
    }
  }, [user]);

  useEffect(() => {
    if (!formData.user_id) { setUserPlatformPreferences([]); return; }
    loadPreferences(formData.user_id);
  }, [formData.user_id]);

  const loadPreferences = async (userId) => {
    try {
      const res = await fetch(`${backendUrl}/api/user-platform-preferences?user_id=${userId}`);
      if (!res.ok) throw 0;
      setUserPlatformPreferences(await res.json());
    } catch { setUserPlatformPreferences([]); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.platform_id) return;

    const userId = user?.role === "admin" ? parseInt(formData.user_id, 10) : user.id;

    const res = await fetch(`${backendUrl}/api/user-platform-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        platform_id: parseInt(formData.platform_id, 10),
      }),
    });

    if (res.ok) {
      setFormData((f) => ({ ...f, platform_id: "" }));
      loadPreferences(userId);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/user-platform-preferences/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUserPlatformPreferences((prefs) => prefs.filter((p) => p.id !== id));
    }
  };

  // -------- helpers visuales --------
  const abs = (url) => (!url ? "" : /^https?:\/\//i.test(url) ? url : `${backendUrl}/${String(url).replace(/^\/+/, "")}`);

  const catalogFromAssoc = (assoc) => {
    if (assoc.platform_id != null) {
      const byId = platformById.get(String(assoc.platform_id));
      if (byId) return byId;
    }
    if (assoc.platform_name) {
      const byName = platformByName.get(String(assoc.platform_name).toLowerCase().trim());
      if (byName) return byName;
    }
    return null;
  };

  const pickImage = (assoc) => {
    const fromAssoc = assoc.platform_image_url || assoc.image_url || assoc.image || null;
    if (fromAssoc) return abs(fromAssoc);
    const cat = catalogFromAssoc(assoc);
    if (cat) {
      const fromCat = cat.image_url || cat.icon_url || cat.logo_url || cat.image || null;
      if (fromCat) return abs(fromCat);
    }
    return "";
  };

  const platformIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("playstation")) return "fa-brands fa-playstation";
    if (n.includes("xbox")) return "fa-brands fa-xbox";
    if (n.includes("nintendo")) return "fa-solid fa-gamepad";
    if (n.includes("switch")) return "fa-solid fa-gamepad";
    if (n.includes("pc") || n.includes("windows")) return "fa-solid fa-desktop";
    if (n.includes("mac")) return "fa-brands fa-apple";
    if (n.includes("linux")) return "fa-brands fa-linux";
    if (n.includes("android")) return "fa-brands fa-android";
    return "fa-solid fa-gamepad";
  };

  const Thumb = ({ assoc }) => {
    const img = pickImage(assoc);
    const name = assoc.platform_name || "Platform";
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
        <i className={`${platformIcon(name)} pref-thumb__icon`} />
      </div>
    );
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3">Platform Preferences</h3>

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
          <select name="platform_id" className="form-select" value={formData.platform_id} onChange={handleChange} required>
            <option value="">Select a platform</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 mt-2 d-grid">
          <button type="submit" className="btn btn-gradient btn-lg" disabled={!formData.user_id || !formData.platform_id}>
            + Add
          </button>
        </div>
      </form>

      <div className="row g-4">
        {userPlatformPreferences.length > 0 ? (
          userPlatformPreferences.map((assoc) => (
            <div key={assoc.id} className="col-12 col-md-6 col-lg-4">
              <div className="card glass-card pref-card h-100 overflow-hidden">
                <Thumb assoc={assoc} />
                <div className="card-body">
                  <h5 className="mb-3">{assoc.platform_name}</h5>
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

export default UserPlatformPreferenceList;



