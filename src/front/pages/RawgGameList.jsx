import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useAuth } from "../context/AuthContext";

export const RawgGameList = () => {
  const { store, dispatch } = useGlobalReducer();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawgApiKey = import.meta.env.VITE_RAWG_API_KEY;

  // Mapeo de plataformas a IDs de RAWG
  const platformMapping = {
    "PC": "4",
    "PlayStation 5": "187",
    "PlayStation 4": "18",
    "Xbox Series S/X": "186",
    "Xbox One": "1",
    "Nintendo Switch": "7"
  };

  const fetchRecommendedGames = async (preferences) => {
    try {
      const { preferred_genres, preferred_platforms, excluded_rawg_ids } = preferences;

      // Construir parámetros para RAWG API
      const params = new URLSearchParams({
        key: rawgApiKey,
        page_size: "40",
        ordering: "-rating"
      });

      // Agregar géneros si los hay
      if (preferred_genres && preferred_genres.length > 0) {
        params.append("genres", preferred_genres.join(","));
      }

      // Agregar plataformas si las hay
      if (preferred_platforms && preferred_platforms.length > 0) {
        const rawgPlatformIds = preferred_platforms
          .map(platform => platformMapping[platform])
          .filter(id => id);

        if (rawgPlatformIds.length > 0) {
          params.append("platforms", rawgPlatformIds.join(","));
        }
      }

      // Hacer petición a RAWG
      const response = await fetch(`https://api.rawg.io/api/games?${params}`);
      const data = await response.json();

      // Filtrar juegos ya evaluados
      const filteredGames = [];
      const games = data.results || [];

      for (const game of games) {
        if (!evaluatedGames.some(evalGame => evalGame.id === game.id)) {
          filteredGames.push(game);
        }
      }

      // Si no hay suficientes juegos, obtener juegos populares
      if (filteredGames.length < 24) {
        const popularParams = new URLSearchParams({
          key: rawgApiKey,
          page_size: "40",
          ordering: "-rating"
        });

        const popularResponse = await fetch(`https://api.rawg.io/api/games?${popularParams}`);
        const popularData = await popularResponse.json();
        const existingIds = new Set(filteredGames.map(g => g.id));

        let addedFromPopular = 0;
        for (const game of popularData.results || []) {
          if (!excluded_rawg_ids.includes(game.id) &&
            !existingIds.has(game.id) &&
            filteredGames.length < 24) {

            filteredGames.push({
              id: game.id,
              rawg_id: game.id,
              name: game.name,
              description: game.description_raw?.substring(0, 500) || "Sin descripción disponible",
              background_image: game.background_image,
              rating: game.rating || 0,
              released: game.released,
              platforms: game.platforms?.map(p => p.platform.name) || [],
              genres: game.genres?.map(g => g.name) || [],
              source: "rawg"
            });
            addedFromPopular++;
          }
        }
      }

      return filteredGames;
    } catch (error) {
      return [];
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);

      // Si el usuario está logueado, usar recomendaciones personalizadas
      if (isAuthenticated && user?.role === "user") {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${backendUrl}/api/games/recommendations`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const preferences = await res.json();
        if (preferences.use_rawg && !preferences.error) {
          const games = await fetchRecommendedGames(preferences);
          dispatch({ type: "set_games", payload: games });
        } else {
          // Fallback a juegos de la BD si algo falla
          const fallbackRes = await fetch(`${backendUrl}/api/games`);
          const fallbackData = await fallbackRes.json();
          dispatch({ type: "set_games", payload: fallbackData });
        }
      } else {
        // Para visitantes y admins, mostrar juegos de la BD
        const res = await fetch(`${backendUrl}/api/games`);
        const data = await res.json();
        dispatch({ type: "set_games", payload: data });
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      // Fallback a juegos de la BD en caso de error
      try {
        const res = await fetch(`${backendUrl}/api/games`);
        const data = await res.json();
        dispatch({ type: "set_games", payload: data });
      } catch (fallbackErr) {
        console.error("Error fetching fallback games:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [isAuthenticated]);

  return (
    <div className="container py-4">
      <h2 className="mb-4">
        <i className="fas fa-globe"></i> Juegos de RAWG API
      </h2>

      {loading || !store.games || store.games.length === 0 ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando juegos...</span>
          </div>
          <p className="mt-2 text-muted">
            {isAuthenticated && user?.role === "user"
              ? "Generando recomendaciones personalizadas..."
              : "Cargando juegos..."
            }
          </p>
        </div>
      ) : (
        <>
          {isAuthenticated && user?.role === "user" && (
            <div className="alert alert-info mb-4">
              <i className="fas fa-magic me-2"></i>
              <strong>¡Recomendaciones personalizadas!</strong> Estos juegos están seleccionados según tus preferencias de géneros y plataformas.
            </div>
          )}
          <div className="row g-4">
            {store.games.map((game) => (
              <div key={game.id} className="col-sm-6 col-md-4 col-lg-4">
                <div className="card h-100 shadow-sm hover-shadow">
                  <Link
                    to={game.rawg_id ? `/dashboard/recommendations/${game.rawg_id}` : `/dashboard/local-games/${game.id}`}
                    className="text-decoration-none"
                  >
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
                          <i className="fas fa-gamepad fa-3x text-muted"></i>
                        </div>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-dark">{game.name}</h5>
                      <div className="mt-auto">
                        {game.rating && game.rating > 0 && (
                          <div className="mb-2">
                            <span className="badge bg-warning text-dark">
                              <i className="fas fa-star me-1"></i>
                              {game.rating}/5
                            </span>
                          </div>
                        )}

                        {game.genres && game.genres.length > 0 && (
                          <div className="mb-2">
                            <small className="text-muted">
                              <i className="fas fa-tags me-1"></i>
                              {game.genres.slice(0, 2).join(", ")}
                              {game.genres.length > 2 && ` +${game.genres.length - 2}`}
                            </small>
                          </div>
                        )}

                        {game.platforms && game.platforms.length > 0 && (
                          <div className="mb-2">
                            <small className="text-muted">
                              <i className="fas fa-gamepad me-1"></i>
                              {game.platforms.slice(0, 2).join(", ")}
                              {game.platforms.length > 2 && ` +${game.platforms.length - 2}`}
                            </small>
                          </div>
                        )}

                        {game.source === "rawg" && (
                          <div className="mb-2">
                            <span className="badge bg-primary">
                              <i className="fas fa-globe me-1"></i>
                              RAWG
                            </span>
                          </div>
                        )}

                        {game.released && (
                          <p className="card-text text-muted small mb-1">
                            <i className="fas fa-calendar me-1"></i>
                            {game.released}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
