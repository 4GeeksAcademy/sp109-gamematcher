import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const GameManager = () => {
  const { store, dispatch } = useGlobalReducer();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawgApiKey = import.meta.env.VITE_RAWG_API_KEY;

  const loadGames = async () => {
    const res = await fetch(`${backendUrl}/api/games`);
    const data = await res.json();
    dispatch({ type: "set_games", payload: data });
  };

  useEffect(() => {
    loadGames();
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

  const handleAddGame = async (game) => {
    const alreadyExists = store.games.some((g) => g.name.toLowerCase() === game.name.toLowerCase());
    if (alreadyExists) {
      alert("Este juego ya existe en tu base de datos.");
      return;
    }

    const payload = {
      name: game.name,
      description: game.slug, // Simplificamos, solo guardamos el slug
    };

    const res = await fetch(`${backendUrl}/api/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      loadGames();
      alert("Juego añadido correctamente.");
    } else {
      alert("Error al añadir juego.");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/games/${id}`, { method: "DELETE" });
    if (res.ok) loadGames();
  };

  return (
    <div className="container py-4">
      <h2>Añade juegos a la base de datos</h2>

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
