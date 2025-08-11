import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import OnboardingStep4 from './OnboardingStep4';

const OnboardingWizard = () => {
  const { user, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado para almacenar las selecciones del usuario
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [selectedNonFavorites, setSelectedNonFavorites] = useState([]);

  const totalSteps = 4;

  // Cargar el progreso del onboarding al montar el componente
  useEffect(() => {
    if (user) {
      loadOnboardingProgress();
    }
  }, [user]);

  const loadOnboardingProgress = async () => {
    if (!user) return;

    try {
      // Cargar el estado del progreso del onboarding
      const progressResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/status/${user.id}`);
      const progressData = await progressResponse.json();

      if (progressData.current_step) {
        setCurrentStep(progressData.current_step);
      }

      // NO cargamos preferencias existentes en el onboarding
      // El onboarding siempre debe empezar con estado limpio
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const updateStep = async (newStep) => {
    if (!user) return;

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/update-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          current_step: newStep
        })
      });

      setCurrentStep(newStep);
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      updateStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Marcar onboarding como completado PRIMERO para evitar re-ejecuciones
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      // 1. Guardar preferencias de plataformas
      for (const platformId of selectedPlatforms) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-platform-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            platform_id: platformId
          })
        });
      }

      // 2. Guardar preferencias de géneros
      for (const genreId of selectedGenres) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-genre-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            genre_id: genreId
          })
        });
      }

      // 3. Guardar juegos favoritos
      for (const gameId of selectedFavorites) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            game_id: gameId
          })
        });
      }

      // 4. Guardar juegos no favoritos
      for (const gameId of selectedNonFavorites) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/non-favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            game_id: gameId
          })
        });
      }

      // Redirigir a las recomendaciones después de completar onboarding
      await checkOnboardingStatus(user.id); // Actualizar estado en el AuthContext
      navigate('/recommendations'); // Redirigir a recomendaciones
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Hubo un error guardando tus preferencias. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            selectedGenres={selectedGenres}
            setSelectedGenres={setSelectedGenres}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            selectedFavorites={selectedFavorites}
            setSelectedFavorites={setSelectedFavorites}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            selectedNonFavorites={selectedNonFavorites}
            setSelectedNonFavorites={setSelectedNonFavorites}
            onComplete={completeOnboarding}
            onPrev={prevStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="row h-100">
        <div className="col-12">
          {/* Header con progreso */}
          <div className="bg-white shadow-sm p-4 mb-4">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="mb-0 text-primary">
                    <i className="fas fa-rocket me-2"></i>
                    Personaliza tu experiencia
                  </h2>
                  <p className="text-muted mb-0">Paso {currentStep} de {totalSteps}</p>
                </div>
                <div className="col-md-6">
                  {/* Barra de progreso */}
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del step actual */}
          <div className="container">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
