import { useEffect, useRef, useState } from "react";

interface Options {
  onMessage?: (data: MessageEvent) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: Options = {}) {
  const { onMessage, autoReconnect = true, reconnectInterval = 5000 } = options;
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    function connect() {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.addEventListener("open", () => setConnected(true));
      socket.addEventListener("close", () => {
        setConnected(false);
        if (autoReconnect) {
          reconnectTimeout.current = window.setTimeout(connect, reconnectInterval);
        }
      });
      socket.addEventListener("message", (event) => onMessage?.(event));
      socket.addEventListener("error", () => socket.close());
    }

    connect();

    return () => {
      socketRef.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url, autoReconnect, reconnectInterval, onMessage]);

  return { socket: socketRef.current, isConnected };
}
