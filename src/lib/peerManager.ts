interface WebSocketPeer {
  send: (message: string) => void;
  id: string;
}

interface PeerConnection {
  peer: WebSocketPeer;
  userId: string;
}

class PeerManager {
  private peerMap: Map<string, PeerConnection[]>;

  constructor() {
    console.log("PeerManager constructor");
    this.peerMap = new Map<string, PeerConnection[]>();
  }

  public addPeer(userId: string, peer: WebSocketPeer): void {
    const existingPeers = this.peerMap.get(userId) || [];
    this.peerMap.set(userId, [...existingPeers, { peer, userId }]);
  }

  public removePeer(userId: string, peerId: string): void {
    const existingPeers = this.peerMap.get(userId) || [];
    const updatedPeers = existingPeers.filter(p => p.peer.id !== peerId);
    if (updatedPeers.length === 0) {
      this.peerMap.delete(userId);
    } else {
      this.peerMap.set(userId, updatedPeers);
    }
  }

  public getPeers(userId: string): PeerConnection[] {
    return this.peerMap.get(userId) || [];
  }

  public sendToPeer(userId: string, message: any): void {
    const peers = this.getPeers(userId);
    peers.forEach(p => p.peer.send(JSON.stringify(message)));
  }

  public getAllPeers(): Map<string, PeerConnection[]> {
    return this.peerMap;
  }
}

// Create and export a single instance
export const peerManager = new PeerManager(); 
