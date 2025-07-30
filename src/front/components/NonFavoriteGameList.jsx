import React, { useEffect, useState } from 'react';
import { Trash3 } from 'react-bootstrap-icons';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const NonFavoriteGameList = () => {
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [nonFavorites, setNonFavorites] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');

  useEffect(() => {
    fetch(`${backendUrl}/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data));

    fetch(`${backendUrl}/api/games`)
      .then(res => res.json())
      .then(data => setGames(data));
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    fetch(`${backendUrl}/api/users/${selectedUserId}/non-favorites`)
      .then(res => res.json())
      .then(data => setNonFavorites(data));
  }, [selectedUserId]);

  const handleAdd = () => {
    if (!selectedUserId || !selectedGameId) return;

    fetch(`${backendUrl}/api/non-favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedUserId, game_id: selectedGameId })
    })
      .then(res => res.json())
      .then(newRelation => {
        setNonFavorites([...nonFavorites, newRelation]);
        setSelectedGameId('');
      });
  };

  const handleDelete = (id) => {
    fetch(`${backendUrl}/api/non-favorites/${id}`, {
      method: 'DELETE'
    }).then(() => {
      setNonFavorites(nonFavorites.filter(rel => rel.id !== id));
    });
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3">Banned Games</h3>

      <div className="row mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.email || user.username || `Usuario ${user.id}`}</option>
            ))}
          </select>
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
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-warning w-100" onClick={handleAdd}>
                Ban this game
              </button>
            </div>
          </div>

          <ul className="list-group">
            {nonFavorites.map(rel => (
              <li key={rel.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{rel.game_name}</span>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(rel.id)}>
                  <Trash3 />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default NonFavoriteGameList;