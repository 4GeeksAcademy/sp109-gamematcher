
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import { GameRecommendations } from "../pages/GameRecommendations";

function UserDashboard() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ background: "#6e00ff", color: "white", padding: "40px 0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
        <div className="container d-flex align-items-center justify-content-between">
          <h2 className="mb-0" style={{ fontWeight: 600 }}>
            ¡Hola, {user?.nickname || user?.name || "Usuario"}!
          </h2>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-12 col-lg-4 col-xl-3">
            <div className="card h-100">
              <div className="card-header py-3">
                <span className="h6 mb-0">Settings</span>
              </div>
              <div className="list-group list-group-flush list-group-sm">
                <Link
                  to="local-games"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${pathname.includes("/dashboard/local-games") ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-database me-2"></i>
                    <span>Todos los juegos</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="profile"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${pathname.includes("/dashboard/profile") ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-user me-2"></i>
                    <span>Perfil</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="user-platform-preferences"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${pathname.includes("/dashboard/user-platform-preferences") ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-gamepad me-2"></i>
                    <span>Plataformas</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="user-genre-preferences"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${pathname.includes("/dashboard/user-genre-preferences") ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-tags me-2"></i>
                    <span>Géneros</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="user-game-favorites"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${pathname.includes("/dashboard/user-game-favorites") ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-heart me-2"></i>
                    <span>Favoritos</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="users/non-favorites"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${pathname.includes("/dashboard/users/non-favorites") ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-ban me-2"></i>
                    <span>No favoritos</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

                <Link
                  to="recommendations"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${(pathname === "/dashboard" || pathname.includes("/dashboard/recommendations")) ? "active" : ""}`}
                >
                  <div>
                    <i className="fa-solid fa-star me-2"></i>
                    <span>Recomendaciones</span>
                  </div>
                  <i className="fa-solid fa-angle-right"></i>
                </Link>

              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-8 col-xl-9">
            <div className="card h-100 p-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;