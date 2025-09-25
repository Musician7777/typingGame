import { useState, useEffect } from "react";

export default function TypewriterText({
  text,
  speed = 150,
  startDelay = 500,
  showCursor = true,
  style = {},
  onComplete = () => {},
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showBlinkingCursor, setShowBlinkingCursor] = useState(true);

  // Typing animation effect
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        },
        currentIndex === 0 ? startDelay : speed
      );

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, text, speed, startDelay, isComplete, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    if (showCursor) {
      const cursorInterval = setInterval(() => {
        setShowBlinkingCursor((prev) => !prev);
      }, 530);

      return () => clearInterval(cursorInterval);
    }
  }, [showCursor]);

  return (
    <span style={style}>
      {displayedText}
      {showCursor && (
        <span
          style={{
            opacity: showBlinkingCursor ? 1 : 0,
            transition: "opacity 0.1s ease",
            color: "var(--primary)",
            fontWeight: "normal",
            animation: isComplete ? "none" : undefined,
          }}
        >
          |
        </span>
      )}
    </span>
  );
}
