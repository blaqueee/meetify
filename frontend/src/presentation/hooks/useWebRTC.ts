import { useState, useCallback, useRef } from 'react';
import { container } from '../../shared/di';
import { IWebRTCRepository, RemotePeer } from '../../domain/repositories/IWebRTCRepository';

export const useWebRTC = (sessionId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const webrtcRepositoryRef = useRef<IWebRTCRepository | null>(null);

  const initialize = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!webrtcRepositoryRef.current) {
      webrtcRepositoryRef.current = container.getWebRTCRepository(sessionId);
    }

    const repo = webrtcRepositoryRef.current;

    repo.onRemoteStream((peer: RemotePeer) => {
      setRemotePeers((prev) => {
        const exists = prev.find((p) => p.sessionId === peer.sessionId);
        if (exists) {
          return prev.map((p) => (p.sessionId === peer.sessionId ? peer : p));
        }
        return [...prev, peer];
      });
    });

    repo.onPeerDisconnected((sessionId: string) => {
      setRemotePeers((prev) => prev.filter((p) => p.sessionId !== sessionId));
    });

    const stream = await repo.initialize(videoElement);
    setLocalStream(stream);

    return stream;
  }, [sessionId]);

  const createOffer = useCallback(async (remoteSessionId: string) => {
    if (webrtcRepositoryRef.current) {
      await webrtcRepositoryRef.current.createOffer(remoteSessionId);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (webrtcRepositoryRef.current) {
      const newMuted = !isMuted;
      webrtcRepositoryRef.current.toggleAudio(!newMuted);
      setIsMuted(newMuted);
      return newMuted;
    }
    return isMuted;
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (webrtcRepositoryRef.current) {
      const newVideoEnabled = !isVideoEnabled;
      webrtcRepositoryRef.current.toggleVideo(newVideoEnabled);
      setIsVideoEnabled(newVideoEnabled);
      return newVideoEnabled;
    }
    return isVideoEnabled;
  }, [isVideoEnabled]);

  const cleanup = useCallback(() => {
    if (webrtcRepositoryRef.current) {
      webrtcRepositoryRef.current.cleanup();
      webrtcRepositoryRef.current = null;
    }
    setLocalStream(null);
    setRemotePeers([]);
    container.resetWebRTCRepository();
  }, []);

  return {
    localStream,
    remotePeers,
    isMuted,
    isVideoEnabled,
    initialize,
    createOffer,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
};
