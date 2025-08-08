import React, { useState, useEffect } from 'react';

const OnboardingStep1 = ({ selectedPlatforms, setSelectedPlatforms, onNext }) => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar plataformas disponibles del backend
  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/platforms`);
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error('Error loading platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platformId) => {
    console.log('Toggle plataforma:', platformId);
    console.log('Plataformas actualmente seleccionadas:', selectedPlatforms);
    
    if (selectedPlatforms.includes(platformId)) {
      const newSelection = selectedPlatforms.filter(id => id !== platformId);
      console.log('Eliminar plataforma, nueva seleccion:', newSelection);
      setSelectedPlatforms(newSelection);
    } else {
      const newSelection = [...selectedPlatforms, platformId];
      console.log('Agregar plataforma, nueva seleccion:', newSelection);
      setSelectedPlatforms(newSelection);
    }
  };

  const handleNext = () => {
    console.log('Ir al siguiente paso con las plataformas seleccionadas:', selectedPlatforms);
    if (selectedPlatforms.length === 0) {
      alert('Por favor selecciona al menos una plataforma');
      return;
    }
    onNext();
  };

  // Iconos para cada plataforma - usando nomenclatura RAWG estándar
  const getPlatformIcon = (platformName) => {
    switch (platformName) {
      case 'PC':
        return 'fas fa-desktop';
      case 'PlayStation 5':
        return 'fab fa-playstation';
      case 'PlayStation 4':
        return 'fab fa-playstation';
      case 'Xbox Series S/X':
        return 'fab fa-xbox';
      case 'Xbox One':
        return 'fab fa-xbox';
      case 'Nintendo Switch':
        return 'fas fa-gamepad';
      case 'macOS':
        return 'fab fa-apple';
      default:
        return 'fas fa-gamepad';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
        <p>Cargando plataformas...</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm border-0">
          <div className="card-body p-5">
            {/* Título */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <i className="fas fa-gamepad fa-3x text-primary"></i>
              </div>
              <h3 className="card-title">¿En qué plataformas juegas?</h3>
              <p className="text-muted">
                Selecciona las plataformas que usas para jugar.
                Esto nos ayudará a recomendarte juegos disponibles en tus dispositivos.
              </p>
            </div>

            {/* Grid de plataformas */}
            <div className="row g-3 mb-4">
              {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                console.log(`Plataforma ${platform.name} (ID: ${platform.id}) - Seleccionada: ${isSelected}`);
                return (
                  <div key={platform.id} className="col-md-6 col-lg-4">
                    <div
                      className={`card h-100 border-2 cursor-pointer platform-card ${isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-light'
                        }`}
                      onClick={() => handlePlatformToggle(platform.id)}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                      <div className="card-body text-center p-4">
                        <i className={`${getPlatformIcon(platform.name)} fa-2x mb-3`}></i>
                        <h6 className="card-title mb-0">{platform.name}</h6>
                        {isSelected && (
                          <i className="fas fa-check-circle mt-2"></i>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contador de selecciones */}
            <div className="text-center mb-4">
              <small className="text-muted">
                {selectedPlatforms.length} plataforma{selectedPlatforms.length !== 1 ? 's' : ''} seleccionada{selectedPlatforms.length !== 1 ? 's' : ''}
              </small>
            </div>

            {/* Botones de navegación */}
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary btn-lg px-4"
                onClick={handleNext}
                disabled={selectedPlatforms.length === 0}
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

export default OnboardingStep1;
