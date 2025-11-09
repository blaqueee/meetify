# Meetify - Video Conferencing Platform

A modern, full-stack video conferencing application built with Spring Boot and Next.js.

## Features

- 🎥 **HD Video Conferencing**: WebRTC-powered peer-to-peer video calls
- 💬 **Real-time Chat**: Live messaging during video calls
- 🚀 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🌙 **Dark Mode**: Automatic dark mode support
- 📱 **Mobile Responsive**: Works on desktop and mobile devices
- 👥 **Multi-participant**: Support for multiple users in one room
- 🔒 **Secure**: Room-based access control

## Tech Stack

### Backend
- **Spring Boot 3.5.7**: Java framework
- **PostgreSQL**: Database
- **WebSocket (STOMP)**: Real-time communication
- **JPA/Hibernate**: ORM
- **Lombok**: Code generation

### Frontend
- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **WebRTC**: Video/audio streaming
- **STOMP.js**: WebSocket client

## Project Structure

```
meetify/
├── src/                    # Backend source code
│   ├── main/
│   │   ├── java/org/blaque/meetify/
│   │   │   ├── config/    # Configuration
│   │   │   ├── controller/# REST & WebSocket controllers
│   │   │   ├── dto/       # Data transfer objects
│   │   │   ├── entity/    # JPA entities
│   │   │   ├── repository/# Data repositories
│   │   │   └── service/   # Business logic
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/               # Frontend Next.js app
│   ├── app/               # Pages and layouts
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── build.gradle           # Gradle configuration
└── CLAUDE.md             # Developer documentation
```

## Getting Started

### Prerequisites

- Java 17+
- PostgreSQL
- Node.js 18+ and npm
- Gradle (or use wrapper)

### Backend Setup

1. **Create PostgreSQL database:**
```bash
psql -U postgres
CREATE DATABASE meetify;
```

2. **Configure database** in `src/main/resources/application.properties`:
```properties
spring.datasource.username=postgres
spring.datasource.password=postgres
```

3. **Run backend:**
```bash
./gradlew bootRun
```

Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install Node.js** from [nodejs.org](https://nodejs.org/)

2. **Install dependencies:**
```bash
cd frontend
npm install
```

3. **Configure environment** (already set up in `.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_BASE_URL=http://localhost:8080
```

4. **Run frontend:**
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. **Create a room**: Enter your name and room name, click "Create Room"
3. **Share room code**: Copy the generated room code
4. **Join from another device/browser**: Enter name and room code
5. **Enjoy video calling**: Use controls to mute/unmute, toggle video, and chat

## API Documentation

See [API_USAGE.md](API_USAGE.md) for detailed API documentation with examples.

## Development Commands

### Backend
```bash
# Run application
./gradlew bootRun

# Build project
./gradlew build

# Run tests
./gradlew test

# Generate WAR file
./gradlew bootWar
```

### Frontend
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### WebRTC Flow
1. User creates/joins room via REST API
2. Frontend connects to WebSocket (STOMP)
3. Users exchange WebRTC signaling (offer/answer/ICE candidates)
4. Direct P2P media connection established between browsers
5. Backend only relays signaling messages, no media processing

### Database Schema
- **rooms**: Video meeting rooms
- **participants**: Users in rooms
- **chat_messages**: Chat history

## Configuration

### Backend Ports
- HTTP: `8080`
- WebSocket: `8080/ws`

### Frontend Ports
- Development: `3000`
- Production: `3000`

## Troubleshooting

### Backend Issues
- **Database connection failed**: Check PostgreSQL is running and credentials are correct
- **Port already in use**: Change port in `application.properties`

### Frontend Issues
- **Cannot connect to backend**: Verify backend is running on port 8080
- **Camera/microphone not working**: Check browser permissions
- **WebSocket connection failed**: Check CORS settings in backend

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

WebRTC requires:
- HTTPS (or localhost for development)
- Camera and microphone permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:
- Check [CLAUDE.md](INFO) for architecture details
- Check [API_USAGE.md](API_USAGE.md) for API examples
- Review [frontend/README.md](frontend/README.md) for frontend specifics

---

Built with ❤️ using Spring Boot and Next.js
