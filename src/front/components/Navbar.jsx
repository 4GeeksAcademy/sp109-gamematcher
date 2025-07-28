import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary me-2">Check the Context in action</button>
					</Link>
					<Link to="/games">
						<button className="btn btn-outline-primary me-2">Games</button>
					</Link>

					<Link to="/genres">
						<button className="btn btn-outline-primary me-2">Genres</button>
					</Link>

					<Link to="/platforms">
						<button className="btn btn-outline-primary">Platforms</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};