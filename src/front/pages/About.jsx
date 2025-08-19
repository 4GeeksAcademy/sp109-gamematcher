import React from "react";
import { Link } from "react-router-dom";
import GameMatcherLogo from "../assets/img/GameMatcherLight.png";

const About = () => {
  const team = [
    {
      name: "Xavier Guas",
      role: "Full-Stack Developer",
      avatar: "/Avatars/Xavier.png",
      github: "https://github.com/xavierguasb",
    },
    {
      name: "Marcel Reig",
      role: "Full-Stack Developer",
      avatar: "/Avatars/Marcel.png",
      github: "https://github.com/MarcelReig",
    },
    {
      name: "Nancy Acevedo",
      role: "Full-Stack Developer",
      avatar: "/Avatars/Nancy.png",
      github: "https://github.com/Nanceap",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section
        className="text-white d-flex align-items-center"
        style={{
          background: "linear-gradient(50deg, #6e00ff 0%, #bb00ff 100%)",
          minHeight: "360px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          <h1 className="display-6 fw-bold mb-3">About us</h1>
          <p className="lead mb-4" style={{ maxWidth: 860 }}>
            We’re building Game Matcher so gamers discover what to play next —
            faster, smarter, and together.
          </p>
          <Link to="/contact" className="btn btn-light rounded-pill px-4">
            Contact us
          </Link>
        </div>

        {/* Watermark / logo derecho con blur (tus valores) */}
        <img
          src={GameMatcherLogo}
          alt="Game Matcher watermark"
          style={{
            position: "absolute",
            right: "5vw",
            bottom: "-80px",
            width: "500px",
            maxWidth: "34vw",
            opacity: 0.22,
            filter: "blur(1px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      </section>

      {/* OUR STORY */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="h3 fw-bold mb-3">Our story</h2>
          <p className="mb-3">
            Game Matcher started as our final project in a full-stack course. We
            bonded over our love for games and set out to make something we
            wished existed: a tool that learns your favorite platforms and
            genres, and recommends titles you’ll actually want to play.
          </p>
          <p className="mb-0">
            Since then, we’ve kept polishing the experience — clean design,
            responsive UI, and a data-driven recommendation engine powered by
            your preferences. Our goal is simple: help you spend less time
            searching and more time playing.
          </p>
        </div>
      </section>

      {/* TEAM CARDS */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column align-items-center text-center mb-4">
            <h2 className="h3 fw-bold mb-2">Meet the team</h2>
            <p className="text-muted mb-0">
              “The right party makes the adventure unforgettable.”
            </p>
          </div>

          <div className="row g-4">
            {team.map((m) => (
              <div className="col-12 col-md-4" key={m.name}>
                <div className="card h-100 shadow-sm border-0 text-center">
                  <div className="card-body d-flex flex-column align-items-center">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      width={140}
                      height={140}
                      className="rounded-circle mb-3"
                      style={{
                        objectFit: "cover",
                        boxShadow: "0 12px 30px rgba(0,0,0,.12)",
                      }}
                    />
                    <h6 className="mb-0">{m.name}</h6>
                    <small className="text-muted mb-3">{m.role}</small>

                    {/* Botón idéntico a Team.jsx (gradiente + FA) */}
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noreferrer"
                      className="btn rounded-pill px-3 text-white"
                      style={{
                        background: "linear-gradient(45deg, #6e00ff, #bb00ff)",
                        border: "none",
                        transition: "all .3s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
                      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                    >
                      <i className="fa-brands fa-github me-2" />
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

export default About;










