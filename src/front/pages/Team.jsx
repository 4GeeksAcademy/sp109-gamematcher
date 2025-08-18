import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const Team = () => (
  <>
    <PublicNavbar />
    <main className="container py-5">
      <h1 className="mb-4">Our Team</h1>
      <div className="row g-4">
        {[
          { name: "Nancy", role: "Product", avatar: "https://i.pravatar.cc/150?img=1" },
          { name: "Marcel", role: "Frontend", avatar: "https://i.pravatar.cc/150?img=5" },
          { name: "Xavier", role: "Backend", avatar: "https://i.pravatar.cc/150?img=11" },
        ].map((m) => (
          <div className="col-12 col-md-4" key={m.name}>
            <div className="card h-100 text-center shadow-sm border-0">
              <div className="card-body">
                <img src={m.avatar} alt={m.name} className="rounded-circle mb-3" width="96" height="96" />
                <h6 className="mb-0">{m.name}</h6>
                <small className="text-muted">{m.role}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
    <Footer />
  </>
);

export default Team;
