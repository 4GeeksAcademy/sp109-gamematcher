import React, { useEffect, useState } from "react";
import { Trash3 } from "react-bootstrap-icons";
import { useAuth } from "../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UserPlatformPreferenceList = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [userPlatformPreferences, setUserPlatformPreferences] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    platform_id: "",
  });

  useEffect(() => {
    fetch(`${backendUrl}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch(`${backendUrl}/api/platforms`)
      .then((res) => res.json())
      .then((data) => setPlatforms(data));
  }, []);

  useEffect(() => {
    if (user?.role !== "admin" && user?.id) {
      setFormData((form) => ({ ...form, user_id: user.id.toString() }));
    }
  }, [user]);

  useEffect(() => {
    if (!formData.user_id) {
      setUserPlatformPreferences([]);
      return;
    }
    fetch(`${backendUrl}/api/user-platform-preferences?user_id=${formData.user_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error loading preferences");
        return res.json();
      })
      .then((data) => {
        console.log('UserPlatformPreferenceList - Preferencias cargadas:', data);
        console.log('Numero de preferencias:', data.length);
        setUserPlatformPreferences(data);
      })
      .catch(() => setUserPlatformPreferences([]));
  }, [formData.user_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((form) => ({
      ...form,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.platform_id) return;

    const res = await fetch(`${backendUrl}/api/user-platform-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(formData.user_id, 10),
        platform_id: parseInt(formData.platform_id, 10),
      }),
    });

    if (res.ok) {
      console.log('Preferencia agregada exitosamente');
      setFormData((form) => ({ ...form, platform_id: "" }));
      // Refrescar llistat
      fetch(`${backendUrl}/api/user-platform-preferences?user_id=${formData.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Preferencias actualizadas despues de agregar:', data);
          setUserPlatformPreferences(data);
        });
    } else {
      console.log('Error agregando preferencia:', res.status, res.statusText);
    }
  };

  const handleDelete = async (id) => {
    console.log('Intentando eliminar preferencia con ID:', id);
    const res = await fetch(`${backendUrl}/api/user-platform-preferences/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      console.log('Preferencia eliminada exitosamente');
      setUserPlatformPreferences((prefs) => {
        const newPrefs = prefs.filter((p) => p.id !== id);
        console.log('Preferencias actualizadas despues de eliminar:', newPrefs);
        return newPrefs;
      });
    } else {
      console.log('Error eliminando preferencia:', res.status, res.statusText);
    }
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3">User ↔ Platform Preferences</h3>

      <form className="row mb-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          {user?.role === "admin" ? (
            <select
              name="user_id"
              className="form-select"
              value={formData.user_id}
              onChange={handleChange}
              required
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nickname || u.name || `User ${u.id}`}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                className="form-control"
                value={user?.nickname || user?.name || `User ${user?.id}`}
                disabled
              />
              <input type="hidden" name="user_id" value={formData.user_id} />
            </>
          )}
        </div>

        <div className="col-md-6">
          <select
            name="platform_id"
            className="form-select"
            value={formData.platform_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a platform</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-12 mt-3 d-grid">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formData.user_id || !formData.platform_id}
          >
            + Add
          </button>
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Platform</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {userPlatformPreferences.length > 0 ? (
            userPlatformPreferences.map((pref) => (
              <tr key={pref.id}>
                <td>
                  {user?.role === "admin"
                    ? users.find((u) => u.id === pref.user_id)?.email || pref.user_name
                    : user?.nickname || user?.name}
                </td>
                <td>{pref.platform_name}</td>
                <td>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(pref.id)}
                    type="button"
                  >
                    <Trash3 />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-muted">
                No preferences found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserPlatformPreferenceList;