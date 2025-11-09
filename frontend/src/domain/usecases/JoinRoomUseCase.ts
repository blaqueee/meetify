import { IRoomRepository, JoinRoomRequest } from '../repositories/IRoomRepository';
import { Participant } from '../entities/Participant';

export class JoinRoomUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(request: JoinRoomRequest): Promise<Participant> {
    if (!request.roomCode.trim()) {
      throw new Error('Room code is required');
    }
    if (!request.username.trim()) {
      throw new Error('Username is required');
    }

    const normalizedRequest = {
      ...request,
      roomCode: request.roomCode.toUpperCase()
    };

    return await this.roomRepository.joinRoom(normalizedRequest);
  }
}
