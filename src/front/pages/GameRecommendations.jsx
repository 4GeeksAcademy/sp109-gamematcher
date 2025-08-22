// src/front/pages/GameRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GameCard } from '../components/GameCard';
import { Loading } from '../components/Loading';

export const GameRecommendations = () => {
  const navigate = useNavigate();
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
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const preferencesResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/games/recommendations/context`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (preferencesResponse.status === 401) {
        throw new Error('Unauthorized. Please sign in again.');
      }
      if (!preferencesResponse.ok) {
        throw new Error('Error fetching user preferences');
      }

      const preferences = await preferencesResponse.json();
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
    if (!API_KEY) throw new Error('RAWG API key not configured');

    const baseUrl = 'https://api.rawg.io/api/games';
    const params = new URLSearchParams({
      key: API_KEY,
      page_size: '40',
      ordering: '-rating',
    });

    if (preferences.preferred_genres?.length) {
      params.append('genres', preferences.preferred_genres.join(','));
    }

    if (preferences.preferred_platforms?.length) {
      // Minimal mapping (extend if you need more)
      const platformMapping = {
        'PC': '4',
        'PlayStation 5': '187',
        'PlayStation 4': '18',
        'Xbox Series S/X': '186',
        'Xbox One': '1',
        'Nintendo Switch': '7',
      };
      const rawgPlatformIds = preferences.preferred_platforms
        .map((p) => platformMapping[p])
        .filter(Boolean);
      if (rawgPlatformIds.length) {
        params.append('platforms', rawgPlatformIds.join(','));
      }
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);

    const data = await response.json();
    const allGames = data.results || [];
    const excluded = preferences.excluded_rawg_ids || [];

    return allGames
      .filter((g) => !excluded.includes(g.id))
      .slice(0, 24)
      .map((g) => ({
        id: g.id,
        rawg_id: g.id,
        name: g.name,
        description: g.description_raw?.slice(0, 500) || 'No description available',
        background_image: g.background_image,
        rating: g.rating || 0,
        released: g.released,
        // Pasamos nombres de plataformas para que GameCard pinte iconos
        platforms: g.platforms?.map((p) => p.platform.name) || [],
        genres: g.genres?.map((x) => x.name) || [],
        source: 'rawg',
      }));
  };

  const handleGameClick = (game) => {
    navigate(`/dashboard/recommendations/${game.rawg_id}`);
  };

  if (loading) {
    return <Loading message="Fetching your personalized recommendations…" />;
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-gradient" onClick={fetchRecommendations}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 games-modern">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-star me-2"></i>
            Recommendations for you
          </h1>

          {games.length === 0 ? (
            <div className="alert alert-info">
              <h5>No recommendations yet</h5>
              <p>Complete your preferences to get personalized game picks.</p>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4">
                We found {games.length} games based on your preferences
              </p>
              <div className="row">
                {games.map((game) => (
                  <div key={game.id} className="col-12 col-md-4 col-lg-4 mb-4">
                    <GameCard game={game} onClick={() => handleGameClick(game)} />
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

