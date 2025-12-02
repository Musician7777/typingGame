import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Palette, ChevronDown } from "lucide-react";

export default function ThemeSelector() {
  const { currentTheme, changeTheme, themes, getCurrentThemeInfo } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeInfo = getCurrentThemeInfo();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: "0.875rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-primary)";
        }}
      >
        <Palette size={16} />
        <span style={{ minWidth: "80px", textAlign: "left" }}>
          {currentThemeInfo.name}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "4px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "8px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              zIndex: 20,
              minWidth: "200px",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              // Hide scrollbar for all browsers
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE and Edge
              WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
            }}
            // Hide scrollbar for Chrome, Safari and Opera
            className="theme-dropdown"
          >
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: currentTheme === theme.id ? "4px" : "0",
                  margin: currentTheme === theme.id ? "2px" : "0",
                  ...(currentTheme === theme.id && {
                    backgroundColor: "var(--primary)",
                    color: "white",
                  }),
                }}
                onMouseEnter={(e) => {
                  if (currentTheme !== theme.id) {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== theme.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {/* Theme Color Preview */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    border: "2px solid var(--border-primary)",
                    flexShrink: 0,
                  }}
                />

                {/* Theme Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      marginBottom: "2px",
                    }}
                  >
                    {theme.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      color:
                        currentTheme === theme.id
                          ? "rgba(255,255,255,0.8)"
                          : "var(--text-muted)",
                    }}
                  >
                    {theme.description}
                  </div>
                </div>

                {/* Current Indicator */}
                {currentTheme === theme.id && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
