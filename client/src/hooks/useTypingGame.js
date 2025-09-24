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

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = useCallback(() => {
    const newText = generateWords(50).join(" ");
    setText(newText);
    setUserInput("");
    setCurrentIndex(0);
    setIsActive(false);
    setStartTime(null);
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
      setStartTime(Date.now());

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeElapsed = (now - (startTime || now)) / 1000;
        const currentWpm = calculateWPM(userInput.length, timeElapsed);
        setWpm(currentWpm);
      }, 100);
    }
  }, [isActive, isFinished, startTime, userInput.length]);

  const handleInput = useCallback(
    (value) => {
      if (isFinished) return;

      if (!isActive) {
        startGame();
      }

      setUserInput(value);
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
        const timeElapsed = (Date.now() - startTime) / 1000;
        const finalWpm = calculateWPM(text.length, timeElapsed);
        setWpm(finalWpm);
      }
    },
    [isFinished, isActive, text, startGame, startTime]
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
