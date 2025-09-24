import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Auth error:", error);
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password");
          break;
        case "auth/email-already-in-use":
          setError("An account with this email already exists");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address");
          break;
        default:
          setError(error.message || "An error occurred");
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in with Google");
    }

    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "1.5rem",
        }}
      >
        {isLogin ? "Sign In" : "Create Account"}
      </h2>

      {error && (
        <div
          style={{
            backgroundColor: "var(--text-error)",
            color: "white",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        {!isLogin && (
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required={!isLogin}
              placeholder="Enter your name"
              style={{ width: "100%" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ width: "100%", paddingRight: "3rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="primary"
          style={{ width: "100%", marginBottom: "1rem" }}
        >
          {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: "100%",
          marginBottom: "1rem",
          backgroundColor: "#4285f4",
          color: "white",
          border: "none",
        }}
      >
        Continue with Google
      </button>

      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "0.875rem",
          }}
        >
          {isLogin
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
