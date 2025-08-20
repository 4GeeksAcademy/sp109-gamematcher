// src/front/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { StoreProvider } from './hooks/useGlobalReducer';
// import { AuthProvider } from './context/AuthContext'; // <- només si NO el muntes a Layout.jsx

const Main = () => {
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === '') {
    return (
      <React.StrictMode>
        <BackendURL />
      </React.StrictMode>
    );
  }

  return (
    <React.StrictMode>
      <StoreProvider>
        {/* Si vols que Auth estigui global aquí (en lloc de Layout.jsx), descomenta: 
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
         */}
        <RouterProvider router={router} />
      </StoreProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);