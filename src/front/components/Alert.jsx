import React, { useState } from "react";

export const Alert = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!message || !isVisible) return null;

  return (
    <div className="alert alert-info alert-dismissible">
      {message}
      <button
        type="button"
        className="btn-close"
        onClick={() => setIsVisible(false)}
      ></button>
    </div>
  );
};
