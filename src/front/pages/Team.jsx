import React from "react";

const Team = () => {
  const members = [
    {
      name: "Xavier Guas",
      role: "Full-Stack Developer",
      img: "/Avatars/Xavier.png",
      github: "https://github.com/xavierguasb",
    },
    {
      name: "Marcel Reig",
      role: "Full-Stack Developer",
      img: "/Avatars/Marcel.png",
      github: "https://github.com/MarcelReig",
    },
    {
      name: "Nancy Acevedo",
      role: "Full-Stack Developer",
      img: "/Avatars/Nancy.png",
      github: "https://github.com/Nanceap",
    },
  ];

  return (
    <>
      {/* HERO */}
      <header className="navbar-gradient text-white team-hero">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">Our Team</h1>
          <p className="lead opacity-90 mb-0">
            We nurtured the passion for details, which most of the time make the difference.
          </p>
        </div>

        {/* Shapes decorativas */}
        <div className="shape shape-diamond" aria-hidden="true" />
        <div className="shape shape-hex" aria-hidden="true" />
      </header>

      {/* QUOTE gamer */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mx-auto" style={{ maxWidth: 820 }}>
            <p className="text-uppercase text-muted small mb-2">Halo</p>
            <h3 className="fw-semibold display-6 mb-3">“No one gets left behind.”</h3>
            <p className="text-muted">
              That’s how we build Game Matcher: collaboratively, shipping fast, and supporting each other.
            </p>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className="pb-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {members.map((m) => (
              <div key={m.name} className="col-12 col-md-6 col-lg-4">
                <div className="card card-team h-100 shadow-sm border-0 text-center">
                  <div className="card-body d-flex flex-column align-items-center">
                    <img
                      src={m.img}
                      alt={m.name}
                      width={160}
                      height={160}
                      className="rounded-circle mb-3 border border-3 border-light-subtle"
                      style={{ objectFit: "cover" }}
                    />
                    <h5 className="mb-1">{m.name}</h5>
                    <small className="text-muted mb-3">{m.role}</small>

                    <a
                      href={m.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-gradient px-3 rounded-pill"
                    >
                      <i className="fab fa-github me-2"></i>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Team;







