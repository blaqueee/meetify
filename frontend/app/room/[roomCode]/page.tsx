'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Copy, Check } from 'lucide-react';
import { WebSocketService } from '@/lib/websocket';
import { WebRTCManager } from '@/lib/webrtc';
import { VideoGrid } from '@/components/VideoGrid';
import { ChatPanel } from '@/components/ChatPanel';
import { ChatMessage, ParticipantEvent } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface RemotePeer {
  sessionId: string;
  username: string;
  stream: MediaStream;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export default function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode;
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('sessionId') || '';
  const username = searchParams.get('username') || '';
  const roomId = searchParams.get('roomId') || '';

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [roomName, setRoomName] = useState('');
  const [copied, setCopied] = useState(false);

  const wsServiceRef = useRef<WebSocketService | null>(null);
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sessionId || !username || !roomId) {
      router.push('/');
      return;
    }

    initializeRoom();

    return () => {
      cleanup();
    };
  }, []);

  const initializeRoom = async () => {
    try {
      // Fetch room info
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomCode}`);
      const room = await response.json();
      setRoomName(room.roomName);

      // Initialize WebSocket
      wsServiceRef.current = new WebSocketService(roomCode, sessionId, username, roomId);

      // Setup WebSocket callbacks
      wsServiceRef.current.onChatMessage((message) => {
        setChatMessages(prev => [...prev, message]);
      });

      wsServiceRef.current.onParticipantEvent((event) => {
        handleParticipantEvent(event);
      });

      await wsServiceRef.current.connect(
        () => {
          setIsConnected(true);
          initializeWebRTC();
        },
        (error) => {
          console.error('WebSocket connection error:', error);
        }
      );
    } catch (error) {
      console.error('Failed to initialize room:', error);
      router.push('/');
    }
  };

  const initializeWebRTC = async () => {
    if (!wsServiceRef.current || !localVideoRef.current) return;

    try {
      webrtcManagerRef.current = new WebRTCManager(wsServiceRef.current, sessionId);

      // Setup WebRTC callbacks
      webrtcManagerRef.current.onRemoteStream((remoteSessionId, stream) => {
        setRemotePeers(prev => {
          const existing = prev.find(p => p.sessionId === remoteSessionId);
          if (existing) {
            return prev.map(p =>
              p.sessionId === remoteSessionId ? { ...p, stream } : p
            );
          }
          return [...prev, {
            sessionId: remoteSessionId,
            username: 'Participant',
            stream,
            isMuted: false,
            isVideoEnabled: true
          }];
        });
      });

      webrtcManagerRef.current.onPeerDisconnected((remoteSessionId) => {
        setRemotePeers(prev => prev.filter(p => p.sessionId !== remoteSessionId));
      });

      // Get local media
      const stream = await webrtcManagerRef.current.initialize(localVideoRef.current);
      setLocalStream(stream);

    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const handleParticipantEvent = (event: ParticipantEvent) => {
    if (event.type === 'join' && event.participant) {
      // Create offer for new participant
      if (event.participant.sessionId !== sessionId && webrtcManagerRef.current) {
        setTimeout(() => {
          webrtcManagerRef.current?.createOffer(event.participant!.sessionId);
        }, 1000);
      }

      // Add to remote peers
      setRemotePeers(prev => {
        const exists = prev.find(p => p.sessionId === event.participant!.sessionId);
        if (!exists && event.participant!.sessionId !== sessionId) {
          return [...prev, {
            sessionId: event.participant!.sessionId,
            username: event.participant!.username,
            stream: new MediaStream(),
            isMuted: false,
            isVideoEnabled: true
          }];
        }
        return prev;
      });
    } else if (event.type === 'leave' && event.participant) {
      setRemotePeers(prev => prev.filter(p => p.sessionId !== event.participant!.sessionId));
    } else if (event.type === 'status') {
      setRemotePeers(prev => prev.map(p =>
        p.sessionId === event.sessionId
          ? {
              ...p,
              isMuted: event.isMuted ?? p.isMuted,
              isVideoEnabled: event.isVideoEnabled ?? p.isVideoEnabled
            }
          : p
      ));
    }
  };

  const toggleMute = () => {
    if (webrtcManagerRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      webrtcManagerRef.current.toggleAudio(!newMutedState);
      wsServiceRef.current?.updateStatus(newMutedState, isVideoEnabled);
    }
  };

  const toggleVideo = () => {
    if (webrtcManagerRef.current) {
      const newVideoState = !isVideoEnabled;
      setIsVideoEnabled(newVideoState);
      webrtcManagerRef.current.toggleVideo(newVideoState);
      wsServiceRef.current?.updateStatus(isMuted, newVideoState);
    }
  };

  const handleSendMessage = (message: string) => {
    wsServiceRef.current?.sendChatMessage(message);
  };

  const handleLeaveRoom = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/rooms/leave/${sessionId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
    cleanup();
    router.push('/');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanup = () => {
    webrtcManagerRef.current?.cleanup();
    wsServiceRef.current?.disconnect();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{roomName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Room Code:</span>
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <code className="text-sm font-mono text-gray-900 dark:text-white">{roomCode}</code>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {remotePeers.length + 1} {remotePeers.length === 0 ? 'participant' : 'participants'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} transition-all`}>
          <VideoGrid
            localStream={localStream}
            remotePeers={remotePeers}
            username={username}
            isMuted={isMuted}
            isVideoEnabled={isVideoEnabled}
          />
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 xl:w-96">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              username={username}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              !isVideoEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all ${
              showChat
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title="Toggle chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            onClick={handleLeaveRoom}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all ml-4"
            title="Leave room"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Hidden local video ref */}
      <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
    </div>
  );
}
