import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const RawgGameList = () => {
  const { store, dispatch } = useGlobalReducer();
  const apiKey = import.meta.env.VITE_RAWG_API_KEY;

  const fetchGames = async () => {
    try {
      // page_size=18 muestra el numero de jueguitos que se ven
      const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page_size=18`);
      const data = await res.json();
      dispatch({ type: "set_rawg_games", payload: data.results });
    } catch (err) {
      console.error("Error fetching RAWG games:", err);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Juegos populares</h2>

      {!store.rawgGames || store.rawgGames.length === 0 ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando juegos...</span>
          </div>
          <p className="mt-2 text-muted">Cargando juegos...</p>
        </div>
      ) : (
        <div className="row g-4">
          {store.rawgGames.map((game) => (
            <div key={game.id} className="col-md-6 col-lg-4 col-xl-3">
              <Link
                to={`/rawg-games/${game.id}`}
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 shadow-sm">
                  <img
                    src={game.background_image}
                    alt={game.name}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{game.name}</h5>
                    <div className="mt-auto">
                      <p className="card-text text-muted small mb-1">
                        <i className="fa-regular fa-calendar me-1"></i>
                        {game.released || "Fecha no disponible"}
                      </p>
                      {game.rating && (
                        <p className="card-text text-muted small mb-0">
                          <i className="fa-solid fa-star text-warning me-1"></i>
                          {game.rating}/5
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
