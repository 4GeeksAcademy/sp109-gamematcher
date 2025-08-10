import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const NonFavoriteGameList = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [nonFavorites, setNonFavorites] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");

  useEffect(() => {
    fetch(`${backendUrl}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch(`${backendUrl}/api/games`)
      .then((res) => res.json())
      .then((data) => setGames(data));
  }, []);

  useEffect(() => {
    if (user?.id) {
      setSelectedUserId(user.id.toString());
    }
  }, [user]);

  useEffect(() => {
    if (!selectedUserId) return;
    fetch(`${backendUrl}/api/users/${selectedUserId}/non-favorites`)
      .then((res) => res.json())
      .then((data) => setNonFavorites(data));
  }, [selectedUserId]);

  const handleAdd = () => {
    if (!selectedUserId || !selectedGameId) return;

    fetch(`${backendUrl}/api/non-favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUserId, game_id: selectedGameId }),
    })
      .then((res) => res.json())
      .then((newRelation) => {
        setNonFavorites([...nonFavorites, newRelation]);
        setSelectedGameId("");
      });
  };

  const handleDelete = (id) => {
    fetch(`${backendUrl}/api/non-favorites/${id}`, {
      method: "DELETE",
    }).then(() => {
      setNonFavorites(nonFavorites.filter((rel) => rel.id !== id));
    });
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3">Banned Games</h3>

      <div className="row mb-3">
        <div className="col-md-6">
          {user?.role === "admin" ? (
            <select
              className="form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nickname || user.name || `User ${user.id}`}
                </option>
              ))}
            </select>
          ) : (
            <>
              <div className="form-control bg-light">
                {user.nickname || user.name || `User ${user.id}`}
              </div>
              <input type="hidden" value={selectedUserId} />
            </>
          )}
        </div>
      </div>

      {selectedUserId && (
        <>
          <div className="row mb-3">
            <div className="col-md-8">
              <select
                className="form-select"
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
              >
                <option value="">Select game to ban</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-warning w-100"
                onClick={handleAdd}
                disabled={!selectedGameId}
              >
                Ban this game
              </button>
            </div>
          </div>

          <ul className="list-group">
            {nonFavorites.length > 0 ? (
              nonFavorites.map((rel) => (
                <li
                  key={rel.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{rel.game_name}</span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(rel.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </li>
              ))
            ) : (
              <li className="list-group-item text-center text-muted">
                No banned games yet.
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default NonFavoriteGameList;