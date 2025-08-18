import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const Contact = () => (
  <>
    <PublicNavbar />
    <main className="container py-5">
      <h1 className="mb-3">Contact us</h1>
      <p className="mb-4">¿Preguntas o sugerencias? Escríbenos.</p>
      <form className="row g-3" onSubmit={(e)=>e.preventDefault()}>
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input className="form-control" required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" required />
        </div>
        <div className="col-12">
          <label className="form-label">Mensaje</label>
          <textarea className="form-control" rows="5" required></textarea>
        </div>
        <div className="col-12">
          <button className="btn btn-primary">Enviar</button>
        </div>
      </form>
    </main>
    <Footer />
  </>
);

export default Contact;
