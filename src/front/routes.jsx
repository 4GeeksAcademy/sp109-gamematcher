// Import necessary components and functions from react-router-dom.
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
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
import NonFavoriteGameList from './components/NonFavoriteGameList';
import { RawgGameList } from "./pages/RawgGameList";
import { RawgGameDetail } from "./pages/RawgGameDetail";
import AdminLoginForm from "./components/AdminLoginForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />

      {/* Rutas protegidas - solo admins */}
      <Route path="/games" element={
        <ProtectedRoute element={GameManager} roles={["admin"]} />
      } />
      <Route path="/platforms" element={
        <ProtectedRoute element={Platforms} roles={["admin"]} />
      } />
      <Route path="/genres" element={
        <ProtectedRoute element={Genres} roles={["admin"]} />
      } />
      <Route path="/users" element={
        <ProtectedRoute element={Users} roles={["admin"]} />
      } />
      <Route path="/admins" element={
        <ProtectedRoute element={AdminManager} roles={["admin"]} />
      } />
      <Route path="/game-platforms" element={
        <ProtectedRoute element={GamePlatformList} roles={["admin"]} />
      } />
      <Route path="/game-genres" element={
        <ProtectedRoute element={GameGenreList} roles={["admin"]} />
      } />

      {/* Rutas accesibles por admin y user */}
      <Route path="/user-game-favorites" element={
        <ProtectedRoute element={UserGameFavoriteManager} roles={["user", "admin"]} />
      } />
      <Route path="/user-platform-preferences" element={
        <ProtectedRoute element={UserPlatformPreferenceList} roles={["user", "admin"]} />
      } />
      <Route path="/user-genre-preferences" element={
        <ProtectedRoute element={UserGenrePreferenceList} roles={["user", "admin"]} />
      } />
      <Route path="/users/non-favorites" element={
        <ProtectedRoute element={NonFavoriteGameList} roles={["user", "admin"]} />
      } />

      {/* Rutas públicas */}
      <Route path="/rawg" element={<RawgGameList />} />
      <Route path="/rawg-games/:id" element={<RawgGameDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLoginForm />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Ruta de onboarding para usuarios */}
      <Route path="/onboarding" element={
        <ProtectedRoute element={Onboarding} roles={["user"]} />
      } />
    </Route>
  )
);
