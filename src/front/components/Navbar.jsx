import { Link } from "react-router-dom";

export const Navbar = () => {

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">React Boilerplate</span>
        </Link>
        <div className="ml-auto">
          {/* <Link to="/demo">
            <button className="btn btn-primary me-2">Check the Context in action</button>
          </Link> */}
          <Link to="/games">
            <button className="btn btn-outline-primary me-2">Games</button>
          </Link>

          <Link to="/genres">
            <button className="btn btn-outline-primary me-2">Genres</button>
          </Link>

          <Link to="/platforms">
            <button className="btn btn-outline-primary me-2">Platforms</button>
          </Link>
          <Link to="/users">
            <button className="btn btn-outline-primary me-2">Users</button>
          </Link>

          <Link to="/game-platforms">
            <button className="btn btn-outline-primary me-2">Game-Platform</button>
          </Link>

          <Link to="/admins">
            <button className="btn btn-outline-primary me-2">Admins</button>
          </Link>

          <Link to="/game-genres">
            <button className="btn btn-outline-primary me-2">Game-Genres</button>
          </Link>
          <Link to="/user-platform-preferences">
            <button className="btn btn-outline-primary me-2">User-Platform Preferences</button>
          </Link>

          <Link to="/user-game-favorites">
            <button className="btn btn-outline-primary me-2">User Game Favorites</button>
          </Link>

          <Link to="/user-genre-preferences">
            <button className="btn btn-outline-primary me-2">User-Genre Preferences</button>
          </Link>
          
          <Link to="/users/non-favorites">
            <button className="btn btn-outline-primary me-2">User-Non-Favorites</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
