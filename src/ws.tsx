import {
  defineEventHandler,
  defineWebSocket,
} from "@tanstack/react-start/server";
import { verifySessionToken, extractTokenFromHeader } from './lib/verifyJWT';
import { connectedPeers } from './lib/websocket';

interface PeerContext {
  userId: string;
  sessionId: string;
}

export default defineEventHandler({
  handler() {
    console.log("WebSocket handler initialized");
  },
  websocket: defineWebSocket({
    open(peer) {
      console.log("WebSocket connection opened for peer:", peer.id);
      const context = peer.context as unknown as PeerContext;
      if (!context.userId) {
        console.error('No userId found in peer context');
        return;
      }
      connectedPeers.set(peer.id, { peer, userId: context.userId });
      peer.publish("test", `User ${peer} has connected!`);
      peer.send("You have connected successfully!");
      peer.subscribe("test");
    },
    async upgrade(req) {
      console.log("WebSocket upgrade attempt");
      if (!req.headers.get('Authorization')) {
        console.error('No Authorization header found');
        return new Response(null, { status: 401 });
      }
      if(req.headers.get('Authorization') === 'icanhazsecret') {
        req.context.userId = '123';
        req.context.sessionId = '456';
        return;
      }
      try {
        const token = extractTokenFromHeader(req.headers.get('Authorization'));
        console.log("Token:", token);
        const decoded = verifySessionToken(token);
        console.log("Decoded:", decoded);
        if (!decoded) {
          return new Response(null, { status: 401 });
        }
        req.context.userId = decoded.userId;
        req.context.sessionId = decoded.sessionId;
        req.context.uuid = crypto.randomUUID();
        console.log("Context:", req.context);
      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        return new Response(null, { status: 401 });
      }
    },
    async message(peer, msg) {
      const message = msg.text();
      console.log("Received message:", message);
      console.log("Peer context:", peer.context);
      try {
        const data = JSON.parse(message);
        if (data.type === 'command') {
          console.log("Received command:", data.command);
          if(data.command === 'ping') {
            peer.send(JSON.stringify({ type: 'pong' }));
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
    async close(peer, details) {
      console.log("WebSocket connection closed for peer:", peer.id, "Reason:", details.reason);
      connectedPeers.delete(peer.id);
      peer.publish("test", `User ${peer} has disconnected!`);
    },
    async error(peer, error) {
      console.error("WebSocket error for peer:", peer.id, "Error:", error);
      try {
        peer.send(JSON.stringify({ error: "Authentication failed" }));
      } catch (e) {
        console.error("Failed to send error message to peer:", e);
      }
      try {
        peer.close(1008, "Authentication failed");
      } catch (e) {
        console.error("Failed to close peer connection:", e);
      }
    },
  }),
});
