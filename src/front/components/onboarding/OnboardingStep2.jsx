// src/front/pages/OnboardingStep2.jsx
import React, { useEffect, useState, useMemo } from "react";

const OnboardingStep2 = ({ selectedGenres, setSelectedGenres, onNext, onPrev }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL, []);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await fetch(`${backend}/api/genres`);
        setGenres(await res.json());
      } catch (e) {
        console.error("Error loading genres:", e);
      } finally {
        setLoading(false);
      }
    };
    loadGenres();
  }, [backend]);

  const toggleGenre = (id) => {
    if (selectedGenres.includes(id)) {
      setSelectedGenres(selectedGenres.filter((x) => x !== id));
    } else {
      setSelectedGenres([...selectedGenres, id]);
    }
  };

  const handleNext = () => {
    if (!selectedGenres.length) {
      alert("Please select at least one genre.");
      return;
    }
    onNext();
  };

  // Fallback icons when an image is missing/broken
  const FALLBACK_ICONS = {
    Action: "fas fa-bolt",
    Indie: "fas fa-heart",
    Adventure: "fas fa-map",
    RPG: "fas fa-dragon",
    Strategy: "fas fa-chess",
    Shooter: "fas fa-crosshairs",
    Casual: "fas fa-mug-hot",
    Simulation: "fas fa-cogs",
    Puzzle: "fas fa-puzzle-piece",
    Arcade: "fas fa-gamepad",
    Platformer: "fas fa-shoe-prints",
    Racing: "fas fa-car",
    "Massively Multiplayer": "fas fa-globe",
    Sports: "fas fa-football-ball",
    Fighting: "fas fa-fist-raised",
    Family: "fas fa-users",
    "Board Games": "fas fa-chess-board",
    Educational: "fas fa-graduation-cap",
    Card: "fas fa-clone",
  };
  const getIcon = (name) => FALLBACK_ICONS[name] || "fas fa-gamepad";

  const hideBrokenImg = (e) => {
    // Hide the <img> and let the fallback icon show
    e.currentTarget.style.display = "none";
    const icon = e.currentTarget.parentElement?.querySelector("[data-fallback-icon]");
    if (icon) icon.style.display = "inline-block";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading genres…</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-xl-9 col-lg-10">
        <div className="glass-card p-4 p-md-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background:
                  "linear-gradient(50deg, rgba(110,0,255,.12), rgba(187,0,255,.12))",
                border: "1px solid rgba(110,0,255,.18)",
              }}
            >
              <i className="fas fa-heart" style={{ color: "#6E00FF" }} />
            </div>
            <h3 className="mb-2" style={{ fontWeight: 800, letterSpacing: "-.02em" }}>
              Which genres do you enjoy?
            </h3>
            <p className="text-muted mb-0">
              Pick the game genres you like the most.  
              We’ll use these to personalize your recommendations.
            </p>
          </div>

          {/* Grid */}
          <div className="row g-3 g-md-4 mb-4">
            {genres.map((g) => {
              const isSelected = selectedGenres.includes(g.id);
              return (
                <div key={g.id} className="col-12 col-sm-6 col-lg-4">
                  <button
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className="w-100 text-start p-0 bg-transparent border-0"
                    style={{ cursor: "pointer" }}
                    aria-pressed={isSelected}
                  >
                    <div
                      className="h-100"
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        border: isSelected
                          ? "2px solid #6E00FF"
                          : "1px solid rgba(15,23,42,.08)",
                        boxShadow: isSelected
                          ? "0 16px 36px rgba(110,0,255,.22)"
                          : "0 10px 28px rgba(17,24,39,.08)",
                        background: "#fff",
                        transition: "all .18s ease",
                      }}
                    >
                      {/* Media */}
                      <div
                        className="position-relative d-flex align-items-center justify-content-center"
                        style={{ height: 160, background: "#f5f6f9" }}
                      >
                        {g.image && (
                          <img
                            src={g.image}
                            alt={g.name}
                            onError={hideBrokenImg}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        )}
                        {/* Fallback icon */}
                        <i
                          data-fallback-icon
                          className={`${getIcon(g.name)} fa-3x text-muted`}
                          style={{ display: g.image ? "none" : "inline-block" }}
                        />

                        {/* Selected pill */}
                        {isSelected && (
                          <span
                            className="position-absolute top-0 end-0 m-2"
                            style={{
                              background: "#6E00FF",
                              color: "#fff",
                              borderRadius: 999,
                              padding: ".35rem .6rem",
                              fontWeight: 700,
                              fontSize: 12,
                              boxShadow: "0 6px 18px rgba(110,0,255,.36)",
                            }}
                          >
                            <i className="fa-solid fa-check me-1" />
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-3">
                        <div className="d-flex align-items-center justify-content-between" style={{ gap: 10 }}>
                          <h6 className="mb-0" style={{ fontWeight: 700 }}>
                            {g.name}
                          </h6>
                          <span className="chip soft">
                            <i className="fa-solid fa-tags me-1" />
                            Genre
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Counter */}
          <div className="text-center mb-4">
            <small className="text-muted">
              {selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""} selected
            </small>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-pill-outline btn-lg"
              onClick={onPrev}
              style={{ borderRadius: 999, paddingInline: "1.2rem" }}
            >
              <i className="fas fa-arrow-left me-2" />
              Back
            </button>

            <button
              className="btn btn-gradient btn-lg"
              onClick={handleNext}
              disabled={!selectedGenres.length}
              style={{ borderRadius: 999, paddingInline: "1.35rem" }}
            >
              Next <i className="fas fa-arrow-right ms-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;

