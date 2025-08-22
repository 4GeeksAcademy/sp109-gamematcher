// src/front/pages/OnboardingStep3.jsx
import React, { useEffect, useMemo, useState } from "react";

const OnboardingStep3 = ({
  selectedFavorites,
  setSelectedFavorites,
  onNext,
  onPrev,
}) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const REQUIRED_FAVORITES = 3;
  const rawgKey = useMemo(() => import.meta.env.VITE_RAWG_API_KEY, []);
  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL, []);

  // Sample games for onboarding
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backend}/api/onboarding/games-sample?limit=12`);
        const data = await res.json();
        setGames(data || []);
      } catch (e) {
        console.error("Error loading games:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [backend]);

  // RAWG search
  useEffect(() => {
    const doSearch = async () => {
      if (searchTerm.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games?search=${encodeURIComponent(
            searchTerm
          )}&key=${rawgKey}`
        );
        const data = await res.json();
        setSearchResults(data?.results || []);
      } catch (e) {
        console.error("Error searching games:", e);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    const t = setTimeout(doSearch, 500);
    return () => clearTimeout(t);
  }, [searchTerm, rawgKey]);

  const getGamesToShow = () =>
    searchTerm.trim().length >= 3 ? searchResults : games;

  const toggleGame = (id) => {
    if (selectedFavorites.includes(id)) {
      setSelectedFavorites(selectedFavorites.filter((x) => x !== id));
    } else if (selectedFavorites.length < REQUIRED_FAVORITES) {
      setSelectedFavorites([...selectedFavorites, id]);
    }
  };

  const remaining = REQUIRED_FAVORITES - selectedFavorites.length;

  const handleNext = () => {
    if (selectedFavorites.length !== REQUIRED_FAVORITES) {
      alert(`Please select exactly ${REQUIRED_FAVORITES} favorite games.`);
      return;
    }
    onNext();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading games…</p>
      </div>
    );
  }

  const reachedLimit = selectedFavorites.length >= REQUIRED_FAVORITES;

  return (
    <div className="row justify-content-center">
      <div className="col-xl-10 col-lg-11">
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
              <i className="fas fa-star" style={{ color: "#6E00FF" }} />
            </div>
            <h3 className="mb-2" style={{ fontWeight: 800, letterSpacing: "-.02em" }}>
              Pick your favorite games
            </h3>
            <p className="text-muted mb-0">
              Choose exactly {REQUIRED_FAVORITES} games you love.  
              This helps us understand your taste.
            </p>
          </div>

          {/* Selection counter */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center gap-2">
              <span
                className="chip alt"
                style={{ fontSize: "0.95rem", fontWeight: 700 }}
              >
                {selectedFavorites.length} / {REQUIRED_FAVORITES} selected
              </span>
            </div>
            {remaining > 0 && (
              <div className="small text-muted mt-2">
                {remaining} selection{remaining !== 1 ? "s" : ""} left
              </div>
            )}
            {remaining === 0 && (
              <div className="small" style={{ color: "#2fb344", fontWeight: 600 }}>
                <i className="fa-solid fa-check me-1" />
                Perfect! You’ve selected {REQUIRED_FAVORITES}.
              </div>
            )}
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="input-group input-group-merge">
              <span className="input-group-text">
                <i className="fa-solid fa-magnifying-glass" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search more games…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchLoading && (
                <span className="input-group-text">
                  <i className="fa-solid fa-spinner fa-spin" />
                </span>
              )}
            </div>
            <small className="text-muted d-block mt-2">
              Type at least 3 characters to search in RAWG.
            </small>
          </div>

          {/* Games grid */}
          <div className="row g-3 g-md-4 mb-4">
            {getGamesToShow().map((g) => {
              const id = g.id ?? g.rawg_id;
              const isSelected = selectedFavorites.includes(id);
              const disabled = reachedLimit && !isSelected;

              return (
                <div key={id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                  <button
                    type="button"
                    onClick={() => (!disabled ? toggleGame(id) : null)}
                    className="w-100 text-start p-0 bg-transparent border-0"
                    style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                    aria-pressed={isSelected}
                    disabled={disabled}
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
                        opacity: disabled ? 0.6 : 1,
                        transition: "all .18s ease",
                      }}
                    >
                      {/* Cover */}
                      <div
                        className="position-relative"
                        style={{ height: 170, background: "#f5f6f9" }}
                      >
                        {g.background_image ? (
                          <img
                            src={g.background_image}
                            alt={g.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                            <i className="fa-solid fa-image fa-lg" />
                          </div>
                        )}

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
                            <i className="fa-solid fa-heart me-1" />
                            Favorite
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-3">
                        <h6
                          className="mb-2"
                          style={{
                            fontWeight: 800,
                            letterSpacing: "-.01em",
                            lineHeight: 1.2,
                          }}
                          title={g.name}
                        >
                          {g.name}
                        </h6>

                        <div className="d-flex align-items-center gap-2">
                          {g.rating ? (
                            <span className="rating-chip">
                              <i className="fa-solid fa-star" />
                              {Number(g.rating).toFixed(1)}
                            </span>
                          ) : null}

                          {g.released ? (
                            <span className="chip soft">
                              <i className="fa-solid fa-calendar me-1" />
                              {g.released?.slice(0, 4)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-between">
            <button className="btn btn-pill-outline btn-lg" onClick={onPrev}>
              <i className="fas fa-arrow-left me-2" />
              Back
            </button>
            <button
              className="btn btn-gradient btn-lg"
              onClick={handleNext}
              disabled={selectedFavorites.length !== REQUIRED_FAVORITES}
            >
              Finish
              <i className="fas fa-arrow-right ms-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;

