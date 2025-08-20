import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="footer-gradient text-white pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-6">
            <h5 className="fw-bold mb-3">Game Matcher</h5>
            <p className="mb-0 opacity-90">
              A smart way to discover games you’ll love, based on your tastes and platforms.
            </p>
          </div>

          <div className="col-6 col-lg-3">
            <h6 className="fw-semibold mb-3">About</h6>
            <ul className="list-unstyled m-0">
              <li className="mb-2"><Link className="text-white text-decoration-none opacity-90" to="/about">About us</Link></li>
              <li className="mb-2"><Link className="text-white text-decoration-none opacity-90" to="/team">Team</Link></li>
              <li><Link className="text-white text-decoration-none opacity-90" to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-3">
            <h6 className="fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled m-0">
              <li className="mb-2"><a className="text-white text-decoration-none opacity-90" href="/terms">Terms</a></li>
              <li className="mb-2"><a className="text-white text-decoration-none opacity-90" href="/privacy">Privacy</a></li>
              <li><a className="text-white text-decoration-none opacity-90" href="/support">Support</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-white-50 my-4" />

        <div className="d-flex align-items-center justify-content-between">
          <small className="opacity-75">© {new Date().getFullYear()} Game Matcher. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







