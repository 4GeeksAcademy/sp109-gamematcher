import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, user, logout, onboardingCompleted } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redireccionar al home después de logout
  };

  const isAdmin = isAuthenticated && user?.role === "admin";
  const isUser = isAuthenticated && user?.role === "user";
  
  // Si el usuario está en proceso de onboarding, solo mostrar logout
  const showOnlyLogout = isUser && !onboardingCompleted;

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">Game Matcher</span>
        </Link>
        <div className="ml-auto">
          {/* Durante onboarding, solo mostrar el botón de logout */}
          {showOnlyLogout ? (
            <>
              <span className="text-muted m-1">
                <i className="fas fa-user-clock"></i> Completando configuración inicial...
              </span>
              <button className="btn btn-outline-danger m-1" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              {/* Ruta pública visible siempre - Base de datos local */}
              <Link to="/local-games">
                <button className="btn btn-outline-primary m-1"><i className="fas fa-database"></i> Base de Datos</button>
              </Link>

              {/* Rutas solo para usuarios normales (no admins) */}
              {isUser && (
                <>
                  <Link to="/recommendations">
                    <button className="btn btn-outline-success m-1"><i className="fas fa-star"></i> Recomendaciones</button>
                  </Link>
                  <Link to="/user-game-favorites">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-heart"></i> Mis Favoritos</button>
                  </Link>
                </>
              )}

              {/* Rutas solo para admins */}
              {isAdmin && (
                <Link to="/user-game-favorites">
                  <button className="btn btn-outline-primary m-1"><i className="fas fa-heart"></i> Favoritos</button>
                </Link>
              )}

              {/* Rutas accesibles por admin o user */}
              {isAuthenticated && (isUser || isAdmin) && (
                <>
                  <Link to="/user-platform-preferences">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-desktop"></i> Mis Plataformas</button>
                  </Link>
                  <Link to="/user-genre-preferences">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-tags"></i> Mis Géneros</button>
                  </Link>
                  <Link to="/users/non-favorites">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-times-circle"></i> No Favoritos</button>
                  </Link>
                </>
              )}

              {/* Rutas solo para administradores */}
              {isAdmin && (
                <>
                  <Link to="/games">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-gamepad"></i> Games</button>
                  </Link>
                  <Link to="/genres">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-tags"></i> Genres</button>
                  </Link>
                  <Link to="/platforms">
                    <button className="btn btn-outline-primary m-1"><i className="fas fa-desktop"></i> Platforms</button>
                  </Link>
                  <Link to="/users">
                    <button className="btn btn-outline-warning m-1"><i className="fas fa-users"></i> Users</button>
                  </Link>
                  <Link to="/admins">
                    <button className="btn btn-outline-warning m-1"><i className="fas fa-user-shield"></i> Admins</button>
                  </Link>
                  <Link to="/game-platforms">
                    <button className="btn btn-outline-warning m-1"><i className="fas fa-link"></i> Game-Platform</button>
                  </Link>
                  <Link to="/game-genres">
                    <button className="btn btn-outline-warning m-1"><i className="fas fa-link"></i> Game-Genres</button>
                  </Link>
                </>
              )}

              {/* Autenticación - solo se muestra LOGIN si no está autenticado */}
              {!isAuthenticated && (
                <Link to="/login">
                  <button className="btn btn-outline-success m-1"><i className="fas fa-sign-in-alt"></i> Login</button>
                </Link>
              )}

              {/* Solo se muestra LOGOUT si está autenticado */}
              {isAuthenticated && (
                <>
                  <span className="text-muted m-1"><i className="fas fa-user"></i> Hola, {user?.name || user?.nickname}</span>
                  <button className="btn btn-outline-danger m-1" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};



