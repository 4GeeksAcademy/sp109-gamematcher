// src/front/pages/UserDashboard.jsx
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(50deg, #6e00ff 0, #bb00ff 100%)",
          color: "white",
          padding: "40px 0",
          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        }}
      >
        <div className="container d-flex align-items-center justify-content-between">
          <h2 className="mb-0" style={{ fontWeight: 600 }}>
            Hi, {user?.nickname || user?.name || "Usuario"}!
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="container py-4">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-12 col-lg-4 col-xl-3">
            <div className="card h-100 shadow-sm border-0 glass-card">
              <div className="card-header py-3 bg-white border-0">
                <span className="h5 mb-0">Browse</span>
              </div>

              <div className="list-group list-group-flush list-group-sm p-3 pt-0">
                {/* Recommendations (first) */}
                <Link
                  to="recommendations"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname === "/dashboard" ||
                    pathname.includes("/dashboard/recommendations")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-star me-2"></i>
                    <span>Recommendations</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="local-games"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname.includes("/dashboard/local-games")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-database me-2"></i>
                    <span>Games</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="profile"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname.includes("/dashboard/profile")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-user me-2"></i>
                    <span>Profile</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="user-platform-preferences"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname.includes("/dashboard/user-platform-preferences")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-gamepad me-2"></i>
                    <span>Platforms</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="user-genre-preferences"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname.includes("/dashboard/user-genre-preferences")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-tags me-2"></i>
                    <span>Genres</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="user-game-favorites"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname.includes("/dashboard/user-game-favorites")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-heart me-2"></i>
                    <span>Favorites</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="users/non-favorites"
                  className={`list-group-item list-group-item-action side-link d-flex justify-content-between align-items-center ${
                    pathname.includes("/dashboard/users/non-favorites")
                      ? "active-purple"
                      : ""
                  }`}
                >
                  <div>
                    <i className="fa-solid fa-ban me-2"></i>
                    <span>Non Favorites</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="col-12 col-lg-8 col-xl-9">
            <div className="card h-100 p-4 shadow-sm border-0 glass-card">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Scoped styles for the sidebar links */}
      <style>
        {`
          /* Item base */
          .side-link {
            border: 1px solid rgba(15,23,42,.08);
            border-radius: 12px;
            margin-bottom: .55rem;
            padding: .75rem .9rem;
            transition: all .18s ease;
            background: #fff;
          }
          .side-link:hover {
            background-color: rgba(110, 0, 255, 0.06);
            border-color: rgba(110, 0, 255, 0.28);
          }

          /* Active morado sin relleno + bordes redondeados */
          .side-link.active-purple {
            border: 2px solid #6e00ff !important;
            color: #6e00ff !important;
            background-color: transparent !important;
            font-weight: 700;
            border-radius: 12px; /* borde curvo */
          }
          .side-link.active-purple i {
            color: #6e00ff !important;
          }

          /* Quitar estilos azules por defecto de Bootstrap active */
          .list-group .list-group-item.active {
            background-color: transparent;
            color: inherit;
            border-color: rgba(15,23,42,.08);
          }
        `}
      </style>
    </div>
  );
}

export default UserDashboard;

