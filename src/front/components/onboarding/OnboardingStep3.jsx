import React, { useState, useEffect } from "react";

const OnboardingStep3 = ({
  selectedFavorites,
  setSelectedFavorites,
  onNext,
  onPrev,
}) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const REQUIRED_FAVORITES = 3;

  // Cargar juegos de muestra para el onboarding
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/onboarding/games-sample`
      );
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameToggle = (gameId) => {
    if (selectedFavorites.includes(gameId)) {
      setSelectedFavorites(selectedFavorites.filter((id) => id !== gameId));
    } else {
      if (selectedFavorites.length < REQUIRED_FAVORITES) {
        setSelectedFavorites([...selectedFavorites, gameId]);
      }
    }
  };

  const handleNext = () => {
    if (selectedFavorites.length !== REQUIRED_FAVORITES) {
      alert(
        `Por favor selecciona exactamente ${REQUIRED_FAVORITES} juegos favoritos`
      );
      return;
    }
    onNext();
  };

  const getRemainingSelections = () => {
    return REQUIRED_FAVORITES - selectedFavorites.length;
  };

  if (loading) {
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
                <i className="fas fa-star fa-3x text-warning"></i>
              </div>
              <h3 className="card-title">¡Selecciona tus juegos favoritos!</h3>
              <p className="text-muted">
                Elige exactamente {REQUIRED_FAVORITES} juegos que te gusten.
                Esto nos ayudará a entender mejor tus preferencias.
              </p>
            </div>

            {/* Contador de selecciones */}
            <div className="text-center mb-4">
              <div className="d-inline-block">
                <span className="badge bg-primary fs-6 px-3 py-2">
                  {selectedFavorites.length} de {REQUIRED_FAVORITES}{" "}
                  seleccionados
                </span>
                {getRemainingSelections() > 0 && (
                  <small className="d-block text-muted mt-2">
                    Faltan {getRemainingSelections()} juego
                    {getRemainingSelections() !== 1 ? "s" : ""}
                  </small>
                )}
                {getRemainingSelections() === 0 && (
                  <small className="d-block text-success mt-2">
                    <i className="fas fa-check me-1"></i>
                    ¡Perfecto! Ya tienes {REQUIRED_FAVORITES} juegos
                    seleccionados
                  </small>
                )}
              </div>
            </div>

            {/* Grid de juegos */}
            <div className="row g-3 mb-4">
              {games.map((game) => (
                <div key={game.id} className="col-md-6 col-lg-4 col-xl-3">
                  <div
                    className={`card h-100 border-2 cursor-pointer game-card ${
                      selectedFavorites.includes(game.id)
                        ? "border-warning bg-warning text-dark"
                        : "border-light"
                    } ${
                      selectedFavorites.length >= REQUIRED_FAVORITES &&
                      !selectedFavorites.includes(game.id)
                        ? "opacity-50"
                        : ""
                    }`}
                    onClick={() => handleGameToggle(game.id)}
                    style={{
                      cursor:
                        selectedFavorites.length >= REQUIRED_FAVORITES &&
                        !selectedFavorites.includes(game.id)
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.3s ease",
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
                              width: "100%",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}

                      {/* Información del juego */}
                      <h6 className="card-title mb-2 small fw-bold">
                        {game.name}
                      </h6>

                      {game.rating && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="fas fa-star text-warning me-1"></i>
                            {game.rating}
                          </small>
                        </div>
                      )}

                      {selectedFavorites.includes(game.id) && (
                        <div className="text-center">
                          <i className="fas fa-heart fa-2x text-danger"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de navegación */}
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={onPrev}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Anterior
              </button>
              <button
                className="btn btn-primary btn-lg px-4"
                onClick={handleNext}
                disabled={selectedFavorites.length !== REQUIRED_FAVORITES}
              >
                Siguiente
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
