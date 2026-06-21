import { io } from "socket.io-client";

// Always connect to the SAME ORIGIN the app was loaded from. In dev the Vite
// proxy forwards /socket.io to the Flask backend; in prod Flask serves both.
// (Connecting to a hardcoded localhost:5002 breaks in Codespaces / any setup
// where the browser isn't on the same host as the server.)
export function createSocket() {
  return io({ path: "/socket.io" });
}
