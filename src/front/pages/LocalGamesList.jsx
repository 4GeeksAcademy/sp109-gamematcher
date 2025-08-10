import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';

export const LocalGamesList = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocalGames();
  }, []);

  const fetchLocalGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener solo juegos de la base de datos local
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener los juegos`);
      }

      const localGames = await response.json();
      setGames(localGames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformGameData = (game) => {
    const transformedGame = {
      ...game,
      background_image: game.image_url || game.background_image || null,
      released: game.release_date ? new Date(game.release_date).getFullYear().toString() : game.released || null,
      genres: game.genres || [],
      rating: game.rating || 0
    };

    return transformedGame;
  };

  const handleGameClick = (game) => {
    navigate(`/games/${game.id}`);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando juegos de la base de datos...</p>
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
          <button className="btn btn-primary" onClick={fetchLocalGames}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-database"></i> Base de Datos
          </h1>

          {games.length === 0 ? (
            <div className="alert alert-info">
              <h5>No hay juegos en la base de datos</h5>
              <p>Aún no se han añadido juegos a la base de datos.</p>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4">
                {games.length} juegos en la base de datos
              </p>
              <div className="row">
                {games.map((game) => (
                  <div key={game.id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
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
