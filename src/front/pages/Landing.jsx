import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PlaceholderCard = ({ title }) => (
  <div className="card h-100 shadow-sm border-0">
    <div className="ratio ratio-16x9 bg-dark rounded-top d-flex align-items-center justify-content-center">
      <span className="text-white-50">No image</span>
    </div>
    <div className="card-body">
      <h6 className="card-title mb-0 text-truncate">{title}</h6>
    </div>
  </div>
);

const Landing = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { store } = useGlobalReducer();
  const [sample, setSample] = useState([]);

  // Cargamos 6 juegos para vitrina (si ya están en store, usamos eso)
  useEffect(() => {
    const fromStore = (store?.games || []).slice(0, 6);
    if (fromStore.length) {
      setSample(fromStore);
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/games`);
        const data = await res.json();
        setSample((data || []).slice(0, 6));
      } catch {
        setSample([]);
      }
    };
    load();
  }, [backendUrl, store?.games]);

  return (
    <>
      <PublicNavbar />

      {/* HERO */}
      <header className="bg-gradient-primary text-white">
        <div className="container py-5 py-lg-6">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold mb-3">
                ¿No sabes qué jugar?
              </h1>
              <p className="lead mb-4">
                Game Matcher analiza tus gustos y te recomienda juegos que amarás,
                según géneros y plataformas que prefieres.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/onboarding" className="btn btn-light btn-lg">
                  Empieza gratis
                </Link>
                <a href="#featured" className="btn btn-outline-light btn-lg">
                  Ver juegos destacados
                </a>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-device-mockup shadow-lg rounded-4 bg-dark opacity-75" style={{height: 260}} />
            </div>
          </div>
        </div>
      </header>

      {/* FEATURED GRID */}
      <section id="featured" className="py-5">
        <div className="container">
          <h2 className="h3 fw-bold mb-4">Descubre juegos populares</h2>
          <div className="row g-4">
            {sample.length === 0 && (
              <div className="col-12">
                <div className="alert alert-secondary mb-0">
                  Carga unos juegos en tu base de datos para ver tarjetas aquí.
                </div>
              </div>
            )}

            {sample.map((g) => (
              <div className="col-12 col-sm-6 col-lg-4" key={g.id}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="ratio ratio-16x9 bg-black rounded-top">
                    {g.background_image ? (
                      <img
                        src={g.background_image}
                        alt={g.name}
                        className="w-100 h-100 object-fit-cover rounded-top"
                      />
                    ) : (
                      <div className="d-flex h-100 w-100 align-items-center justify-content-center">
                        <span className="text-white-50">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h6 className="card-title mb-1 text-truncate">{g.name}</h6>
                    {g.rating != null && (
                      <small className="text-muted">Rating: {g.rating}</small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* quick actions */}
          <div className="d-flex flex-wrap gap-3 justify-content-center mt-5">
            <Link to="/platforms" className="btn btn-outline-dark btn-lg rounded-pill px-4">
              Platforms
            </Link>
            <Link to="/genres" className="btn btn-outline-dark btn-lg rounded-pill px-4">
              Genres
            </Link>
            <Link to="/localgameslist" className="btn btn-outline-dark btn-lg rounded-pill px-4">
              Games
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Landing;
