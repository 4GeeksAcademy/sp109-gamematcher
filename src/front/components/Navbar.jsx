import { Link } from "react-router-dom";

export const Navbar = () => {

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">Game Matcher</span>
        </Link>
        <div className="ml-auto">
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
            <button className="btn btn-outline-primary m-1">Users</button>
          </Link>

          <Link to="/game-platforms">
            <button className="btn btn-outline-primary m-1">Game-Platform</button>
          </Link>

          <Link to="/admins">
            <button className="btn btn-outline-primary m-1">Admins</button>
          </Link>

          <Link to="/game-genres">
            <button className="btn btn-outline-primary m-1">Game-Genres</button>
          </Link>
          <Link to="/user-platform-preferences">
            <button className="btn btn-outline-primary m-1">User-Platform Preferences</button>
          </Link>

          <Link to="/user-game-favorites">
            <button className="btn btn-outline-primary m-1">User Game Favorites</button>
          </Link>

          <Link to="/user-genre-preferences">
            <button className="btn btn-outline-primary m-1">User-Genre Preferences</button>
          </Link>
          
          <Link to="/users/non-favorites">
            <button className="btn btn-outline-primary m-1">User-Non-Favorites</button>
          </Link>

          <Link to="/rawg">
            <button className="btn btn-outline-primary m-1">RAWG List</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
