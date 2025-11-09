import { IChatRepository } from '../repositories/IChatRepository';

export class SendChatMessageUseCase {
  constructor(private chatRepository: IChatRepository) {}

  async execute(roomCode: string, message: string): Promise<void> {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      throw new Error('Message cannot be empty');
    }

    if (trimmedMessage.length > 500) {
      throw new Error('Message is too long (max 500 characters)');
    }

    await this.chatRepository.sendMessage(roomCode, trimmedMessage);
  }
}
