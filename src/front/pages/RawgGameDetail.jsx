import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RawgGameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchGameDetail();
  }, [id]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar en RAWG API
      const API_KEY = import.meta.env.VITE_RAWG_API_KEY;

      if (!API_KEY) {
        throw new Error("RAWG API key no configurada");
      }

      const response = await fetch(
        `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudo obtener el juego`
        );
      }

      const rawgGame = await response.json();

      setGame({
        id: rawgGame.id,
        rawg_id: rawgGame.id,
        name: rawgGame.name,
        description:
          rawgGame.description_raw ||
          rawgGame.description ||
          "Sin descripción disponible",
        background_image: rawgGame.background_image,
        rating: rawgGame.rating || 0,
        released: rawgGame.released,
        platforms: rawgGame.platforms?.map((p) => p.platform.name) || [],
        genres: rawgGame.genres?.map((g) => g.name) || [],
        metacritic: rawgGame.metacritic,
        website: rawgGame.website,
        developers: rawgGame.developers?.map((d) => d.name) || [],
        publishers: rawgGame.publishers?.map((p) => p.name) || [],
        source: 'rawg'
      });

    } catch (err) {
      console.error("Error al cargar juego:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!user) {
      alert("Debes iniciar sesión para añadir favoritos");
      return;
    }

    try {
      setAdding(true);

      // Crear el juego en la base de datos local
      const createGameResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/games`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: game.name,
            description: game.description.slice(0, 500),
            image_url: game.background_image,
            rating: game.rating,
            rawg_id: game.rawg_id,
            release_date: game.released,
          }),
        }
      );

      if (!createGameResponse.ok) {
        const errorData = await createGameResponse.json();
        throw new Error(errorData.error || "Error al crear el juego");
      }

      const createdGame = await createGameResponse.json();

      // Añadir a favoritos
      const favoriteResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            game_id: createdGame.id,
          }),
        }
      );

      if (!favoriteResponse.ok) {
        const errorData = await favoriteResponse.json();
        throw new Error(errorData.error || "Error al añadir a favoritos");
      }

      alert("¡Juego añadido a favoritos!");
    } catch (err) {
      console.error("Error al añadir favorito:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };



  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando detalles del juego...</p>
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
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard/recommendations")}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <h4>Juego no encontrado</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard/recommendations") }>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => navigate("/dashboard/recommendations")}
          >
            ← Volver
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          {game.background_image && (
            <img
              src={game.background_image}
              alt={game.name}
              className="img-fluid rounded shadow-sm"
            />
          )}
        </div>

        <div className="col-md-8">
          <div className="game-header mb-4">
            <h1 className="display-4 mb-2">{game.name}</h1>

            <div className="game-meta mb-3">
              {game.rating > 0 && (
                <span className="badge bg-warning text-dark me-2">
                  <i className="fas fa-star me-1"></i>
                  {game.rating}/5
                </span>
              )}
              {game.metacritic && (
                <span className="badge bg-success me-2">
                  Metacritic: {game.metacritic}
                </span>
              )}
              {game.released && (
                <span className="badge bg-info me-2">
                  <i className="fas fa-calendar me-1"></i>
                  {game.released}
                </span>
              )}
            </div>

            {game.genres && game.genres.length > 0 && (
              <div className="genres mb-3">
                <h6>Géneros:</h6>
                <div>
                  {game.genres.map((genre) => (
                    <span key={genre} className="badge bg-secondary me-1">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {game.platforms && game.platforms.length > 0 && (
              <div className="platforms mb-3">
                <h6>Plataformas:</h6>
                <div>
                  {game.platforms.map((platform) => (
                    <span key={platform} className="badge bg-primary me-1">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción - Solo para usuarios normales, no admins */}
          {user && user.role !== "admin" && (
            <div className="action-buttons mb-4">
              <button
                className="btn btn-warning me-2"
                onClick={handleAddFavorite}
                disabled={adding}
              >
                {adding ? "Añadiendo..." : <><i className="fas fa-star me-1"></i>Añadir a favoritos</>}
              </button>
            </div>
          )}

          {game.description && (
            <div className="game-description">
              <h5>Descripción</h5>
              <div
                className="description-content"
                dangerouslySetInnerHTML={{ __html: game.description }}
              />
            </div>
          )}

          {/* Información adicional */}
          <div className="additional-info mt-4">
            {game.developers && game.developers.length > 0 && (
              <p>
                <strong>Desarrolladores:</strong> {game.developers.join(", ")}
              </p>
            )}
            {game.publishers && game.publishers.length > 0 && (
              <p>
                <strong>Distribuidores:</strong> {game.publishers.join(", ")}
              </p>
            )}
            {game.website && (
              <p>
                <strong>Sitio web:</strong>
                <a
                  href={game.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2"
                >
                  Visitar sitio oficial
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};