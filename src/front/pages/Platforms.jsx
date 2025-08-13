// src/front/pages/Platforms.jsx
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Platforms = () => {
  const { store, dispatch } = useGlobalReducer();

  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Carga de plataformas desde el backend (DB) -> persiste entre sesiones
  const loadPlatforms = async () => {
    const res = await fetch(`${backendUrl}/api/platforms`);
    const data = await res.json();
    dispatch({ type: "set_platforms", payload: data });
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  // Subir archivo a Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadMsg("⚠️ Falta configuración de Cloudinary (.env)");
      return;
    }

    try {
      setUploading(true);
      setUploadMsg("Subiendo imagen...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const resp = await fetch(url, { method: "POST", body: formData });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error("Cloudinary error:", errData);
        throw new Error("Error al subir a Cloudinary");
      }
      const data = await resp.json();

      setForm((prev) => ({ ...prev, image: data.secure_url }));
      setUploadMsg("✅ Imagen subida correctamente");
    } catch (err) {
      console.error(err);
      setUploadMsg("❌ Error subiendo imagen");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(""), 2000);
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${backendUrl}/api/platforms/${editingId}`
      : `${backendUrl}/api/platforms`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: form.price,
        image: form.image || null,
      }),
    });

    if (res.ok) {
      setForm({ name: "", price: "", image: "" });
      setEditingId(null);
      loadPlatforms();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Error guardando la plataforma");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${backendUrl}/api/platforms/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadPlatforms();
  };

  const handleEdit = (platform) => {
    setForm({ name: platform.name || "", price: platform.price || "", image: platform.image || "" });
    setEditingId(platform.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Platforms</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. PlayStation 5"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 499"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          <div className="col-md-5">
            <label className="form-label d-flex justify-content-between">
              <span>Imagen</span>
              {uploadMsg && <small className="text-muted">{uploadMsg}</small>}
            </label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {form.image ? (
                <button
                  type="button"
                  onClick={clearImage}
                  className="btn btn-outline-secondary"
                  title="Quitar imagen"
                >
                  Quitar
                </button>
              ) : null}
            </div>

            {/* Preview */}
            <div className="mt-2 d-flex align-items-center gap-3">
              {form.image ? (
                <img
                  src={form.image}
                  alt="preview"
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              ) : (
                <div
                  className="text-muted d-flex align-items-center justify-content-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    border: "1px dashed #bbb",
                    fontSize: 12,
                  }}
                >
                  sin img
                </div>
              )}
              {form.image && (
                <small className="text-truncate" style={{ maxWidth: 280 }}>
                  {form.image}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-success" type="submit" disabled={uploading}>
            {editingId ? "Actualizar Plataforma" : "Añadir Plataforma"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline-secondary ms-2"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", price: "", image: "" });
              }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {/* Lista de plataformas */}
      <ul className="list-group">
        {store.platforms.map((platform) => (
          <li
            key={platform.id}
            className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
          >
            <div className="d-flex align-items-center gap-3">
              {/* Thumb */}
              {platform.image ? (
                <img
                  src={platform.image}
                  alt={platform.name}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
              ) : (
                <div
                  className="bg-light text-secondary d-flex align-items-center justify-content-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    border: "1px dashed #bbb",
                    fontSize: 12,
                  }}
                >
                  sin img
                </div>
              )}

              <div className="d-flex flex-column">
                <strong>{platform.name}</strong>
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {platform.price}
                </span>
                {platform.image && (
                  <span
                    className="text-muted text-truncate"
                    style={{ maxWidth: 380, fontSize: "0.8rem" }}
                    title={platform.image}
                  >
                    {platform.image}
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-warning"
                style={{ width: 40, height: 40 }}
                onClick={() => handleEdit(platform)}
                title="Editar"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                className="btn btn-sm btn-danger"
                style={{ width: 40, height: 40 }}
                onClick={() => handleDelete(platform.id)}
                title="Eliminar"
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

export default Platforms;

