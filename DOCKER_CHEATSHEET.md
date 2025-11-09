# Docker Commands Cheatsheet для Meetify

Быстрая справка по всем Docker командам для Meetify.

## 🚀 Основные команды

### Development (с hot reload)
```bash
# Запуск
make dev
docker-compose -f docker-compose.dev.yml up

# Остановка
make dev-down
docker-compose -f docker-compose.dev.yml down

# Логи
make dev-logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Production (базовая версия)
```bash
# Запуск
make up
docker-compose up -d

# Остановка
make down
docker-compose down

# Логи
make logs
docker-compose logs -f
```

### Production (с nginx & SSL)
```bash
# Первый запуск (без nginx)
docker-compose -f docker-compose.prod.yml up -d db backend frontend

# Инициализация SSL
./scripts/init-letsencrypt.sh yourdomain.com your-email@example.com

# Запуск nginx
docker-compose -f docker-compose.prod.yml up -d nginx certbot

# Остановка всего
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Управление контейнерами

### Просмотр статуса
```bash
make ps
docker-compose ps
docker ps
```

### Перезапуск сервисов
```bash
# Все сервисы
make restart
docker-compose restart

# Конкретный сервис
make restart-backend
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Пересборка образов
```bash
# Всё с нуля
make build
docker-compose build --no-cache

# Конкретный сервис
make rebuild-backend
docker-compose build --no-cache backend
```

## 📊 Логи и мониторинг

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Последние N строк
docker-compose logs --tail=100 backend
```

### Статистика ресурсов
```bash
# Использование CPU/RAM/Network
docker stats

# Только Meetify контейнеры
docker stats meetify-backend meetify-frontend meetify-db
```

## 🐚 Доступ к контейнерам

### Shell доступ
```bash
# Backend
make shell-backend
docker exec -it meetify-backend sh

# Frontend
make shell-frontend
docker exec -it meetify-frontend sh

# Database (psql)
make shell-db
docker exec -it meetify-db psql -U postgres -d meetify
```

### Выполнение команд
```bash
# Backend - запуск тестов
docker exec -it meetify-backend ./gradlew test

# Backend - проверка переменных окружения
docker exec -it meetify-backend env

# Database - SQL запрос
docker exec -it meetify-db psql -U postgres -d meetify -c "SELECT * FROM rooms;"

# Frontend - проверка версии Node
docker exec -it meetify-frontend node --version
```

## 🗄️ База данных

### Backup
```bash
# Создать backup
./scripts/backup-database.sh

# Backup конкретного контейнера
./scripts/backup-database.sh meetify-db-prod

# Ручной backup
docker exec meetify-db pg_dump -U postgres meetify > backup.sql
```

### Restore
```bash
# Восстановить из backup
./scripts/restore-database.sh ./backups/meetify_backup_YYYYMMDD_HHMMSS.sql.gz

# Ручное восстановление
cat backup.sql | docker exec -i meetify-db psql -U postgres -d meetify
```

### Прямой доступ к PostgreSQL
```bash
# psql консоль
docker exec -it meetify-db psql -U postgres -d meetify

# SQL команды внутри psql:
\dt          # Список таблиц
\d rooms     # Структура таблицы rooms
\q           # Выход
```

## 🌐 Сеть и порты

### Проверка портов
```bash
# Проверить, что порты свободны
netstat -ano | findstr "3000 8080 5432"  # Windows
lsof -i :3000,8080,5432                   # Linux/Mac

# Какой контейнер использует порт
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Инспекция сети
```bash
# Информация о Docker сети
docker network inspect meetify_meetify-network

# Какие контейнеры в сети
docker network inspect meetify_meetify-network --format '{{range .Containers}}{{.Name}} {{end}}'
```

## 🧹 Очистка

### Остановка и удаление
```bash
# Остановить всё
docker-compose down

# Остановить и удалить volumes (УДАЛИТ БД!)
make clean
docker-compose down -v

# Production
docker-compose -f docker-compose.prod.yml down -v
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker image prune -f

# Удалить неиспользуемые volumes
docker volume prune -f

# Полная очистка (осторожно!)
docker system prune -a --volumes
```

## 🔍 Отладка

### Проверка здоровья контейнеров
```bash
# Статус health check
docker ps --format "table {{.Names}}\t{{.Status}}"

# Подробная информация
docker inspect meetify-backend --format '{{.State.Health.Status}}'
```

### Проверка подключений
```bash
# Backend доступен?
curl http://localhost:8080/api/actuator/health

# Frontend доступен?
curl http://localhost:3000

# Database доступна?
docker exec meetify-db pg_isready -U postgres
```

### Проверка переменных окружения
```bash
# Backend
docker exec meetify-backend env | grep SPRING

# Frontend
docker exec meetify-frontend env | grep NEXT_PUBLIC
```

## 📦 Образы

### Управление образами
```bash
# Список образов Meetify
docker images | grep meetify

# Размер образов
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Удалить старые образы
docker rmi $(docker images -f "dangling=true" -q)
```

### Инспекция образа
```bash
# История слоёв
docker history meetify-backend:latest

# Подробная информация
docker inspect meetify-backend:latest
```

## 🔄 Обновление

### Обновление после изменения кода
```bash
# Development (автоматически через hot reload)
# Ничего делать не нужно!

# Production - пересборка и перезапуск
docker-compose build backend
docker-compose up -d backend

# Или всё сразу
docker-compose up -d --build
```

### Обновление зависимостей
```bash
# Backend - обновить Gradle зависимости
docker-compose exec backend ./gradlew dependencies --refresh-dependencies

# Frontend - обновить npm зависимости
docker-compose exec frontend npm update
```

## 🎯 Быстрые проверки

### Всё ли работает?
```bash
# 1. Контейнеры запущены?
docker-compose ps

# 2. Backend отвечает?
curl http://localhost:8080/api/actuator/health

# 3. Frontend отвечает?
curl http://localhost:3000

# 4. БД работает?
docker exec meetify-db psql -U postgres -c "SELECT 1"

# 5. Логи без ошибок?
docker-compose logs --tail=50 | grep -i error
```

## 📚 Справка

```bash
# Все Makefile команды
make help

# Docker Compose помощь
docker-compose --help

# Docker помощь
docker --help
```

## 🆘 Аварийное восстановление

### Система не работает?
```bash
# 1. Остановить всё
docker-compose down

# 2. Очистить кэш
docker system prune -f

# 3. Пересобрать с нуля
docker-compose build --no-cache

# 4. Запустить заново
docker-compose up -d

# 5. Проверить логи
docker-compose logs -f
```

### База данных повреждена?
```bash
# 1. Остановить зависимые сервисы
docker-compose stop backend frontend

# 2. Восстановить из backup
./scripts/restore-database.sh ./backups/latest_backup.sql.gz

# 3. Запустить всё
docker-compose start backend frontend
```

## 💡 Полезные алиасы

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
# Meetify shortcuts
alias mup='cd /path/to/meetify && make up'
alias mdown='cd /path/to/meetify && make down'
alias mdev='cd /path/to/meetify && make dev'
alias mlogs='cd /path/to/meetify && make logs'
alias mrestart='cd /path/to/meetify && make restart'
alias mshell='cd /path/to/meetify && make shell-backend'
```

## 📖 Дополнительная документация

- **[DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)** - Быстрый старт
- **[DOCKER.md](DOCKER.md)** - Полная документация
- **[scripts/README.md](scripts/README.md)** - Утилиты для production
- **[DOCKER_SETUP_SUMMARY.md](DOCKER_SETUP_SUMMARY.md)** - Обзор setup
