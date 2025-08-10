import React from 'react';

export const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="container mt-4">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  );
};
