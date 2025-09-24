import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGINS?.split(",") || [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Game state
const rooms = new Map();
const userSockets = new Map();

// Word lists for generating text
const commonWords = [
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
];

function generateWords(count = 50) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
  }
  return words.join(" ");
}

function calculateWPM(charactersTyped, timeElapsed) {
  if (timeElapsed === 0) return 0;
  return Math.round(charactersTyped / 5 / (timeElapsed / 60));
}

function calculateAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, user }) => {
    console.log(`User ${user.uid} joining room ${roomId}`);

    // Leave current room if any
    for (const [id, room] of rooms.entries()) {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        socket.leave(id);
        io.to(id).emit("player-left", { playerId: socket.id });

        if (Object.keys(room.players).length === 0) {
          rooms.delete(id);
        }
        break;
      }
    }

    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        players: {},
        gameState: "waiting", // waiting, playing, finished
        text: generateWords(parseInt(process.env.DEFAULT_WORD_COUNT) || 50),
        startTime: null,
        maxPlayers: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 4,
      });
    }

    const room = rooms.get(roomId);

    // Check if room is full
    if (Object.keys(room.players).length >= room.maxPlayers) {
      socket.emit("room-full");
      return;
    }

    // Add player to room
    room.players[socket.id] = {
      id: socket.id,
      user: user,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finished: false,
      position: null,
    };

    userSockets.set(socket.id, { roomId, user });
    socket.join(roomId);

    // Send room state to all players
    io.to(roomId).emit("room-state", {
      room: {
        ...room,
        players: Object.values(room.players),
      },
    });

    console.log(
      `Room ${roomId} now has ${Object.keys(room.players).length} players`
    );
  });

  socket.on("start-game", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== "waiting") return;

    room.gameState = "playing";
    room.startTime = Date.now();
    room.text = generateWords(parseInt(process.env.DEFAULT_WORD_COUNT) || 50); // Generate new text for each game

    // Reset all player progress
    Object.values(room.players).forEach((player) => {
      player.progress = 0;
      player.wpm = 0;
      player.accuracy = 100;
      player.finished = false;
      player.position = null;
    });

    io.to(roomId).emit("game-started", {
      text: room.text,
      startTime: room.startTime,
    });

    console.log(`Game started in room ${roomId}`);
  });

  socket.on(
    "typing-update",
    ({ roomId, progress, wpm, accuracy, finished }) => {
      const room = rooms.get(roomId);
      if (!room || room.gameState !== "playing") return;

      const player = room.players[socket.id];
      if (!player) return;

      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy;

      if (finished && !player.finished) {
        player.finished = true;

        // Calculate position
        const finishedPlayers = Object.values(room.players).filter(
          (p) => p.finished
        ).length;
        player.position = finishedPlayers;

        // Check if all players finished
        const allFinished = Object.values(room.players).every(
          (p) => p.finished
        );
        if (allFinished) {
          room.gameState = "finished";
          io.to(roomId).emit("game-finished");
        }

        io.to(roomId).emit("player-finished", {
          playerId: socket.id,
          position: player.position,
          wpm: player.wpm,
          accuracy: player.accuracy,
        });
      }

      // Send updated progress to all players in room
      io.to(roomId).emit("players-progress", {
        players: Object.values(room.players),
      });
    }
  );

  socket.on("reset-game", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.gameState = "waiting";
    room.startTime = null;
    room.text = generateWords(parseInt(process.env.DEFAULT_WORD_COUNT) || 50);

    // Reset all player stats
    Object.values(room.players).forEach((player) => {
      player.progress = 0;
      player.wpm = 0;
      player.accuracy = 100;
      player.finished = false;
      player.position = null;
    });

    io.to(roomId).emit("game-reset", {
      text: room.text,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const userInfo = userSockets.get(socket.id);
    if (userInfo) {
      const { roomId } = userInfo;
      const room = rooms.get(roomId);

      if (room && room.players[socket.id]) {
        delete room.players[socket.id];
        userSockets.delete(socket.id);

        io.to(roomId).emit("player-left", { playerId: socket.id });

        // Delete room if empty
        if (Object.keys(room.players).length === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted`);
        } else {
          // Send updated room state
          io.to(roomId).emit("room-state", {
            room: {
              ...room,
              players: Object.values(room.players),
            },
          });
        }
      }
    }
  });
});

// REST API endpoints
app.get("/api/room/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (room) {
    res.json({
      success: true,
      room: {
        ...room,
        players: Object.values(room.players),
      },
    });
  } else {
    res.json({ success: false, message: "Room not found" });
  }
});

app.post("/api/room", (req, res) => {
  const roomId = uuidv4().substring(0, 8);

  rooms.set(roomId, {
    id: roomId,
    players: {},
    gameState: "waiting",
    text: generateWords(parseInt(process.env.DEFAULT_WORD_COUNT) || 50),
    startTime: null,
    maxPlayers: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 4,
  });

  res.json({ success: true, roomId });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
