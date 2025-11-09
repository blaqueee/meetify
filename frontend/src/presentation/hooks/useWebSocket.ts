import { useCallback, useRef } from 'react';
import { container } from '../../shared/di';
import { IWebSocketRepository, ParticipantEvent } from '../../domain/repositories/IWebSocketRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { WebRTCSignal } from '../../domain/repositories/IWebRTCRepository';

export const useWebSocket = () => {
  const wsRepositoryRef = useRef<IWebSocketRepository | null>(null);

  const connect = useCallback(
    (
      roomCode: string,
      sessionId: string,
      username: string,
      onConnected: () => void,
      onError: (error: Error) => void
    ) => {
      if (!wsRepositoryRef.current) {
        wsRepositoryRef.current = container.getWebSocketRepository();
      }

      wsRepositoryRef.current.connect(roomCode, sessionId, username, onConnected, onError);
    },
    []
  );

  const disconnect = useCallback(() => {
    if (wsRepositoryRef.current) {
      wsRepositoryRef.current.disconnect();
      wsRepositoryRef.current = null;
      container.resetWebSocketRepository();
    }
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (wsRepositoryRef.current) {
      wsRepositoryRef.current.sendChatMessage(message);
    }
  }, []);

  const updateStatus = useCallback((isMuted: boolean, isVideoEnabled: boolean) => {
    if (wsRepositoryRef.current) {
      wsRepositoryRef.current.updateStatus(isMuted, isVideoEnabled);
    }
  }, []);

  const onSignal = useCallback((callback: (signal: WebRTCSignal) => void) => {
    if (wsRepositoryRef.current) {
      wsRepositoryRef.current.onSignal(callback);
    }
  }, []);

  const onChatMessage = useCallback((callback: (message: ChatMessage) => void) => {
    if (wsRepositoryRef.current) {
      wsRepositoryRef.current.onChatMessage(callback);
    }
  }, []);

  const onParticipantEvent = useCallback((callback: (event: ParticipantEvent) => void) => {
    if (wsRepositoryRef.current) {
      wsRepositoryRef.current.onParticipantEvent(callback);
    }
  }, []);

  const setRoomId = useCallback((roomId: string) => {
    if (wsRepositoryRef.current && 'setRoomId' in wsRepositoryRef.current) {
      (wsRepositoryRef.current as any).setRoomId(roomId);
    }
  }, []);

  return {
    connect,
    disconnect,
    sendChatMessage,
    updateStatus,
    onSignal,
    onChatMessage,
    onParticipantEvent,
    setRoomId,
  };
};
