// src/front/pages/OnboardingStep1.jsx
import React, { useState, useEffect, useMemo } from "react";

const OnboardingStep1 = ({ selectedPlatforms, setSelectedPlatforms, onNext }) => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState(new Set());

  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL, []);

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const res = await fetch(`${backend}/api/platforms`);
        setPlatforms(await res.json());
      } catch (e) {
        console.error("Error loading platforms:", e);
      } finally {
        setLoading(false);
      }
    };
    loadPlatforms();
  }, [backend]);

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((x) => x !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const onNextClick = () => {
    if (!selectedPlatforms.length) {
      alert("Please select at least one platform.");
      return;
    }
    onNext();
  };

  const getPlatformIcon = (name) => {
    switch (name) {
      case "PC":
        return "fas fa-desktop";
      case "PlayStation 5":
      case "PlayStation 4":
        return "fab fa-playstation";
      case "Xbox Series S/X":
      case "Xbox One":
        return "fab fa-xbox";
      case "Nintendo Switch":
        return "fas fa-gamepad";
      case "macOS":
        return "fab fa-apple";
      default:
        return "fas fa-gamepad";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading platforms…</p>
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
                borderRadius: "14px",
                background:
                  "linear-gradient(50deg, rgba(110,0,255,.12), rgba(187,0,255,.12))",
                border: "1px solid rgba(110,0,255,.18)",
              }}
            >
              <i className="fas fa-gamepad" style={{ color: "#6E00FF" }}></i>
            </div>
            <h3 className="mb-2" style={{ fontWeight: 800, letterSpacing: "-.02em" }}>
              Which platforms do you play on?
            </h3>
            <p className="text-muted mb-0">
              Select the platforms you use to play.  
              This will help us recommend games available for your devices.
            </p>
          </div>

          {/* Grid */}
          <div className="row g-3 g-md-4 mb-4">
            {platforms.map((p) => {
              const isSelected = selectedPlatforms.includes(p.id);
              const showImage = p.image && !brokenImages.has(p.id);

              return (
                <div key={p.id} className="col-12 col-sm-6 col-lg-4">
                  <button
                    type="button"
                    onClick={() => togglePlatform(p.id)}
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
                        className="position-relative"
                        style={{ height: 160, background: "#f5f6f9" }}
                      >
                        {showImage ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={() =>
                              setBrokenImages((prev) => new Set(prev).add(p.id))
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                            <i className={`${getPlatformIcon(p.name)} fa-3x text-muted`} />
                          </div>
                        )}

                        {/* Check pill */}
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
                        <div
                          className="d-flex align-items-center justify-content-between"
                          style={{ gap: 10 }}
                        >
                          <h6 className="mb-0" style={{ fontWeight: 700 }}>
                            {p.name}
                          </h6>
                          <span className="chip soft">
                            <i className="fa-solid fa-gamepad"></i> Gaming
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
              {selectedPlatforms.length} platform
              {selectedPlatforms.length !== 1 ? "s" : ""} selected
            </small>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-gradient btn-lg"
              onClick={onNextClick}
              disabled={!selectedPlatforms.length}
              style={{ borderRadius: 999, paddingInline: "1.35rem" }}
            >
              Next <i className="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1;



