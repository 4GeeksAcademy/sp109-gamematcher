import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GameCard } from '../components/GameCard';
import { Loading } from '../components/Loading';

export const GameRecommendations = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      const preferencesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games/recommendations/context`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (preferencesResponse.status === 401) {
        throw new Error('No autorizado. Inicie sesión nuevamente.');
      }

      if (!preferencesResponse.ok) {
        throw new Error('Error al obtener preferencias del usuario');
      }

      const preferences = await preferencesResponse.json();
      console.log('Preferencias del usuario:', preferences);

      const rawgGames = await fetchRawgGames(preferences);
      setGames(rawgGames);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRawgGames = async (preferences) => {
    const API_KEY = import.meta.env.VITE_RAWG_API_KEY;

    if (!API_KEY) {
      throw new Error('RAWG API key no configurada');
    }

    const baseUrl = 'https://api.rawg.io/api/games';

    const params = new URLSearchParams({
      key: API_KEY,
      page_size: '40',
      ordering: '-rating'
    });

    if (preferences.preferred_genres && preferences.preferred_genres.length > 0) {
      params.append('genres', preferences.preferred_genres.join(','));
    }

    if (preferences.preferred_platforms && preferences.preferred_platforms.length > 0) {
      const platformMapping = {
        'PC': '4',
        'PlayStation 5': '187',
        'PlayStation 4': '18',
        'Xbox Series S/X': '186',
        'Xbox One': '1',
        'Nintendo Switch': '7'
      };

      const rawgPlatformIds = preferences.preferred_platforms
        .map(platform => platformMapping[platform])
        .filter(id => id);

      if (rawgPlatformIds.length > 0) {
        params.append('platforms', rawgPlatformIds.join(','));
      }
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Error de RAWG API: ${response.status}`);
    }

    const data = await response.json();
    const allGames = data.results || [];

    const excluded = preferences.excluded_rawg_ids || [];
    const filteredGames = allGames
      .filter(game => !excluded.includes(game.id))
      .slice(0, 24) // 24 juegos = múltiplo perfecto para grids de 2, 3, 4, 6 columnas
      .map(game => ({
        id: game.id,
        rawg_id: game.id,
        name: game.name,
        description: game.description_raw?.slice(0, 500) || 'Sin descripción disponible',
        background_image: game.background_image,
        rating: game.rating || 0,
        released: game.released,
        platforms: game.platforms?.map(p => p.platform.name) || [],
        genres: game.genres?.map(g => g.name) || [],
        source: 'rawg'
      }));

    return filteredGames;
  };

  const handleGameClick = (game) => {
    window.location.href = `/game/${game.rawg_id}`;
  };

  if (loading) {
    return <Loading message="Obteniendo recomendaciones personalizadas..." />;
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchRecommendations}>
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
          <h1 className="mb-4"><i className="fas fa-star"></i> Recomendaciones para ti</h1>
          {games.length === 0 ? (
            <div className="alert alert-info">
              <h5>No hay recomendaciones disponibles</h5>
              <p>Complete su perfil de preferencias para obtener recomendaciones personalizadas.</p>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4">
                Encontramos {games.length} juegos basados en tus preferencias
              </p>
              <div className="row">
                {games.map(game => (
                  <div key={game.id} className="col-12 col-md-4 col-lg-4 mb-4">
                    <GameCard
                      game={game}
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
