"use client";

import React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useWebSocket } from "./useWebSocket";
import { useTypingTest } from "./useTypingTest";
import { Player, RoomStatus, ServerMessage, TestResults } from "@/lib/protocol";
import { generateWordsSeeded } from "@/lib/seededRandom";

export function useMultiplayerTest(roomId: string, playerName: string) {
  const { connected, send, onMessage } = useWebSocket(roomId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("waiting");
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [opponentProgress, setOpponentProgress] = useState({ currentWordIndex: 0, wpm: 0 });
  const [opponentResults, setOpponentResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const joinedRef = useRef(false);

  const initialWords = useMemo(
    () => (seed !== null ? generateWordsSeeded(200, seed) : undefined),
    [seed]
  );
  const typing = useTypingTest(30, initialWords);
  const forceStartRef = useRef(typing.forceStart);
  forceStartRef.current = typing.forceStart;

  // Join room once connected
  useEffect(() => {
    if (connected && !joinedRef.current) {
      joinedRef.current = true;
      send({ type: "join", name: playerName });
    }
  }, [connected, playerName, send]);

  // Handle server messages
  useEffect(() => {
    return onMessage((msg: ServerMessage) => {
      switch (msg.type) {
        case "room_state":
          setPlayers(msg.players);
          setMyId(msg.yourId);
          setSeed(msg.seed);
          setRoomStatus(msg.status);
          break;
        case "player_joined":
          setPlayers((prev) => [...prev, msg.player]);
          break;
        case "player_left":
          setPlayers((prev) => prev.filter((p) => p.id !== msg.id));
          break;
        case "countdown":
          if (msg.value === 0) {
            setCountdownValue(null);
            setRoomStatus("running");
            forceStartRef.current();
          } else {
            setCountdownValue(msg.value);
            setRoomStatus("countdown");
          }
          break;
        case "progress":
          setOpponentProgress({ currentWordIndex: msg.currentWordIndex, wpm: msg.wpm });
          break;
        case "player_finished":
          setOpponentResults(msg.results);
          break;
        case "error":
          setError(msg.message);
          break;
      }
    });
  }, [onMessage]);

  // Send progress updates when typing
  const prevWordIndexRef = useRef(0);
  useEffect(() => {
    if (roomStatus === "running" && typing.currentWordIndex !== prevWordIndexRef.current) {
      prevWordIndexRef.current = typing.currentWordIndex;
      const results = typing.getResults();
      send({ type: "progress", currentWordIndex: typing.currentWordIndex, wpm: results.wpm });
    }
  }, [typing.currentWordIndex, roomStatus, send, typing]);

  // Send finished when test ends
  useEffect(() => {
    if (typing.status === "finished" && roomStatus === "running") {
      const results = typing.getResults();
      send({ type: "finished", results });
      setRoomStatus("finished");
    }
  }, [typing.status, roomStatus, send, typing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab" && roomStatus === "running") {
        e.preventDefault();
        return;
      }
      typing.handleKeyDown(e);
    },
    [roomStatus, typing]
  );

  const startGame = useCallback(() => {
    send({ type: "start_game" });
  }, [send]);

  const isOwner = players.find((p) => p.id === myId)?.isOwner ?? false;
  const opponent = players.find((p) => p.id !== myId) ?? null;

  return {
    connected,
    players,
    myId,
    isOwner,
    opponent,
    roomStatus,
    countdownValue,
    opponentProgress,
    opponentResults,
    error,
    startGame,
    handleKeyDown,
    typing,
    seed,
  };
}
