import { useState, useEffect, useRef, useCallback } from "react";
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

  const intervalRef = useRef(null);
  // Refs to avoid stale values inside setInterval
  const startTimeRef = useRef(null);
  const userInputRef = useRef("");

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

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    if (!isActive && !isFinished) {
      setIsActive(true);
      const startedAt = Date.now();
      setStartTime(startedAt);
      startTimeRef.current = startedAt;

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const base = startTimeRef.current || now; // if not started, avoid NaN
        const timeElapsed = (now - base) / 1000;
        const currentWpm = calculateWPM(
          userInputRef.current.length,
          timeElapsed
        );
        setWpm(currentWpm);
      }, 100);
    }
  }, [isActive, isFinished]);

  const handleInput = useCallback(
    (value) => {
      if (isFinished) return;

      if (!isActive) {
        startGame();
      }

      setUserInput(value);
      userInputRef.current = value;
      setCurrentIndex(value.length);

      // Calculate errors
      const newErrors = [];
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== text[i]) {
          newErrors.push(i);
        }
      }
      setErrors(newErrors);

      // Calculate accuracy
      const correctChars = value.length - newErrors.length;
      const currentAccuracy = calculateAccuracy(correctChars, value.length);
      setAccuracy(currentAccuracy);

      // Check if finished
      if (value === text) {
        setIsFinished(true);
        setIsActive(false);
        setEndTime(Date.now());

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Final calculations
        const base = startTimeRef.current || Date.now();
        const timeElapsed = (Date.now() - base) / 1000;
        const finalWpm = calculateWPM(text.length, timeElapsed);
        setWpm(finalWpm);
      }
    },
    [isFinished, isActive, text, startGame]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

  return {
    text,
    userInput,
    currentIndex,
    isActive,
    isFinished,
    wpm,
    accuracy,
    errors,
    timeElapsed: Math.floor(timeElapsed / 1000),
    handleInput,
    resetGame,
    getCharacterClass,
  };
}
