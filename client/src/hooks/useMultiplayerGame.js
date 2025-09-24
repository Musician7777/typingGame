import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { calculateWPM, calculateAccuracy } from "../utils/textGenerator";

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export function useMultiplayerGame(roomId) {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState("waiting"); // waiting, playing, finished
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [position, setPosition] = useState(null);

  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser || !roomId) return;

    const socketInstance = io(SERVER_URL);
    setSocket(socketInstance);

    // Join room when socket connects
    socketInstance.on("connect", () => {
      console.log("Connected to server");
      socketInstance.emit("join-room", {
        roomId,
        user: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email,
          email: currentUser.email,
        },
      });
    });

    // Room state updates
    socketInstance.on("room-state", ({ room }) => {
      console.log("Room state update:", room);
      setRoom(room);
      setPlayers(room.players);
      setGameState(room.gameState);
      if (room.text) setText(room.text);
    });

    // Game started
    socketInstance.on("game-started", ({ text, startTime }) => {
      console.log("Game started");
      setText(text);
      setGameState("playing");
      setStartTime(startTime);
      setIsActive(true);
      setUserInput("");
      setCurrentIndex(0);
      setErrors([]);
      setWpm(0);
      setAccuracy(100);
      setIsFinished(false);
      setPosition(null);

      // Start WPM calculation interval
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeElapsed = (now - startTime) / 1000;
        const currentWpm = calculateWPM(userInput.length, timeElapsed);
        setWpm(currentWpm);
      }, 100);
    });

    // Players progress updates
    socketInstance.on("players-progress", ({ players }) => {
      setPlayers(players);
    });

    // Player finished
    socketInstance.on(
      "player-finished",
      ({ playerId, position, wpm, accuracy }) => {
        console.log(`Player ${playerId} finished at position ${position}`);
        if (playerId === socketInstance.id) {
          setPosition(position);
        }
      }
    );

    // Game finished
    socketInstance.on("game-finished", () => {
      console.log("Game finished");
      setGameState("finished");
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    });

    // Game reset
    socketInstance.on("game-reset", ({ text }) => {
      console.log("Game reset");
      setText(text);
      setGameState("waiting");
      setUserInput("");
      setCurrentIndex(0);
      setErrors([]);
      setWpm(0);
      setAccuracy(100);
      setIsFinished(false);
      setIsActive(false);
      setStartTime(null);
      setPosition(null);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    });

    // Player left
    socketInstance.on("player-left", ({ playerId }) => {
      console.log(`Player ${playerId} left`);
    });

    // Room full
    socketInstance.on("room-full", () => {
      alert("Room is full!");
    });

    // Cleanup
    return () => {
      socketInstance.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser, roomId]);

  const handleInput = useCallback(
    (value) => {
      if (!isActive || isFinished || gameState !== "playing") return;

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

      // Calculate progress percentage
      const progress = (value.length / text.length) * 100;

      // Check if finished
      const finished = value === text;
      if (finished && !isFinished) {
        setIsFinished(true);
        setIsActive(false);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Final calculations
        const timeElapsed = (Date.now() - startTime) / 1000;
        const finalWpm = calculateWPM(text.length, timeElapsed);
        setWpm(finalWpm);
      }

      // Calculate current WPM for socket update
      const currentTimeElapsed = (Date.now() - startTime) / 1000;
      const currentWpm = calculateWPM(value.length, currentTimeElapsed);

      // Throttle socket updates to prevent spam
      const now = Date.now();
      if (now - lastUpdateRef.current > 100 || finished) {
        // Update every 100ms or on finish
        lastUpdateRef.current = now;

        if (socket) {
          socket.emit("typing-update", {
            roomId,
            progress: Math.min(progress, 100),
            wpm: currentWpm,
            accuracy: currentAccuracy,
            finished,
          });
        }
      }
    },
    [isActive, isFinished, gameState, text, wpm, startTime, socket, roomId]
  );

  const startGame = useCallback(() => {
    if (socket && gameState === "waiting") {
      socket.emit("start-game", { roomId });
    }
  }, [socket, gameState, roomId]);

  const resetGame = useCallback(() => {
    if (socket) {
      socket.emit("reset-game", { roomId });
    }
  }, [socket, roomId]);

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

  const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;

  return {
    room,
    players,
    gameState,
    text,
    userInput,
    currentIndex,
    isActive,
    isFinished,
    wpm,
    accuracy,
    errors,
    position,
    timeElapsed: Math.floor(timeElapsed),
    handleInput,
    startGame,
    resetGame,
    getCharacterClass,
    connected: socket?.connected || false,
  };
}
