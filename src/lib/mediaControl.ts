// src/lib/mediaControl.ts
import { EventSourcePolyfill } from 'event-source-polyfill';

const MEDIA_CONTROL_URL = 'http://localhost:3002/events';

export class MediaControlClient {
  private eventSource: EventSourcePolyfill | null = null;
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  connect(token: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSourcePolyfill(MEDIA_CONTROL_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'connected') {
        console.log('Connected to media control server');
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.eventSource?.close();
      this.eventSource = null;
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
