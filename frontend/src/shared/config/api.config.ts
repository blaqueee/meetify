export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  wsBaseURL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:8080',
  endpoints: {
    rooms: '/api/rooms',
    createRoom: '/api/rooms',
    joinRoom: '/api/rooms/join',
    leaveRoom: (sessionId: string) => `/api/rooms/leave/${sessionId}`,
    getRoom: (roomCode: string) => `/api/rooms/${roomCode}`,
    chatHistory: (roomCode: string) => `/api/rooms/${roomCode}/messages`,
  },
  websocket: {
    endpoint: '/ws',
    reconnectInterval: 5000,
    heartbeatInterval: 4000,
  },
  webrtc: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
} as const;
