'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Users, MessageSquare, Sparkles, Link2 } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { useI18n } from '../../shared/i18n';

export default function HomePage() {
  const router = useRouter();
  const { createRoom, joinRoom, loading, error } = useRoom();
  const { t } = useI18n();

  // Shared state
  const [username, setUsername] = useState('');

  // Create room state
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Join room state
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      return;
    }

    if (!roomName.trim()) {
      return;
    }

    setIsCreating(true);

    const result = await createRoom(roomName.trim(), username.trim());

    if (result) {
      const { room, participant } = result;
      router.push(
        `/room/${room.roomCode}?sessionId=${participant.sessionId}&username=${participant.username}&roomId=${room.id}`
      );
    }

    setIsCreating(false);
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      return;
    }

    if (!roomCode.trim()) {
      return;
    }

    setIsJoining(true);

    const participant = await joinRoom(roomCode.trim(), username.trim());

    if (participant) {
      // We need to get room ID, but for now we can navigate without it
      router.push(
        `/room/${roomCode.trim().toUpperCase()}?sessionId=${participant.sessionId}&username=${participant.username}`
      );
    }

    setIsJoining(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.home.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.home.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t.home.tagline}
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
            {t.home.hero.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.home.hero.description}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t.home.features.video.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t.home.features.video.description}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t.home.features.multiUser.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t.home.features.multiUser.description}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t.home.features.chat.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t.home.features.chat.description}
            </p>
          </div>
        </div>

        {/* Username Input (Shared) */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.home.form.yourName}
            </label>
            <input
              type="text"
              placeholder={t.home.form.yourNamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Meeting Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{t.home.form.createRoomTitle}</h3>
              <p className="text-blue-100">{t.home.form.createRoomSubtitle}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.home.form.roomName}
                </label>
                <input
                  type="text"
                  placeholder={t.home.form.roomNamePlaceholder}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={!username.trim()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={!username.trim() || !roomName.trim() || isCreating || loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? t.home.form.creating : t.home.form.createRoom}
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{t.home.form.joinRoomTitle}</h3>
              <p className="text-purple-100">{t.home.form.joinRoomSubtitle}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.home.form.roomCode}
                </label>
                <input
                  type="text"
                  placeholder={t.home.form.roomCodePlaceholder}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  disabled={!username.trim()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all uppercase disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!username.trim() || !roomCode.trim() || isJoining || loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isJoining ? t.home.form.joining : t.home.form.joinRoom}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20 py-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
