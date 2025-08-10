import React, { useState, useEffect } from "react";

const OnboardingStep2 = ({
  selectedGenres,
  setSelectedGenres,
  onNext,
  onPrev,
}) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar géneros disponibles del backend
  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/genres`
      );
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error("Error loading genres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleNext = () => {
    if (selectedGenres.length === 0) {
      alert("Por favor selecciona al menos un género");
      return;
    }
    onNext();
  };

  // Mapeo fijo de géneros basado en RAWG (lista oficial completa)
  const GENRE_ICONS = {
    Action: "fas fa-fist-raised",
    Indie: "fas fa-heart",
    Adventure: "fas fa-map",
    RPG: "fas fa-dragon",
    Strategy: "fas fa-chess",
    Shooter: "fas fa-crosshairs",
    Casual: "fas fa-coffee",
    Simulation: "fas fa-cogs",
    Puzzle: "fas fa-puzzle-piece",
    Arcade: "fas fa-gamepad",
    Platformer: "fas fa-running",
    Racing: "fas fa-car",
    "Massively Multiplayer": "fas fa-globe",
    Sports: "fas fa-football-ball",
    Fighting: "fas fa-fist-raised",
    Family: "fas fa-users",
    "Board Games": "fas fa-chess-board",
    Educational: "fas fa-graduation-cap",
    Card: "fas fa-cards",
  };

  // Iconos para cada género
  const getGenreIcon = (genreName) => {
    return GENRE_ICONS[genreName] || "fas fa-gamepad";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
        <p>Cargando géneros...</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="card shadow-sm border-0">
          <div className="card-body p-5">
            {/* Título */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <i className="fas fa-heart fa-3x text-danger"></i>
              </div>
              <h3 className="card-title">¿Qué géneros te gustan?</h3>
              <p className="text-muted">
                Selecciona los géneros de juegos que más disfrutas. Esto nos
                ayudará a personalizar tus recomendaciones.
              </p>
            </div>

            {/* Grid de géneros */}
            <div className="row g-3 mb-4">
              {genres.map((genre) => (
                <div key={genre.id} className="col-md-4 col-lg-3">
                  <div
                    className={`card h-100 border-2 cursor-pointer ${
                      selectedGenres.includes(genre.id)
                        ? "border-primary bg-primary text-white"
                        : "border-light"
                    }`}
                    onClick={() => handleGenreToggle(genre.id)}
                    style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                  >
                    <div className="card-body text-center p-3">
                      <i
                        className={`${getGenreIcon(genre.name)} fa-2x mb-2`}
                      ></i>
                      <h6 className="card-title mb-1 small">{genre.name}</h6>
                      {selectedGenres.includes(genre.id) && (
                        <i className="fas fa-check-circle mt-1"></i>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contador de selecciones */}
            <div className="text-center mb-4">
              <small className="text-muted">
                {selectedGenres.length} género
                {selectedGenres.length !== 1 ? "s" : ""} seleccionado
                {selectedGenres.length !== 1 ? "s" : ""}
              </small>
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
                disabled={selectedGenres.length === 0}
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

export default OnboardingStep2;
