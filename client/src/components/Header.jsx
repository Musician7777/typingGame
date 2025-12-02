import { useAuth } from "../contexts/AuthContext";
import { LogOut, User, Keyboard } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { Link } from "react-router-dom";

export default function Header() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container">
        <div
          className="flex items-center justify-between"
          style={{ padding: "1.25rem 0" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2" style={{ gap: "0.75rem" }}>
            <div
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                padding: "0.625rem",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-md), 0 0 20px var(--cursor-glow)",
              }}
            >
              <Keyboard size={24} style={{ color: "white" }} />
            </div>
            <Link
              to="/"
              style={{
                fontSize: "1.625rem",
                fontWeight: "800",
                margin: 0,
                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              {import.meta.env.VITE_APP_NAME || "TypeRace"}
            </Link>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4" style={{ gap: "1rem" }}>
            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Info */}
            {currentUser && (
              <>
                <div
                  className="flex items-center gap-2"
                  style={{
                    color: "var(--text-secondary)",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <User size={18} />
                  <span
                    className="text-sm"
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    padding: "0.625rem",
                    borderRadius: "10px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Log out"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--text-error)";
                    e.currentTarget.style.color = "var(--text-error)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-primary)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
