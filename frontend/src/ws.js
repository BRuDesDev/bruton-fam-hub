import { env } from "@/config/env";
export function connectWS(path = "/ws/notify") {
    const base = env.socketBaseUrl.replace(/\/$/, "");
    const ws = new WebSocket(`${base}${path}`);
    ws.onmessage = (ev) => console.log("WS:", ev.data);
    return ws;
}
