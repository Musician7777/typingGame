import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard, Users, Play, Plus, ArrowRight } from "lucide-react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
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
      style={{ padding: "3rem 1rem", maxWidth: "600px" }}
    >
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Keyboard size={48} style={{ color: "var(--primary)" }} />
        </div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            margin: "0 0 1rem 0",
            color: "var(--text-primary)",
          }}
        >
          {import.meta.env.VITE_APP_NAME || "TypeRace"}
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
            margin: "0 0 2rem 0",
            lineHeight: 1.6,
          }}
        >
          Test your typing speed and compete with friends in real-time
          multiplayer races.
        </p>
      </div>

      {/* Game Modes */}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {/* Single Player */}
        <div
          className="card"
          style={{
            padding: "2rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "2px solid var(--border-primary)",
          }}
          onClick={() => navigate("/practice")}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "var(--primary)",
                  borderRadius: "8px",
                  color: "white",
                }}
              >
                <Play size={20} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>
                  Practice Mode
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Improve your typing skills solo
                </p>
              </div>
            </div>
            <ArrowRight size={20} style={{ color: "var(--text-muted)" }} />
          </div>
        </div>

        {/* Multiplayer Section */}
        <div className="card" style={{ padding: "2rem" }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "var(--accent)",
                borderRadius: "8px",
                color: "white",
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>
                Multiplayer Race
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Compete with up to {import.meta.env.VITE_MAX_PLAYERS || 4}{" "}
                players in real-time
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Create Room */}
            <button
              onClick={createRoom}
              disabled={loading}
              className="primary"
              style={{ width: "100%" }}
            >
              <Plus size={16} />
              {loading ? "Creating..." : "Create New Room"}
            </button>

            {/* Join Room */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              />
              <button
                onClick={joinRoom}
                disabled={!roomId.trim()}
                className="success"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          Features
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
            <div className="text-sm">Real-time WPM</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎯</div>
            <div className="text-sm">Accuracy Tracking</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
            <div className="text-sm">Multiplayer Races</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
            <div className="text-sm">Live Rankings</div>
          </div>
        </div>
      </div>
    </div>
  );
}
