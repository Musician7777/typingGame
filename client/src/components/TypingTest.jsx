import { useEffect, useRef, useState } from "react";
import { useTypingGame } from "../hooks/useTypingGame";
import GameSettingsModal from "./GameSettingsModal";
import { Clock, Hash } from "lucide-react";

export default function TypingTest() {
  const [showSettings, setShowSettings] = useState(true);
  const [gameSettings, setGameSettings] = useState({ mode: "words", value: 50 });

  const {
    text,
    userInput,
    currentIndex,
    isActive,
    isFinished,
    wpm,
    accuracy,
    timeElapsed,
    timeRemaining,
    settings,
    handleInput,
    resetGame,
    getCharacterClass,
    hasTrail,
  } = useTypingGame(gameSettings);

  const containerRef = useRef(null);

  const handleStartGame = (newSettings) => {
    setGameSettings(newSettings);
    setShowSettings(false);
    // Reset game will be triggered by useEffect when settings change
  };

  const handleResetWithSettings = () => {
    setShowSettings(true);
    resetGame();
  };

  // Handle direct typing on the text without input field
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Tab to reset game
      if (e.key === "Tab") {
        e.preventDefault();
        handleResetWithSettings();
        return;
      }

      if (isFinished) return;

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

    // Add event listener when component mounts
    if (!showSettings) {
      document.addEventListener("keydown", handleKeyDown);
    }

    // Focus the container for better UX
    if (containerRef.current) {
      containerRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userInput, handleInput, isFinished, showSettings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {showSettings && (
        <GameSettingsModal
          onStart={handleStartGame}
          onClose={() => { }}
          showCancel={false}
        />
      )}

      <div
        ref={containerRef}
        className="container"
        style={{
          padding: "2rem 1rem",
          maxWidth: "800px",
          outline: "none",
          opacity: showSettings ? 0.5 : 1,
          pointerEvents: showSettings ? "none" : "all",
        }}
        tabIndex={0}
      >
        {/* Game Info Banner */}
        <div
          className="card"
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            background: "linear-gradient(135deg, var(--primary-light) 0%, var(--bg-card) 100%)",
          }}
        >
          {settings.mode === "words" ? (
            <>
              <Hash size={20} style={{ color: "var(--primary)" }} />
              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                Word Count: {settings.value} words
              </span>
            </>
          ) : (
            <>
              <Clock size={20} style={{ color: "var(--primary)" }} />
              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                Time Limit: {settings.value} minute{settings.value > 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4" style={{ justifyContent: "center" }}>
          <div className="card stat-card">
            <div className="stat-value">{wpm}</div>
            <div className="stat-label">WPM</div>
          </div>

          <div className="card stat-card">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>

          {settings.mode === "time" ? (
            <div className="card stat-card">
              <div className="stat-value" style={{ color: timeRemaining <= 10 ? "var(--text-error)" : "var(--primary)" }}>
                {formatTime(timeRemaining || 0)}
              </div>
              <div className="stat-label">Time Left</div>
            </div>
          ) : (
            <div className="card stat-card">
              <div className="stat-value">{timeElapsed}s</div>
              <div className="stat-label">Time</div>
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
            position: "relative",
            minHeight: "120px",
            maxHeight: "400px",
            overflowY: "auto",
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

        {/* Completion Results */}
        {isFinished && (
          <div
            className="card"
            style={{ padding: "2rem", textAlign: "center", marginBottom: "1rem" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "var(--primary)" }}>
              Test Complete!
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div className="stat-card">
                <div className="stat-value">{wpm}</div>
                <div className="stat-label">Words Per Minute</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{accuracy}%</div>
                <div className="stat-label">Accuracy</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">
                  {settings.mode === "time" ? formatTime(settings.value * 60) : `${timeElapsed}s`}
                </div>
                <div className="stat-label">
                  {settings.mode === "time" ? "Time Used" : "Time Taken"}
                </div>
              </div>
            </div>

            <button
              onClick={handleResetWithSettings}
              className="primary"
              style={{ padding: "0.75rem 2rem" }}
            >
              Try Another Test
            </button>
          </div>
        )}

        {/* Typing Instructions */}
        {!isFinished ? (
          <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
            <div className="text-sm text-muted">
              Start typing directly! Press <strong>Backspace</strong> to correct
              mistakes, <strong>Tab</strong> to change settings.
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
            <div className="text-lg" style={{ marginBottom: "0.5rem" }}>
              🎉 Test Complete!
            </div>
            <div className="text-sm text-muted">
              Press <strong>Tab</strong> to start a new test
            </div>
          </div>
        )}
      </div>
    </>
  );
}
