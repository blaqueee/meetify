import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IWebSocketRepository, ParticipantEvent } from '../../domain/repositories/IWebSocketRepository';
import { WebRTCSignal } from '../../domain/repositories/IWebRTCRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { API_CONFIG } from '../../shared/config';

export class WebSocketRepositoryImpl implements IWebSocketRepository {
  private client: Client | null = null;
  private roomCode: string = '';
  private sessionId: string = '';
  private username: string = '';
  private roomId: string = '';

  private onSignalCallback?: (signal: WebRTCSignal) => void;
  private onChatMessageCallback?: (message: ChatMessage) => void;
  private onParticipantEventCallback?: (event: ParticipantEvent) => void;

  connect(
    roomCode: string,
    sessionId: string,
    username: string,
    onConnected: () => void,
    onError: (error: Error) => void
  ): void {
    this.roomCode = roomCode;
    this.sessionId = sessionId;
    this.username = username;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_CONFIG.wsBaseURL}${API_CONFIG.websocket.endpoint}`),

      onConnect: () => {
        console.log('WebSocket connected');
        this.subscribeToTopics();
        this.notifyJoin();
        onConnected();
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        const error = new Error(`STOMP error: ${frame.headers['message'] || 'Unknown error'}`);
        onError(error);
      },

      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        const error = new Error('WebSocket connection error');
        onError(error);
      },

      reconnectDelay: API_CONFIG.websocket.reconnectInterval,
      heartbeatIncoming: API_CONFIG.websocket.heartbeatInterval,
      heartbeatOutgoing: API_CONFIG.websocket.heartbeatInterval,
    });

    this.client.activate();
  }

  private subscribeToTopics(): void {
    if (!this.client) return;

    this.client.subscribe(`/topic/room/${this.roomCode}/signal`, (message: IMessage) => {
      const signal: WebRTCSignal = JSON.parse(message.body);
      if (this.onSignalCallback && signal.senderSessionId !== this.sessionId) {
        this.onSignalCallback(signal);
      }
    });

    this.client.subscribe(`/queue/signal/${this.sessionId}`, (message: IMessage) => {
      const signal: WebRTCSignal = JSON.parse(message.body);
      if (this.onSignalCallback) {
        this.onSignalCallback(signal);
      }
    });

    this.client.subscribe(`/topic/room/${this.roomCode}/chat`, (message: IMessage) => {
      const chatData = JSON.parse(message.body);
      const chatMessage = ChatMessage.fromDTO(chatData);
      if (this.onChatMessageCallback) {
        this.onChatMessageCallback(chatMessage);
      }
    });

    this.client.subscribe(`/topic/room/${this.roomCode}/participant`, (message: IMessage) => {
      const event: ParticipantEvent = JSON.parse(message.body);
      if (this.onParticipantEventCallback) {
        this.onParticipantEventCallback(event);
      }
    });
  }

  private notifyJoin(): void {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/participant/${this.roomCode}/join`,
      body: JSON.stringify({
        username: this.username,
        sessionId: this.sessionId,
      }),
    });
  }

  sendSignal(signal: WebRTCSignal): void {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/signal/${this.roomCode}`,
      body: JSON.stringify(signal),
    });
  }

  sendChatMessage(message: string): void {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/chat/${this.roomCode}`,
      body: JSON.stringify({
        roomId: this.roomId,
        senderUsername: this.username,
        senderSessionId: this.sessionId,
        message,
      }),
    });
  }

  updateStatus(isMuted: boolean, isVideoEnabled: boolean): void {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/participant/${this.roomCode}/status`,
      body: JSON.stringify({
        sessionId: this.sessionId,
        username: this.username,
        isMuted,
        isVideoEnabled,
      }),
    });
  }

  onSignal(callback: (signal: WebRTCSignal) => void): void {
    this.onSignalCallback = callback;
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    this.onChatMessageCallback = callback;
  }

  onParticipantEvent(callback: (event: ParticipantEvent) => void): void {
    this.onParticipantEventCallback = callback;
  }

  disconnect(): void {
    if (this.client) {
      this.notifyLeave();
      this.client.deactivate();
      this.client = null;
    }
  }

  private notifyLeave(): void {
    if (!this.client) return;

    this.client.publish({
      destination: `/app/participant/${this.roomCode}/leave`,
      body: JSON.stringify({
        username: this.username,
        sessionId: this.sessionId,
      }),
    });
  }

  setRoomId(roomId: string): void {
    this.roomId = roomId;
  }
}
