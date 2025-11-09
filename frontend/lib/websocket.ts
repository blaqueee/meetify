import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebRTCSignal, ChatMessage, ParticipantEvent } from '@/types';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:8080';

export class WebSocketService {
  private client: Client | null = null;
  private roomCode: string;
  private sessionId: string;
  private username: string;
  private roomId: string;

  private onSignalCallback?: (signal: WebRTCSignal) => void;
  private onChatMessageCallback?: (message: ChatMessage) => void;
  private onParticipantEventCallback?: (event: ParticipantEvent) => void;

  constructor(roomCode: string, sessionId: string, username: string, roomId: string) {
    this.roomCode = roomCode;
    this.sessionId = sessionId;
    this.username = username;
    this.roomId = roomId;
  }

  connect(
    onConnected: () => void,
    onError: (error: any) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),

        onConnect: () => {
          console.log('WebSocket connected');
          this.subscribeToTopics();
          this.notifyJoin();
          onConnected();
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          onError(frame);
          reject(frame);
        },

        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          onError(event);
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.activate();
    });
  }

  private subscribeToTopics() {
    if (!this.client) return;

    // Subscribe to WebRTC signaling (broadcast)
    this.client.subscribe(`/topic/room/${this.roomCode}/signal`, (message: IMessage) => {
      const signal: WebRTCSignal = JSON.parse(message.body);
      if (this.onSignalCallback && signal.senderSessionId !== this.sessionId) {
        this.onSignalCallback(signal);
      }
    });

    // Subscribe to direct signals
    this.client.subscribe(`/queue/signal/${this.sessionId}`, (message: IMessage) => {
      const signal: WebRTCSignal = JSON.parse(message.body);
      if (this.onSignalCallback) {
        this.onSignalCallback(signal);
      }
    });

    // Subscribe to chat messages
    this.client.subscribe(`/topic/room/${this.roomCode}/chat`, (message: IMessage) => {
      const chatMessage: ChatMessage = JSON.parse(message.body);
      if (this.onChatMessageCallback) {
        this.onChatMessageCallback(chatMessage);
      }
    });

    // Subscribe to participant events
    this.client.subscribe(`/topic/room/${this.roomCode}/participant`, (message: IMessage) => {
      const event: ParticipantEvent = JSON.parse(message.body);
      if (this.onParticipantEventCallback) {
        this.onParticipantEventCallback(event);
      }
    });
  }

  private notifyJoin() {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/participant/${this.roomCode}/join`,
      body: JSON.stringify({
        username: this.username,
        sessionId: this.sessionId
      })
    });
  }

  sendSignal(signal: WebRTCSignal) {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/signal/${this.roomCode}`,
      body: JSON.stringify(signal)
    });
  }

  sendChatMessage(message: string) {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/chat/${this.roomCode}`,
      body: JSON.stringify({
        roomId: this.roomId,
        senderUsername: this.username,
        senderSessionId: this.sessionId,
        message
      })
    });
  }

  updateStatus(isMuted: boolean, isVideoEnabled: boolean) {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/participant/${this.roomCode}/status`,
      body: JSON.stringify({
        sessionId: this.sessionId,
        username: this.username,
        isMuted,
        isVideoEnabled
      })
    });
  }

  notifyLeave() {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/participant/${this.roomCode}/leave`,
      body: JSON.stringify({
        username: this.username,
        sessionId: this.sessionId
      })
    });
  }

  onSignal(callback: (signal: WebRTCSignal) => void) {
    this.onSignalCallback = callback;
  }

  onChatMessage(callback: (message: ChatMessage) => void) {
    this.onChatMessageCallback = callback;
  }

  onParticipantEvent(callback: (event: ParticipantEvent) => void) {
    this.onParticipantEventCallback = callback;
  }

  disconnect() {
    if (this.client) {
      this.notifyLeave();
      this.client.deactivate();
      this.client = null;
    }
  }
}
