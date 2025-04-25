import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { getAuth } from '@clerk/tanstack-react-start/server'

interface WebSocketPeer {
  send: (message: string) => void;
}

// This will be populated by the WebSocket handler
export const connectedPeers = new Map<string, { peer: WebSocketPeer; userId: string }>();

export const sendWebSocketCommand = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  console.log('Received context:', ctx);
  
  if (!ctx.data) {
    throw new Error('No data received in request');
  }

  const formData = ctx.data as FormData;
  const command = formData.get('command') as string;
  const peerId = formData.get('peerId') as string | null;

  if (!command) {
    throw new Error('No command specified in request');
  }

  const { userId } = await getAuth(getWebRequest()!)
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Find the peer for this user
  const peer = connectedPeers.get(peerId || userId)
  if (!peer) {
    throw new Error('No connected peer found for user')
  }

  // Send the command through the WebSocket
  peer.peer.send(JSON.stringify({ type: 'command', command }))
  
  return { success: true, command }
}) 
