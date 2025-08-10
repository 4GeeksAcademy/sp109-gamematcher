import React, { useState, useEffect } from 'react';

const OnboardingStep4 = ({ selectedNonFavorites, setSelectedNonFavorites, onComplete, onPrev, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedGamesVisual, setSelectedGamesVisual] = useState([]);

  const REQUIRED_NON_FAVORITES = 3;
  const rawgApiKey = import.meta.env.VITE_RAWG_API_KEY;

  // Buscador de juegos en RAWG
  useEffect(() => {
    const searchRawgGames = async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://api.rawg.io/api/games?search=${searchTerm}&key=${rawgApiKey}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error searching games:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const delaySearch = setTimeout(searchRawgGames, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, rawgApiKey]);

  const handleGameToggle = async (game) => {
    const isSelected = selectedGamesVisual.some(g => g.name === game.name);

    if (isSelected) {
      // Remover del visual y del array de IDs
      setSelectedGamesVisual(selectedGamesVisual.filter(g => g.name !== game.name));
      setSelectedNonFavorites(selectedNonFavorites.slice(0, -1));
    } else {
      if (selectedGamesVisual.length < REQUIRED_NON_FAVORITES) {
        try {
          // Guardar en la base de datos
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: game.name,
              description: game.description_raw || "Sin descripción",
              background_image: game.background_image,
              released: game.released,
              rating: game.rating,
              rawg_id: game.id
            })
          });

          if (response.ok) {
            const gameData = await response.json();
            setSelectedGamesVisual([...selectedGamesVisual, { name: game.name }]);
            setSelectedNonFavorites([...selectedNonFavorites, gameData.id]);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
  };

  const handleComplete = () => {
    if (selectedGamesVisual.length !== REQUIRED_NON_FAVORITES) {
      alert(`Por favor selecciona exactamente ${REQUIRED_NON_FAVORITES} juegos que NO te gusten`);
      return;
    }
    onComplete();
  };

  const getRemainingSelections = () => {
    return REQUIRED_NON_FAVORITES - selectedGamesVisual.length;
  };

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
                  {selectedGamesVisual.length} de {REQUIRED_NON_FAVORITES} seleccionados
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

            {/* Buscador de juegos */}
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar juegos que NO te gusten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchLoading && (
                <div className="text-center mt-2">
                  <small className="text-muted">
                    <i className="fas fa-spinner fa-spin me-1"></i>
                    Buscando...
                  </small>
                </div>
              )}
            </div>

            {/* Lista de juegos seleccionados */}
            {/* {selectedGamesVisual.length > 0 && (
              <div className="mb-4">
                <h6>Juegos NO favoritos seleccionados:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {selectedGamesVisual.map((game, index) => (
                    <span key={index} className="badge bg-danger fs-6 px-2 py-2">
                      {game.name}
                    </span>
                  ))}
                </div>
              </div>
            )} */}

            {/* Grid de juegos */}
            {searchResults.length > 0 && (
              <div className="row g-3 mb-4">
                {searchResults.map((game) => {
                  const isSelected = selectedGamesVisual.some(g => g.name === game.name);
                  return (
                    <div key={game.id} className="col-md-6 col-lg-4 col-xl-3">
                      <div
                        className={`card h-100 border-2 cursor-pointer game-card ${isSelected
                          ? 'border-danger bg-danger text-white'
                          : 'border-light'
                          } ${selectedGamesVisual.length >= REQUIRED_NON_FAVORITES &&
                            !isSelected
                            ? 'opacity-50'
                            : ''
                          }`}
                        onClick={() => handleGameToggle(game)}
                        style={{
                          cursor: selectedGamesVisual.length >= REQUIRED_NON_FAVORITES &&
                            !isSelected
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
                              <small className={isSelected ? 'text-light' : 'text-muted'}>
                                <i className="fas fa-star text-warning me-1"></i>
                                {game.rating}
                              </small>
                            </div>
                          )}

                          {isSelected && (
                            <div className="text-center">
                              <i className="fas fa-times-circle fa-2x text-white"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mensaje de finalización */}
            {selectedGamesVisual.length === REQUIRED_NON_FAVORITES && (
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
                disabled={selectedGamesVisual.length !== REQUIRED_NON_FAVORITES || loading}
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