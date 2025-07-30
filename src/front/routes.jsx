// Import necessary components and functions from react-router-dom.
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { GameManager } from "./pages/GameManager";
import { Platforms } from "./pages/Platforms";
import { Genres } from "./pages/Genres";
import { Users } from "./pages/Users";
import GamePlatformList from "./components/GamePlatformList";
import { AdminManager } from "./pages/AdminManager";
import GameGenreList from "./components/GameGenreList";
import UserPlatformPreferenceList from "./components/UserPlatformPreferenceList";
import UserGenrePreferenceList from "./components/UserGenrePreferenceList";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/games" element={<GameManager />} />
      <Route path="/platforms" element={<Platforms />} />
      <Route path="/genres" element={<Genres />} />
      <Route path="/users" element={<Users />} />
      <Route path="/game-platforms" element={<GamePlatformList />} />
      <Route path="/game-genres" element={<GameGenreList />} />
      <Route path="/user-platform-preferences" element={<UserPlatformPreferenceList />} />
      <Route path="/admins" element={<AdminManager />} />
      <Route path="/user-genre-preferences" element={<UserGenrePreferenceList />} />
    </Route>
  )
);
