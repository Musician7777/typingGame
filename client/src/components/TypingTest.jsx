import { useEffect, useRef } from "react";
import { useTypingGame } from "../hooks/useTypingGame";

export default function TypingTest() {
  const {
    text,
    userInput,
    currentIndex,
    isActive,
    isFinished,
    wpm,
    accuracy,
    timeElapsed,
    handleInput,
    resetGame,
    getCharacterClass,
  } = useTypingGame();

  const containerRef = useRef(null);

  // Handle direct typing on the text without input field
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Tab to reset game
      if (e.key === "Tab") {
        e.preventDefault();
        resetGame();
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
    document.addEventListener("keydown", handleKeyDown);

    // Focus the container for better UX
    if (containerRef.current) {
      containerRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userInput, handleInput, isFinished, resetGame]);

  return (
    <div
      ref={containerRef}
      className="container"
      style={{
        padding: "2rem 1rem",
        maxWidth: "800px",
        outline: "none",
      }}
      tabIndex={0}
    >
      {/* Stats */}
      <div className="flex gap-4 mb-4" style={{ justifyContent: "center" }}>
        <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
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

        <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
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

        <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
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
      </div>

      {/* Text Display */}
      <div
        className="card mb-4"
        style={{
          padding: "2rem",
          fontSize: "1.2rem",
          lineHeight: "1.8",
          fontFamily: "var(--font-mono, monospace)",
          position: "relative",
          minHeight: "120px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2px",
          }}
        >
          {text.split("").map((char, index) => (
            <span
              key={index}
              style={{
                color:
                  getCharacterClass(index) === "correct"
                    ? "var(--text-correct)"
                    : getCharacterClass(index) === "incorrect"
                    ? "var(--text-incorrect)"
                    : getCharacterClass(index) === "current"
                    ? "var(--text-current)"
                    : "var(--text-pending)",
                backgroundColor:
                  getCharacterClass(index) === "current"
                    ? "var(--cursor-color)"
                    : "transparent",
                borderRadius:
                  getCharacterClass(index) === "current" ? "2px" : "0",
                padding: getCharacterClass(index) === "current" ? "0 1px" : "0",
                transition: "all 0.1s ease",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>

        {isFinished && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "var(--bg-overlay)",
              color: "white",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0" }}>Test Complete!</h3>
            <div style={{ marginBottom: "1rem" }}>
              <div>WPM: {wpm}</div>
              <div>Accuracy: {accuracy}%</div>
              <div>Time: {timeElapsed}s</div>
            </div>
            <button onClick={resetGame} className="primary">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Typing Instructions */}
      {!isFinished ? (
        <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
          <div className="text-sm text-muted">
            Start typing directly! Press <strong>Backspace</strong> to correct
            mistakes, <strong>Tab</strong> to restart.
          </div>
          <div className="text-xs text-muted mt-2">
            Current input: "{userInput}"
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
  );
}
