import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { AuthProvider } from "../context/AuthContext"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
  return (
    <AuthProvider>
      <ScrollToTop>
        <Navbar />
        <Outlet />
        <Footer />
      </ScrollToTop>
    </AuthProvider>
  )
}