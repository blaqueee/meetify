import { useState } from 'react';
import { container } from '../../shared/di';
import { Room } from '../../domain/entities/Room';
import { Participant } from '../../domain/entities/Participant';

export const useRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (roomName: string, username: string): Promise<{ room: Room; participant: Participant } | null> => {
    setLoading(true);
    setError(null);

    try {
      const useCase = container.getCreateRoomUseCase();
      const result = await useCase.execute({ roomName, username });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomCode: string, username: string): Promise<Participant | null> => {
    setLoading(true);
    setError(null);

    try {
      const useCase = container.getJoinRoomUseCase();
      const participant = await useCase.execute({ roomCode, username });
      return participant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getRoom = async (roomCode: string): Promise<Room | null> => {
    setLoading(true);
    setError(null);

    try {
      const useCase = container.getGetRoomUseCase();
      const room = await useCase.execute(roomCode);
      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get room';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async (sessionId: string): Promise<boolean> => {
    try {
      const useCase = container.getLeaveRoomUseCase();
      await useCase.execute(sessionId);
      return true;
    } catch (err) {
      console.error('Failed to leave room:', err);
      return false;
    }
  };

  return {
    createRoom,
    joinRoom,
    getRoom,
    leaveRoom,
    loading,
    error,
  };
};
