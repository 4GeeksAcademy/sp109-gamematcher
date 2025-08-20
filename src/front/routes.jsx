import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";

// Páginas públicas
import Landing from "./pages/Landing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Team from "./pages/Team";

// Páginas de usuario/admin
import Home from "./pages/Home";
import { GameManager } from "./pages/GameManager";
import { Platforms } from "./pages/Platforms";
import { Genres } from "./pages/Genres";
import { Users } from "./pages/Users";
import GamePlatformList from "./components/GamePlatformList";
import { AdminManager } from "./pages/AdminManager";
import GameGenreList from "./components/GameGenreList";
import UserPlatformPreferenceList from "./components/UserPlatformPreferenceList";
import UserGenrePreferenceList from "./components/UserGenrePreferenceList";
import { UserGameFavoriteManager } from "./pages/UserGameFavoriteManager";
import NonFavoriteGameList from "./components/NonFavoriteGameList";
import { RawgGameDetail } from "./pages/RawgGameDetail";
import { GameRecommendations } from "./pages/GameRecommendations";
import { LocalGamesList } from "./pages/LocalGamesList";
import { LocalGameDetail } from "./pages/LocalGameDetail";
import AdminLoginForm from "./components/AdminLoginForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import { Profile } from "./pages/Profile";

// (Opcional) Dashboard con rutas anidadas si lo usas
import UserDashboard from "./components/UserDashboard";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>

      {/* Landing pública como página inicial */}
      <Route index element={<Landing />} />

      {/* Páginas públicas de marketing */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/team" element={<Team />} />

      {/* Home protegido (usuarios/admins) */}
      <Route
        path="/home"
        element={<ProtectedRoute element={Home} roles={["user", "admin"]} />}
      />

      {/* Rutas protegidas - solo admins */}
      <Route
        path="/games"
        element={<ProtectedRoute element={GameManager} roles={["admin"]} />}
      />
      <Route
        path="/platforms"
        element={<ProtectedRoute element={Platforms} roles={["admin"]} />}
      />
      <Route
        path="/genres"
        element={<ProtectedRoute element={Genres} roles={["admin"]} />}
      />
      <Route
        path="/users"
        element={<ProtectedRoute element={Users} roles={["admin"]} />}
      />
      <Route
        path="/admins"
        element={<ProtectedRoute element={AdminManager} roles={["admin"]} />}
      />
      <Route
        path="/game-platforms"
        element={<ProtectedRoute element={GamePlatformList} roles={["admin"]} />}
      />
      <Route
        path="/game-genres"
        element={<ProtectedRoute element={GameGenreList} roles={["admin"]} />}
      />

      {/* Dashboard (user/admin) con rutas anidadas */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={UserDashboard} roles={["user", "admin"]} />}
      >
        <Route
          index
          element={<ProtectedRoute element={GameRecommendations} roles={["user"]} />}
        />
        <Route
          path="profile"
          element={<ProtectedRoute element={Profile} roles={["user", "admin"]} />}
        />
        <Route
          path="user-platform-preferences"
          element={<ProtectedRoute element={UserPlatformPreferenceList} roles={["user", "admin"]} />}
        />
        <Route
          path="user-genre-preferences"
          element={<ProtectedRoute element={UserGenrePreferenceList} roles={["user", "admin"]} />}
        />
        <Route
          path="user-game-favorites"
          element={<ProtectedRoute element={UserGameFavoriteManager} roles={["user", "admin"]} />}
        />
        <Route
          path="users/non-favorites"
          element={<ProtectedRoute element={NonFavoriteGameList} roles={["user", "admin"]} />}
        />

        <Route path="local-games" element={<LocalGamesList />} />
        <Route path="local-games/:id" element={<LocalGameDetail />} />

        <Route
          path="recommendations"
          element={<ProtectedRoute element={GameRecommendations} roles={["user"]} />}
        />
        <Route
          path="recommendations/:id"
          element={<ProtectedRoute element={RawgGameDetail} roles={["user"]} />}
        />
      </Route>

      {/* Rutas planas (compatibilidad) */}
      <Route
        path="/user-game-favorites"
        element={<ProtectedRoute element={UserGameFavoriteManager} roles={["user", "admin"]} />}
      />
      <Route
        path="/user-platform-preferences"
        element={<ProtectedRoute element={UserPlatformPreferenceList} roles={["user", "admin"]} />}
      />
      <Route
        path="/user-genre-preferences"
        element={<ProtectedRoute element={UserGenrePreferenceList} roles={["user", "admin"]} />}
      />
      <Route
        path="/users/non-favorites"
        element={<ProtectedRoute element={NonFavoriteGameList} roles={["user", "admin"]} />}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute element={Profile} roles={["user", "admin"]} />}
      />

      {/* Rutas públicas existentes */}
      <Route path="/local-games" element={<LocalGamesList />} />
      <Route path="/local-games/:id" element={<LocalGameDetail />} />
      <Route path="/rawg-games/:id" element={<RawgGameDetail />} />
      <Route path="/game/:id" element={<RawgGameDetail />} />
      <Route path="/games/:id" element={<LocalGameDetail />} />
      <Route
        path="/recommendations"
        element={<ProtectedRoute element={GameRecommendations} roles={["user"]} />}
      />

      {/* Auth / estado */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLoginForm />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Onboarding para usuarios loggeados */}
      <Route
        path="/onboarding"
        element={<ProtectedRoute element={Onboarding} roles={["user"]} />}
      />
    </Route>
  )
);









