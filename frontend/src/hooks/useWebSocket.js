import { useEffect, useRef, useState } from "react";
export function useWebSocket(url, options = {}) {
    const { onMessage, autoReconnect = true, reconnectInterval = 5000 } = options;
    const socketRef = useRef(null);
    const reconnectTimeout = useRef(null);
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
