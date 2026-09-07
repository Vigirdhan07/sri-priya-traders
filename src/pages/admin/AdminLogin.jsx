import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./AdminLogin.css";

function AdminLogin() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  if (loading) {
    return (
      <section className="admin-login-page">
        <div className="admin-login-card">
          <p>Checking login...</p>
        </div>
      </section>
    );
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoggingIn(true);

      await login(
        email.trim(),
        password
      );

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      console.error(
        "Admin login error:",
        loginError
      );

      setError(
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <LockKeyhole size={34} />
        </div>

        <div className="admin-login-brand">
          <Sparkles size={16} />
          <span>SRI PRIYA TRADERS</span>
          <Sparkles size={16} />
        </div>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Sign in to manage your store.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="admin-email">
              Email Address
            </label>

            <div className="admin-input-wrapper">
              <Mail size={19} />

              <input
                id="admin-email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loggingIn}
          >
            <LogIn size={19} />

            {loggingIn
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>🔐 Secure Admin Area</span>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;