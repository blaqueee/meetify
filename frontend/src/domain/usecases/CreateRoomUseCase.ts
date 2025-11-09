import { IRoomRepository, CreateRoomRequest } from '../repositories/IRoomRepository';
import { Room } from '../entities/Room';
import { Participant } from '../entities/Participant';

export class CreateRoomUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(request: CreateRoomRequest): Promise<{ room: Room; participant: Participant }> {
    if (!request.roomName.trim()) {
      throw new Error('Room name is required');
    }
    if (!request.username.trim()) {
      throw new Error('Username is required');
    }

    return await this.roomRepository.createRoom(request);
  }
}
