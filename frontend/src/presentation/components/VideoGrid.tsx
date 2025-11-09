'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, User } from 'lucide-react';
import { RemotePeer } from '../../domain/repositories/IWebRTCRepository';

interface VideoGridProps {
  localStream: MediaStream | null;
  remotePeers: RemotePeer[];
  username: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export function VideoGrid({ localStream, remotePeers, username, isMuted, isVideoEnabled }: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const totalParticipants = remotePeers.length + 1;
  const gridCols = totalParticipants <= 2 ? 1 : totalParticipants <= 4 ? 2 : 3;

  return (
    <div
      className={`grid gap-4 h-full p-4 ${
        gridCols === 1 ? 'grid-cols-1' :
        gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {/* Local Video */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-white font-medium">{username} (You)</span>
            <div className="flex items-center gap-2">
              {isMuted ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-green-400" />
              )}
              {!isVideoEnabled && <VideoOff className="w-4 h-4 text-red-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Remote Videos */}
      {remotePeers.map((peer) => (
        <RemoteVideo key={peer.sessionId} peer={peer} />
      ))}
    </div>
  );
}

function RemoteVideo({ peer }: { peer: RemotePeer }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center justify-between">
          <span className="text-white font-medium">{peer.username}</span>
        </div>
      </div>
    </div>
  );
}
