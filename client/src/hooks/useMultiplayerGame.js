import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { calculateWPM, calculateAccuracy } from "../utils/textGenerator";

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3002";

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
  const [gameEnded, setGameEnded] = useState(false);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [position, setPosition] = useState(null);
  const [trailMarks, setTrailMarks] = useState([]);

  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0);
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
      setGameEnded(false);
      setFinalWpm(0);
      setFinalTime(0);
      userInputRef.current = "";
      clearTrailTimers();
      setTrailMarks([]);

      // Start WPM calculation interval
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeElapsed = (now - startTime) / 1000;
        const currentWpm = calculateWPM(
          userInputRef.current.length,
          timeElapsed
        );
        setWpm(currentWpm);
      }, 100);
    });

    // Players progress updates
    socketInstance.on("players-progress", ({ players }) => {
      console.log(
        "Players progress update:",
        players.map((p) => ({
          name: p.user.displayName || p.user.email,
          progress: p.progress,
          temporaryPosition: p.temporaryPosition,
          finished: p.finished,
        }))
      );
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
    socketInstance.on("game-finished", ({ players: finalPlayers }) => {
      console.log("Game finished");
      setGameState("finished");
      setIsActive(false);
      setGameEnded(true);
      if (finalPlayers) {
        setPlayers(finalPlayers);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
      setGameEnded(false);
      setFinalWpm(0);
      setFinalTime(0);
      userInputRef.current = "";
      clearTrailTimers();
      setTrailMarks([]);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
      clearTrailTimers();
    };
  }, [clearTrailTimers, currentUser, roomId]);

  const handleInput = useCallback(
    (value) => {
      if (!isActive || isFinished || gameState !== "playing") return;

      const previousLength = userInputRef.current.length;

      setUserInput(value);
      setCurrentIndex(value.length);
      userInputRef.current = value;

      if (value.length > previousLength) {
        addTrailMark(value.length - 1);
      }

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

        // Clear the WPM calculation interval immediately when player finishes
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Final calculations
        const timeElapsed = (Date.now() - startTime) / 1000;
        const finalWpm =
          timeElapsed > 0 ? calculateWPM(text.length, timeElapsed) : 0;
        setWpm(finalWpm);
        setFinalWpm(finalWpm);
        setFinalTime(timeElapsed);

        console.log(
          `Player finished! Final WPM: ${finalWpm}, Time: ${timeElapsed}s`
        );
      }

      // Calculate current WPM for socket update
      const currentTimeElapsed = (Date.now() - startTime) / 1000;
      const currentWpm =
        currentTimeElapsed > 0
          ? calculateWPM(value.length, currentTimeElapsed)
          : 0;

      // Throttle socket updates to prevent spam
      const now = Date.now();
      if (now - lastUpdateRef.current > 100 || finished) {
        // Update every 100ms or on finish
        lastUpdateRef.current = now;

        if (socket) {
          socket.emit("typing-update", {
            roomId,
            progress: Math.min(progress, 100),
            wpm: finished ? finalWpm || currentWpm : currentWpm,
            accuracy: currentAccuracy,
            finished,
          });
        }
      }
    },
    [
      addTrailMark,
      isActive,
      isFinished,
      gameState,
      text,
      wpm,
      startTime,
      socket,
      roomId,
    ]
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

  const timeElapsed = useMemo(() => {
    if (!startTime) return 0;
    if (isFinished) return finalTime;
    if (gameEnded)
      return finalTime > 0 ? finalTime : (Date.now() - startTime) / 1000;
    return (Date.now() - startTime) / 1000;
  }, [startTime, isFinished, gameEnded, finalTime]);

  const activeTrailIndices = useMemo(
    () => new Set(trailMarks.map((mark) => mark.index)),
    [trailMarks]
  );

  return {
    room,
    players,
    gameState,
    text,
    userInput,
    currentIndex,
    isActive,
    isFinished,
    gameEnded,
    wpm: isFinished || gameEnded ? finalWpm : wpm,
    accuracy,
    errors,
    position,
    timeElapsed: Math.floor(timeElapsed),
    handleInput,
    startGame,
    resetGame,
    getCharacterClass,
    hasTrail: (index) => activeTrailIndices.has(index),
    connected: socket?.connected || false,
  };
}
