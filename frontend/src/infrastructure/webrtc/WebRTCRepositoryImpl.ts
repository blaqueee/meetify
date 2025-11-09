import { IWebRTCRepository, WebRTCSignal, RemotePeer } from '../../domain/repositories/IWebRTCRepository';
import { IWebSocketRepository } from '../../domain/repositories/IWebSocketRepository';
import { API_CONFIG } from '../../shared/config';

export class WebRTCRepositoryImpl implements IWebRTCRepository {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private peerUsernames: Map<string, string> = new Map();
  private localStream: MediaStream | null = null;
  private sessionId: string;
  private wsRepository: IWebSocketRepository;

  private onRemoteStreamCallback?: (peer: RemotePeer) => void;
  private onPeerDisconnectedCallback?: (sessionId: string) => void;

  constructor(wsRepository: IWebSocketRepository, sessionId: string) {
    this.wsRepository = wsRepository;
    this.sessionId = sessionId;

    this.wsRepository.onSignal(this.handleSignal.bind(this));
  }

  async initialize(videoElement: HTMLVideoElement): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      videoElement.srcObject = this.localStream;

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera and microphone');
    }
  }

  async createOffer(remoteSessionId: string): Promise<void> {
    const peerConnection = this.getOrCreatePeerConnection(remoteSessionId);

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.wsRepository.sendSignal({
        type: 'offer',
        senderSessionId: this.sessionId,
        targetSessionId: remoteSessionId,
        data: offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      throw new Error('Failed to create WebRTC offer');
    }
  }

  async handleSignal(signal: WebRTCSignal): Promise<void> {
    const remoteSessionId = signal.senderSessionId;

    if (signal.type === 'offer') {
      await this.handleOffer(remoteSessionId, signal.data);
    } else if (signal.type === 'answer') {
      await this.handleAnswer(remoteSessionId, signal.data);
    } else if (signal.type === 'ice-candidate') {
      await this.handleIceCandidate(remoteSessionId, signal.data);
    }
  }

  private async handleOffer(remoteSessionId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.getOrCreatePeerConnection(remoteSessionId);

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.wsRepository.sendSignal({
        type: 'answer',
        senderSessionId: this.sessionId,
        targetSessionId: remoteSessionId,
        data: answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(remoteSessionId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(remoteSessionId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(remoteSessionId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(remoteSessionId);
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private getOrCreatePeerConnection(remoteSessionId: string): RTCPeerConnection {
    let peerConnection = this.peerConnections.get(remoteSessionId);

    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({
        iceServers: [...API_CONFIG.webrtc.iceServers]
      });

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          peerConnection!.addTrack(track, this.localStream!);
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.wsRepository.sendSignal({
            type: 'ice-candidate',
            senderSessionId: this.sessionId,
            targetSessionId: remoteSessionId,
            data: event.candidate,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        if (this.onRemoteStreamCallback && event.streams[0]) {
          const username = this.peerUsernames.get(remoteSessionId) || remoteSessionId;
          this.onRemoteStreamCallback({
            sessionId: remoteSessionId,
            username,
            stream: event.streams[0],
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection!.connectionState === 'failed' ||
          peerConnection!.connectionState === 'disconnected' ||
          peerConnection!.connectionState === 'closed'
        ) {
          this.removePeerConnection(remoteSessionId);
        }
      };

      this.peerConnections.set(remoteSessionId, peerConnection);
    }

    return peerConnection;
  }

  private removePeerConnection(remoteSessionId: string): void {
    const peerConnection = this.peerConnections.get(remoteSessionId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(remoteSessionId);
      this.peerUsernames.delete(remoteSessionId);

      if (this.onPeerDisconnectedCallback) {
        this.onPeerDisconnectedCallback(remoteSessionId);
      }
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  onRemoteStream(callback: (peer: RemotePeer) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onPeerDisconnected(callback: (sessionId: string) => void): void {
    this.onPeerDisconnectedCallback = callback;
  }

  registerPeerUsername(sessionId: string, username: string): void {
    this.peerUsernames.set(sessionId, username);
  }

  cleanup(): void {
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.peerUsernames.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }
}
