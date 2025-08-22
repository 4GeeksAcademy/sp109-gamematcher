import React from 'react';

const normalizePlatformNames = (game) => {
  // Acepta varios posibles formatos: strings, objetos { name }, RAWG { platform: { name } }, etc.
  const fromCommon =
    (Array.isArray(game.platforms) ? game.platforms : []) ||
    (Array.isArray(game.platform_names) ? game.platform_names : []) ||
    (Array.isArray(game.platforms_names) ? game.platforms_names : []);

  const names = (fromCommon || [])
    .map(p => {
      if (typeof p === 'string') return p;
      if (p?.name) return p.name;
      if (p?.platform?.name) return p.platform.name;
      return null;
    })
    .filter(Boolean);

  // Deduplicar y devolver
  return [...new Set(names)];
};

const faIconFor = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('pc') || n.includes('windows')) return 'fa-brands fa-windows';
  if (n.includes('playstation') || n.startsWith('ps')) return 'fa-brands fa-playstation';
  if (n.includes('xbox')) return 'fa-brands fa-xbox';
  if (n.includes('switch') || n.includes('nintendo')) return 'fa-solid fa-gamepad'; // fallback para Switch
  if (n.includes('mac') || n.includes('ios') || n.includes('apple') || n.includes('os x')) return 'fa-brands fa-apple';
  if (n.includes('linux') || n.includes('steam deck') || n.includes('steamos')) return 'fa-brands fa-linux';
  if (n.includes('android')) return 'fa-brands fa-android';
  if (n.includes('web') || n.includes('browser')) return 'fa-solid fa-globe';
  return null; // sin icono conocido
};

export const GameCard = ({ game, onClick }) => {
  const platformNames = normalizePlatformNames(game);
  const platformIcons = platformNames
    .map(n => ({ name: n, icon: faIconFor(n) }))
    .filter(p => p.icon);

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

        {/* Iconos de plataformas (si hay datos) */}
        {platformIcons.length > 0 && (
          <div className="platform-icons mb-2">
            {platformIcons.map((p, idx) => (
              <i key={idx} className={p.icon} title={p.name} aria-label={p.name}></i>
            ))}
          </div>
        )}

        {/* Rating lilac chip (como ya lo dejamos) */}
        {game.rating > 0 && (
          <div className="mb-2">
            <span className="rating-chip rating-chip--lilac">
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


