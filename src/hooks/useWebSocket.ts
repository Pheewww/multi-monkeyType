"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ServerMessage, ClientMessage } from "@/lib/protocol";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

export function useWebSocket(roomId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<((msg: ServerMessage) => void)[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/room/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const msg: ServerMessage = JSON.parse(e.data);
      listenersRef.current.forEach((fn) => fn(msg));
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const onMessage = useCallback((fn: (msg: ServerMessage) => void) => {
    listenersRef.current.push(fn);
    return () => {
      listenersRef.current = listenersRef.current.filter((l) => l !== fn);
    };
  }, []);

  return { connected, send, onMessage };
}
