import React, { useState, useEffect } from 'react';

const OnboardingStep4 = ({ selectedNonFavorites, setSelectedNonFavorites, onComplete, onPrev, loading }) => {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const REQUIRED_NON_FAVORITES = 3;

  // Cargar juegos de muestra para el onboarding
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/games-sample`);
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleGameToggle = (gameId) => {
    if (selectedNonFavorites.includes(gameId)) {
      setSelectedNonFavorites(selectedNonFavorites.filter(id => id !== gameId));
    } else {
      if (selectedNonFavorites.length < REQUIRED_NON_FAVORITES) {
        setSelectedNonFavorites([...selectedNonFavorites, gameId]);
      }
    }
  };

  const handleComplete = () => {
    if (selectedNonFavorites.length !== REQUIRED_NON_FAVORITES) {
      alert(`Por favor selecciona exactamente ${REQUIRED_NON_FAVORITES} juegos que NO te gusten`);
      return;
    }
    onComplete();
  };

  const getRemainingSelections = () => {
    return REQUIRED_NON_FAVORITES - selectedNonFavorites.length;
  };

  if (loadingGames) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
        <p>Cargando juegos...</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-12">
        <div className="card shadow-sm border-0">
          <div className="card-body p-5">
            {/* Título */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <i className="fas fa-thumbs-down fa-3x text-danger"></i>
              </div>
              <h3 className="card-title">¿Qué juegos NO te interesan?</h3>
              <p className="text-muted">
                Selecciona exactamente {REQUIRED_NON_FAVORITES} juegos que NO te gusten o no te llamen la atención.
                Esto nos ayudará a evitar recomendarte juegos similares.
              </p>
            </div>

            {/* Contador de selecciones */}
            <div className="text-center mb-4">
              <div className="d-inline-block">
                <span className="badge bg-danger fs-6 px-3 py-2">
                  {selectedNonFavorites.length} de {REQUIRED_NON_FAVORITES} seleccionados
                </span>
                {getRemainingSelections() > 0 && (
                  <small className="d-block text-muted mt-2">
                    Faltan {getRemainingSelections()} juego{getRemainingSelections() !== 1 ? 's' : ''}
                  </small>
                )}
                {getRemainingSelections() === 0 && (
                  <small className="d-block text-success mt-2">
                    <i className="fas fa-check me-1"></i>
                    ¡Perfecto! Ya tienes {REQUIRED_NON_FAVORITES} juegos seleccionados
                  </small>
                )}
              </div>
            </div>

            {/* Grid de juegos */}
            <div className="row g-3 mb-4">
              {games.map((game) => (
                <div key={game.id} className="col-md-6 col-lg-4 col-xl-3">
                  <div
                    className={`card h-100 border-2 cursor-pointer game-card ${selectedNonFavorites.includes(game.id)
                      ? 'border-danger bg-danger text-white'
                      : 'border-light'
                      } ${selectedNonFavorites.length >= REQUIRED_NON_FAVORITES &&
                        !selectedNonFavorites.includes(game.id)
                        ? 'opacity-50'
                        : ''
                      }`}
                    onClick={() => handleGameToggle(game.id)}
                    style={{
                      cursor: selectedNonFavorites.length >= REQUIRED_NON_FAVORITES &&
                        !selectedNonFavorites.includes(game.id)
                        ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="card-body p-3">
                      {/* Imagen del juego */}
                      {game.background_image && (
                        <div className="mb-2">
                          <img
                            src={game.background_image}
                            alt={game.name}
                            className="img-fluid rounded"
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      )}

                      {/* Información del juego */}
                      <h6 className="card-title mb-2 small fw-bold">{game.name}</h6>

                      {game.rating && (
                        <div className="mb-2">
                          <small className={selectedNonFavorites.includes(game.id) ? 'text-light' : 'text-muted'}>
                            <i className="fas fa-star text-warning me-1"></i>
                            {game.rating}
                          </small>
                        </div>
                      )}

                      {selectedNonFavorites.includes(game.id) && (
                        <div className="text-center">
                          <i className="fas fa-times-circle fa-2x text-white"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje de finalización */}
            {selectedNonFavorites.length === REQUIRED_NON_FAVORITES && (
              <div className="alert alert-success text-center mb-4">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
                <h5>¡Casi terminamos!</h5>
                <p className="mb-0">
                  Tienes todo listo. Haz clic en "Finalizar" para completar tu configuración
                  y empezar a recibir recomendaciones personalizadas.
                </p>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={onPrev}
                disabled={loading}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Anterior
              </button>
              <button
                className="btn btn-success btn-lg px-4"
                onClick={handleComplete}
                disabled={selectedNonFavorites.length !== REQUIRED_NON_FAVORITES || loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Finalizar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep4;
