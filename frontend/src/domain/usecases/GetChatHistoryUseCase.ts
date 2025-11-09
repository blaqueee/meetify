import { IChatRepository } from '../repositories/IChatRepository';
import { ChatMessage } from '../entities/ChatMessage';

export class GetChatHistoryUseCase {
  constructor(private chatRepository: IChatRepository) {}

  async execute(roomCode: string): Promise<ChatMessage[]> {
    if (!roomCode.trim()) {
      throw new Error('Room code is required');
    }

    return await this.chatRepository.getChatHistory(roomCode);
  }
}
