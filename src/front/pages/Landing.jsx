import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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

const Landing = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawgKey = import.meta.env.VITE_RAWG_API_KEY;
  const { store } = useGlobalReducer();

  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ===== RAWG fetch (paged) =====
  const fetchGamesPage = async (pageToLoad = 1) => {
    if (!rawgKey) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${RAWG_URL}?key=${rawgKey}&page_size=24&ordering=-added&page=${pageToLoad}`
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
        // fallback store/backend
        const fromStore = store?.games || [];
        if (fromStore.length) setGames(fromStore);
        else {
          try {
            const r = await fetch(`${backendUrl}/api/games`);
            const d = await r.json();
            setGames(d || []);
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

  // ===== Hero mini-fader =====
  const heroImages = useMemo(
    () =>
      games
        .filter((g) => g.background_image)
        .map((g) => g.background_image)
        .slice(0, 8),
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

  // ===== Testimonials =====
  const reviews = [
    { name:"Heather Wright",company:"Google",avatar:"https://i.pravatar.cc/100?img=47",text:"Found 3 games I didn’t know and they became favorites. Spot-on picks.",stars:5 },
    { name:"Monroe Parker",company:"Apple",avatar:"https://i.pravatar.cc/100?img=12",text:"Clean UI and accurate results. Perfect when you don’t know what to play.",stars:5 },
    { name:"John Sullivan",company:"Amazon",avatar:"https://i.pravatar.cc/100?img=32",text:"Platform filters saved me time. I only see games I can actually play.",stars:5 },
    { name:"Ana Gomez",company:"Indie Dev",avatar:"https://i.pravatar.cc/100?img=5",text:"Lists and preference learning are well executed.",stars:4 },
    { name:"Luis Ortega",company:"Streamer",avatar:"https://i.pravatar.cc/100?img=21",text:"Great for discovering games on stream. My chat loves it.",stars:5 },
    { name:"Sofia Ruiz",company:"UX Designer",avatar:"https://i.pravatar.cc/100?img=15",text:"Smooth experience and polished cards. Recommended.",stars:4 },
    { name:"Marco Silva",company:"QA",avatar:"https://i.pravatar.cc/100?img=7",text:"Accurate suggestions even for niche genres.",stars:5 },
    { name:"Patricia Lee",company:"Gamer",avatar:"https://i.pravatar.cc/100?img=45",text:"In minutes I had recommendations that fit me.",stars:5 },
    { name:"Kevin Zhou",company:"Data",avatar:"https://i.pravatar.cc/100?img=68",text:"Solid recommendation engine. Data work shows.",stars:4 },
  ];
  const slides = Array.from({length: Math.ceil(reviews.length/3)}, (_,i)=>reviews.slice(i*3, i*3+3));

  // Bootstrap Carousel instance + sync external indicators
  const carouselRef = useRef(null);
  const bsCarouselRef = useRef(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || !window.bootstrap) return;
    bsCarouselRef.current = new window.bootstrap.Carousel(el, {
      interval: false,
      ride: false,
      wrap: true,
    });

    const handler = (e) => {
      const idx = Array.from(el.querySelectorAll(".carousel-item")).indexOf(e.relatedTarget);
      const buttons = document.querySelectorAll("#reviewsDots button");
      buttons.forEach((b, i) => b.classList.toggle("active", i === idx));
    };

    el.addEventListener("slid.bs.carousel", handler);
    return () => {
      el.removeEventListener("slid.bs.carousel", handler);
      try { bsCarouselRef.current?.dispose?.(); } catch {}
    };
  }, []);

  return (
    <>
      {/* HERO */}
      <header className="text-white navbar-gradient">
        <div className="container py-5 py-lg-6">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold mb-3">Not sure what to play?</h1>
              <p className="lead mb-4">
                Game Matcher learns your taste and recommends games you’ll love,
                based on your favorite genres and platforms.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/onboarding" className="btn btn-light btn-lg rounded-pill px-4">Start for free</Link>
                <a href="#featured" className="btn btn-outline-light btn-lg rounded-pill px-4">See featured games</a>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="shadow-lg rounded-4 bg-dark" style={{height:260, overflow:"hidden", position:"relative"}}>
                {heroImages.map((src, idx)=>(
                  <img key={idx} src={src} alt="game"
                       style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
                               opacity: idx===heroIdx ? 1 : 0, transition:"opacity .6s ease"}}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURED GRID */}
      <section id="featured" className="py-5 mb-4">
        <div className="container">
          <h2 className="h3 fw-bold mb-4">Available games</h2>

          <div className="row g-4">
            {games.length === 0 && (
              <div className="col-12">
                <div className="alert alert-secondary mb-0">
                  No results. Check your <strong>VITE_RAWG_API_KEY</strong> or try again later.
                </div>
              </div>
            )}

            {games.map((g) => (
              <div className="col-12 col-sm-6 col-lg-4" key={g.id || g.slug}>
                <div className="game-card h-100">
                  <div className="ratio ratio-16x9 game-thumb">
                    {g.background_image
                      ? <img src={g.background_image} alt={g.name}/>
                      : <div className="d-flex h-100 w-100 align-items-center justify-content-center bg-light text-muted">No image</div>}
                    <div className="game-overlay">
                      <div className="small">
                        {g.released && <div className="mb-1"><i className="far fa-calendar-alt me-1"></i>{g.released}</div>}
                        <div className="opacity-100 fw-semibold">
                          Sign up to see more
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
                          return <span key={`${slug}-${i}`}>{platformIcons[slug] || <i className="fas fa-circle"></i>}</span>;
                        })}
                      </span>
                      {g.metacritic && <span className="badge-chip">MC {g.metacritic}</span>}
                      <span className="badge-chip"><i className="far fa-plus-square me-1"></i>{g.added || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button
                className="load-more-btn"
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

      {/* EXPLORE BY CATEGORIES — SLIM band + centered text + bubbles */}
      <section className="slice-xl navbar-gradient has-floating-items text-white position-relative categories-band">
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "240px" }}>
          <div className="text-center" style={{ maxWidth: 700 }}>
            <h2 className="fw-bold mb-3" style={{ fontSize: '2.6rem', lineHeight: 1.05 }}>
              Explore by categories
            </h2>
            <p className="mb-0 opacity-75" style={{ fontSize: '1.125rem' }}>
              Find what you love faster and discover new titles.
            </p>
          </div>
        </div>

        {/* Bubbles acomodadas para banda más delgada */}
        <div className="floating-bubble lg delay-0" style={{ top:"9%", left:"6%"  }}><i className="fas fa-gamepad"></i></div>
        <div className="floating-bubble sm delay-1" style={{ top:"10%", left:"34%" }}><i className="fas fa-trophy"></i></div>
        <div className="floating-bubble sm delay-2" style={{ top:"10%", right:"12%" }}><i className="fas fa-headset"></i></div>
        <div className="floating-bubble sm delay-3" style={{ bottom:"10%", left:"20%" }}><i className="fas fa-star"></i></div>
        <div className="floating-bubble sm delay-4" style={{ bottom:"8%",  right:"16%" }}><i className="fas fa-heart"></i></div>
        <div className="floating-bubble sm delay-5" style={{ top:"12%", right:"30%" }}><i className="fas fa-running"></i></div>
      </section>

      {/* APPLE-LIKE TWO CARDS: PLATFORMS + GENRES */}
      <CategoriesTwo />

      {/* TESTIMONIALS */}
      <section className="section-soft slice">
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="fw-semibold">What our customers say</h3>
            <p className="text-muted mb-0">Real opinions from players using Game Matcher.</p>
          </div>

          <div id="reviewsCarousel" className="carousel slide" data-bs-ride="false" ref={carouselRef}>
            <div className="carousel-inner pt-3">
              {slides.map((group, sIdx) => (
                <div key={sIdx} className={`carousel-item ${sIdx === 0 ? "active" : ""}`}>
                  <div className="row g-4 justify-content-center">
                    {group.map((r, i) => (
                      <div className="col-12 col-md-6 col-lg-4" key={i}>
                        <div className="testimonial-card p-4 h-100">
                          <div className="d-flex align-items-center mb-3">
                            <img src={r.avatar} alt={r.name} className="avatar me-3" />
                            <div>
                              <div className="fw-semibold">{r.name}</div>
                              <small className="text-muted">{r.company}</small>
                            </div>
                          </div>
                          <p className="mb-3">{r.text}</p>
                          <div className="text-warning">
                            {Array.from({ length: r.stars }).map((_, k) => <i key={k} className="fas fa-star me-1"></i>)}
                            {Array.from({ length: 5 - r.stars }).map((_, k) => <i key={k} className="far fa-star me-1"></i>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External indicators centered below */}
          <div className="reviews-indicators-wrap">
            <div id="reviewsDots" className="reviews-indicators">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={idx === 0 ? "active" : ""}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => bsCarouselRef.current?.to(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

/* ===== Two-card categories block (Platforms + Genres) ===== */
const CategoriesTwo = () => {
  const apiKey = import.meta.env.VITE_RAWG_API_KEY;
  const [imgs, setImgs] = useState({ platforms: [], genres: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, g] = await Promise.all([
          fetch(`https://api.rawg.io/api/platforms?key=${apiKey}`).then(r => r.json()),
          fetch(`https://api.rawg.io/api/genres?key=${apiKey}`).then(r => r.json()),
        ]);
        setImgs({
          platforms: p?.results?.map(x => x.image_background).filter(Boolean) || [],
          genres: g?.results?.map(x => x.image_background).filter(Boolean) || [],
        });
      } catch { /* noop */ }
    };
    load();
  }, [apiKey]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3500);
    return () => clearInterval(t);
  }, []);

  const pick = (arr) => (arr?.length ? arr[tick % arr.length] : "");

  return (
    <section className="slice pt-0 pb-5">
      <div className="container">
        <div className="category-hero">
          {/* Platforms */}
          <div className="category-card">
            <div
              className="category-bg"
              style={{ backgroundImage: `url(${pick(imgs.platforms)})` }}
            />
            <div className="category-content">
              <h2>Platforms</h2>
              <p>PC, PlayStation, Xbox, Nintendo and more — tailor your library to what you own.</p>
              <Link to="/onboarding" className="btn">Find more!</Link>
            </div>
          </div>

          {/* Genres */}
          <div className="category-card">
            <div
              className="category-bg"
              style={{ backgroundImage: `url(${pick(imgs.genres)})` }}
            />
            <div className="category-content">
              <h2>Genres</h2>
              <p>Action, adventure, sports, indie, RPG and more — discover new favorites.</p>
              <Link to="/onboarding" className="btn">Let's play!</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;













