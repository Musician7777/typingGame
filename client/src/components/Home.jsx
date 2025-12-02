import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard, Users, Play, Plus, ArrowRight, Zap, Target, Trophy } from "lucide-react";
import TypewriterText from "./TypewriterText";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
        }/api/room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        navigate(`/multiplayer/${data.roomId}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Make sure the server is running.");
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/multiplayer/${roomId.trim()}`);
    }
  };

  return (
    <div
      className="container"
      style={{ padding: "4rem 1.5rem", maxWidth: "680px" }}
    >
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            padding: "0.625rem 1.25rem",
            background: "linear-gradient(135deg, var(--primary-light) 0%, var(--bg-secondary) 100%)",
            borderRadius: "50px",
            border: "1px solid var(--border-primary)",
          }}
        >
          <Keyboard size={20} style={{ color: "var(--primary)" }} />
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: "700",
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Welcome to TypeRace
          </span>
        </div>

        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            margin: "0 0 1.25rem 0",
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            minHeight: "3.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          <TypewriterText
            text={import.meta.env.VITE_APP_NAME || "TypeRace"}
            speed={100}
            startDelay={0}
            showCursor={true}
          />
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            margin: "0",
            lineHeight: 1.7,
            fontWeight: "500",
          }}
        >
          Master your typing speed and compete with friends in real-time multiplayer races
        </p>
      </div>

      {/* Game Modes */}
      <div
        style={{
          display: "grid",
          gap: "1.25rem",
          marginBottom: "3rem",
        }}
      >
        {/* Single Player */}
        <div
          className="card"
          style={{
            padding: "2rem",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "2px solid var(--border-primary)",
            position: "relative",
            overflow: "hidden",
          }}
          onClick={() => navigate("/practice")}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-xl), 0 0 30px var(--cursor-glow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-lg)";
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3"
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              <div
                style={{
                  padding: "1rem",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                  borderRadius: "12px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-md), 0 0 20px var(--cursor-glow)",
                }}
              >
                <Play size={24} fill="white" />
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1.375rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Practice Mode
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9375rem",
                    fontWeight: "500",
                  }}
                >
                  Improve your typing skills solo
                </p>
              </div>
            </div>
            <ArrowRight
              size={24}
              style={{
                color: "var(--text-muted)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Multiplayer Section */}
        <div
          className="card"
          style={{
            padding: "2rem",
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light) 100%)",
          }}
        >
          <div
            className="flex items-center gap-3 mb-4"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                borderRadius: "12px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-md), 0 0 20px hsla(142, 76%, 36%, 0.3)",
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.375rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                Multiplayer Race
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9375rem",
                  fontWeight: "500",
                }}
              >
                Compete with up to {import.meta.env.VITE_MAX_PLAYERS || 4} players in real-time
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Create Room */}
            <button
              onClick={createRoom}
              disabled={loading}
              className="primary"
              style={{ width: "100%", fontSize: "1rem", padding: "1rem 1.5rem" }}
            >
              <Plus size={20} />
              {loading ? "Creating..." : "Create New Room"}
            </button>

            {/* Join Room - Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                margin: "0.5rem 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "var(--border-secondary)",
                }}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Or
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "var(--border-secondary)",
                }}
              />
            </div>

            {/* Join Room */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                style={{ flex: 1, fontSize: "0.9375rem" }}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              />
              <button
                onClick={joinRoom}
                disabled={!roomId.trim()}
                className="success"
                style={{ padding: "0.875rem 1.75rem" }}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div
        className="card"
        style={{
          padding: "2rem",
          background: "var(--bg-card)",
        }}
      >
        <h3
          style={{
            margin: "0 0 1.75rem 0",
            fontSize: "1.25rem",
            textAlign: "center",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          Why TypeRace?
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary-light)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "0.75rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Zap size={40} style={{ color: "var(--primary)" }} />
            </div>
            <div
              className="text-sm"
              style={{ fontWeight: "600", color: "var(--text-primary)" }}
            >
              Real-time WPM
            </div>
          </div>
          <div
            style={{
              padding: "1rem",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary-light)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "0.75rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Target size={40} style={{ color: "var(--accent)" }} />
            </div>
            <div
              className="text-sm"
              style={{ fontWeight: "600", color: "var(--text-primary)" }}
            >
              Accuracy Tracking
            </div>
          </div>
          <div
            style={{
              padding: "1rem",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary-light)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "0.75rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Trophy size={40} style={{ color: "hsl(45, 100%, 48%)" }} />
            </div>
            <div
              className="text-sm"
              style={{ fontWeight: "600", color: "var(--text-primary)" }}
            >
              Live Rankings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
