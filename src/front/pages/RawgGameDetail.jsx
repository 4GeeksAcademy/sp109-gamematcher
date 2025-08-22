// src/front/pages/RawgGameDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RawgGameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchGameDetail();
  }, [id]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
      if (!API_KEY) throw new Error("RAWG API key not configured");

      const response = await fetch(
        `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
      );
      if (!response.ok) throw new Error(`Error ${response.status}: Game not found`);

      const rawgGame = await response.json();

      setGame({
        id: rawgGame.id,
        rawg_id: rawgGame.id,
        name: rawgGame.name,
        description:
          rawgGame.description_raw ||
          rawgGame.description ||
          "No description available.",
        background_image: rawgGame.background_image,
        rating: rawgGame.rating || 0,
        released: rawgGame.released,
        platforms: rawgGame.platforms?.map((p) => p.platform.name) || [],
        genres: rawgGame.genres?.map((g) => g.name) || [],
        metacritic: rawgGame.metacritic,
        website: rawgGame.website,
        developers: rawgGame.developers?.map((d) => d.name) || [],
        publishers: rawgGame.publishers?.map((p) => p.name) || [],
        source: "rawg",
      });
    } catch (err) {
      console.error("Error loading game:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!user) {
      alert("You must sign in to add favorites.");
      return;
    }

    try {
      setAdding(true);

      const createGameResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/games`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: game.name,
            description: game.description.slice(0, 500),
            image_url: game.background_image,
            rating: game.rating,
            rawg_id: game.rawg_id,
            release_date: game.released,
          }),
        }
      );

      if (!createGameResponse.ok) {
        const errorData = await createGameResponse.json();
        throw new Error(errorData.error || "Error creating game");
      }

      const createdGame = await createGameResponse.json();

      const favoriteResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            game_id: createdGame.id,
          }),
        }
      );

      if (!favoriteResponse.ok) {
        const errorData = await favoriteResponse.json();
        throw new Error(errorData.error || "Error adding favorite");
      }

      alert("Game added to favorites!");
    } catch (err) {
      console.error("Error adding favorite:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const platformIcon = (platformName = "") => {
    const n = platformName.toLowerCase();
    if (n.includes("playstation")) return "fa-brands fa-playstation";
    if (n.includes("xbox")) return "fa-brands fa-xbox";
    if (n.includes("nintendo")) return "fa-solid fa-gamepad";
    if (n === "pc" || n.includes("windows")) return "fa-brands fa-windows";
    if (n.includes("mac") || n.includes("macos")) return "fa-brands fa-apple";
    if (n.includes("linux")) return "fa-brands fa-linux";
    if (n.includes("android")) return "fa-brands fa-android";
    if (n.includes("ios")) return "fa-brands fa-apple";
    return "fa-solid fa-display";
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="mt-2">Loading game details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4>Error</h4>
          <p>{error}</p>
          <button
            className="btn btn-pill-outline"
            onClick={() => navigate("/dashboard/recommendations")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <h5>Game not found</h5>
          <button
            className="btn btn-pill-outline"
            onClick={() => navigate("/dashboard/recommendations")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const bgStyle = game.background_image
    ? { backgroundImage: `url(${game.background_image})` }
    : {};

  return (
    <div className="container mt-4 gdetail-page">
      {/* Back */}
      <div className="row">
        <div className="col-12">
          <button
            className="btn btn-pill-outline mb-3"
            onClick={() => navigate("/dashboard/recommendations")}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="gdetail-hero" style={bgStyle}>
        <div className="gdetail-hero__overlay"></div>
        <div className="gdetail-hero__inner">
          <div className="row g-4 align-items-end">
            <div className="col-md-4">
              {game.background_image ? (
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="gdetail-cover rounded shadow-sm"
                />
              ) : (
                <div
                  className="gdetail-cover rounded d-flex align-items-center justify-content-center"
                  style={{ background: "#f1f3f8" }}
                >
                  <i className="fas fa-gamepad fa-2x text-muted"></i>
                </div>
              )}
            </div>

            <div className="col-md-8">
              <h1 className="gdetail-title mb-2">{game.name}</h1>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                {game.rating > 0 && (
                  <span className="rating-chip">
                    <i className="fas fa-star"></i> {game.rating.toFixed(1)}
                  </span>
                )}
                {game.metacritic && (
                  <span className="chip alt">
                    Metacritic: <strong>{game.metacritic}</strong>
                  </span>
                )}
                {game.released && (
                  <span className="chip soft">
                    <i className="fas fa-calendar"></i> {game.released}
                  </span>
                )}
              </div>

              {/* Platforms with pill buttons */}
              {game.platforms?.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {game.platforms.map((p) => (
                    <span key={p} className="chip pill d-flex align-items-center gap-2">
                      <i className={platformIcon(p)}></i>
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="row mt-4">
        <div className="col-lg-8">
          {game.description && (
            <div className="glass-card p-3 p-md-4 mb-3">
              <h5 className="mb-2">Description</h5>
              <div
                dangerouslySetInnerHTML={{ __html: game.description }}
              />
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {game.genres?.length > 0 && (
            <div className="glass-card p-3 p-md-4 mb-3">
              <div className="gdetail-meta__label mb-2">Genres</div>
              <div className="d-flex flex-wrap gap-2">
                {game.genres.map((g) => (
                  <span key={g} className="chip">{g}</span>
                ))}
              </div>
            </div>
          )}

          {(game.developers?.length > 0 ||
            game.publishers?.length > 0 ||
            game.website) && (
            <div className="glass-card p-3 p-md-4 mb-3">
              {game.developers?.length > 0 && (
                <p className="mb-2">
                  <strong>Developers:</strong> {game.developers.join(", ")}
                </p>
              )}
              {game.publishers?.length > 0 && (
                <p className="mb-2">
                  <strong>Publishers:</strong> {game.publishers.join(", ")}
                </p>
              )}
              {game.website && (
                <p className="mb-0">
                  <strong>Website:</strong>{" "}
                  <a href={game.website} target="_blank" rel="noreferrer">
                    Visit official site
                  </a>
                </p>
              )}
            </div>
          )}

          {user && user.role !== "admin" && (
            <div className="glass-card p-3 p-md-4">
              <button
                className="btn btn-gradient w-100"
                onClick={handleAddFavorite}
                disabled={adding}
              >
                {adding ? "Adding…" : (<><i className="fas fa-star me-1" /> Add to favorites</>)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

