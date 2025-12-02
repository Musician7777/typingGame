import { useState } from "react";
import { Clock, Hash, X } from "lucide-react";

export default function GameSettingsModal({ onStart, onClose, showCancel = true }) {
    const [mode, setMode] = useState("words"); // "words" or "time"
    const [wordCount, setWordCount] = useState(50);
    const [timeLimit, setTimeLimit] = useState(1);

    const wordOptions = [10, 25, 50, 100, 150];
    const timeOptions = [1, 2, 3, 5, 10];

    const handleStart = () => {
        const settings = {
            mode,
            value: mode === "words" ? wordCount : timeLimit,
        };
        onStart(settings);
    };

    return (
        <div
            className="modal-overlay"
            onClick={showCancel ? onClose : undefined}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                cursor: showCancel ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                background: "rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)"
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "500px",
                    cursor: "default",
                }}
            >
                {showCancel && (
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-primary)",
                            borderRadius: "8px",
                            padding: "0.5rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                        }}
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                )}

                <h2
                    style={{
                        margin: "0 0 1.5rem 0",
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                        textAlign: "center",
                    }}
                >
                    Game Settings
                </h2>

                {/* Mode Selection */}
                <div style={{ marginBottom: "2rem" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "0.75rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Test Mode
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <button
                            onClick={() => setMode("words")}
                            className={mode === "words" ? "primary" : ""}
                            style={{
                                padding: "1rem",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.5rem",
                                border: mode === "words" ? "2px solid var(--primary)" : "2px solid var(--border-primary)",
                            }}
                        >
                            <Hash size={24} />
                            <span style={{ fontWeight: "600" }}>Word Count</span>
                        </button>
                        <button
                            onClick={() => setMode("time")}
                            className={mode === "time" ? "primary" : ""}
                            style={{
                                padding: "1rem",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.5rem",
                                border: mode === "time" ? "2px solid var(--primary)" : "2px solid var(--border-primary)",
                            }}
                        >
                            <Clock size={24} />
                            <span style={{ fontWeight: "600" }}>Time Limit</span>
                        </button>
                    </div>
                </div>

                {/* Word Count Selection */}
                {mode === "words" && (
                    <div style={{ marginBottom: "2rem" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.75rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Number of Words
                        </label>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
                                gap: "0.5rem",
                            }}
                        >
                            {wordOptions.map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setWordCount(count)}
                                    className={wordCount === count ? "primary" : ""}
                                    style={{
                                        padding: "0.75rem",
                                        fontSize: "1rem",
                                        fontWeight: "700",
                                        border: wordCount === count ? "2px solid var(--primary)" : "2px solid var(--border-primary)",
                                    }}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Time Limit Selection */}
                {mode === "time" && (
                    <div style={{ marginBottom: "2rem" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.75rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Time in Minutes
                        </label>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
                                gap: "0.5rem",
                            }}
                        >
                            {timeOptions.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setTimeLimit(time)}
                                    className={timeLimit === time ? "primary" : ""}
                                    style={{
                                        padding: "0.75rem",
                                        fontSize: "1rem",
                                        fontWeight: "700",
                                        border: timeLimit === time ? "2px solid var(--primary)" : "2px solid var(--border-primary)",
                                    }}
                                >
                                    {time}m
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="success"
                    style={{
                        width: "100%",
                        padding: "1rem 1.5rem",
                        fontSize: "1.125rem",
                        fontWeight: "700",
                    }}
                >
                    Start Game
                </button>

                {/* Info Message */}
                <p
                    style={{
                        marginTop: "1.5rem",
                        textAlign: "center",
                        fontSize: "0.8125rem",
                        color: "var(--text-muted)",
                        lineHeight: "1.6",
                    }}
                >
                    {mode === "words"
                        ? `Type ${wordCount} words as fast as you can!`
                        : `Type as many words as possible in ${timeLimit} minute${timeLimit > 1 ? "s" : ""}!`}
                </p>
            </div>
        </div>
    );
}
