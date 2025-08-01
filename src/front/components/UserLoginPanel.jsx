import React, { useState } from "react";

export const UserLoginPanel = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = mode === "signup" ? "/api/user-signup" : "/api/user-login";

    try {
      const resp = await fetch(import.meta.env.VITE_BACKEND_URL + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setMessage(data.msg || "Something went wrong");
        return;
      }

      if (mode === "signup") {
        setMessage("Registered successfully! You can now log in.");
        setMode("login");
      } else {
        sessionStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setMessage("Login successful!");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setMessage("Logged out successfully");
  };

  return (
    <div className="card p-4 mt-3" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h5 className="text-center mb-3">{mode === "signup" ? "Sign Up" : "Login"}</h5>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100" type="submit">
          {mode === "signup" ? "Register" : "Login"}
        </button>
      </form>

      {message && <div className="alert alert-info mt-3">{message}</div>}

      <div className="text-center mt-3">
        {mode === "signup" ? (
          <span>
            Already have an account?{" "}
            <button className="btn btn-link p-0" onClick={() => setMode("login")}>
              Login
            </button>
          </span>
        ) : (
          <span>
            Don't have an account?{" "}
            <button className="btn btn-link p-0" onClick={() => setMode("signup")}>
              Sign up
            </button>
          </span>
        )}
      </div>

      {token && (
        <div className="text-center mt-3">
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};


