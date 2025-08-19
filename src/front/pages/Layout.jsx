import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider, useAuth } from "../context/AuthContext";

const LayoutWithNavbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* key fuerza re-render del navbar cuando cambia auth */}
      <Navbar key={isAuthenticated ? "auth" : "guest"} />
      <Outlet />
      <Footer />
    </>
  );
};

export const Layout = () => {
  return (
    <AuthProvider>
      <ScrollToTop>
        <LayoutWithNavbar />
      </ScrollToTop>
    </AuthProvider>
  );
};



