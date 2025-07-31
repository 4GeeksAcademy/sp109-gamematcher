import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const RawgGameDetail = () => {
  const { id } = useParams();
  const apiKey = import.meta.env.VITE_RAWG_API_KEY;
  const [game, setGame] = useState(null);

  const fetchGameDetail = async () => {
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games/${id}?key=${apiKey}`
      );
      const data = await res.json();
      setGame(data);
    } catch (err) {
      console.error("Error fetching RAWG game detail:", err);
    }
  };

  useEffect(() => {
    fetchGameDetail();
  }, [id]);

  if (!game)
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleAddFavorite = async () => {
    try {
      // Primero, crear/verificar que el juego existe en nuestra base de datos
      const gameData = {
        id: game.id, // ID de RAWG
        name: game.name,
        description: game.description_raw || "Sin descripción"
      };

      // Intentar crear el juego primero (si no existe, lo crea; si existe, lo devuelve)
      const gameResponse = await fetch(`${backendUrl}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });

      if (!gameResponse.ok) {
        const gameError = await gameResponse.json();
        console.error("Error creating game:", gameError);
        alert("Error al procesar el juego: " + gameError.message);
        return;
      }

      // Ahora añadir a favoritos
      const favResponse = await fetch(`${backendUrl}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // 🔧 Simulado hasta que tengas auth
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
          <img
            src={game.background_image}
            alt={game.name}
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-8">
          <Link to="/rawg" className="btn btn-outline-secondary btn-sm">
            ← Volver a la lista
          </Link>

          <h1 className="mb-3">{game.name}</h1>

          <div className="mb-3">
            <span className="badge bg-primary me-2">
              <i className="fa-regular fa-calendar me-1"></i>
              {game.released || "Fecha no disponible"}
            </span>
            {game.rating && (
              <span className="badge bg-warning text-dark">
                <i className="fa-solid fa-star me-1"></i>
                {game.rating}/5
              </span>
            )}
          </div>

          {game.genres && game.genres.length > 0 && (
            <div className="mb-3">
              <strong>Géneros:</strong>
              <div className="mt-1">
                {game.genres.map((genre) => (
                  <span key={genre.id} className="badge bg-secondary me-1">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {game.description && (
            <div className="mt-4">
              <button
                className="btn btn-sm btn-outline-danger mb-3"
                onClick={handleAddFavorite}
              >
                <i className="fa-solid fa-heart me-2"></i>
                Añadir a favoritos
              </button>
              <h5>Descripción:</h5>
              <div
                className="border p-3 rounded bg-light"
                dangerouslySetInnerHTML={{ __html: game.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
