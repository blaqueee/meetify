.PHONY: help build up down logs clean restart dev dev-down dev-logs test

# Default target
help:
	@echo "Meetify Docker Management"
	@echo ""
	@echo "Production commands:"
	@echo "  make build       - Build all Docker images"
	@echo "  make up          - Start all services in production mode"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make restart     - Restart all services"
	@echo "  make clean       - Stop services and remove volumes"
	@echo ""
	@echo "Development commands:"
	@echo "  make dev         - Start all services in development mode (with hot reload)"
	@echo "  make dev-down    - Stop development services"
	@echo "  make dev-logs    - View development logs"
	@echo ""
	@echo "Utility commands:"
	@echo "  make test        - Run backend tests"
	@echo "  make ps          - Show running containers"
	@echo "  make shell-backend   - Open shell in backend container"
	@echo "  make shell-frontend  - Open shell in frontend container"
	@echo "  make shell-db        - Open psql in database container"

# Production commands
build:
	docker-compose build --no-cache

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v
	docker system prune -f

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up --build

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Utility commands
test:
	./gradlew test

ps:
	docker-compose ps

shell-backend:
	docker exec -it meetify-backend sh

shell-frontend:
	docker exec -it meetify-frontend sh

shell-db:
	docker exec -it meetify-db psql -U postgres -d meetify

# Individual service management
restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

rebuild-backend:
	docker-compose build --no-cache backend
	docker-compose up -d backend

rebuild-frontend:
	docker-compose build --no-cache frontend
	docker-compose up -d frontend
