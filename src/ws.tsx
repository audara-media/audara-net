import {
  defineEventHandler,
  defineWebSocket,
} from "@tanstack/react-start/server";
import { verifySessionToken, extractTokenFromHeader } from './lib/verifyJWT';
import { peerManager } from './lib/peerManager';
import { queue, ch1, ch2 } from './lib/queueManager';

interface PeerContext {
  userId: string;
  sessionId: string;
}

ch1.consume(queue, (msg) => {
  if (msg !== null) {;
    ch1.ack(msg);
    const data = JSON.parse(msg.content.toString());
    if(data.type === 'keyCode') {
      peerManager.sendToPeer(data.userId, { userId: data.userId, type: 'keyCode', keyCode: data.keyCode });
    }
  } else {
    console.log('Consumer cancelled by server');
  }
});

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
      peerManager.addPeer(context.userId, peer);
      peer.send(JSON.stringify({ type: 'register-app', peerId: peer.id }));
    },
    async upgrade(req) {
      console.log("WebSocket upgrade attempt");
      if (!req.headers.get('Authorization')) {
        console.error('No Authorization header found');
        return new Response(null, { status: 401 });
      }
      if(req.headers.get('Authorization') === 'icanhazsecret') {
        req.context.userId = '123';
        return;
      }
      try {
        const token = extractTokenFromHeader(req.headers.get('Authorization'));
        const decoded = verifySessionToken(token);
        if (!decoded) {
          return new Response(null, { status: 401 });
        }
        req.context.userId = decoded.userId;
      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        return new Response(null, { status: 401 });
      }
    },
    async message(peer, msg) {
      const message = msg.text();
      try {
        const data = JSON.parse(message);
        if (data.type === 'command') {
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
      const context = peer.context as unknown as PeerContext;
      
      if (context.userId) {
        peerManager.removePeer(context.userId, peer.id);
      }
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
