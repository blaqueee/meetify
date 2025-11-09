import { WebRTCSignal } from './IWebRTCRepository';
import { ChatMessage } from '../entities/ChatMessage';

export interface ParticipantEvent {
  type: 'join' | 'leave' | 'status';
  participant?: {
    username: string;
    sessionId: string;
  };
  sessionId?: string;
  username?: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  timestamp?: string;
}

export interface IWebSocketRepository {
  connect(
    roomCode: string,
    sessionId: string,
    username: string,
    onConnected: () => void,
    onError: (error: Error) => void
  ): void;
  disconnect(): void;
  sendSignal(signal: WebRTCSignal): void;
  sendChatMessage(message: string): void;
  updateStatus(isMuted: boolean, isVideoEnabled: boolean): void;
  onSignal(callback: (signal: WebRTCSignal) => void): void;
  onChatMessage(callback: (message: ChatMessage) => void): void;
  onParticipantEvent(callback: (event: ParticipantEvent) => void): void;
}
