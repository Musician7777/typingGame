import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  generateWords,
  calculateWPM,
  calculateAccuracy,
} from "../utils/textGenerator";

export function useTypingGame() {
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
    const newText = generateWords(50).join(" ");
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

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [clearTrailTimers]);

  const startGame = useCallback(() => {
    if (isActive || isFinished) return;

    setIsActive(true);
    const startedAt = Date.now();
    setStartTime(startedAt);
    startTimeRef.current = startedAt;

    intervalRef.current = setInterval(() => {
      // We only update WPM here, not timeElapsed for display
      const now = Date.now();
      const base = startTimeRef.current || now;
      const timeElapsed = (now - base) / 1000;
      const currentWpm = calculateWPM(userInputRef.current.length, timeElapsed);
      setWpm(currentWpm);
    }, 1000); // Update WPM every second
  }, [isActive, isFinished]);

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
    handleInput,
    resetGame,
    getCharacterClass,
    hasTrail: (index) => activeTrailIndices.has(index),
  };
}
