import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const About = () => (
  <>
    <PublicNavbar />
    <main className="container py-5">
      <h1 className="mb-3">About Game Matcher</h1>
      <p className="lead">
        Somos una plataforma que recomienda videojuegos según tus preferencias de géneros y plataformas.
      </p>
      <p>
        Elige lo que te gusta, marca favoritos o descarta lo que no te interese. Nuestro motor
        combina tus gustos con datos y te sugiere juegos que encajan contigo.
      </p>
    </main>
    <Footer />
  </>
);

export default About;
