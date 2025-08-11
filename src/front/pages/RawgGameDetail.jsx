import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const RawgGameDetail = () => {
  //Utilizamos useParams para obtener el ID del juego de la URL
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const [platformNames, setPlatformNames] = useState([]);
  const [genreNames, setGenreNames] = useState([]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      // Obtener detalles del juego desde la base de datos local
      const res = await fetch(`${backendUrl}/api/games/${id}`);

      if (!res.ok) {
        throw new Error('Juego no encontrado');
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
        // Si falla alguna crida relacionada, no trenquem la pàgina
        console.warn("No se pudieron cargar plataformas/géneros relacionados:", e);
        setPlatformNames([]);
        setGenreNames([]);
      }
      // 🔼 FI CANVIS

    } catch (err) {
      console.error("Error fetching game detail:", err);
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
    // Verificar si el usuario está autenticado
    if (!isAuthenticated || !user) {
      alert("❌ Debes iniciar sesión para añadir juegos a favoritos.");
      return;
    }

    // Solo usuarios regulares pueden añadir favoritos (no admins)
    if (user.role !== "user") {
      alert("❌ Solo los usuarios pueden añadir juegos a favoritos.");
      return;
    }

    try {
      const token = sessionStorage.getItem("access_token");

      const favResponse = await fetch(`${backendUrl}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          game_id: game.id,
        }),
      });

      if (favResponse.ok) {
        alert("✅ Añadido a favoritos correctamente.");
      } else {
        const favError = await favResponse.json();
        console.error("Error adding favorite:", favError);
        alert("Error al añadir a favoritos: " + favError.message);
      }
    } catch (err) {
      console.error("Error al añadir favorito:", err);
      alert("Error en la conexión con el servidor.");
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-4 mb-4">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="img-fluid rounded shadow"
            />
          ) : (
            <div className="bg-light rounded shadow d-flex align-items-center justify-content-center"
              style={{ height: "300px" }}>
              <i className="fa-solid fa-gamepad fa-4x text-muted"></i>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <Link to="/rawg" className="btn btn-outline-secondary btn-sm">
            <i className="fa-solid fa-arrow-left me-2"></i>
            Volver a la lista
          </Link>

          <h1 className="mb-3">{game.name}</h1>

          <div className="mb-3">
            {game.released && (
              <span className="badge bg-primary me-2">
                <i className="fa-regular fa-calendar me-1"></i>
                {game.released}
              </span>
            )}
            {game.rating && (
              <span className="badge bg-warning text-dark">
                <i className="fa-solid fa-star me-1"></i>
                {game.rating}/5
              </span>
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

          {/* Solo mostrar botón de favoritos si el usuario está autenticado y es un usuario regular */}
          {isAuthenticated && user && user.role === "user" && (
            <button
              className="btn btn-sm btn-outline-danger mb-3 mt-3"
              onClick={handleAddFavorite}
            >
              <i className="fa-solid fa-heart me-2"></i>
              Añadir a favoritos
            </button>
          )}

          {/* Mensaje para usuarios no autenticados */}
          {!isAuthenticated && (
            <div className="alert alert-info mb-3">
              <i className="fa-solid fa-info-circle me-2"></i>
              <Link to="/login" className="alert-link">Inicia sesión</Link> para añadir juegos a favoritos
            </div>
          )}

          {/* Mensaje para admins */}
          {isAuthenticated && user && user.role === "admin" && (
            <div className="alert alert-warning mb-3">
              <i className="fa-solid fa-user-shield me-2"></i>
              Los administradores no pueden añadir favoritos
            </div>
          )}

          {game.description && (
            <div className="mt-4">
              <h5>Descripción:</h5>
              <div className="border p-3 rounded bg-light">
                <p className="mb-0">{game.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};