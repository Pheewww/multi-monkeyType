export interface TestResults {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export interface Player {
  id: string;
  name: string;
  isOwner: boolean;
}

export type RoomStatus = "waiting" | "countdown" | "running" | "finished";

// Client -> Server
export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start_game" }
  | { type: "progress"; currentWordIndex: number; wpm: number }
  | { type: "finished"; results: TestResults };

// Server -> Client
export type ServerMessage =
  | { type: "room_state"; players: Player[]; seed: number; duration: number; status: RoomStatus; yourId: string }
  | { type: "player_joined"; player: Player }
  | { type: "player_left"; id: string }
  | { type: "countdown"; value: number }
  | { type: "progress"; id: string; currentWordIndex: number; wpm: number }
  | { type: "player_finished"; id: string; results: TestResults }
  | { type: "error"; message: string };
