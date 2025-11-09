export interface Room {
  id: string;
  roomCode: string;
  roomName: string;
  createdAt: string;
  isActive: boolean;
  participants: Participant[];
}

export interface Participant {
  id: string;
  username: string;
  sessionId: string;
  joinedAt: string;
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface ChatMessage {
  senderUsername: string;
  senderSessionId: string;
  message: string;
  sentAt: string;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  senderSessionId: string;
  targetSessionId?: string;
  data: any;
}

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
