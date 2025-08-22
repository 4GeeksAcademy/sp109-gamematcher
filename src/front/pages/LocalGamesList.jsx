// src/front/pages/LocalGamesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';

import { useAuth } from "../context/AuthContext";
import AlertMessage from "../components/AlertMessage";

export const LocalGamesList = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawgApiKey = import.meta.env.VITE_RAWG_API_KEY;

  useEffect(() => {
    fetchLocalGames();
    if (isAuthenticated && user?.role === "user") {
      loadOptions();
    }
  }, [isAuthenticated, user?.role]);

  const fetchLocalGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games`);
      if (!response.ok) throw new Error(`Error ${response.status}: Could not fetch games`);
      const localGames = await response.json();
      setGames(localGames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVO: normalizador de nombres de plataformas para las tarjetas ---
  const normalizePlatformNames = (game) => {
    const candidates =
      [
        game.platforms,         // ["PC", "PS5"] o [{ name }, { platform: { name } }]
        game.platform_names,
        game.platforms_names,
        game.platforms_list,
        game.platforms_rel,     // [{ platform_name: "PC" }, ...]
        game.platformsRelation, // [{ platform_name: "PC" }, ...]
      ].find(Boolean) || [];

    const names = (Array.isArray(candidates) ? candidates : [])
      .map(p => {
        if (typeof p === 'string') return p;
        if (p?.name) return p.name;
        if (p?.platform?.name) return p.platform.name;
        if (p?.platform_name) return p.platform_name;
        return null;
      })
      .filter(Boolean);

    return [...new Set(names)];
  };

  const transformGameData = (game) => ({
    ...game,
    background_image: game.image_url || game.background_image || null,
    released: game.release_date
      ? new Date(game.release_date).getFullYear().toString()
      : game.released || null,
    genres: game.genres || [],
    rating: game.rating || 0,
    // NUEVO: pasamos plataformas normalizadas si existen
    platforms: normalizePlatformNames(game),
  });

  const handleGameClick = (game) => {
    navigate(`/dashboard/local-games/${game.id}`);
  };

  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualGame, setManualGame] = useState({
    name: "",
    description: "",
    released: "",
    background_image: "",
    rating: "",
    platforms: [],
    genres: []
  });

  const [allPlatforms, setAllPlatforms] = useState([]);
  const [allGenres, setAllGenres] = useState([]);

  const loadOptions = async () => {
    try {
      const [platRes, genRes] = await Promise.all([
        fetch(`${backendUrl}/api/platforms`),
        fetch(`${backendUrl}/api/genres`)
      ]);
      setAllPlatforms(await platRes.json());
      setAllGenres(await genRes.json());
    } catch (err) {
      console.error("Error loading platforms/genres:", err);
    }
  };

  useEffect(() => {
    if (!(isAuthenticated && user?.role === "user")) return;

    const fetchRawg = async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games?search=${encodeURIComponent(searchTerm)}&key=${rawgApiKey}`
        );
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {
        console.error("RAWG error:", e);
      } finally {
        setLoadingSearch(false);
      }
    };

    const t = setTimeout(fetchRawg, 500);
    return () => clearTimeout(t);
  }, [searchTerm, isAuthenticated, user?.role, rawgApiKey]);

  // ---- helpers ----
  const ensurePlatformsExist = async (names) => {
    const norm = (s) => String(s || "").toLowerCase().trim();
    const mapNow = new Map(allPlatforms.map(p => [norm(p.name), p.id]));
    const missing = (names || []).filter(n => !mapNow.has(norm(n)));
    for (const name of missing) {
      try {
        await fetch(`${backendUrl}/api/platforms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
      } catch (e) {
        console.warn("Platform could not be created:", name, e);
      }
    }
    const res = await fetch(`${backendUrl}/api/platforms`);
    const updated = await res.json();
    setAllPlatforms(updated);
    const mapFinal = new Map(updated.map(p => [norm(p.name), p.id]));
    return (names || []).map(n => mapFinal.get(norm(n))).filter(Boolean);
  };

  const ensureGenresExist = async (names) => {
    const norm = (s) => String(s || "").toLowerCase().trim();
    const mapNow = new Map(allGenres.map(g => [norm(g.name), g.id]));
    const missing = (names || []).filter(n => !mapNow.has(norm(n)));
    for (const name of missing) {
      try {
        await fetch(`${backendUrl}/api/genres`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
      } catch (e) {
        console.warn("Genre could not be created:", name, e);
      }
    }
    const res = await fetch(`${backendUrl}/api/genres`);
    const updated = await res.json();
    setAllGenres(updated);
    const mapFinal = new Map(updated.map(g => [norm(g.name), g.id]));
    return (names || []).map(n => mapFinal.get(norm(n))).filter(Boolean);
  };

  const handleAddFromRawg = async (g) => {
    if (!g?.id || !g?.name) {
      setAlert({ type: "danger", message: "❌ Incomplete game data." });
      return;
    }
    try {
      const detailRes = await fetch(`https://api.rawg.io/api/games/${g.id}?key=${rawgApiKey}`);
      const gameDetail = await detailRes.json();

      const rawgPlatformNames = (gameDetail.platforms || [])
        .map(p => p.platform?.name)
        .filter(Boolean);
      const rawgGenreNames = (gameDetail.genres || []).map(gg => gg.name).filter(Boolean);

      const platform_ids = await ensurePlatformsExist(rawgPlatformNames);
      const genre_ids = await ensureGenresExist(rawgGenreNames);

      const payload = {
        name: g.name,
        description: gameDetail.description_raw || "No description available",
        background_image: g.background_image,
        released: g.released,
        rating: g.rating,
        rawg_id: g.id,
        platform_ids,
        genre_ids
      };

      const res = await fetch(`${backendUrl}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAlert({ type: "success", message: "✅ Game added." });
        fetchLocalGames();
      } else {
        setAlert({ type: "danger", message: "❌ Error adding game." });
      }
    } catch (err) {
      console.error("RAWG detail error:", err);
      setAlert({ type: "danger", message: "❌ Error fetching game details." });
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    if (name === "rating") {
      const num = parseFloat(value);
      if (num > 5) return;
    }
    setManualGame({ ...manualGame, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setManualGame((prev) => {
      const prevArr = Array.isArray(prev[name]) ? prev[name] : [];
      if (checked) {
        if (prevArr.includes(value)) return prev;
        return { ...prev, [name]: [...prevArr, value] };
      } else {
        return { ...prev, [name]: prevArr.filter((v) => v !== value) };
      }
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualGame.name.trim()) {
      setAlert({ type: "danger", message: "❌ Game name is required." });
      return;
    }
    const payload = {
      name: manualGame.name,
      description: manualGame.description || "",
      released: manualGame.released || "",
      background_image: manualGame.background_image || "",
      rating: manualGame.rating || null,
      platform_ids: (manualGame.platforms || []).map(Number),
      genre_ids: (manualGame.genres || []).map(Number)
    };
    try {
      const res = await fetch(`${backendUrl}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await res.json();
        setAlert({ type: "success", message: "✅ Game created." });
        setManualGame({
          name: "",
          description: "",
          released: "",
          background_image: "",
          rating: "",
          platforms: [],
          genres: []
        });
        setShowManualForm(false);
        fetchLocalGames();
      } else {
        const errorData = await res.json();
        console.error("❌ Backend error:", errorData);
        setAlert({ type: "danger", message: "❌ Error creating game." });
      }
    } catch (err) {
      console.error("❌ Connection error:", err);
      setAlert({ type: "danger", message: "❌ Connection error." });
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="mt-2">Loading games from the database…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-gradient" onClick={fetchLocalGames}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 local-games-page games-modern">
      <AlertMessage
        message={alert?.message}
        type={alert?.type}
        onClose={() => setAlert(null)}
      />

      {isAuthenticated && user?.role === "user" && (
        <div className="bg-white p-3 rounded shadow-sm mb-4">
          <h5 className="mb-3">Search or add a game</h5>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search on RAWG…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loadingSearch && (
            <div className="text-center my-2">
              <div className="spinner-border" role="status"></div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="row">
              {searchResults.map((g) => (
                <div key={g.id} className="col-12 col-md-4 col-lg-4 mb-3">
                  <div className="card glass-card h-100">
                    {g.background_image ? (
                      <img
                        src={g.background_image}
                        alt={g.name}
                        className="card-img-top"
                        style={{ height: 160, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: 160 }}
                      >
                        <i className="fa-solid fa-image text-muted"></i>
                      </div>
                    )}
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title">{g.name}</h6>
                      <p className="text-muted small mb-2">
                        {g.released || "No date"}
                      </p>
                      <button
                        className="btn btn-gradient mt-auto"
                        onClick={() => handleAddFromRawg(g)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showManualForm ? (
            <button
              className="btn btn-gradient"
              onClick={() => setShowManualForm(true)}
            >
              Add game manually
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="bg-light p-3 rounded mt-3">
              <h6>Create game manually</h6>

              <div className="mb-2">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={manualGame.name}
                  onChange={handleManualChange}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={manualGame.description}
                  onChange={handleManualChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Release date</label>
                <input
                  type="date"
                  name="released"
                  className="form-control"
                  value={manualGame.released}
                  onChange={handleManualChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Background image (URL)</label>
                <input
                  type="text"
                  name="background_image"
                  className="form-control"
                  value={manualGame.background_image}
                  onChange={handleManualChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Rating (max 5)</label>
                <input
                  type="number"
                  step="0.1"
                  name="rating"
                  className="form-control"
                  value={manualGame.rating}
                  onChange={handleManualChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label d-block">Platforms</label>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-2">
                  {allPlatforms.map((p) => (
                    <div key={p.id} className="col">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`platform-${p.id}`}
                          name="platforms"
                          value={String(p.id)}
                          checked={manualGame.platforms.includes(String(p.id))}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor={`platform-${p.id}`}>
                          {p.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">Genres</label>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-2">
                  {allGenres.map((g) => (
                    <div key={g.id} className="col">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`genre-${g.id}`}
                          name="genres"
                          value={String(g.id)}
                          checked={manualGame.genres.includes(String(g.id))}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor={`genre-${g.id}`}>
                          {g.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-gradient me-2">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowManualForm(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">All games</h1>

          {games.length === 0 ? (
            <div className="alert alert-info">
              <h5>No games found</h5>
              <p>There are no games in the database yet.</p>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4">
                {games.length} games in the database
              </p>
              <div className="row">
                {games.map((game) => (
                  <div key={game.id} className="col-12 col-md-4 col-lg-4 mb-4">
                    <GameCard
                      game={transformGameData(game)}
                      onClick={() => handleGameClick(game)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};



