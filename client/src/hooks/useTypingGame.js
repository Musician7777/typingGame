import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  generateWords,
  calculateWPM,
  calculateAccuracy,
} from "../utils/textGenerator";

export function useTypingGame(settings = { mode: "words", value: 50 }) {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [trailMarks, setTrailMarks] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const intervalRef = useRef(null);
  // Refs to avoid stale values inside setInterval
  const startTimeRef = useRef(null);
  const userInputRef = useRef("");
  const trailTimeoutsRef = useRef([]);

  const clearTrailTimers = useCallback(() => {
    trailTimeoutsRef.current.forEach(({ timeoutId }) =>
      clearTimeout(timeoutId)
    );
    trailTimeoutsRef.current = [];
  }, []);

  const addTrailMark = useCallback((index) => {
    if (index < 0) return;

    const id = `${index}-${Date.now()}-${Math.random()}`;

    setTrailMarks((prev) => [...prev, { index, id }]);

    const timeoutId = setTimeout(() => {
      setTrailMarks((prev) => prev.filter((mark) => mark.id !== id));
      trailTimeoutsRef.current = trailTimeoutsRef.current.filter(
        (entry) => entry.id !== id
      );
    }, 300);

    trailTimeoutsRef.current.push({ id, timeoutId });
  }, []);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = useCallback(() => {
    // Generate text based on mode
    const wordCount = settings.mode === "words" ? settings.value : 200; // For time mode, generate lots of words
    const newText = generateWords(wordCount).join(" ");
    setText(newText);
    setUserInput("");
    userInputRef.current = "";
    setCurrentIndex(0);
    setIsActive(false);
    setStartTime(null);
    startTimeRef.current = null;
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors([]);
    setIsFinished(false);
    clearTrailTimers();
    setTrailMarks([]);

    // Initialize time remaining for time mode
    if (settings.mode === "time") {
      setTimeRemaining(settings.value * 60); // Convert minutes to seconds
    } else {
      setTimeRemaining(null);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [clearTrailTimers, settings]);

  const startGame = useCallback(() => {
    if (isActive || isFinished) return;

    setIsActive(true);
    const startedAt = Date.now();
    setStartTime(startedAt);
    startTimeRef.current = startedAt;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const base = startTimeRef.current || now;
      const timeElapsed = (now - base) / 1000;
      const currentWpm = calculateWPM(userInputRef.current.length, timeElapsed);
      setWpm(currentWpm);

      // Handle time mode countdown
      if (settings.mode === "time") {
        const elapsed = Math.floor(timeElapsed);
        const remaining = Math.max(0, settings.value * 60 - elapsed);
        setTimeRemaining(remaining);

        // Time's up!
        if (remaining === 0) {
          setIsFinished(true);
          setIsActive(false);
          setEndTime(Date.now());

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          // Calculate final stats
          const finalWpm = calculateWPM(userInputRef.current.length, settings.value * 60);
          setWpm(finalWpm);

          const correctChars = userInputRef.current.split("").filter((char, i) => char === text[i]).length;
          const finalAccuracy = calculateAccuracy(correctChars, userInputRef.current.length);
          setAccuracy(finalAccuracy);
        }
      }
    }, 1000); // Update every second
  }, [isActive, isFinished, settings, text]);

  const handleInput = useCallback(
    (value) => {
      if (isFinished) return;

      if (!isActive) {
        startGame();
      }

      const previousLength = userInputRef.current.length;

      setUserInput(value);
      userInputRef.current = value;
      setCurrentIndex(value.length);

      if (value.length > previousLength) {
        addTrailMark(value.length - 1);
      }

      const newErrors = [];
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== text[i]) {
          newErrors.push(i);
        }
      }
      setErrors(newErrors);

      const correctChars = value.length - newErrors.length;
      const currentAccuracy = calculateAccuracy(correctChars, value.length);
      setAccuracy(currentAccuracy);

      if (value.length === text.length) {
        // Game finished
        setIsFinished(true);
        setIsActive(false);
        const endedAt = Date.now();
        setEndTime(endedAt);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Final calculations
        const base = startTimeRef.current || endedAt;
        const timeElapsed = (endedAt - base) / 1000;
        const finalWpm = calculateWPM(text.length, timeElapsed);
        setWpm(finalWpm);

        // Final accuracy
        const finalCorrectChars = text.length - newErrors.length;
        const finalAccuracy = calculateAccuracy(finalCorrectChars, text.length);
        setAccuracy(finalAccuracy);
      }
    },
    [isFinished, isActive, text, startGame]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTrailTimers();
    };
  }, [clearTrailTimers]);

  const getCharacterClass = useCallback(
    (index) => {
      if (index < currentIndex) {
        return errors.includes(index) ? "incorrect" : "correct";
      } else if (index === currentIndex) {
        return "current";
      }
      return "pending";
    },
    [currentIndex, errors]
  );

  const timeElapsed = startTime ? (endTime || Date.now()) - startTime : 0;

  const activeTrailIndices = useMemo(
    () => new Set(trailMarks.map((mark) => mark.index)),
    [trailMarks]
  );

  return {
    text,
    userInput,
    currentIndex,
    isActive,
    isFinished,
    wpm,
    accuracy,
    errors,
    timeElapsed: isFinished
      ? Math.floor((endTime - startTime) / 1000)
      : Math.floor(timeElapsed / 1000),
    timeRemaining,
    settings,
    handleInput,
    resetGame,
    getCharacterClass,
    hasTrail: (index) => activeTrailIndices.has(index),
  };
}
