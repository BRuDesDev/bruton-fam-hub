const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}`;
const socketBaseUrl = import.meta.env.VITE_SOCKET_URL ?? apiBaseUrl.replace("http", "ws");
export const env = {
    apiBaseUrl,
    socketBaseUrl
};
