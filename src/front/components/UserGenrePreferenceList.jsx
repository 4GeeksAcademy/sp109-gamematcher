import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const UserGenrePreferenceList = () => {
  const { user } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [users, setUsers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [userGenrePreferences, setUserGenrePreferences] = useState([]);

  const [formData, setFormData] = useState({
    user_id: "",
    genre_id: "",
  });

  // Carregar usuaris i gèneres al muntar
  useEffect(() => {
    fetch(`${backendUrl}/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data));

    fetch(`${backendUrl}/api/genres`)
      .then(res => res.json())
      .then(data => setGenres(data));
  }, []);

  // Posar user_id automàticament si no és admin
  useEffect(() => {
    if (user?.role !== "admin" && user?.id) {
      setFormData(form => ({ ...form, user_id: user.id.toString() }));
    }
  }, [user]);

  // Carregar preferències quan canvia user_id
  useEffect(() => {
    if (!formData.user_id) {
      setUserGenrePreferences([]);
      return;
    }
    fetch(`${backendUrl}/api/user-genre-preferences?user_id=${formData.user_id}`)
      .then(res => {
        if (!res.ok) throw new Error("Error loading preferences");
        return res.json();
      })
      .then(data => setUserGenrePreferences(data))
      .catch(() => setUserGenrePreferences([]));
  }, [formData.user_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(form => ({
      ...form,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.genre_id) return;

    const res = await fetch(`${backendUrl}/api/user-genre-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(formData.user_id, 10),
        genre_id: parseInt(formData.genre_id, 10),
      }),
    });

    if (res.ok) {
      setFormData(form => ({ ...form, genre_id: "" }));
      // Refrescar llistat
      fetch(`${backendUrl}/api/user-genre-preferences?user_id=${formData.user_id}`)
        .then(res => res.json())
        .then(data => setUserGenrePreferences(data));
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/user-genre-preferences/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUserGenrePreferences(prefs => prefs.filter(p => p.id !== id));
    }
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3">User ↔ Genre Preferences</h3>

      <div className="row mb-3">
        <div className="col-md-6">
          {user?.role === "admin" ? (
            <select
              name="user_id"
              className="form-select"
              value={formData.user_id}
              onChange={handleChange}
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nickname || u.name || u.email}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                className="form-control"
                value={user?.nickname || user?.name || user?.email}
                disabled
              />
              <input type="hidden" name="user_id" value={formData.user_id} />
            </>
          )}
        </div>

        <div className="col-md-6">
          <select
            name="genre_id"
            className="form-select"
            value={formData.genre_id}
            onChange={handleChange}
          >
            <option value="">Select a genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <button
            type="submit"
            className="btn btn-primary w-100"
            onClick={handleSubmit}
            disabled={!formData.user_id || !formData.genre_id}
          >
            + Add
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Genre</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {userGenrePreferences.length > 0 ? (
            userGenrePreferences.map((assoc) => (
              <tr key={assoc.id}>
                <td>{assoc.user_name || assoc.user?.nickname || assoc.user_id}</td>
                <td>{assoc.genre_name || assoc.genre?.name || assoc.genre_id}</td>
                <td>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(assoc.id)}
                    type="button"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No preferences found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserGenrePreferenceList;