import { useState, useCallback } from 'react';
import { container } from '../../shared/di';
import { ChatMessage } from '../../domain/entities/ChatMessage';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChatHistory = useCallback(async (roomCode: string) => {
    setLoading(true);
    try {
      const useCase = container.getGetChatHistoryUseCase();
      const history = await useCase.execute(roomCode);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    loadChatHistory,
    addMessage,
    clearMessages,
  };
};
