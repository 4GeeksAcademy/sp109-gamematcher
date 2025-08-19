import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/img/GameMatcherLight.png";

export const Navbar = () => {
  const { isAuthenticated, user, logout, onboardingCompleted } = useAuth();
  const navigate = useNavigate();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isUser = isAuthenticated && user?.role === "user";
  const inOnboarding = isUser && !onboardingCompleted;

  return (
    <nav className={`navbar navbar-expand-lg navbar-light navbar-gradient shadow-sm ${stuck ? "navbar-blur" : ""}`}>
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-white">
          <img
            src={logo}
            alt="Game Matcher"
            width="40"
            height="40"
            className="rounded"
            onError={(e) => { e.currentTarget.src = "/GameMatcher.png"; }}
          />
          <span className="fw-bold">Game Matcher</span>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler navbar-toggler-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon navbar-toggler-icon-white"></span>
        </button>

        {/* Collapsible */}
        <div className="collapse navbar-collapse" id="mainNav">
          {/* LEFT: public links only if guest */}
          {!isAuthenticated ? (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link nav-link-ghost text-white" to="/about">About us</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-link-ghost text-white" to="/team">Our Team</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-link-ghost text-white" to="/contact">Contact</Link>
              </li>
            </ul>
          ) : (
            <div className="me-auto" />
          )}

          {/* RIGHT */}
          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated && (
              <div className="d-flex flex-wrap gap-2">
                <Link to="/login" className="btn btn-light btn-sm rounded-pill px-3">
                  <i className="fas fa-sign-in-alt me-1"></i> Login
                </Link>
                <Link to="/onboarding" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  Sign up
                </Link>
              </div>
            )}

            {isAuthenticated && inOnboarding && (
              <>
                <span className="text-white-50 small d-none d-md-inline">
                  <i className="fas fa-user-clock me-1"></i> Completing initial setup…
                </span>
                <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i> Logout
                </button>
              </>
            )}

            {isAuthenticated && !inOnboarding && (
              <>
                <Link to="/profile" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  <i className="fas fa-user-circle me-1"></i> Profile
                </Link>
                <button className="btn btn-light btn-sm rounded-pill px-3" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;













