import { IRoomRepository } from '../repositories/IRoomRepository';
import { Room } from '../entities/Room';

export class GetRoomUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(roomCode: string): Promise<Room> {
    if (!roomCode.trim()) {
      throw new Error('Room code is required');
    }

    return await this.roomRepository.getRoom(roomCode);
  }
}
