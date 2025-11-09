# Docker Quick Start для Meetify

## 🚀 Быстрый запуск

### Вариант 1: Production (рекомендуется для тестирования)

```bash
docker-compose up --build
```

### Вариант 2: Development (с hot reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Вариант 3: С Makefile (самый удобный)

```bash
# Production
make up

# Development
make dev
```

## 📦 Что включено

После запуска у вас будет работать:

| Сервис | Порт | URL |
|--------|------|-----|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| Database (PostgreSQL) | 5432 | localhost:5432 |

## 🛠️ Основные команды

```bash
# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Пересборка конкретного сервиса
docker-compose build backend
docker-compose up -d backend

# Очистка всего (включая БД)
docker-compose down -v
```

## 📝 Структура файлов

```
meetify/
├── Dockerfile                  # Backend production image
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose (hot reload)
├── Makefile                    # Shortcuts для команд
├── .dockerignore              # Файлы игнорируемые backend
├── DOCKER.md                  # Полная документация
└── frontend/
    ├── Dockerfile             # Frontend production image
    ├── Dockerfile.dev         # Frontend development image
    └── .dockerignore         # Файлы игнорируемые frontend
```

## 🔧 Troubleshooting

### Порты заняты?
Измените порты в `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend теперь на 3001
  - "8081:8080"  # Backend теперь на 8081
```

### Backend не стартует?
Проверьте логи:
```bash
docker-compose logs backend
```

### Нужно очистить всё и начать заново?
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## 📚 Подробная документация

Смотрите [DOCKER.md](DOCKER.md) для:
- Production deployment
- Environment variables
- Оптимизация образов
- Debugging
- И многое другое

## ⚡ С Makefile

```bash
make help       # Показать все команды
make up         # Production start
make dev        # Development start (hot reload)
make logs       # Просмотр логов
make clean      # Очистить всё
make shell-db   # Подключиться к PostgreSQL
```

## 🎯 Следующие шаги

1. Запустите один из вариантов выше
2. Откройте http://localhost:3000
3. Создайте комнату и проверьте видеосвязь
4. Для production деплоя смотрите [DOCKER.md](DOCKER.md)
