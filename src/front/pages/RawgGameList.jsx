import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const RawgGameList = () => {
  const { store, dispatch } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchGames = async () => {
    try {
      // Obtener juegos de la base de datos local
      const res = await fetch(`${backendUrl}/api/games`);
      const data = await res.json();
      dispatch({ type: "set_games", payload: data });
    } catch (err) {
      console.error("Error fetching games from database:", err);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Biblioteca de Juegos</h2>

      {!store.games || store.games.length === 0 ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando juegos...</span>
          </div>
          <p className="mt-2 text-muted">Cargando juegos...</p>
        </div>
      ) : (
        <div className="row g-4">
          {store.games.map((game) => (
            <div key={game.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card h-100 shadow-sm">
                <Link to={`/rawg-games/${game.id}`} className="text-decoration-none">
                  <div
                    className="card-img-top"
                    style={{
                      height: "200px",
                      backgroundImage: game.background_image
                        ? `url(${game.background_image})`
                        : 'none',
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }}
                  >
                    {!game.background_image && (
                      <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                        <i className="fa-solid fa-gamepad fa-3x text-muted"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-dark">{game.name}</h5>
                    <div className="mt-auto">
                      {game.rating && (
                        <div className="mb-2">
                          <span className="badge bg-warning text-dark">
                            <i className="fa-solid fa-star me-1"></i>
                            {game.rating}/5
                          </span>
                        </div>
                      )}
                      {game.released && (
                        <p className="card-text text-muted small mb-1">
                          <i className="fa-solid fa-calendar me-1"></i>
                          {game.released}
                        </p>
                      )}
                      {game.description && (
                        <p className="card-text text-muted small">
                          {game.description.length > 100
                            ? `${game.description.substring(0, 100)}...`
                            : game.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
