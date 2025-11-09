import { IRoomRepository } from '../repositories/IRoomRepository';

export class LeaveRoomUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(sessionId: string): Promise<void> {
    if (!sessionId.trim()) {
      throw new Error('Session ID is required');
    }

    await this.roomRepository.leaveRoom(sessionId);
  }
}
