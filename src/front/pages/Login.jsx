import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginUser, isAuthenticated } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser(nickname, password);
    } catch (err) {
      setError(err.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Sign up failed");
      await loginUser(nickname, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="auth-wrapper">
      {/* decorative hexes */}
      <span className="hex hex--1" />
      <span className="hex hex--2" />
      <span className="hex hex--3" />
      <span className="hex hex--4" />
      <span className="hex hex--5" />
      <span className="hex hex--6" />

      <div className="container py-5">
        <div className="row justify-content-center align-items-center g-5">
          {/* Left: quote */}
          <div className="col-lg-6">
            <div className="auth-hero">
              <p className="auth-quote">
                The bigger your goal, the sweeter the taste of victory.
                <small>— God of War</small>
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="col-lg-5 col-xl-4">
            <div className="auth-card p-4 p-md-5">
              <div className="mb-3 text-center">
                <span className="auth-brand">
                  <i className="fa-solid fa-gamepad"></i> GameMatcher
                </span>
              </div>

              <h3 className="text-center mb-4">
                {mode === "login" ? "Sign in" : "Create account"}
              </h3>

              <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
                <div className="mb-3 input-icon">
                  <span className="icon">
                    <i className="fa-regular fa-user"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="your_nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </div>

                {mode === "signup" && (
                  <div className="mb-3 input-icon">
                    <span className="icon">
                      <i className="fa-regular fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="mb-3 input-icon">
                  <span className="icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Gradient main button */}
                <button
                  type="submit"
                  className="btn-auth btn-gradient w-100 py-2"
                  disabled={loading}
                >
                  {loading
                    ? mode === "login" ? "Signing in..." : "Creating account..."
                    : mode === "login" ? "Sign in" : "Sign up"}
                </button>

                {mode === "signup" ? (
                  <div className="text-center small text-muted mt-3">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="btn btn-link link-auth p-0 align-baseline"
                      onClick={() => setMode("login")}
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <div className="text-center small text-muted mt-3">
                    Not registered?{" "}
                    <button
                      type="button"
                      className="btn btn-link link-auth p-0 align-baseline"
                      onClick={() => setMode("signup")}
                    >
                      Create account
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



