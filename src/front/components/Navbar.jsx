// src/front/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GameMatcherLight from "../assets/img/GameMatcherLight.png"; // <-- RUTA CORRECTA

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-gradient navbar-dark">
      <div className="container">
        {/* Izquierda: Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={GameMatcherLight}
            alt="Game Matcher"
            className="me-2"
            style={{ height: "45px" }}
            onError={(e) => { e.currentTarget.src = "/GameMatcher.png"; }}
          />
          <span className="fw-bold text-white">Game Matcher</span>
        </Link>

        {/* Toggler (mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Izquierda: About / Team / Contact (solo invitados) */}
          {!isAuthenticated && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/about" className="nav-link text-white">About</Link>
              </li>
              <li className="nav-item">
                <Link to="/team" className="nav-link text-white">Team</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link text-white">Contact</Link>
              </li>
            </ul>
          )}

          {/* Derecha: Login / Logout */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              {isAuthenticated ? (
                <button
                  className="btn btn-outline-light ms-lg-3"
                  style={{ borderRadius: 50, padding: "0.4rem 1.4rem" }}
                  onClick={logout}
                >
                  Logout
                </button>
              ) : (
                <Link to="/login">
                  <button
                    className="btn btn-outline-light ms-lg-3"
                    style={{ borderRadius: 50, padding: "0.4rem 1.4rem" }}
                  >
                    Login
                  </button>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;





























