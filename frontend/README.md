# Meetify Frontend

Modern video conferencing web application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🎥 HD video conferencing with WebRTC
- 💬 Real-time chat messaging
- 🎨 Modern, responsive UI
- 🌙 Dark mode support
- 📱 Mobile-friendly design
- 🔊 Audio/video controls
- 👥 Multi-participant support
- 📋 Easy room code sharing

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8080`

## Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/)

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file (copy from `.env.local.example`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_BASE_URL=http://localhost:8080
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page (create/join room)
│   ├── room/[roomCode]/   # Room page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── VideoGrid.tsx      # Video grid display
│   └── ChatPanel.tsx      # Chat interface
├── lib/                   # Utilities
│   ├── websocket.ts       # WebSocket service
│   └── webrtc.ts          # WebRTC manager
├── types/                 # TypeScript types
│   └── index.ts
└── package.json
```

## Usage

### Creating a Room

1. Enter your name and room name
2. Click "Create Room"
3. Share the room code with others

### Joining a Room

1. Enter your name and room code
2. Click "Join Room"
3. Allow camera and microphone access

### In-Room Controls

- **Mic button**: Mute/unmute audio
- **Video button**: Turn camera on/off
- **Chat button**: Open/close chat panel
- **Phone button**: Leave room

## Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **WebRTC**: Peer-to-peer video/audio
- **STOMP over WebSocket**: Real-time messaging
- **Lucide React**: Icon library

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### Camera/Microphone Not Working

- Check browser permissions for camera and microphone
- Ensure you're using HTTPS (or localhost)
- Try a different browser

### Connection Issues

- Verify backend is running on `http://localhost:8080`
- Check firewall settings
- Ensure WebSocket connection is allowed

### Video Not Showing

- Check camera is not being used by another application
- Verify browser has camera permission
- Check console for WebRTC errors

## License

MIT
