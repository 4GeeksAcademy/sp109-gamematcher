// src/front/pages/OnboardingWizard.jsx
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

  // User selections
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [selectedNonFavorites, setSelectedNonFavorites] = useState([]);

  const totalSteps = 4;

  useEffect(() => {
    if (user) {
      loadOnboardingProgress();
    }
  }, [user]);

  const loadOnboardingProgress = async () => {
    if (!user) return;
    try {
      const progressResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/onboarding/status/${user.id}`
      );
      const progressData = await progressResponse.json();

      if (progressData.current_step) {
        setCurrentStep(progressData.current_step);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const updateStep = async (newStep) => {
    if (!user) return;

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/update-step`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_step: newStep,
        }),
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
      // Mark onboarding as completed first
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      // Save platform preferences
      for (const platformId of selectedPlatforms) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-platform-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, platform_id: platformId }),
        });
      }

      // Save genre preferences
      for (const genreId of selectedGenres) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-genre-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, genre_id: genreId }),
        });
      }

      // Save favorites
      for (const gameId of selectedFavorites) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, game_id: gameId }),
        });
      }

      // Save non-favorites
      for (const gameId of selectedNonFavorites) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/non-favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, game_id: gameId }),
        });
      }

      await checkOnboardingStatus(user.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('There was an error saving your preferences. Please try again.');
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
      <div
        className="container-fluid d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid"
      style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}
    >
      <div className="row">
        <div className="col-12">
          {/* Header with progress */}
          <div className="bg-white shadow-sm p-4 mb-4">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="mb-0" style={{ color: '#6E00FF', fontWeight: 700 }}>
                    <i className="fas fa-rocket me-2"></i>
                    Customize your experience
                  </h2>
                  <p className="text-muted mb-0">
                    Step {currentStep} of {totalSteps}
                  </p>
                </div>
                <div className="col-md-6">
                  {/* Progress bar with gradient */}
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(currentStep / totalSteps) * 100}%`,
                        background:
                          'linear-gradient(90deg, #6E00FF 0%, #BB00FF 100%)',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current step content */}
          <div className="container">{renderCurrentStep()}</div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

