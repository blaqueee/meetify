export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  senderSessionId: string;
  targetSessionId?: string;
  data: any;
}

export interface RemotePeer {
  sessionId: string;
  username: string;
  stream: MediaStream;
}

export interface IWebRTCRepository {
  initialize(videoElement: HTMLVideoElement): Promise<MediaStream>;
  createOffer(remoteSessionId: string): Promise<void>;
  handleSignal(signal: WebRTCSignal): Promise<void>;
  toggleAudio(enabled: boolean): void;
  toggleVideo(enabled: boolean): void;
  cleanup(): void;
  onRemoteStream(callback: (peer: RemotePeer) => void): void;
  onPeerDisconnected(callback: (sessionId: string) => void): void;
}
