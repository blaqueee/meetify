# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meetify is a full-stack video conferencing platform consisting of:
- **Backend**: Spring Boot 3.5.7 REST API + WebSocket server
- **Frontend**: Next.js 15 web application with React and TypeScript

The backend handles room management, participant tracking, chat persistence, and WebRTC signaling. The frontend provides a modern UI for video calls with P2P WebRTC connections.

**Backend Details:**
- Group: org.blaque
- Artifact: meetify
- Package: org.blaque.meetify

**Frontend Details:**
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Location: `/frontend` directory

## Build System

This project uses Gradle with the Gradle Wrapper.

### Common Commands

**Build the project:**
```bash
./gradlew build
```

**Run the application:**
```bash
./gradlew bootRun
```

**Run tests:**
```bash
./gradlew test
```

**Run a single test:**
```bash
./gradlew test --tests org.blaque.meetify.MeetifyApplicationTests
./gradlew test --tests "org.blaque.meetify.*SpecificTest.testMethod"
```

**Clean build:**
```bash
./gradlew clean build
```

**Generate WAR file:**
```bash
./gradlew bootWar
```

## Architecture

### Application Overview

Meetify is a video conferencing backend that supports WebRTC P2P connections between clients. The backend handles:
- Room management (create/join rooms)
- WebRTC signaling via WebSocket (offer/answer/ICE candidates)
- Real-time chat functionality
- Participant state tracking

### Technology Stack

- **Spring Boot 3.5.7** with Web, WebSocket, JPA starters
- **Java 17** (language toolchain configured in build.gradle)
- **PostgreSQL** - Primary database for persistent storage
- **WebSocket + STOMP** - Real-time communication protocol
- **Hibernate/JPA** - ORM for database operations
- **Lombok** - Reduces boilerplate code
- **Bean Validation** - Request validation

### Database Setup

Before running the application, ensure PostgreSQL is running and create the database:

```bash
psql -U postgres
CREATE DATABASE meetify;
```

Update credentials in `application.properties` if needed:
- `spring.datasource.username`
- `spring.datasource.password`

### Application Structure

#### Entities (org.blaque.meetify.entity)
- **Room** - Video meeting room with unique room code
- **Participant** - User in a room with connection state
- **ChatMessage** - Chat messages within a room

#### DTOs (org.blaque.meetify.dto)
- Request/Response objects for REST APIs
- WebRTC signaling payloads
- Chat message objects

#### Services (org.blaque.meetify.service)
- **RoomService** - Room and participant management
- **ChatService** - Chat message persistence

#### Controllers
- **RoomController** - REST API for room operations (`/api/rooms`)
- **WebSocketController** - WebSocket handlers for signaling and chat

#### Configuration (org.blaque.meetify.config)
- **WebSocketConfig** - STOMP over WebSocket configuration
- **WebConfig** - CORS configuration for frontend access

### API Endpoints

#### REST API (HTTP)

**Create Room:**
```
POST /api/rooms
Body: {"roomName": "My Meeting"}
Response: {roomCode, roomName, id, participants, ...}
```

**Get Room:**
```
GET /api/rooms/{roomCode}
Response: {roomCode, roomName, participants, ...}
```

**Join Room:**
```
POST /api/rooms/join
Body: {"roomCode": "ABC123", "username": "John"}
Response: {sessionId, username, ...}
```

**Leave Room:**
```
POST /api/rooms/leave/{sessionId}
```

#### WebSocket API (STOMP)

**Connect:**
```
Endpoint: ws://localhost:8080/ws
```

**WebRTC Signaling:**
- Send: `/app/signal/{roomCode}`
- Subscribe: `/topic/room/{roomCode}/signal` (broadcast)
- Subscribe: `/queue/signal/{sessionId}` (direct)

**Chat:**
- Send: `/app/chat/{roomCode}`
- Subscribe: `/topic/room/{roomCode}/chat`

**Participant Events:**
- Join: `/app/participant/{roomCode}/join`
- Leave: `/app/participant/{roomCode}/leave`
- Status: `/app/participant/{roomCode}/status`
- Subscribe: `/topic/room/{roomCode}/participant`

### WebRTC Flow

1. Client A creates/joins room via REST API
2. Client A connects to WebSocket and subscribes to `/topic/room/{roomCode}/signal`
3. Client B joins the same room
4. Clients exchange WebRTC offers/answers/ICE candidates via WebSocket
5. Direct P2P media connection established between clients
6. Backend only relays signaling messages, no media processing

### Deployment

**Backend:**
The project is configured to build as a WAR file for deployment to external application servers. It can also run standalone using embedded Tomcat via `./gradlew bootRun`.

**Frontend:**
The Next.js application can be deployed to:
- Vercel (recommended)
- Any Node.js hosting
- Docker container
- Static export for CDN

## Full Stack Development

### Running Both Services

**Terminal 1 - Backend:**
```bash
./gradlew bootRun
# Runs on http://localhost:8080
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
# Runs on http://localhost:3000
```

### Frontend Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page (create/join)
│   ├── room/[roomCode]/      # Video room page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── VideoGrid.tsx         # Video display grid
│   └── ChatPanel.tsx         # Chat sidebar
├── lib/
│   ├── websocket.ts          # WebSocket/STOMP client
│   └── webrtc.ts             # WebRTC peer management
├── types/
│   └── index.ts              # TypeScript interfaces
└── package.json
```

### Key Files for Development

- **Backend API**: `src/main/java/org/blaque/meetify/controller/RoomController.java`
- **WebSocket**: `src/main/java/org/blaque/meetify/controller/WebSocketController.java`
- **Frontend API Client**: `frontend/app/page.tsx` (REST calls)
- **WebRTC Logic**: `frontend/lib/webrtc.ts`
- **WebSocket Client**: `frontend/lib/websocket.ts`

### Adding New Features

**New REST Endpoint:**
1. Add method to `RoomController.java`
2. Add corresponding fetch call in frontend
3. Update DTO classes if needed

**New WebSocket Event:**
1. Add handler in `WebSocketController.java`
2. Update `WebSocketService` in frontend
3. Handle event in room page component

**New UI Component:**
1. Create in `frontend/components/`
2. Import in room page
3. Style with Tailwind CSS classes
