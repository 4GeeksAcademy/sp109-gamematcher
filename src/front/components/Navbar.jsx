// src/front/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GameMatcherLight from "../assets/img/GameMatcherLight.png"; // <-- RUTA CORRECTA

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

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

          {/* Enlaces de administración (solo para admins) */}
          {isAuthenticated && user?.role === "admin" && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/games" className="nav-link text-white">Games</Link>
              </li>
              <li className="nav-item">
                <Link to="/platforms" className="nav-link text-white">Platforms</Link>
              </li>
              <li className="nav-item">
                <Link to="/genres" className="nav-link text-white">Genres</Link>
              </li>
              <li className="nav-item">
                <Link to="/users" className="nav-link text-white">Users</Link>
              </li>
              <li className="nav-item">
                <Link to="/admins" className="nav-link text-white">Admins</Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Relations
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/game-platforms">Game-Platforms</Link></li>
                  <li><Link className="dropdown-item" to="/game-genres">Game-Genres</Link></li>
                </ul>
              </li>
            </ul>
          )}

          {/* Enlaces de usuario (solo para usuarios normales) */}
          {/* Eliminado: Dashboard link redundante ya que los usuarios van directo al dashboard */}

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





























