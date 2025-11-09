import { Room } from '../entities/Room';
import { Participant } from '../entities/Participant';

export interface CreateRoomRequest {
  roomName: string;
  username: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  username: string;
}

export interface IRoomRepository {
  createRoom(request: CreateRoomRequest): Promise<{ room: Room; participant: Participant }>;
  getRoom(roomCode: string): Promise<Room>;
  joinRoom(request: JoinRoomRequest): Promise<Participant>;
  leaveRoom(sessionId: string): Promise<void>;
}
