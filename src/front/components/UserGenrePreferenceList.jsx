import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useAuth } from "../context/AuthContext";

const UserGenrePreferenceList = () => {
  const { store, dispatch } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({ user_id: "", genre_id: "" });

  const { user } = useAuth();

  useEffect(() => {
    fetchAssociations();
    fetchUsers();
    fetchGenres();
  }, []);

  useEffect(() => {
    if (user?.role !== "admin" && user?.id) {
      setFormData((form) => ({ ...form, user_id: user.id }));
    }
  }, [user]);

  const fetchAssociations = async () => {
    const res = await fetch(`${backendUrl}/api/user-genre-preferences`);
    const data = await res.json();
    dispatch({ type: "set_userGenrePreferences", payload: data });
  };

  const fetchUsers = async () => {
    const res = await fetch(`${backendUrl}/api/users`);
    const data = await res.json();
    dispatch({ type: "set_users", payload: data });
  };

  const fetchGenres = async () => {
    const res = await fetch(`${backendUrl}/api/genres`);
    const data = await res.json();
    dispatch({ type: "set_genres", payload: data });
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/user-genre-preferences/${id}`, { method: "DELETE" });
    if (res.ok) {
      dispatch({
        type: "set_userGenrePreferences",
        payload: store.userGenrePreferences.filter((assoc) => assoc.id !== id),
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${backendUrl}/api/user-genre-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const newAssoc = await res.json();
      dispatch({
        type: "set_userGenrePreferences",
        payload: [...store.userGenrePreferences, newAssoc],
      });
      setFormData({ user_id: user?.role !== "admin" ? user.id : "", genre_id: "" });
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">User ↔ Genre Preferences</h2>

      <form className="row g-2 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-5">
          {user?.role !== "admin" ? (
            <>
              <div className="form-control my-2 bg-light">
                {user.name}
              </div>
              <input type="hidden" name="user_id" value={user.id} />
            </>
          ) : (
            <select
              name="user_id"
              className="form-select"
              value={formData.user_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a user</option>
              {store.users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nickname || u.name}
                </option>
              ))}
            </select>
          )}
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
          <button type="submit" className="btn btn-primary">➕ Add</button>
        </div>
      </form>

      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>User</th>
            <th>Genre</th>
            <th className="text-center" style={{ width: "50px" }}></th>
          </tr>
        </thead>
        <tbody>
          {store.userGenrePreferences?.length > 0 ? (
            store.userGenrePreferences.map((assoc) => (
              <tr key={assoc.id}>
                <td>{assoc.user_name}</td>
                <td>{assoc.genre_name}</td>
                <td className="text-center">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(assoc.id)}>🗑️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">No associations yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserGenrePreferenceList;