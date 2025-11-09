export interface RoomDTO {
  id: string;
  roomCode: string;
  roomName: string;
  createdAt: string;
  isActive: boolean;
  participants: ParticipantDTO[];
}

export interface ParticipantDTO {
  id: string;
  username: string;
  sessionId: string;
  joinedAt: string;
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface ChatMessageDTO {
  id?: string;
  senderUsername: string;
  senderSessionId: string;
  message: string;
  sentAt: string;
}

export interface CreateRoomResponseDTO {
  id: string;
  roomCode: string;
  roomName: string;
  createdAt: string;
  isActive: boolean;
  participants: ParticipantDTO[];
  sessionId: string;
  username: string;
}

export interface JoinRoomResponseDTO {
  sessionId: string;
  username: string;
}
