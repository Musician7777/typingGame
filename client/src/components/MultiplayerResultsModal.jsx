import { Trophy, Crown, Medal, X, RotateCcw } from "lucide-react";

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
        <span
          style={{ width: "24px", textAlign: "center", fontWeight: "bold" }}
        >
          #{position}
        </span>
      );
  }
};

const getPositionColor = (pos) => {
  switch (pos) {
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

export default function MultiplayerResultsModal({
  isOpen,
  onClose,
  players,
  currentUser,
  onPlayAgain,
}) {
  if (!isOpen) return null;

  // No need to sort here if rankedPlayers are passed from MultiplayerRoom
  const rankedPlayers = players;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <button onClick={onClose} className="modal-close-button">
          <X size={24} />
        </button>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem 0" }}>🏁 Race Results</h2>
          <div className="text-muted" style={{ fontSize: "0.9rem" }}>
            {rankedPlayers.filter((p) => p.finished).length} of{" "}
            {rankedPlayers.length} players finished
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          {rankedPlayers.map((player) => {
            const displayPosition = player.finalPosition;
            const isWinner = displayPosition <= 3;

            return (
              <div
                key={player.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  backgroundColor:
                    player.user.uid === currentUser?.uid
                      ? "var(--bg-secondary)"
                      : "var(--bg-primary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${getPositionColor(displayPosition)}`,
                  boxShadow: isWinner ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getPositionIcon(displayPosition)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {player.user.displayName || player.user.email}
                      {player.user.uid === currentUser?.uid && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
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
                    <div className="text-sm text-muted">
                      {player.finished
                        ? `✅ Finished`
                        : `${Math.round(player.progress)}% complete`}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: isWinner ? "1.1rem" : "1rem",
                      color: isWinner
                        ? getPositionColor(displayPosition)
                        : "inherit",
                    }}
                  >
                    {player.wpm} WPM
                  </div>
                  <div className="text-sm text-muted">
                    {player.accuracy}% accuracy
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={onPlayAgain} className="primary">
            <RotateCcw size={16} />
            Play Again
          </button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 8px;
          position: relative;
          width: 90%;
          border: 2px solid var(--primary);
        }
        .modal-close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }
        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .gap-1 {
          gap: 0.25rem;
        }
        .gap-3 {
          gap: 0.75rem;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-muted {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
