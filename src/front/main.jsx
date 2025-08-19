// src/front/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from './hooks/useGlobalReducer';
import { BackendURL } from './components/BackendURL';
import { AuthProvider } from './context/AuthContext';
import "bootstrap/dist/css/bootstrap.min.css";

const Main = () => {
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
    return (
      <React.StrictMode>
        <BackendURL />
      </React.StrictMode>
    );
  }

  return (
    <React.StrictMode>
      <StoreProvider>
        {/* Primero RouterProvider (necesario para que useNavigate funcione) */}
        <RouterProvider router={router} />
        {/* Luego AuthProvider se debería mover DENTRO de Layout.jsx o un wrapper */}
      </StoreProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);


