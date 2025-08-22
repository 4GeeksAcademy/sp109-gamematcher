// src/front/pages/Profile.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const Profile = () => {
  const { user, isAuthenticated, getToken, updateUser } = useAuth();

  // avatar + picker inline
  const [image, setImage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const [toast, setToast] = useState("");

  // fuentes para elegir imagen
  const [favThumbs, setFavThumbs] = useState([]);
  const [fallbackThumbs, setFallbackThumbs] = useState([]);

  // carruseles y métricas
  const [favorites, setFavorites] = useState([]); // máx 6
  const [recs, setRecs] = useState([]);           // máx 6
  const [counts, setCounts] = useState({ games: 0, genres: 0, platforms: 0 });
  const [metricBgs, setMetricBgs] = useState([]); // fondos para los 3 tiles

  const cloudinaryUploadURL = useMemo(
    () => `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    []
  );

  useEffect(() => {
    setImage(user?.profile_image_url || "");
  }, [user?.profile_image_url]);

  // -------- helpers --------
  const notify = (msg) => {
    setToast(msg);
    window.clearTimeout((notify)._t);
    (notify)._t = window.setTimeout(() => setToast(""), 2400);
  };

  const getAnyToken = () => {
    const candidates = [
      typeof getToken === "function" ? getToken() : null,
      localStorage.getItem("token"),
      sessionStorage.getItem("token"),
      localStorage.getItem("jwt"),
      sessionStorage.getItem("jwt"),
      localStorage.getItem("access_token"),
      sessionStorage.getItem("access_token"),
    ].filter(Boolean);

    if (!candidates.length) return null;

    let raw = String(candidates[0]).replace(/^"(.*)"$/, "$1").trim();
    if (!raw) return null;
    return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  };

  // -------- data: favoritos + contadores --------
  useEffect(() => {
    if (!user?.id) return;

    const fetchFavorites = async () => {
      try {
        const [relRes, gamesRes] = await Promise.all([
          fetch(`${API_URL}/api/favorites`),
          fetch(`${API_URL}/api/games`)
        ]);
        const rels = await relRes.json();
        const games = await gamesRes.json();

        const mine = (rels || []).filter((r) => r.user_id === user.id);
        const gameMap = new Map(games.map((g) => [g.id, g]));
        const favGames = mine.map((r) => gameMap.get(r.game_id)).filter(Boolean);

        setFavorites(
          favGames
            .map((g) => ({
              id: g.id,
              name: g.name,
              background_image: g.image_url || g.background_image || "",
              released: g.release_date || g.released || "",
              rating: g.rating || 0,
            }))
            .slice(0, 6)
        );

        setCounts((c) => ({ ...c, games: mine.length }));
        setFavThumbs(
          favGames
            .map((g) => g.image_url || g.background_image)
            .filter(Boolean)
            .slice(0, 12)
        );
      } catch {
        setFavorites([]); setFavThumbs([]);
      }
    };

    const fetchPrefsCounts = async () => {
      try {
        const [gp, pp] = await Promise.all([
          fetch(`${API_URL}/api/user-genre-preferences?user_id=${user.id}`).then((r) => r.json()),
          fetch(`${API_URL}/api/user-platform-preferences?user_id=${user.id}`).then((r) => r.json()),
        ]);
        setCounts((c) => ({
          ...c,
          genres: Array.isArray(gp) ? gp.length : 0,
          platforms: Array.isArray(pp) ? pp.length : 0,
        }));
      } catch {
        setCounts((c) => ({ ...c, genres: 0, platforms: 0 }));
      }
    };

    fetchFavorites();
    fetchPrefsCounts();
  }, [user?.id, API_URL]);

  // -------- data: recomendaciones con fallback --------
  useEffect(() => {
    const fetchRawgTop = async () => {
      try {
        const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
        const params = new URLSearchParams({
          key: API_KEY,
          page_size: "12",
          ordering: "-rating",
        });
        const rawg = await fetch(`https://api.rawg.io/api/games?${params}`).then((r) => r.json());
        const list = (rawg.results || []).slice(0, 6).map((g) => ({
          id: g.id,
          name: g.name,
          background_image: g.background_image,
          rating: g.rating || 0,
          released: g.released || "",
          rawg_id: g.id,
        }));
        setRecs(list);
      } catch {
        setRecs([]);
      }
    };

    const fetchRecs = async () => {
      try {
        const bearer = getAnyToken();
        if (!bearer) {
          await fetchRawgTop();
          return;
        }

        const prefsRes = await fetch(`${API_URL}/api/games/recommendations/context`, {
          headers: { Authorization: bearer },
        });

        if (prefsRes.status === 401 || !prefsRes.ok) {
          await fetchRawgTop();
          return;
        }

        const prefs = await prefsRes.json();
        const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
        const params = new URLSearchParams({
          key: API_KEY,
          page_size: "12",
          ordering: "-rating",
        });

        if (prefs.preferred_genres?.length) params.append("genres", prefs.preferred_genres.join(","));
        if (prefs.preferred_platforms?.length) {
          const map = { PC: "4", "PlayStation 5": "187", "PlayStation 4": "18", "Xbox Series S/X": "186", "Xbox One": "1", "Nintendo Switch": "7" };
          const ids = prefs.preferred_platforms.map((p) => map[p]).filter(Boolean);
          if (ids.length) params.append("platforms", ids.join(","));
        }

        const rawg = await fetch(`https://api.rawg.io/api/games?${params}`).then((r) => r.json());
        const excluded = prefs.excluded_rawg_ids || [];
        const list = (rawg.results || [])
          .filter((g) => !excluded.includes(g.id))
          .slice(0, 6)
          .map((g) => ({
            id: g.id,
            name: g.name,
            background_image: g.background_image,
            rating: g.rating || 0,
            released: g.released || "",
            rawg_id: g.id,
          }));
        setRecs(list);
      } catch {
        await fetchRawgTop();
      }
    };

    if (isAuthenticated) {
      fetchRecs();
    } else {
      (async () => fetchRecs())();
    }
  }, [isAuthenticated, API_URL]);

  // -------- fallback thumbs + fondos métricas --------
  useEffect(() => {
    const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
    if (!favThumbs.length) {
      fetch(`https://api.rawg.io/api/platforms?key=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => {
          const imgs = (data?.results || []).map((p) => p.image_background).filter(Boolean).slice(0, 12);
          setFallbackThumbs(imgs);
        })
        .catch(() => setFallbackThumbs([]));
    }
    fetch(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=3&ordering=-rating`)
      .then((r) => r.json())
      .then((d) => {
        setMetricBgs((d.results || []).map((g) => g.background_image).filter(Boolean).slice(0, 3));
      })
      .catch(() => setMetricBgs([]));
  }, [favThumbs.length]);

  // -------- avatar actions (con token & errores) --------
  const saveProfileImage = async (urlOrNull) => {
    const bearer = getAnyToken();
    if (!bearer || !user?.id) {
      notify("Session not found. Please sign in again.");
      throw new Error("NO_TOKEN");
    }
    const res = await axios.put(
      `${API_URL}/api/users/${user.id}/profile-image`,
      { profile_image_url: urlOrNull },
      {
        headers: {
          Authorization: bearer,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        validateStatus: () => true,
      }
    );
    if (res.status === 401) {
      notify("Your session expired. Please sign in again.");
      throw new Error("UNAUTHORIZED");
    }
    if (res.status >= 400) {
      notify("Could not update your image.");
      throw new Error(`HTTP_${res.status}`);
    }
    setImage(urlOrNull || "");
    updateUser({ profile_image_url: urlOrNull || null });
    return res.data;
  };

  const onPickFromThumb = async (url) => {
    try {
      setBusy(true);
      await saveProfileImage(url);
      notify("Profile image updated.");
      setShowPicker(false);
    } catch {/* mensajes arriba */} finally { setBusy(false); }
  };

  const onUploadLocal = async (file) => {
    if (!file) return;
    try {
      setBusy(true);
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const cloud = await axios.post(cloudinaryUploadURL, form, { validateStatus: () => true });
      if (cloud.status >= 400) throw new Error("CLOUD_UPLOAD_FAIL");
      await saveProfileImage(cloud.data.secure_url);
      notify("Profile image uploaded.");
      setShowPicker(false);
    } catch {
      notify("Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemove = async () => {
    try {
      setBusy(true);
      await saveProfileImage(null);
      notify("Profile image removed.");
      setShowPicker(false);
    } catch {/* notificado */} finally { setBusy(false); }
  };

  // -------- UI helpers --------
  const ScrollRow = ({ items, seeMoreHref, title }) => {
    const wrapRef = useRef(null);
    const scrollBy = (dir) => {
      const el = wrapRef.current; if (!el) return;
      const w = el.clientWidth; el.scrollBy({ left: dir * (w * 0.9), behavior: "smooth" });
    };
    return (
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">{title}</h5>
          {seeMoreHref && <Link to={seeMoreHref} className="btn btn-hero-outline-white">See more</Link>}
        </div>
        <div className="position-relative">
          <button type="button" onClick={() => scrollBy(-1)} className="scroll-pill left" aria-label="prev">
            <i className="fa-solid fa-angle-left"></i>
          </button>
          <div ref={wrapRef} className="hscroll-cards">
            {items.map((g) => (
              <div key={g.id} className="hscroll-card glass-card">
                {g.background_image ? (
                  <img
                    src={g.background_image}
                    alt={g.name}
                    className="w-100"
                    style={{ height: 140, objectFit: "cover", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-light"
                       style={{ height: 140, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                    <i className="fa-solid fa-image text-muted"></i>
                  </div>
                )}
                <div className="p-3">
                  <div className="fw-bold text-truncate" title={g.name}>{g.name}</div>
                  <div className="d-flex align-items-center gap-2 small text-muted mt-1">
                    {g.rating ? <span className="chip alt"><i className="fa-solid fa-star"></i>{g.rating}</span> : null}
                    {g.released ? <span className="chip soft"><i className="fa-solid fa-calendar"></i>{String(g.released).slice(0,4)}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => scrollBy(1)} className="scroll-pill right" aria-label="next">
            <i className="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page">
      {/* HERO */}
      <div className="bg-gradient-primary py-5 position-relative">
        <div className="container position-relative">
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-hero-outline-white"
              onClick={() => setShowPicker(true)}
              style={{ backdropFilter: "blur(4px)" }}
            >
              Change image
            </button>
          </div>

          <div className="d-flex flex-column align-items-center mt-3">
            <div className="position-relative"
                 style={{ width: 180, height: 180, borderRadius: "50%", overflow: "hidden",
                          border: "4px solid rgba(255,255,255,.9)", boxShadow: "0 10px 30px rgba(0,0,0,.2)" }}>
              {image ? (
                <img src={image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                  <i className="fa-regular fa-user" style={{ fontSize: 72, color: "#94a3b8" }}/>
                </div>
              )}
            </div>
            <h3 className="text-white mt-3 mb-0">{user?.nickname || user?.name || "User"}</h3>
          </div>

          {/* INLINE PICKER dentro del HERO */}
          {showPicker && (
            <div className="hero-picker-overlay" style={{ zIndex: 50 }}>
              <div
                className="hero-picker-backdrop"
                style={{ zIndex: 50 }}
                onClick={() => !busy && setShowPicker(false)}
              />
              <div
                className="hero-picker glass-card"
                style={{ zIndex: 51 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="mb-0">Profile image</h5>
                  <button className="btn-close" onClick={() => !busy && setShowPicker(false)} aria-label="Close"/>
                </div>

                <h6 className="mb-2">Pick from your games</h6>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  {(favThumbs.length ? favThumbs : fallbackThumbs).map((u, i) => (
                    <button
                      key={i}
                      className="p-0 border-0 bg-transparent"
                      style={{ borderRadius: 10, overflow: "hidden", cursor: busy ? "not-allowed" : "pointer" }}
                      onClick={() => !busy && onPickFromThumb(u)}
                      title="Use this image"
                      disabled={busy}
                    >
                      <img src={u} alt={`thumb-${i}`}
                           style={{ width: 180, height: 112, objectFit: "cover", display: "block" }}/>
                    </button>
                  ))}
                  {(!favThumbs.length && !fallbackThumbs.length) && (
                    <div className="text-muted">No images available right now.</div>
                  )}
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onUploadLocal(e.target.files?.[0] || null)}
                    hidden
                  />
                  {/* ← Morado (texto + borde) dentro del popup */}
                  <button
                    type="button"
                    className="btn btn-outline-brand"
                    onClick={() => !busy && fileRef.current?.click()}
                    disabled={busy}
                  >
                    <i className="fa-solid fa-upload me-2"></i>
                    Upload from your device
                  </button>
                  {image && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => !busy && onRemove()}
                      disabled={busy}
                    >
                      <i className="fa-solid fa-trash me-2"></i>
                      Remove current image
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="container py-5">
        <ScrollRow title="My Favourite Games" seeMoreHref="/dashboard/user-game-favorites" items={favorites}/>
        <ScrollRow title="Recommendations" seeMoreHref="/dashboard/recommendations" items={recs}/>

        {/* MÉTRICAS con fondos blur */}
        <div className="row g-3 g-md-4">
          {["games", "genres", "platforms"].map((key, idx) => (
            <div key={key} className="col-12 col-md-4">
              <div className="metric-card">
                {metricBgs[idx] && (
                  <div className="metric-bg" style={{ backgroundImage: `url(${metricBgs[idx]})` }} />
                )}
                <div className="metric-overlay" />
                <div className="metric-content">
                  <div className="metric-num">{counts[key]}</div>
                  <div className="metric-title">{key}</div>
                  <p className="metric-desc">
                    {key === "games" &&
                      "Add more games you love so we can tailor your experience."}
                    {key === "genres" &&
                      "Pick your favorite genres—your opinion matters to get better matches."}
                    {key === "platforms" &&
                      "Select platforms to recommend games that fit your setup."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* toast simple */}
      {toast && (
        <div
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3 py-2 glass-card"
          style={{ zIndex: 60, borderRadius: 12 }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default Profile;





















