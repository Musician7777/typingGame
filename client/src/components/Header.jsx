import { useAuth } from "../contexts/AuthContext";
import { LogOut, User, Keyboard } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

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
      }}
    >
      <div className="container">
        <div
          className="flex items-center justify-between"
          style={{ padding: "1rem 0" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Keyboard size={24} style={{ color: "var(--primary)" }} />
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              {import.meta.env.VITE_APP_NAME || "TypeRace"}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Info */}
            {currentUser && (
              <>
                <div
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <User size={16} />
                  <span className="text-sm">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    transition: "color 0.2s ease",
                  }}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
