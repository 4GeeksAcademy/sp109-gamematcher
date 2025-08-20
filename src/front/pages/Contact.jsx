// src/front/pages/Contact.jsx
import React from "react";
import GameMatcherLogo from "../assets/img/GameMatcherLight.png";

const Contact = () => {
  return (
    <>
      {/* HERO con degradado, rombos y watermark */}
      <section
        className="text-white d-flex align-items-center text-center"
        style={{
          background: "linear-gradient(50deg, #6e00ff 0%, #bb00ff 100%)",
          minHeight: "320px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          <h1 className="display-5 fw-bold mb-3">Contact us</h1>
          <p className="lead mb-0" style={{ maxWidth: 760, margin: "0 auto" }}>
            Send us a message and we’ll get back to you as soon as possible.
          </p>
        </div>

        {/* Watermark / logo con blur */}
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

        {/* Rombos decorativos */}
        <div
          style={{
            position: "absolute",
            top: "28%",
            left: "10%",
            width: "62px",
            height: "62px",
            backgroundColor: "#00e0ff",
            transform: "rotate(45deg)",
            opacity: 0.7,
          }}
        />

      </section>

      {/* FORM SECTION */}
      <section className="py-5 bg-white">
        <div className="container" style={{ maxWidth: 960 }}>
          

          <form
            className="row g-4"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            {/* First / Last name */}
            <div className="col-md-6">
              <label className="form-label">First name</label>
              <input
                type="text"
                className="form-control"
                placeholder="First name"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Last name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Last name"
                required
              />
            </div>

            {/* Email / Phone */}
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+40-745-234-567"
              />
            </div>

            {/* Subject */}
            <div className="col-12">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder="Custom project"
                required
              />
            </div>

            {/* Message */}
            <div className="col-12">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows="6"
                placeholder="Tell us a few words …"
                required
              ></textarea>
            </div>

            {/* Submit */}
            <div className="col-12 d-flex flex-column align-items-center">
              <button
                type="submit"
                className="btn rounded-pill px-4 py-2 text-white"
                style={{
                  background: "linear-gradient(45deg, #6e00ff, #bb00ff)",
                  border: "none",
                  boxShadow: "0 12px 30px rgba(110,0,255,.25)",
                  fontWeight: 700,
                  minWidth: 220,
                }}
              >
                Send your message
              </button>
              <small className="text-muted mt-3">
                We’ll get back to you in 24–48 h.
              </small>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;




