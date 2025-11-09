import { IRoomRepository, CreateRoomRequest, JoinRoomRequest } from '../../domain/repositories/IRoomRepository';
import { Room } from '../../domain/entities/Room';
import { Participant } from '../../domain/entities/Participant';
import { ApiClient } from './ApiClient';
import { API_CONFIG } from '../../shared/config';
import { CreateRoomResponseDTO, JoinRoomResponseDTO, RoomDTO } from '../../application/dto';

export class RoomApiRepository implements IRoomRepository {
  constructor(private apiClient: ApiClient) {}

  async createRoom(request: CreateRoomRequest): Promise<{ room: Room; participant: Participant }> {
    const roomResponse = await this.apiClient.post<CreateRoomResponseDTO>(
      API_CONFIG.endpoints.createRoom,
      {
        roomName: request.roomName,
      }
    );

    const joinResponse = await this.apiClient.post<JoinRoomResponseDTO>(
      API_CONFIG.endpoints.joinRoom,
      {
        roomCode: roomResponse.roomCode,
        username: request.username,
      }
    );

    const room = Room.fromDTO(roomResponse);
    const participant = Participant.fromDTO({
      id: joinResponse.sessionId,
      username: joinResponse.username,
      sessionId: joinResponse.sessionId,
      joinedAt: roomResponse.createdAt,
      isConnected: true,
      isMuted: false,
      isVideoEnabled: true,
    });

    return { room, participant };
  }

  async getRoom(roomCode: string): Promise<Room> {
    const response = await this.apiClient.get<RoomDTO>(
      API_CONFIG.endpoints.getRoom(roomCode)
    );

    return Room.fromDTO(response);
  }

  async joinRoom(request: JoinRoomRequest): Promise<Participant> {
    const response = await this.apiClient.post<JoinRoomResponseDTO>(
      API_CONFIG.endpoints.joinRoom,
      {
        roomCode: request.roomCode,
        username: request.username,
      }
    );

    return Participant.fromDTO({
      id: response.sessionId,
      username: response.username,
      sessionId: response.sessionId,
      joinedAt: new Date().toISOString(),
      isConnected: true,
      isMuted: false,
      isVideoEnabled: true,
    });
  }

  async leaveRoom(sessionId: string): Promise<void> {
    await this.apiClient.post(API_CONFIG.endpoints.leaveRoom(sessionId));
  }
}
