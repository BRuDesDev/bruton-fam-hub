var _a;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Allow overriding the backend origin via env (falls back to localhost dev server).
var backendHttpOrigin = (_a = process.env.VITE_BACKEND_HTTP_ORIGIN) !== null && _a !== void 0 ? _a : "http://localhost:8000";
var backendWsOrigin = backendHttpOrigin.replace(/^http/i, "ws");
export default defineConfig({
    plugins: [react()],
    server: {
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            "/api": {
                target: backendHttpOrigin,
                changeOrigin: true
            },
            "/ws": {
                target: backendWsOrigin,
                ws: true
            }
        }
    },
    resolve: {
        alias: {
            "@": "/src"
        }
    }
});
