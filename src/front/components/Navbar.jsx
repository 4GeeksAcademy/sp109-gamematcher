import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">Game Matcher</span>
        </Link>
        <div className="ml-auto">
          {/* Ruta pública visible siempre */}
          <Link to="/rawg">
            <button className="btn btn-outline-primary m-1">RAWG List</button>
          </Link>

          {/* Ruta para usuarios autenticados */}
          {isAuthenticated && (
            <Link to="/user-game-favorites">
              <button className="btn btn-outline-primary m-1">Mis Favoritos</button>
            </Link>
          )}

          {/* Rutas solo para administradores */}
          {isAuthenticated && user?.role === "admin" && (
            <>
              <Link to="/games">
                <button className="btn btn-outline-primary m-1">Games</button>
              </Link>
              <Link to="/genres">
                <button className="btn btn-outline-primary m-1">Genres</button>
              </Link>
              <Link to="/platforms">
                <button className="btn btn-outline-primary m-1">Platforms</button>
              </Link>
              <Link to="/users">
                <button className="btn btn-outline-warning m-1">Users</button>
              </Link>
              <Link to="/admins">
                <button className="btn btn-outline-warning m-1">Admins</button>
              </Link>
              <Link to="/game-platforms">
                <button className="btn btn-outline-warning m-1">Game-Platform</button>
              </Link>
              <Link to="/game-genres">
                <button className="btn btn-outline-warning m-1">Game-Genres</button>
              </Link>
              <Link to="/user-platform-preferences">
                <button className="btn btn-outline-warning m-1">User-Platform Preferences</button>
              </Link>
              <Link to="/user-genre-preferences">
                <button className="btn btn-outline-warning m-1">User-Genre Preferences</button>
              </Link>
              <Link to="/users/non-favorites">
                <button className="btn btn-outline-warning m-1">User-Non-Favorites</button>
              </Link>
            </>
          )}

          {/* Botones de autenticación */}
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <button className="btn btn-outline-success m-1">Login</button>
              </Link>
              <Link to="/admin-login">
                <button className="btn btn-outline-warning m-1">Admin</button>
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <span className="text-muted m-1">Hola, {user?.name}</span>
              <button className="btn btn-outline-danger m-1" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

