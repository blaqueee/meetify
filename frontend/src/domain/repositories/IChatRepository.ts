import { ChatMessage } from '../entities/ChatMessage';

export interface IChatRepository {
  getChatHistory(roomCode: string): Promise<ChatMessage[]>;
  sendMessage(roomCode: string, message: string): Promise<void>;
}
