import React from "react";

const AlertMessage = ({ message, onClose, type = "light" }) => {
  if (!message) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 9999 }}
    >
      <div
        className={`alert alert-${type} alert-dismissible fade show text-center`}
        role="alert"
        style={{
          width: "500px",
          maxWidth: "90vw",
          padding: "2.5rem 2rem",
          fontSize: "1.5rem",
          backgroundColor: "white",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <div className="mb-3">{message}</div>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default AlertMessage; 