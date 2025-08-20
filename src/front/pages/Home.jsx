import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useGlobalReducer from "../hooks/useGlobalReducer";

const RAWG_URL = "https://api.rawg.io/api/games";

const platformIcons = {
  pc: <i className="fab fa-windows" title="PC"></i>,
  playstation: <i className="fab fa-playstation" title="PlayStation"></i>,
  xbox: <i className="fab fa-xbox" title="Xbox"></i>,
  nintendo: <i className="fas fa-gamepad" title="Nintendo"></i>,
  ios: <i className="fab fa-apple" title="iOS"></i>,
  mac: <i className="fab fa-apple" title="Mac"></i>,
  android: <i className="fab fa-android" title="Android"></i>,
  linux: <i className="fab fa-linux" title="Linux"></i>,
  web: <i className="fas fa-globe" title="Web"></i>,
};

const Home = () => {
  const { user } = useAuth();
  const { store } = useGlobalReducer();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawgKey = import.meta.env.VITE_RAWG_API_KEY;

  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchGamesPage = async (pageToLoad = 1) => {
    if (!rawgKey) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${RAWG_URL}?key=${rawgKey}&page_size=18&ordering=-added&page=${pageToLoad}`
      );
      const data = await res.json();
      const results = data?.results || [];
      setGames((prev) => (pageToLoad === 1 ? results : [...prev, ...results]));
      setHasMore(Boolean(data?.next));
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (rawgKey) {
        setPage(1);
        await fetchGamesPage(1);
      } else {
        const fromStore = store?.games || [];
        if (fromStore.length) setGames(fromStore.slice(0, 18));
        else {
          try {
            const r = await fetch(`${backendUrl}/api/games`);
            const d = await r.json();
            setGames((d || []).slice(0, 18));
          } catch {
            setGames([]);
          }
        }
        setHasMore(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, store?.games, rawgKey]);

  const heroImages = useMemo(
    () =>
      games
        .filter((g) => g.background_image)
        .map((g) => g.background_image)
        .slice(0, 6),
    [games]
  );
  const [heroIdx, setHeroIdx] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!heroImages.length) return;
    timerRef.current = setInterval(
      () => setHeroIdx((i) => (i + 1) % heroImages.length),
      3500
    );
    return () => clearInterval(timerRef.current);
  }, [heroImages.length]);

  return (
    <>
      <header className="text-white navbar-gradient">
        <div className="container py-5 py-lg-6">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-6 fw-bold mb-2">
                Welcome back{user?.nickname ? `, ${user.nickname}` : ""}!
              </h1>
              <p className="lead mb-4">
                Pick up where you left off or discover fresh games tailored to your taste.
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/recommendations" className="btn btn-light btn-lg rounded-pill px-4">
                  <i className="fas fa-star me-2"></i> See recommendations
                </Link>
                <Link to="/user-game-favorites" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i className="fas fa-heart me-2"></i> My favorites
                </Link>
                <Link to="/user-platform-preferences" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i className="fas fa-desktop me-2"></i> My platforms
                </Link>
                <Link to="/user-genre-preferences" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i className="fas fa-tags me-2"></i> My genres
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div
                className="shadow-lg rounded-4 bg-dark"
                style={{ height: 240, overflow: "hidden", position: "relative" }}
              >
                {heroImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="game"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: idx === heroIdx ? 1 : 0,
                      transition: "opacity .6s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="d-flex align-items-end justify-content-between mb-3">
            <h2 className="h4 fw-bold mb-0">Trending now</h2>
            <Link to="/local-games" className="btn btn-outline-dark rounded-pill">
              Browse all
            </Link>
          </div>

          <div className="row g-4">
            {games.length === 0 && (
              <div className="col-12">
                <div className="alert alert-secondary mb-0">
                  No games to show right now. Try again in a moment.
                </div>
              </div>
            )}

            {games.map((g) => (
              <div className="col-12 col-sm-6 col-lg-4" key={g.id || g.slug}>
                <div className="game-card h-100">
                  <div className="ratio ratio-16x9 game-thumb">
                    {g.background_image ? (
                      <img src={g.background_image} alt={g.name} />
                    ) : (
                      <div className="d-flex h-100 w-100 align-items-center justify-content-center bg-light text-muted">
                        No image
                      </div>
                    )}
                    <div className="game-overlay">
                      <div className="small">
                        {g.released && (
                          <div className="mb-1">
                            <i className="far fa-calendar-alt me-1"></i>
                            {g.released}
                          </div>
                        )}
                        <div className="opacity-100 fw-semibold">
                          View details in the catalog
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="game-body">
                    <h6 className="game-title">{g.name}</h6>
                    <div className="game-meta">
                      <span className="d-flex align-items-center gap-2">
                        {g.parent_platforms?.map((pp, i) => {
                          const slug = pp?.platform?.slug;
                          return (
                            <span key={`${slug}-${i}`}>
                              <i className="fas fa-circle"></i>
                            </span>
                          );
                        })}
                      </span>
                      {g.metacritic && <span className="badge-chip">MC {g.metacritic}</span>}
                      <span className="badge-chip">
                        <i className="far fa-plus-square me-1"></i>
                        {g.added || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button
                className="btn btn-gradient rounded-pill px-4"
                disabled={loadingMore}
                onClick={async () => {
                  const next = page + 1;
                  await fetchGamesPage(next);
                  setPage(next);
                }}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;





