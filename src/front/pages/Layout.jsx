// src/front/pages/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";      // default import
import Footer from "../components/Footer";      // default import
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../context/AuthContext"; // 👈 Provider va aquí

const LayoutWithProviders = () => {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
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





