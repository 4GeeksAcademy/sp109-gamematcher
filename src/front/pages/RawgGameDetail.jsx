import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchGameDetail();
  }, [id]);

  const [platformNames, setPlatformNames] = useState([]);
  const [genreNames, setGenreNames] = useState([]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/api/games/${id}`);
      if (!res.ok) {
        throw new Error("Juego no encontrado en la base de datos");
      }

      const data = await res.json();
      setGame(data);

      try {
        const [platRes, genRes] = await Promise.all([
          fetch(`${backendUrl}/api/game-platforms/game/${id}`),
          fetch(`${backendUrl}/api/game-genres/game/${id}`)
        ]);

        const platData = platRes.ok ? await platRes.json() : [];
        const genData = genRes.ok ? await genRes.json() : [];

        setPlatformNames(platData.map(p => p.platform_name).filter(Boolean));
        setGenreNames(genData.map(g => g.genre_name).filter(Boolean));
      } catch (e) {
        console.warn("No se pudieron cargar plataformas/géneros relacionados:", e);
        setPlatformNames([]);
        setGenreNames([]);
      }

    } catch (err) {
      console.error("Error al cargar juego:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando detalles del juego...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <h3 className="text-danger">Error al cargar el juego</h3>
          <p className="text-muted">{error || 'Juego no encontrado'}</p>
          <Link to="/rawg" className="btn btn-primary">
            <i className="fa-solid fa-arrow-left me-2"></i>
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

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
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
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
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
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
            onClick={() => navigate(-1)}
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

          {platformNames.length > 0 && (
            <div className="mt-3">
              <h5>Plataformas:</h5>
              <div>
                {platformNames.map((p, idx) => (
                  <span key={idx} className="badge bg-secondary me-2">{p}</span>
                ))}
              </div>
            </div>
          )}

          {genreNames.length > 0 && (
            <div className="mt-3">
              <h5>Géneros:</h5>
              <div>
                {genreNames.map((g, idx) => (
                  <span key={idx} className="badge bg-info me-2 text-dark">{g}</span>
                ))}
              </div>
            </div>
          )}

          {isAuthenticated && user && user.role === "user" && (
            <div className="mt-3">
              <button
                className="btn btn-warning me-2"
                onClick={handleAddFavorite}
                disabled={adding}
              >
                {adding ? "Añadiendo..." : (
                  <>
                    <i className="fas fa-star me-1"></i>
                    Añadir a favoritos
                  </>
                )}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="alert alert-info mb-3">
              <i className="fa-solid fa-info-circle me-2"></i>
              <Link to="/login" className="alert-link">Inicia sesión</Link> para añadir juegos a favoritos
            </div>
          )}

          {isAuthenticated && user && user.role === "admin" && (
            <div className="alert alert-warning mb-3">
              <i className="fa-solid fa-user-shield me-2"></i>
              Los administradores no pueden añadir favoritos
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