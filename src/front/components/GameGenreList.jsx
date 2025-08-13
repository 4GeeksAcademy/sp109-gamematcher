import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const GameGenreList = () => {
  const { store, dispatch } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({ game_id: "", genre_id: "" });

  useEffect(() => {
    fetchAssociations();
    fetchGames();
    fetchGenres();
  }, []);

  const fetchAssociations = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/game-genres`);
      const data = await res.json();
      dispatch({ type: "set_gameGenres", payload: data });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/games`);
      const data = await res.json();
      dispatch({ type: "set_games", payload: data });
    } catch (error) {
      console.error("Error loading games:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/genres`);
      const data = await res.json();
      dispatch({ type: "set_genres", payload: data });
    } catch (error) {
      console.error("Error loading genres:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/game-genres/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        dispatch({
          type: "set_gameGenres",
          payload: store.gameGenres.filter((assoc) => assoc.id !== id),
        });
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.game_id || !formData.genre_id) return;

    try {
      const res = await fetch(`${backendUrl}/api/game-genres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newAssoc = await res.json();
        dispatch({
          type: "set_gameGenres",
          payload: [...store.gameGenres, newAssoc],
        });
        setFormData({ game_id: "", genre_id: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Error creating association.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // ayuda para leer imagen del género por id
  const genreById = new Map((store.genres || []).map(g => [g.id, g]));

  return (
    <div className="container my-4">
      <h2 className="mb-4">Game ↔ Genre Associations</h2>

      <form className="row g-2 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-5">
          <select
            name="game_id"
            className="form-select"
            value={formData.game_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a game</option>
            {store.games?.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-5">
          <select
            name="genre_id"
            className="form-select"
            value={formData.genre_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a genre</option>
            {store.genres?.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-primary">
            ➕ Add
          </button>
        </div>
      </form>

      <table className="table table-striped table-bordered align-middle">
        <thead>
          <tr>
            <th>Game</th>
            <th>Genre</th>
            <th style={{ width: 72 }}>Image</th>
            <th className="text-center" style={{ width: 50 }}></th>
          </tr>
        </thead>
        <tbody>
          {store.gameGenres?.length > 0 ? (
            store.gameGenres.map((assoc) => {
              const gObj =
                assoc.genre ||
                genreById.get(assoc.genre_id) ||
                null;
              const gImg = gObj?.image;
              return (
                <tr key={assoc.id}>
                  <td>{assoc.game?.name || assoc.game_name}</td>
                  <td>{gObj?.name || assoc.genre?.name || assoc.genre_name}</td>
                  <td>
                    <div
                      className="rounded-circle bg-light overflow-hidden mx-auto"
                      style={{
                        width: 48,
                        height: 48,
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      {gImg ? (
                        <img
                          src={gImg}
                          alt={gObj?.name || "genre"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                          style={{ fontSize: 10 }}
                        >
                          —
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(assoc.id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No associations yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GameGenreList;
