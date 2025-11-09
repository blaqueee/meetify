# Meetify Project Structure

Complete overview of the Meetify project structure after Docker setup.

```
meetify/
├── 🐳 Docker Configuration
│   ├── Dockerfile                      # Backend production image
│   ├── docker-compose.yml              # Basic production setup
│   ├── docker-compose.dev.yml          # Development with hot reload
│   ├── docker-compose.prod.yml         # Full production with nginx & SSL
│   ├── .dockerignore                   # Backend Docker ignore
│   └── nginx.conf                      # Nginx reverse proxy config
│
├── 📚 Documentation
│   ├── DOCKER.md                       # Complete Docker documentation
│   ├── DOCKER_QUICKSTART.md            # Quick start guide
│   ├── DOCKER_SETUP_SUMMARY.md         # Setup summary
│   ├── DOCKER_CHEATSHEET.md            # Commands cheatsheet
│   ├── PROJECT_STRUCTURE.md            # This file
│   └── REFACTORING_SUMMARY.md          # Previous refactoring notes
│
├── 🛠️ Utilities
│   ├── Makefile                        # Command shortcuts
│   ├── .env.example                    # Environment variables template
│   └── scripts/
│       ├── README.md                   # Scripts documentation
│       ├── init-letsencrypt.sh         # SSL certificate setup
│       ├── backup-database.sh          # Database backup utility
│       └── restore-database.sh         # Database restore utility
│
├── 🚀 CI/CD
│   └── .github/
│       └── workflows/
│           └── docker-build.yml        # GitHub Actions workflow
│
├── ☕ Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/blaque/meetify/
│   │   │   │   ├── MeetifyApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── WebConfig.java
│   │   │   │   │   └── WebSocketConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── RoomController.java
│   │   │   │   │   └── WebSocketController.java
│   │   │   │   ├── dto/
│   │   │   │   │   └── [Request/Response DTOs]
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Room.java
│   │   │   │   │   ├── Participant.java
│   │   │   │   │   └── ChatMessage.java
│   │   │   │   ├── repository/
│   │   │   │   │   └── [JPA Repositories]
│   │   │   │   └── service/
│   │   │   │       ├── RoomService.java
│   │   │   │       └── ChatService.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/org/blaque/meetify/
│   ├── build.gradle                    # Gradle build configuration
│   ├── settings.gradle                 # Gradle settings
│   ├── gradlew                         # Gradle wrapper (Unix)
│   └── gradlew.bat                     # Gradle wrapper (Windows)
│
├── ⚛️ Frontend (Next.js)
│   ├── frontend/
│   │   ├── app/
│   │   │   ├── page.tsx                # Home page (create/join)
│   │   │   ├── layout.tsx              # Root layout
│   │   │   ├── globals.css             # Global styles
│   │   │   ├── room/
│   │   │   │   └── [roomCode]/         # Dynamic room page
│   │   │   └── [locale]/               # i18n routing
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── VideoGrid.tsx       # Video display
│   │   │   │   ├── ChatPanel.tsx       # Chat sidebar
│   │   │   │   └── [Other components]
│   │   │   ├── lib/
│   │   │   │   ├── websocket.ts        # WebSocket client
│   │   │   │   └── webrtc.ts           # WebRTC logic
│   │   │   ├── shared/
│   │   │   │   └── i18n/               # Internationalization
│   │   │   └── types/
│   │   │       └── index.ts            # TypeScript types
│   │   ├── public/                     # Static assets
│   │   ├── Dockerfile                  # Production image
│   │   ├── Dockerfile.dev              # Development image
│   │   ├── .dockerignore               # Frontend Docker ignore
│   │   ├── package.json                # Dependencies
│   │   ├── next.config.ts              # Next.js config
│   │   ├── tailwind.config.ts          # Tailwind CSS config
│   │   ├── postcss.config.mjs          # PostCSS config
│   │   └── tsconfig.json               # TypeScript config
│
├── 🗄️ Database & Volumes
│   ├── backups/                        # Database backups (created at runtime)
│   ├── certbot/                        # SSL certificates (created at runtime)
│   │   ├── conf/                       # Let's Encrypt configs
│   │   └── www/                        # ACME challenge
│   └── [Docker volumes]
│       ├── postgres_data               # Production DB data
│       ├── postgres_data_dev           # Development DB data
│       └── postgres_data_prod          # Production with nginx DB data
│
└── 🔧 Configuration Files
    ├── .gitignore                      # Git ignore (updated)
    ├── .env.example                    # Environment template
    └── .env                            # Environment variables (create from .env.example)
```

