import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import AlertMessage from "../components/AlertMessage";

export const GameManager = () => {
  const { store, dispatch } = useGlobalReducer();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [alert, setAlert] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawgApiKey = import.meta.env.VITE_RAWG_API_KEY;

  const loadGames = async () => {
    const res = await fetch(`${backendUrl}/api/games`);
    const data = await res.json();
    dispatch({ type: "set_games", payload: data });
  };

  const loadOptions = async () => {
    try {
      const [platRes, genRes] = await Promise.all([
        fetch(`${backendUrl}/api/platforms`),
        fetch(`${backendUrl}/api/genres`)
      ]);
      setAllPlatforms(await platRes.json());
      setAllGenres(await genRes.json());
    } catch (err) {
      console.error("Error cargando plataformas/géneros:", err);
    }
  };

  useEffect(() => {
    loadGames();
    loadOptions();
  }, []);

  useEffect(() => {
    const fetchRawgGames = async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://api.rawg.io/api/games?search=${searchTerm}&key=${rawgApiKey}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Error fetching RAWG games:", err);
      } finally {
        setLoading(false);
      }
    };
    const delayDebounce = setTimeout(fetchRawgGames, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // ------ HELPERS: assegurar que existeixen a BD i retornar IDs interns ------

  const ensurePlatformsExist = async (names) => {
    const norm = (s) => String(s || "").toLowerCase().trim();
    const mapNow = new Map(allPlatforms.map(p => [norm(p.name), p.id]));
    const missing = (names || []).filter(n => !mapNow.has(norm(n)));

    // crea les que faltin (si no existeixen)
    for (const name of missing) {
      try {
        await fetch(`${backendUrl}/api/platforms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
      } catch (e) {
        console.warn("No s'ha pogut crear la plataforma:", name, e);
      }
    }

    // recarrega llistat i torna IDs finals
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

    // crea els que faltin (si no existeixen)
    for (const name of missing) {
      try {
        await fetch(`${backendUrl}/api/genres`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
      } catch (e) {
        console.warn("No s'ha pogut crear el gènere:", name, e);
      }
    }

    // recarrega llistat i torna IDs finals
    const res = await fetch(`${backendUrl}/api/genres`);
    const updated = await res.json();
    setAllGenres(updated);
    const mapFinal = new Map(updated.map(g => [norm(g.name), g.id]));
    return (names || []).map(n => mapFinal.get(norm(n))).filter(Boolean);
  };

  // --------------------------------------------------------------------------

  const handleAddGame = async (game) => {
    if (!game.id || !game.name) {
      setAlert({ type: "danger", message: "❌ Datos del juego incompletos." });
      return;
    }
    try {
      const detailRes = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${rawgApiKey}`);
      const gameDetail = await detailRes.json();

      // noms que dona RAWG
      const rawgPlatformNames = (gameDetail.platforms || []).map(p => p.platform?.name).filter(Boolean);
      const rawgGenreNames    = (gameDetail.genres || []).map(g => g.name).filter(Boolean);

      // assegurem existència a BD i obtenim IDs interns
      const platform_ids = await ensurePlatformsExist(rawgPlatformNames);
      const genre_ids    = await ensureGenresExist(rawgGenreNames);

      const payload = {
        name: game.name,
        description: gameDetail.description_raw || "Sin descripción disponible",
        background_image: game.background_image,
        released: game.released,
        rating: game.rating,
        rawg_id: game.id,
        platform_ids,
        genre_ids
      };

      const res = await fetch(`${backendUrl}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        loadGames();
        setAlert({ type: "success", message: "✅ Juego añadido correctamente." });
      } else {
        setAlert({ type: "danger", message: "❌ Error al añadir juego." });
      }
    } catch (err) {
      console.error("Error al obtener detalles del juego:", err);
      setAlert({ type: "danger", message: "❌ Error al obtener detalles del juego." });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualGame.name.trim()) {
      setAlert({ type: "danger", message: "❌ El nombre del juego es obligatorio." });
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
        setAlert({ type: "success", message: "✅ Juego creado manualmente." });
        loadGames();
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
      } else {
        const errorData = await res.json();
        console.error("❌ Error backend:", errorData);
        setAlert({ type: "danger", message: "❌ Error al crear juego manual." });
      }
    } catch (err) {
      console.error("❌ Error conexión:", err);
      setAlert({ type: "danger", message: "❌ Error en la conexión." });
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
    const { name, value, checked } = e.target; // "platforms" o "genres"
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

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/games/${id}`, { method: "DELETE" });
    if (res.ok) loadGames();
  };

  return (
    <div className="container py-4">
      <h2>Añade juegos a la base de datos</h2>

      <AlertMessage message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

      <input
        type="text"
        className="form-control my-3"
        placeholder="Buscar juegos en RAWG..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {searchResults.length === 0 && searchTerm.length >= 3 && (
        <div className="my-3">
          <p>No se encontraron juegos con ese nombre.</p>
          {!showManualForm && (
            <button
              className="btn btn-outline-primary"
              onClick={() => setShowManualForm(true)}
            >
              Crear juego manualmente
            </button>
          )}
        </div>
      )}

      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-light p-4 rounded shadow-sm mb-4">
          <h5>Crear juego manual</h5>
          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={manualGame.name}
              onChange={handleManualChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              name="description"
              className="form-control"
              value={manualGame.description}
              onChange={handleManualChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fecha de lanzamiento</label>
            <input
              type="date"
              name="released"
              className="form-control"
              value={manualGame.released}
              onChange={handleManualChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Imagen de fondo (URL)</label>
            <input
              type="text"
              name="background_image"
              className="form-control"
              value={manualGame.background_image}
              onChange={handleManualChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Puntuación (hasta 5)</label>
            <input
              type="number"
              step="0.1"
              name="rating"
              className="form-control"
              value={manualGame.rating}
              onChange={handleManualChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label d-block">Plataformas</label>
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
            <label className="form-label d-block">Géneros</label>
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
          <button type="submit" className="btn btn-success me-2">Crear juego</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowManualForm(false)}>Cancelar</button>
        </form>
      )}

      <div className="row">
        {searchResults.map((game) => (
          <div key={game.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={game.background_image}
                alt={game.name}
                className="card-img-top"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{game.name}</h5>
                <p className="card-text text-muted small mb-1">
                  <i className="fa-regular fa-calendar me-1"></i>
                  {game.released || 'Fecha no disponible'}
                </p>
                <button
                  className="btn btn-success mt-auto"
                  onClick={() => handleAddGame(game)}
                >
                  Añadir a Base de Datos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      <h4>Lista de Juegos</h4>
      <ul className="list-group">
        {store.games.map((game) => (
          <li key={game.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{game.name}</strong>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(game.id)}
              style={{ width: "40px", height: "40px" }}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};