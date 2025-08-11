import React from 'react';

export const GameCard = ({ game, onClick }) => {
  return (
    <div className="card h-100 shadow-sm game-card" style={{ cursor: 'pointer' }} onClick={onClick}>
      {game.background_image ? (
        <img
          src={game.background_image}
          className="card-img-top"
          alt={game.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div
          className="card-img-top d-flex align-items-center justify-content-center bg-light"
          style={{ height: '200px' }}
        >
          <i className="fas fa-gamepad fa-3x text-muted"></i>
        </div>
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{game.name}</h5>

        {game.rating > 0 && (
          <div className="mb-2">
            <span className="badge bg-warning text-dark">
              <i className="fas fa-star me-1"></i>{game.rating}/5
            </span>
          </div>
        )}

        {game.genres && game.genres.length > 0 && (
          <div className="mb-2">
            {game.genres.slice(0, 3).map(genre => (
              <span key={genre} className="badge bg-secondary me-1">
                <i className="fas fa-tags me-1"></i>{genre}
              </span>
            ))}
          </div>
        )}

        {game.released && (
          <small className="text-muted">
            <i className="fas fa-calendar me-1"></i>{game.released}
          </small>
        )}
      </div>
    </div>
  );
};