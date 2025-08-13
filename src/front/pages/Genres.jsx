import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import axios from "axios";

export const Genres = () => {
  const { store, dispatch } = useGlobalReducer();
  const [form, setForm] = useState({ name: "", image: "" });
  const [editingId, setEditingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const loadGenres = async () => {
    const res = await fetch(`${backendUrl}/api/genres`);
    const data = await res.json();
    dispatch({ type: "set_genres", payload: data });
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      setForm((prev) => ({ ...prev, image: res.data.secure_url }));
    } catch (error) {
      console.error("Error uploading to Cloudinary", error);
      alert("Error uploading image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${backendUrl}/api/genres/${editingId}`
      : `${backendUrl}/api/genres`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", image: "" });
      setEditingId(null);
      loadGenres();
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/genres/${id}`, { method: "DELETE" });
    if (res.ok) loadGenres();
  };

  const handleEdit = (genre) => {
    setForm({ name: genre.name, image: genre.image });
    setEditingId(genre.id);
  };

  return (
    <div className="container py-4">
      <h2>Genres</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        {/* Subida de imagen a Cloudinary */}
        <input
          type="file"
          className="form-control my-2"
          accept="image/*"
          onChange={handleFileChange}
        />
        {form.image && (
          <div className="my-2">
            <img
              src={form.image}
              alt="Preview"
              style={{ maxHeight: "150px", borderRadius: "8px" }}
            />
          </div>
        )}

        <button className="btn btn-success" type="submit">
          {editingId ? "Update Genre" : "Add Genre"}
        </button>
      </form>

      <ul className="list-group">
        {store.genres.map((genre) => (
          <li
            key={genre.id}
            className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
          >
            <div className="d-flex align-items-center gap-3">
              {genre.image ? (
                <img
                  src={genre.image}
                  alt={genre.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                />
              ) : (
                <span className="text-muted">No image</span>
              )}
              <div>
                <strong>{genre.name}</strong>
              </div>
            </div>
            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-sm btn-warning"
                style={{ width: "40px", height: "40px" }}
                onClick={() => handleEdit(genre)}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                className="btn btn-sm btn-danger"
                style={{ width: "40px", height: "40px" }}
                onClick={() => handleDelete(genre.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};



