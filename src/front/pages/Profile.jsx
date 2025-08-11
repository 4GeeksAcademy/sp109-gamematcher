import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Modal, Button } from "react-bootstrap";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const Profile = () => {
  const { user, isAuthenticated, getToken, updateUser } = useAuth();
  const [image, setImage] = useState("");
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const cloudinaryUploadURL = useMemo(
    () => `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    []
  );

  useEffect(() => {
    if (user?.profile_image_url) setImage(user.profile_image_url);

    // Sugeridas desde RAWG (como antes)
    fetch(`https://api.rawg.io/api/platforms?key=${import.meta.env.VITE_RAWG_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const images = (data?.results || [])
          .map(p => p.image_background)
          .filter(Boolean)
          .slice(0, 6);
        setSuggestedImages(images);
      })
      .catch(() => setSuggestedImages([]));
  }, [user?.profile_image_url]);

  const notify = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2000);
  };

  // Subir archivo local -> Cloudinary -> guardar URL en backend -> actualizar contexto y localStorage
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(cloudinaryUploadURL, formData);
      const url = cloudRes.data.secure_url;
      await saveProfileImage(url);

      notify("Imagen subida correctamente");
    } catch (err) {
      console.error("Error uploading to Cloudinary", err);
      notify("No se pudo subir la imagen");
    } finally {
      setLoading(false);
      // limpiar input file
      e.target.value = "";
    }
  };

  // Guardar URL (de Cloudinary o sugeridas) en backend y en contexto/localStorage
  const saveProfileImage = async (url) => {
    const token = getToken?.();
    if (!token || !user?.id) {
      notify("Sesión inválida");
      return;
    }

    await axios.put(
      `${API_URL}/api/users/${user.id}/profile-image`,
      { profile_image_url: url },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setImage(url);
    // ACTUALIZAR CONTEXTO + localStorage
    updateUser({ profile_image_url: url });
  };

  const handleUseSuggested = async (url) => {
    try {
      setLoading(true);
      await saveProfileImage(url);
      notify("Imagen cambiada correctamente");
    } catch {
      notify("No se pudo actualizar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setLoading(true);
      await saveProfileImage(null); // backend puede guardar null
      setImage("");
      updateUser({ profile_image_url: null });
      notify("Imagen eliminada");
    } catch {
      notify("No se pudo eliminar");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const avatar = (
    <div
      className="position-relative mx-auto"
      style={{
        width: 180,
        height: 180,
        borderRadius: "50%",
        overflow: "hidden",
        border: "3px solid #e9ecef",
        background: image ? "#000" : "#adb5bd", // gris para el icono
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {image ? (
        <>
          <img
            src={image}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Botón eliminar en la esquina */}
          <button
            type="button"
            className="btn btn-light p-1 position-absolute"
            style={{
              top: 6,
              right: 6,
              width: 34,
              height: 34,
              borderRadius: "50%",
              boxShadow: "0 2px 6px rgba(0,0,0,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowConfirm(true)}
            title="Eliminar imagen"
          >
            <i className="bi bi-x-lg" />
          </button>
        </>
      ) : (
        // Icono bootstrap cuando no hay imagen
        <i className="bi bi-person-circle" style={{ fontSize: 110, color: "white" }} />
      )}
    </div>
  );

  return (
    <div className="container py-4">
      <div className="card p-4">
        <h2 className="mb-3">Mi Perfil</h2>

        {/* Avatar + nickname */}
        <div className="text-center mb-3">
          {avatar}
          <div className="mt-3">
            <strong>{user?.nickname || user?.name || "Usuario"}</strong>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="alert alert-success py-2 text-center" role="alert">
            {feedback}
          </div>
        )}

        {/* Subir desde PC */}
        <div className="text-center mb-4">
          <label className="btn btn-primary">
            {loading ? "Subiendo..." : "Subir desde tu PC"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Sugeridas RAWG */}
        <div>
          <h5 className="mb-2">Elige una sugerida:</h5>
          <div className="d-flex gap-3 flex-wrap">
            {suggestedImages.map((url, idx) => (
              <button
                key={idx}
                className="p-0 border-0 bg-transparent"
                onClick={() => handleUseSuggested(url)}
                disabled={loading}
                title="Usar esta imagen"
                style={{ borderRadius: 12, overflow: "hidden" }}
              >
                <img
                  src={url}
                  alt={`suggested-${idx}`}
                  style={{ width: 120, height: 90, objectFit: "cover", display: "block" }}
                />
              </button>
            ))}
            {suggestedImages.length === 0 && (
              <div className="text-muted">No hay sugerencias disponibles ahora.</div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmación eliminar */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Seguro que quieres eliminar tu imagen de perfil?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleRemoveImage} disabled={loading}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};















