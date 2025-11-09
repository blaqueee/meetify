import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { ApiClient } from './ApiClient';
import { API_CONFIG } from '../../shared/config';
import { ChatMessageDTO } from '../../application/dto';

export class ChatApiRepository implements IChatRepository {
  constructor(private apiClient: ApiClient) {}

  async getChatHistory(roomCode: string): Promise<ChatMessage[]> {
    try {
      const response = await this.apiClient.get<ChatMessageDTO[]>(
        API_CONFIG.endpoints.chatHistory(roomCode)
      );

      return response.map(dto => ChatMessage.fromDTO(dto));
    } catch (error) {
      console.warn('Chat history endpoint not available:', error);
      return [];
    }
  }

  async sendMessage(roomCode: string, message: string): Promise<void> {
    throw new Error('Send message should be done via WebSocket');
  }
}
