import { WebSocketServer, WebSocket } from "ws";
import http from "http";

interface TestResults {
  wpm: number; rawWpm: number; accuracy: number;
  correct: number; incorrect: number; extra: number; missed: number;
}

interface Player {
  id: string;
  name: string;
  isOwner: boolean;
  ws: WebSocket;
}

interface Room {
  id: string;
  players: Map<string, Player>;
  seed: number;
  duration: number;
  status: "waiting" | "countdown" | "running" | "finished";
  countdownTimer?: NodeJS.Timeout;
}

const rooms = new Map<string, Room>();
let nextId = 1;

const server = http.createServer((_, res) => {
  res.writeHead(200);
  res.end("WebSocket server running");
});

const wss = new WebSocketServer({ server });

function broadcast(room: Room, msg: object, excludeId?: string) {
  const data = JSON.stringify(msg);
  for (const p of room.players.values()) {
    if (p.id !== excludeId && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(data);
    }
  }
}

function send(ws: WebSocket, msg: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function getRoom(roomId: string): Room {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      players: new Map(),
      seed: Math.floor(Math.random() * 2147483647),
      duration: 30,
      status: "waiting",
    };
    rooms.set(roomId, room);
  }
  return room;
}

function serializePlayers(room: Room) {
  return Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    isOwner: p.isOwner,
  }));
}

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/room\/(.+)$/);
  if (!match) {
    ws.close(1008, "Invalid path");
    return;
  }

  const roomId = match[1];
  const room = getRoom(roomId);
  let playerId: string | null = null;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === "join") {
      if (room.players.size >= 2) {
        send(ws, { type: "error", message: "Room is full" });
        ws.close();
        return;
      }
      if (room.status !== "waiting") {
        send(ws, { type: "error", message: "Game already in progress" });
        ws.close();
        return;
      }

      playerId = String(nextId++);
      const isOwner = room.players.size === 0;
      const player: Player = { id: playerId, name: msg.name || "Player", isOwner, ws };
      room.players.set(playerId, player);

      send(ws, {
        type: "room_state",
        players: serializePlayers(room),
        seed: room.seed,
        duration: room.duration,
        status: room.status,
        yourId: playerId,
      });

      broadcast(room, {
        type: "player_joined",
        player: { id: playerId, name: player.name, isOwner },
      }, playerId);
    }

    if (!playerId) return;

    if (msg.type === "start_game") {
      const player = room.players.get(playerId);
      if (!player?.isOwner || room.players.size < 2 || room.status !== "waiting") return;

      room.status = "countdown";
      let count = 3;
      broadcast(room, { type: "countdown", value: count });

      room.countdownTimer = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(room.countdownTimer!);
          room.status = "running";
          broadcast(room, { type: "countdown", value: 0 });
        } else {
          broadcast(room, { type: "countdown", value: count });
        }
      }, 1000);
    }

    if (msg.type === "progress") {
      broadcast(room, {
        type: "progress",
        id: playerId,
        currentWordIndex: msg.currentWordIndex,
        wpm: msg.wpm,
      }, playerId);
    }

    if (msg.type === "finished") {
      broadcast(room, {
        type: "player_finished",
        id: playerId,
        results: msg.results,
      }, playerId);
    }
  });

  ws.on("close", () => {
    if (playerId && room.players.has(playerId)) {
      room.players.delete(playerId);
      broadcast(room, { type: "player_left", id: playerId });

      if (room.players.size === 0) {
        if (room.countdownTimer) clearInterval(room.countdownTimer);
        rooms.delete(roomId);
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