## 📊 File Count Summary

### Docker Configuration: 7 files
- Dockerfiles: 3 (backend, frontend prod, frontend dev)
- Docker Compose: 3 (basic, dev, prod)
- Nginx: 1

### Documentation: 7 files
- Main docs: 5 (DOCKER.md, QUICKSTART, SUMMARY, CHEATSHEET, STRUCTURE)
- Project docs: 2 (CLAUDE.md, REFACTORING_SUMMARY.md)

### Utilities: 6 files
- Scripts: 4 (README, init-ssl, backup, restore)
- Config: 2 (Makefile, .env.example)

### CI/CD: 1 file
- GitHub Actions: 1

### Total New Files: 21 files

## 🎯 Key Directories

### Development
```
/src                    # Backend source code
/frontend/src           # Frontend source code
/frontend/app           # Next.js app directory
```

### Configuration
```
/scripts                # Utility scripts
/.github/workflows      # CI/CD pipelines
```

### Runtime (created automatically)
```
/backups                # Database backups
/certbot                # SSL certificates
/build                  # Backend build output
/frontend/.next         # Frontend build output
```

## 🔍 Important Files

### Must Configure Before Production
1. `.env` (copy from .env.example)
2. `nginx.conf` (update domain)
3. `scripts/init-letsencrypt.sh` (run for SSL)

### Must Keep in .gitignore
1. `.env`
2. `/backups/*.sql*`
3. `/certbot/conf/*`
4. `/build`
5. `/.gradle`
6. `/frontend/.next`
7. `/frontend/node_modules`

### Must Version Control
1. `.env.example`
2. All Docker files
3. All documentation
4. All scripts
5. Source code

## 📦 Docker Images

### Production Images (optimized)
```
meetify-backend:latest          ~300MB (Alpine + JRE 17 + WAR)
meetify-frontend:latest         ~200MB (Alpine + Node 20 + Next.js)
postgres:16-alpine               ~230MB
nginx:alpine                     ~40MB
certbot/certbot                  ~100MB
```

### Total size: ~870MB for complete stack

## 🌐 Network Architecture

```
Docker Network: meetify-network (bridge)
├── Container: meetify-db           (internal)
├── Container: meetify-backend      (internal)
├── Container: meetify-frontend     (internal)
├── Container: meetify-nginx        (ports: 80, 443)
└── Container: meetify-certbot      (internal)

External Access:
- Port 80  → nginx → HTTP redirect to HTTPS
- Port 443 → nginx → frontend (/) + backend (/api) + WebSocket (/ws)
```

## 🔐 Security Layers

1. **Network Isolation**: All services in private Docker network
2. **No Direct Exposure**: Only nginx exposed to public
3. **SSL/TLS**: Automatic Let's Encrypt certificates
4. **Environment Variables**: Secrets in .env (not in git)
5. **Regular Backups**: Automated database backups
6. **Health Checks**: Container health monitoring
7. **Resource Limits**: Can be added to docker-compose

## 📈 Scalability Options

### Horizontal Scaling (future)
- Add load balancer
- Multiple backend instances
- Redis for session management
- PostgreSQL replica

### Current Architecture
- Single instance of each service
- Suitable for small to medium deployments
- Can handle 100+ concurrent users

## 🎓 Learning Resources

Each major component has detailed documentation:

- **Getting Started**: [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)
- **Complete Guide**: [DOCKER.md](DOCKER.md)
- **Command Reference**: [DOCKER_CHEATSHEET.md](DOCKER_CHEATSHEET.md)
- **Scripts Guide**: [scripts/README.md](scripts/README.md)
- **Project Overview**: [CLAUDE.md](INFO)
