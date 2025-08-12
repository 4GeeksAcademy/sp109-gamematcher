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
  const placeholderImage = '/placeholder-game.png'; // opcional, mostraría si no hay imagen

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Juego base
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games/${id}`);
        if (!res.ok) throw new Error(`Error ${res.status}: Juego no encontrado`);
        const data = await res.json();
        setGame(data);

        // 2. Relacionados (plataformas + géneros) en paralelo; si fallan, no rompen la vista
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
          console.warn('No se pudieron cargar relaciones:', relErr);
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
      if (!res.ok) throw new Error('No se pudo añadir a favoritos');
      await res.json();
      alert('¡Juego añadido a favoritos!');
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
          <button className="btn btn-primary" onClick={() => navigate('/local-games')}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>Juego no encontrado</h5>
          <p>El juego solicitado no existe en nuestra base de datos.</p>
          <button className="btn btn-primary" onClick={() => navigate('/local-games')}>
            Volver a la lista
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
            onClick={() => navigate('/local-games')}
          >
            ← Volver
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="img-fluid rounded shadow-sm"
              onError={(e) => { e.target.src = placeholderImage; }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center rounded bg-light" style={{ height: '300px' }}>
              <i className="fas fa-gamepad fa-4x text-muted"></i>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <h1 className="display-5 mb-3">{game.name}</h1>
          <div className="game-meta mb-3">
            {!!game.rating && game.rating > 0 && (
              <span className="badge bg-warning text-dark me-2">
                <i className="fas fa-star me-1"></i>{game.rating}
              </span>
            )}
            {game.released && (
              <span className="badge bg-info text-dark me-2">
                <i className="fas fa-calendar me-1"></i>{game.released}
              </span>
            )}
          </div>
          {platformNames.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-1">Plataformas</h6>
              {platformNames.map(p => <span key={p} className="badge bg-secondary me-2">{p}</span>)}
            </div>
          )}
          {genreNames.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-1">Géneros</h6>
              {genreNames.map(g => <span key={g} className="badge bg-primary me-2">{g}</span>)}
            </div>
          )}
          {isAuthenticated && user?.role === 'user' && (
            <div className="mb-3">
              <button className="btn btn-warning" onClick={handleAddFavorite} disabled={adding}>
                {adding ? 'Añadiendo...' : <><i className="fas fa-star me-1" />Añadir a favoritos</>}
              </button>
            </div>
          )}
          {!isAuthenticated && (
            <div className="alert alert-info py-2"> <i className="fa-solid fa-info-circle me-2"></i>
              <Link to="/login" className="alert-link">Inicia sesión</Link> para añadir a favoritos
            </div>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <div className="alert alert-warning py-2"><i className="fa-solid fa-user-shield me-2"></i>Los administradores no pueden añadir favoritos</div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {/* Descripción */}
          {game.description && (
            <div className="mt-4">
              <h5>Descripción</h5>
              <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{game.description}</p>
            </div>
          )}
          <div className="mt-4 small text-muted">
            <span><strong>ID:</strong> {game.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
