// src/front/pages/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";      // default import
import Footer from "../components/Footer";      // default import
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../context/AuthContext"; // 👈 Provider va aquí

const LayoutWithProviders = () => {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export const Layout = () => {
  return (
    <ScrollToTop>
      <LayoutWithProviders />
    </ScrollToTop>
  );
};





