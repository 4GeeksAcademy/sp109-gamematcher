// src/front/pages/OnboardingStep4.jsx
import React, { useEffect, useMemo, useState } from "react";

const OnboardingStep4 = ({
  selectedNonFavorites,
  setSelectedNonFavorites,
  onComplete,
  onPrev,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Just for toggled UI state (by RAWG id/name)
  const [selectedGamesVisual, setSelectedGamesVisual] = useState([]);

  const REQUIRED_NON_FAVORITES = 3;
  const rawgApiKey = useMemo(() => import.meta.env.VITE_RAWG_API_KEY, []);
  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL, []);

  // RAWG search
  useEffect(() => {
    const doSearch = async () => {
      if (searchTerm.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://api.rawg.io/api/games?search=${encodeURIComponent(
            searchTerm
          )}&key=${rawgApiKey}`
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
    const t = setTimeout(doSearch, 500);
    return () => clearTimeout(t);
  }, [searchTerm, rawgApiKey]);

  const handleGameToggle = async (game) => {
    // We identify selection by RAWG id for visual state
    const isSelected = selectedGamesVisual.some((g) => g.id === game.id);

    if (isSelected) {
      // Remove from visual and pop the last saved id (keeps current logic)
      setSelectedGamesVisual((prev) => prev.filter((g) => g.id !== game.id));
      setSelectedNonFavorites((prev) => prev.slice(0, -1));
      return;
    }

    // Add new (cap at REQUIRED_NON_FAVORITES)
    if (selectedGamesVisual.length >= REQUIRED_NON_FAVORITES) return;

    try {
      // Create game in local DB so we can reference it later
      const response = await fetch(`${backend}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: game.name,
          description: game.description_raw || "No description",
          background_image: game.background_image,
          released: game.released,
          rating: game.rating,
          rawg_id: game.id,
        }),
      });

      if (response.ok) {
        const gameData = await response.json();
        setSelectedGamesVisual((prev) => [
          ...prev,
          { id: game.id, name: game.name },
        ]);
        setSelectedNonFavorites((prev) => [...prev, gameData.id]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const remaining = REQUIRED_NON_FAVORITES - selectedGamesVisual.length;

  const handleComplete = () => {
    if (selectedGamesVisual.length !== REQUIRED_NON_FAVORITES) {
      alert(`Please select exactly ${REQUIRED_NON_FAVORITES} games you are NOT into.`);
      return;
    }
    onComplete();
  };

  const reachedLimit =
    selectedGamesVisual.length >= REQUIRED_NON_FAVORITES && !loading;

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
              <i className="fa-solid fa-thumbs-down" style={{ color: "#6E00FF" }} />
            </div>
            <h3 className="mb-2" style={{ fontWeight: 800, letterSpacing: "-.02em" }}>
              Which games are *not* for you?
            </h3>
            <p className="text-muted mb-0">
              Pick exactly {REQUIRED_NON_FAVORITES} titles you don’t enjoy so we can avoid
              similar suggestions.
            </p>
          </div>

          {/* Selection counter */}
          <div className="text-center mb-4">
            <span className="chip alt" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {selectedGamesVisual.length} / {REQUIRED_NON_FAVORITES} selected
            </span>
            {remaining > 0 && (
              <div className="small text-muted mt-2">
                {remaining} selection{remaining !== 1 ? "s" : ""} left
              </div>
            )}
            {remaining === 0 && (
              <div className="small" style={{ color: "#2fb344", fontWeight: 600 }}>
                <i className="fa-solid fa-check me-1" />
                Great! You’ve selected {REQUIRED_NON_FAVORITES}.
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
                placeholder="Search games you don’t like…"
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

          {/* Grid */}
          {searchResults.length > 0 ? (
            <div className="row g-3 g-md-4 mb-4">
              {searchResults.map((game) => {
                const isSelected = selectedGamesVisual.some((g) => g.id === game.id);
                const disabled = reachedLimit && !isSelected;

                return (
                  <div key={game.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <button
                      type="button"
                      className="w-100 text-start p-0 bg-transparent border-0"
                      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                      onClick={() => (!disabled ? handleGameToggle(game) : null)}
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
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
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
                              <i className="fa-solid fa-ban me-1" />
                              Not for me
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
                            title={game.name}
                          >
                            {game.name}
                          </h6>

                          <div className="d-flex align-items-center gap-2">
                            {game.rating ? (
                              <span className="rating-chip">
                                <i className="fa-solid fa-star" />
                                {Number(game.rating).toFixed(1)}
                              </span>
                            ) : null}

                            {game.released ? (
                              <span className="chip soft">
                                <i className="fa-solid fa-calendar me-1" />
                                {game.released?.slice(0, 4)}
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
          ) : (
            <div className="text-center text-muted mb-4">
              Start typing to find games you don’t like.
            </div>
          )}

          {/* Actions */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-pill-outline btn-lg"
              onClick={onPrev}
              disabled={loading}
            >
              <i className="fas fa-arrow-left me-2" />
              Back
            </button>
            <button
              className="btn btn-gradient btn-lg"
              onClick={handleComplete}
              disabled={
                loading || selectedGamesVisual.length !== REQUIRED_NON_FAVORITES
              }
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2" />
                  Saving…
                </>
              ) : (
                <>
                  Finish
                  <i className="fas fa-arrow-right ms-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep4;
