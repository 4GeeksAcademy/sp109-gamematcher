import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LocalGameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, getToken } = useAuth();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [platformNames, setPlatformNames] = useState([]);
  const [genreNames, setGenreNames] = useState([]);

  const placeholderImage = '/placeholder-game.png';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // Base game
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games/${id}`);
        if (!res.ok) throw new Error(`Error ${res.status}: Game not found`);
        const data = await res.json();
        setGame(data);

        // Relations (platforms + genres) — soft-fail
        try {
          const [platRes, genRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/game-platforms/game/${id}`),
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/game-genres/game/${id}`)
          ]);

          const platData = platRes.ok ? await platRes.json() : [];
          const genData = genRes.ok ? await genRes.json() : [];
          setPlatformNames(platData.map(p => p.platform_name).filter(Boolean));
          setGenreNames(genData.map(g => g.genre_name).filter(Boolean));
        } catch (relErr) {
          console.warn('Relations could not be loaded:', relErr);
          setPlatformNames([]);
          setGenreNames([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleAddFavorite = async () => {
    if (!user || !isAuthenticated || adding) return;
    try {
      setAdding(true);
      const token = getToken ? getToken() : localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, game_id: game.id })
      });
      if (!res.ok) throw new Error('Could not add to favorites');
      await res.json();
      alert('Game added to favorites!');
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="mt-2">Loading game details…</p>
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
          <button className="btn btn-gradient" onClick={() => navigate('/dashboard/local-games')}>
            Back to list
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>Game not found</h5>
          <p>The requested game does not exist in our database.</p>
          <button className="btn btn-gradient" onClick={() => navigate('/dashboard/local-games')}>
            Back to list
          </button>
        </div>
      </div>
    );
  }

  const bg = game.background_image || placeholderImage;

  return (
    <div className="container mt-3 gdetail-page">
      {/* Top actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-pill-outline"
          onClick={() => navigate('/dashboard/local-games')}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>
          Back
        </button>

        {isAuthenticated && user?.role === 'user' && (
          <button className="btn btn-gradient" onClick={handleAddFavorite} disabled={adding}>
            {adding ? 'Adding…' : (<><i className="fa-solid fa-star me-2"></i>Add to favorites</>)}
          </button>
        )}
      </div>

      {/* Hero with background image + overlay gradient */}
      <section
        className="gdetail-hero mb-4"
        style={{ backgroundImage: `url('${bg}')` }}
      >
        <div className="gdetail-hero__overlay" />
        <div className="gdetail-hero__inner">
          <div className="row g-4 align-items-center">
            <div className="col-md-5 col-lg-4">
              {game.background_image ? (
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="img-fluid rounded-3 shadow gdetail-cover"
                  onError={(e) => { e.currentTarget.src = placeholderImage; }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-light gdetail-cover">
                  <i className="fas fa-gamepad fa-3x text-muted"></i>
                </div>
              )}
            </div>

            <div className="col-md-7 col-lg-8 text-white">
              <h1 className="gdetail-title mb-2">{game.name}</h1>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                {!!game.rating && game.rating > 0 && (
                  <span className="rating-chip">
                    <i className="fas fa-star me-1"></i>{game.rating}/5
                  </span>
                )}
                {game.released && (
                  <span className="chip soft">
                    <i className="fas fa-calendar me-1"></i>{game.released}
                  </span>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2">
                {platformNames.length > 0 && (
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {platformNames.map(p => (
                      <span key={p} className="chip">{p}</span>
                    ))}
                  </div>
                )}
                {genreNames.length > 0 && (
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {genreNames.map(g => (
                      <span key={g} className="chip alt">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glass content card */}
      <section className="glass-card p-4 p-md-5 mb-4">
        {game.description && (
          <>
            <h5 className="mb-2">About</h5>
            <p className="mb-4" style={{ whiteSpace: 'pre-line' }}>{game.description}</p>
          </>
        )}

        <div className="row gy-3">
          <div className="col-sm-6 col-lg-3">
            <div className="gdetail-meta">
              <span className="gdetail-meta__label">Release</span>
              <span className="gdetail-meta__value">
                {game.released || '—'}
              </span>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="gdetail-meta">
              <span className="gdetail-meta__label">Rating</span>
              <span className="gdetail-meta__value">{game.rating ?? '—'}</span>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="gdetail-meta">
              <span className="gdetail-meta__label">Platforms</span>
              <span className="gdetail-meta__value">
                {platformNames.length ? platformNames.join(', ') : '—'}
              </span>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="gdetail-meta">
              <span className="gdetail-meta__label">Genres</span>
              <span className="gdetail-meta__value">
                {genreNames.length ? genreNames.join(', ') : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 small text-muted">
          <strong>ID:</strong> {game.id}
        </div>
      </section>

      {/* CTA for non-auth users */}
      {!isAuthenticated && (
        <div className="alert alert-info py-2 glass-lite">
          <i className="fa-solid fa-info-circle me-2"></i>
          <Link to="/login" className="alert-link">Sign in</Link> to add favorites
        </div>
      )}
      {isAuthenticated && user?.role === 'admin' && (
        <div className="alert alert-warning py-2 glass-lite">
          <i className="fa-solid fa-user-shield me-2"></i>
          Admins cannot add favorites
        </div>
      )}
    </div>
  );
};


