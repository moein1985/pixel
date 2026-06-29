import type { FastifyInstance } from "fastify";
import { verifyToken } from "./auth.js";

interface SocketUser {
  userId: string;
  phone: string;
  role: string;
}

export function setupSocketServer(server: FastifyInstance) {
  const connectedUsers = new Map<string, string>(); // userId -> connectionId

  server.get("/ws", { websocket: true }, (socket, req) => {
    let currentUser: SocketUser | null = null;

    socket.on("message", async (raw: Buffer) => {
      try {
        const data = JSON.parse(raw.toString());
        const { event, payload } = data;

        switch (event) {
          case "auth": {
            const token = payload?.token as string;
            if (!token) {
              socket.send(JSON.stringify({ event: "error", payload: { message: "Token required" } }));
              return;
            }
            const decoded = verifyToken(token);
            if (!decoded) {
              socket.send(JSON.stringify({ event: "error", payload: { message: "Invalid token" } }));
              return;
            }
            currentUser = {
              userId: decoded.userId,
              phone: decoded.phone,
              role: decoded.role,
            };
            connectedUsers.set(currentUser.userId, (socket as any).id);
            socket.send(JSON.stringify({ event: "auth:success", payload: { userId: currentUser.userId } }));
            break;
          }

          case "message:send": {
            if (!currentUser) {
              socket.send(JSON.stringify({ event: "error", payload: { message: "Not authenticated" } }));
              return;
            }
            const { conversationId, content } = payload;
            socket.send(JSON.stringify({
              event: "message:sent",
              payload: { conversationId, content, senderId: currentUser.userId, timestamp: new Date().toISOString() },
            }));
            break;
          }

          case "typing:start": {
            if (!currentUser) return;
            const { conversationId } = payload;
            socket.send(JSON.stringify({
              event: "typing:started",
              payload: { conversationId, userId: currentUser.userId },
            }));
            break;
          }

          case "typing:stop": {
            if (!currentUser) return;
            const { conversationId } = payload;
            socket.send(JSON.stringify({
              event: "typing:stopped",
              payload: { conversationId, userId: currentUser.userId },
            }));
            break;
          }

          default:
            socket.send(JSON.stringify({ event: "error", payload: { message: `Unknown event: ${event}` } }));
        }
      } catch {
        socket.send(JSON.stringify({ event: "error", payload: { message: "Invalid message format" } }));
      }
    });

    socket.on("close", () => {
      if (currentUser) {
        connectedUsers.delete(currentUser.userId);
      }
    });
  });

  console.log("🔌 Socket.io WebSocket server registered at /ws");
}
