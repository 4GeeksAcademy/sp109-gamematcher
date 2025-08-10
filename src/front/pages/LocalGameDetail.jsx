import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LocalGameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchLocalGame();
  }, [id]);

  const fetchLocalGame = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Juego no encontrado`);
      }

      const localGame = await response.json();
      setGame(localGame);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!user || adding) {
      return;
    }

    try {
      setAdding(true);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: user.id,
          game_id: game.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('¡Juego añadido a favoritos!');
      } else {
        const errorText = await response.text();
        alert(`Error al añadir a favoritos: ${response.status}`);
      }
    } catch (err) {
      alert(`Error al añadir a favoritos: ${err.message}`);
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
          {(game.image_url || game.background_image) ? (
            <img
              src={game.image_url || game.background_image}
              alt={game.name}
              className="img-fluid rounded shadow-sm"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center rounded bg-light"
              style={{ height: '300px' }}
            >
              <i className="fas fa-gamepad fa-4x text-muted"></i>
            </div>
          )}
          {(game.image_url || game.background_image) && (
            <div
              className="align-items-center justify-content-center rounded bg-light"
              style={{ height: '300px', display: 'none' }}
            >
              <i className="fas fa-gamepad fa-4x text-muted"></i>
            </div>
          )}
        </div>

        <div className="col-md-8">
          <div className="game-header mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h1 className="display-4 mb-0">{game.name}</h1>
              <span className="badge bg-success fs-6">
                <i className="fas fa-database me-1"></i>
                Base de Datos
              </span>
            </div>

            <div className="game-meta mb-3">
              {game.rating > 0 && (
                <span className="badge bg-warning text-dark me-2">
                  <i className="fas fa-star me-1"></i>
                  {game.rating}/5
                </span>
              )}
              {game.release_date && (
                <span className="badge bg-info me-2">
                  <i className="fas fa-calendar me-1"></i>
                  {new Date(game.release_date).getFullYear()}
                </span>
              )}
            </div>
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
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {/* Descripción */}
          {game.description && (
            <div className="game-description mt-4">
              <h5>Descripción</h5>
              <div className="description-content">
                <p>{game.description}</p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="additional-info mt-4">
            <p>
              <strong>ID:</strong> {game.id}
            </p>
            {game.created_at && (
              <p>
                <strong>Añadido:</strong> {new Date(game.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
