'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Copy, Check, Link2 } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebSocket } from '../hooks/useWebSocket';
import { VideoGrid } from '../components/VideoGrid';
import { ChatPanel } from '../components/ChatPanel';
import { ParticipantEvent } from '../../domain/repositories/IWebSocketRepository';
import { useI18n } from '../../shared/i18n';

export default function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode.toUpperCase();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('sessionId') || '';
  const username = searchParams.get('username') || '';
  const roomId = searchParams.get('roomId') || '';

  const { getRoom } = useRoom();
  const { messages, loadChatHistory, addMessage } = useChat();
  const webrtc = useWebRTC(sessionId);
  const ws = useWebSocket();
  const { t } = useI18n();

  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !username) {
      router.push('/');
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeRoom();
    }

    return () => {
      cleanup();
    };
  }, []);

  const initializeRoom = async () => {
    try {
      const room = await getRoom(roomCode);
      if (room) {
        setRoomName(room.roomName);
      }

      await loadChatHistory(roomCode);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('sessionId');
        url.searchParams.delete('roomId');
        setShareLink(url.toString());
      }

      ws.onChatMessage((message) => {
        addMessage(message);
      });

      ws.onParticipantEvent((event) => {
        handleParticipantEvent(event);
      });

      if (roomId) {
        ws.setRoomId(roomId);
      }

      ws.connect(
        roomCode,
        sessionId,
        username,
        () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          initializeWebRTC();
        },
        (error) => {
          console.error('WebSocket error:', error);
        }
      );
    } catch (error) {
      console.error('Failed to initialize room:', error);
      router.push('/');
    }
  };

  const initializeWebRTC = async () => {
    if (!localVideoRef.current) return;

    try {
      await webrtc.initialize(localVideoRef.current);
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const handleParticipantEvent = (event: ParticipantEvent) => {
    if (event.type === 'join' && event.participant) {
      if (event.participant.sessionId !== sessionId) {
        setTimeout(() => {
          webrtc.createOffer(event.participant!.sessionId);
        }, 1000);
      }
    }
  };

  const toggleMute = () => {
    const newMuted = webrtc.toggleAudio();
    ws.updateStatus(newMuted, webrtc.isVideoEnabled);
  };

  const toggleVideo = () => {
    const newVideoEnabled = webrtc.toggleVideo();
    ws.updateStatus(webrtc.isMuted, newVideoEnabled);
  };

  const handleSendMessage = (message: string) => {
    ws.sendChatMessage(message);
  };

  const handleLeaveRoom = async () => {
    cleanup();
    router.push('/');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanup = () => {
    webrtc.cleanup();
    ws.disconnect();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{roomName || t.room.chat}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.room.roomCode}:</span>
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

              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
              >
                <Link2 className="w-4 h-4" />
                <span>{t.room.shareLink}</span>
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
              {isConnected ? t.room.connected : t.room.connecting}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {webrtc.remotePeers.length + 1} {webrtc.remotePeers.length === 0 ? t.room.participant : t.room.participants}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} transition-all`}>
          <VideoGrid
            localStream={webrtc.localStream}
            remotePeers={webrtc.remotePeers}
            username={username}
            isMuted={webrtc.isMuted}
            isVideoEnabled={webrtc.isVideoEnabled}
          />
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 xl:w-96">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              username={username}
              currentSessionId={sessionId}
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
              webrtc.isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title={webrtc.isMuted ? t.room.unmute : t.room.mute}
          >
            {webrtc.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              !webrtc.isVideoEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title={webrtc.isVideoEnabled ? t.room.turnOffCamera : t.room.turnOnCamera}
          >
            {webrtc.isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all ${
              showChat
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title={t.room.toggleChat}
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            onClick={handleLeaveRoom}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all ml-4"
            title={t.room.leaveRoom}
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
