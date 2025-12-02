import { useEffect, useRef, useState } from "react";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { useAuth } from "../contexts/AuthContext";
import { Users, Play, RotateCcw, Crown, Trophy, Medal } from "lucide-react";
import MultiplayerResultsModal from "./MultiplayerResultsModal";

export default function MultiplayerRoom({ roomId }) {
  const { currentUser } = useAuth();
  const {
    room,
    players,
    gameState,
    text,
    userInput,
    isActive,
    isFinished,
    gameEnded,
    wpm,
    accuracy,
    position,
    timeElapsed,
    handleInput,
    startGame,
    resetGame,
    getCharacterClass,
    hasTrail,
    connected,
  } = useMultiplayerGame(roomId);

  const containerRef = useRef(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    if (gameEnded) {
      setShowResultsModal(true);
    } else {
      setShowResultsModal(false);
    }
  }, [gameEnded]);

  // Handle direct typing on the text without input field
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== "playing" || isFinished) return;

      // Prevent default browser shortcuts that might interfere
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Handle backspace
      if (e.key === "Backspace") {
        e.preventDefault();
        if (userInput.length > 0) {
          handleInput(userInput.slice(0, -1));
        }
        return;
      }

      // Handle regular character input
      if (e.key.length === 1) {
        e.preventDefault();
        handleInput(userInput + e.key);
      }
    };

    // Add event listener when game is playing
    if (gameState === "playing") {
      document.addEventListener("keydown", handleKeyDown);
      // Focus the container for better UX
      if (containerRef.current) {
        containerRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, userInput, handleInput, isFinished]);

  const getPositionIcon = (pos) => {
    switch (pos) {
      case 1:
        return <Crown size={16} style={{ color: "#ffd700" }} />;
      case 2:
        return <Trophy size={16} style={{ color: "#c0c0c0" }} />;
      case 3:
        return <Medal size={16} style={{ color: "#cd7f32" }} />;
      default:
        return null;
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

  if (!connected) {
    return (
      <div
        className="container"
        style={{ padding: "2rem 1rem", textAlign: "center" }}
      >
        <div className="card" style={{ padding: "2rem" }}>
          <h2>Connecting to room...</h2>
          <div className="text-muted">
            Please wait while we connect you to the game.
          </div>
        </div>
      </div>
    );
  }

  // Create sorted rankings for results
  const sortedPlayers = [...players].sort((a, b) => {
    // First, sort by finished status and position for finished players
    if (a.finished && b.finished) {
      return a.position - b.position;
    }
    if (a.finished) return -1;
    if (b.finished) return 1;

    // For unfinished players, sort by progress, then by WPM
    if (a.progress !== b.progress) {
      return b.progress - a.progress;
    }
    return b.wpm - a.wpm;
  });

  // Assign final ranking positions for display
  const rankedPlayers = sortedPlayers.map((player, index) => ({
    ...player,
    finalPosition: player.position || index + 1,
  }));

  return (
    <div
      ref={containerRef}
      className="container"
      style={{
        padding: "2rem 1rem",
        maxWidth: "1000px",
        outline: "none",
      }}
      tabIndex={-1}
    >
      {/* Room Header */}
      <div className="card mb-4" style={{ padding: "1rem" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} style={{ color: "var(--primary)" }} />
            <h2 style={{ margin: 0 }}>Room: {roomId}</h2>
            <span className="text-muted">
              ({players.length}/{import.meta.env.VITE_MAX_PLAYERS || 4} players)
            </span>
          </div>

          <div className="flex gap-2">
            {gameState === "waiting" && players.length >= 1 && (
              <button onClick={startGame} className="primary">
                <Play size={16} />
                Start Game
              </button>
            )}

            {gameState === "finished" && (
              <button onClick={resetGame} className="success">
                <RotateCcw size={16} />
                Play Again
              </button>
            )}

            <div
              style={{
                padding: "0.75rem",
                backgroundColor:
                  gameState === "playing"
                    ? "var(--accent)"
                    : gameState === "finished"
                    ? "var(--text-success)"
                    : "var(--secondary)",
                color: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {gameState === "waiting"
                ? "Waiting"
                : gameState === "playing"
                ? "Playing"
                : "Finished"}
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="card mb-4" style={{ padding: "1rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Players</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {players.map((player) => (
            <div
              key={player.id}
              style={{
                padding: "1rem",
                border: "1px solid var(--border-primary)",
                borderRadius: "6px",
                backgroundColor:
                  player.user.uid === currentUser?.uid
                    ? "var(--bg-secondary)"
                    : "transparent",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: "500" }}>
                    {player.user.displayName || player.user.email}
                  </span>
                  {player.user.uid === currentUser?.uid && (
                    <span
                      className="text-xs"
                      style={{
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
                <div className="flex items-center gap-1">
                  {player.finished && player.position ? (
                    // Final position for finished players
                    <>
                      {getPositionIcon(player.position)}
                      <span
                        style={{
                          color: getPositionColor(player.position),
                          fontWeight: "600",
                        }}
                      >
                        #{player.position}
                      </span>
                    </>
                  ) : gameState === "playing" && player.temporaryPosition ? (
                    // Live temporary position during gameplay
                    <span
                      style={{
                        color:
                          player.temporaryPosition <= 3
                            ? getPositionColor(player.temporaryPosition)
                            : "var(--text-secondary)",
                        fontSize: "0.875rem",
                        fontWeight:
                          player.temporaryPosition <= 3 ? "600" : "normal",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {player.temporaryPosition <= 3 &&
                        getPositionIcon(player.temporaryPosition)}
                      #{player.temporaryPosition}
                    </span>
                  ) : gameState === "playing" ? (
                    // Fallback for players without position yet
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        fontStyle: "italic",
                      }}
                    >
                      Racing...
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>WPM: {player.wpm}</span>
                <span>Accuracy: {player.accuracy}%</span>
              </div>

              {gameState === "playing" && (
                <div
                  style={{
                    width: "100%",
                    height: "4px",
                    backgroundColor: "var(--border-primary)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${player.progress}%`,
                      height: "100%",
                      backgroundColor: player.finished
                        ? "var(--text-success)"
                        : "var(--primary)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Area */}
      {gameState !== "waiting" && (
        <>
          {/* Stats */}
          <div className="flex gap-4 mb-4" style={{ justifyContent: "center" }}>
            <div
              className="card"
              style={{ padding: "1rem", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--primary)",
                }}
              >
                {wpm}
              </div>
              <div className="text-sm text-muted">WPM</div>
            </div>

            <div
              className="card"
              style={{ padding: "1rem", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--accent)",
                }}
              >
                {accuracy}%
              </div>
              <div className="text-sm text-muted">Accuracy</div>
            </div>

            <div
              className="card"
              style={{ padding: "1rem", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--secondary)",
                }}
              >
                {timeElapsed}s
              </div>
              <div className="text-sm text-muted">Time</div>
            </div>

            {position && (
              <div
                className="card"
                style={{ padding: "1rem", textAlign: "center" }}
              >
                <div
                  className="flex items-center justify-center gap-1"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: getPositionColor(position),
                  }}
                >
                  {getPositionIcon(position)}#{position}
                </div>
                <div className="text-sm text-muted">Position</div>
              </div>
            )}
          </div>

          {/* Text Display */}
          <div
            className="card mb-4"
            style={{
              padding: "2rem",
              fontSize: "1.5rem",
              lineHeight: "1.8",
              fontFamily: "var(--font-mono, monospace)",
              minHeight: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0",
              }}
            >
              {(() => {
                const words = text.split(/(\s+)/);
                let charIndex = 0;

                return words.map((word, wordIdx) => (
                  <span
                    key={wordIdx}
                    style={{
                      display: "inline-block",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {word.split("").map((char, charIdx) => {
                      const currentIndex = charIndex++;
                      const state = getCharacterClass(currentIndex);
                      const isCurrent = state === "current";
                      const isTrail = hasTrail(currentIndex);

                      const color =
                        state === "correct"
                          ? "var(--text-correct)"
                          : state === "incorrect"
                          ? "var(--text-incorrect)"
                          : state === "current"
                          ? "var(--text-current)"
                          : "var(--text-pending)";

                      return (
                        <span
                          key={charIdx}
                          style={{
                            color,
                            backgroundColor: isCurrent
                              ? "var(--cursor-color)"
                              : "transparent",
                            borderRadius: isCurrent ? "2px" : "0",
                            padding: isCurrent ? "0 1px" : "0",
                            transition: "all 0.1s ease",
                            textShadow: isTrail
                              ? "0 0 4px var(--trail-shadow), 0 0 12px var(--trail-glow-strong), 0 0 30px var(--trail-glow), 0 0 48px var(--trail-glow)"
                              : "none",
                            animation: isTrail
                              ? "typingTrail 0.7s ease-out"
                              : "none",
                          }}
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      );
                    })}
                  </span>
                ));
              })()}
            </div>
          </div>

          {/* Typing Instructions */}
          {gameState === "playing" && !isFinished && (
            <div
              className="card"
              style={{ padding: "1rem", textAlign: "center" }}
            >
              <div className="text-sm text-muted">
                Start typing directly! Press <strong>Backspace</strong> to
                correct mistakes.
              </div>
            </div>
          )}
        </>
      )}

      {/* Waiting Message */}
      {gameState === "waiting" && (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "1rem" }}>Waiting for game to start</h3>
          <div className="text-muted">
            {players.length === 0
              ? "Waiting for players to join..."
              : players.length === 1
              ? "Need at least 1 player to start."
              : 'Ready to play! Click "Start Game" when ready.'}
          </div>
        </div>
      )}

      {/* Results Modal */}
      <MultiplayerResultsModal
        isOpen={showResultsModal}
        onClose={() => {
          setShowResultsModal(false);
          if (gameState === "finished") {
            resetGame();
          }
        }}
        players={rankedPlayers}
        currentUser={currentUser}
        onPlayAgain={resetGame}
      />
    </div>
  );
}
