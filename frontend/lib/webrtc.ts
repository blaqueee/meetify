import { WebSocketService } from './websocket';
import { WebRTCSignal } from '@/types';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private wsService: WebSocketService;
  private localStream: MediaStream | null = null;
  private sessionId: string;

  private onRemoteStreamCallback?: (sessionId: string, stream: MediaStream) => void;
  private onPeerDisconnectedCallback?: (sessionId: string) => void;

  constructor(wsService: WebSocketService, sessionId: string) {
    this.wsService = wsService;
    this.sessionId = sessionId;

    this.wsService.onSignal(this.handleSignal.bind(this));
  }

  async initialize(localVideoRef: HTMLVideoElement) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      localVideoRef.srcObject = this.localStream;

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createOffer(remoteSessionId: string) {
    const peerConnection = this.getOrCreatePeerConnection(remoteSessionId);

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.wsService.sendSignal({
        type: 'offer',
        senderSessionId: this.sessionId,
        targetSessionId: remoteSessionId,
        data: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  private async handleSignal(signal: WebRTCSignal) {
    const remoteSessionId = signal.senderSessionId;

    if (signal.type === 'offer') {
      await this.handleOffer(remoteSessionId, signal.data);
    } else if (signal.type === 'answer') {
      await this.handleAnswer(remoteSessionId, signal.data);
    } else if (signal.type === 'ice-candidate') {
      await this.handleIceCandidate(remoteSessionId, signal.data);
    }
  }

  private async handleOffer(remoteSessionId: string, offer: RTCSessionDescriptionInit) {
    const peerConnection = this.getOrCreatePeerConnection(remoteSessionId);

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.wsService.sendSignal({
        type: 'answer',
        senderSessionId: this.sessionId,
        targetSessionId: remoteSessionId,
        data: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(remoteSessionId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(remoteSessionId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(remoteSessionId: string, candidate: RTCIceCandidateInit) {
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
      peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection!.addTrack(track, this.localStream!);
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.wsService.sendSignal({
            type: 'ice-candidate',
            senderSessionId: this.sessionId,
            targetSessionId: remoteSessionId,
            data: event.candidate
          });
        }
      };

      peerConnection.ontrack = (event) => {
        if (this.onRemoteStreamCallback && event.streams[0]) {
          this.onRemoteStreamCallback(remoteSessionId, event.streams[0]);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection!.connectionState === 'failed' ||
            peerConnection!.connectionState === 'disconnected' ||
            peerConnection!.connectionState === 'closed') {
          this.removePeerConnection(remoteSessionId);
        }
      };

      this.peerConnections.set(remoteSessionId, peerConnection);
    }

    return peerConnection;
  }

  private removePeerConnection(remoteSessionId: string) {
    const peerConnection = this.peerConnections.get(remoteSessionId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(remoteSessionId);

      if (this.onPeerDisconnectedCallback) {
        this.onPeerDisconnectedCallback(remoteSessionId);
      }
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  onRemoteStream(callback: (sessionId: string, stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onPeerDisconnected(callback: (sessionId: string) => void) {
    this.onPeerDisconnectedCallback = callback;
  }

  cleanup() {
    this.peerConnections.forEach((pc, sessionId) => {
      pc.close();
    });
    this.peerConnections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}
