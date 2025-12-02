import { useEffect, useState } from "react";
import { Crown, Trophy, Medal, X, Clock, Target, Zap } from "lucide-react";

const ResultsModal = ({
  isOpen,
  onClose,
  players,
  gameStartTime,
  currentUser,
}) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown size={24} style={{ color: "#ffd700" }} />;
      case 2:
        return <Trophy size={24} style={{ color: "#c0c0c0" }} />;
      case 3:
        return <Medal size={24} style={{ color: "#cd7f32" }} />;
      default:
        return (
          <div
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {position}
          </div>
        );
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1:
        return "#ffd700";
      case 2:
        return "#c0c0c0";
      case 3:
        return "#cd7f32";
      default:
        return "var(--text-secondary)";
    }
  };

  const getCompletionTime = (player) => {
    if (!gameStartTime || !player.finished) return "DNF";

    // Calculate time based on WPM and text length estimate
    // Assuming average word length of 5 characters and using their WPM to estimate completion time
    if (player.wpm > 0) {
      // Rough estimate: if they typed at their average WPM, how long would it take?
      // This is more accurate than using current time since players finish at different times
      const estimatedCharacters = player.wpm || 250; // Fallback to ~50 words * 5 chars
      const timeInMinutes = estimatedCharacters / 5 / player.wpm;
      const timeInSeconds = Math.round(timeInMinutes * 60);
      return `${timeInSeconds}s`;
    }

    // Fallback to position-based estimation
    const baseTime = 30; // Base time for first place
    const positionPenalty = (player.position - 1) * 5; // 5 seconds per position
    return `${baseTime + positionPenalty}s`;
  };

  // Sort players by their final positions
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.position || 999) - (b.position || 999);
    }
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;

    // For unfinished players, sort by progress then WPM
    if (a.progress !== b.progress) {
      return b.progress - a.progress;
    }
    return b.wpm - a.wpm;
  });

  // Assign display positions
  const rankedPlayers = sortedPlayers.map((player, index) => ({
    ...player,
    displayPosition:
      player.position || players.filter((p) => p.finished).length + index + 1,
  }));

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        opacity: showModal ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      onClick={handleClose}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          border: "1px solid var(--border)",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          transform: showModal ? "scale(1)" : "scale(0.95)",
          transition: "transform 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              color: "var(--text-primary)",
            }}
          >
            🏁 Game Results
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <X size={20} />
          </button>
        </div>

        {/* Winner Announcement */}
        {rankedPlayers.length > 0 && rankedPlayers[0].finished && (
          <div
            className="winner-announcement"
            style={{
              textAlign: "center",
              marginBottom: "1.5rem",
              padding: "1rem",
              backgroundColor: "var(--bg-primary)",
              borderRadius: "8px",
              border: "2px solid #ffd700",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <Crown size={24} style={{ color: "#ffd700" }} />
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#ffd700",
                }}
              >
                Winner!
              </span>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>
              {rankedPlayers[0].user.displayName || rankedPlayers[0].user.email}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              {rankedPlayers[0].wpm} WPM • {rankedPlayers[0].accuracy}% accuracy
            </div>
          </div>
        )}

        {/* Results List */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {rankedPlayers.map((player, index) => {
            const isCurrentUser = player.user.uid === currentUser?.uid;
            const position = player.displayPosition;

            return (
              <div
                key={player.id || index}
                className="results-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  backgroundColor: isCurrentUser
                    ? "var(--primary-bg)"
                    : "var(--bg-primary)",
                  borderRadius: "8px",
                  border: isCurrentUser
                    ? "2px solid var(--primary)"
                    : "1px solid var(--border)",
                  gap: "1rem",
                }}
              >
                {/* Position */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor:
                      position <= 3
                        ? getPositionColor(position) + "20"
                        : "var(--bg-secondary)",
                    border: `2px solid ${getPositionColor(position)}`,
                  }}
                >
                  {getPositionIcon(position)}
                </div>

                {/* Player Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: "600", fontSize: "1rem" }}>
                      {player.user.displayName || player.user.email}
                    </span>
                    {isCurrentUser && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          backgroundColor: "var(--primary)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "12px",
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {player.finished
                      ? "Finished"
                      : `${Math.round(player.progress)}% complete`}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Zap size={14} style={{ color: "var(--primary)" }} />
                      <span style={{ fontWeight: "600" }}>{player.wpm}</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        WPM
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Target size={14} style={{ color: "var(--accent)" }} />
                      <span style={{ fontWeight: "600" }}>
                        {player.accuracy}%
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Clock
                        size={14}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <span style={{ fontWeight: "600" }}>
                        {getCompletionTime(player)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            onClick={handleClose}
            className="primary"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
