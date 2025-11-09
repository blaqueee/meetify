# Docker Deployment Guide

## Быстрый старт

### Production режим

Запуск оптимизированных production образов:

```bash
docker-compose up --build
```

### Development режим (с hot reload)

Запуск в режиме разработки с автоматической перезагрузкой:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Приложение будет доступно по адресам:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5432

### Остановка сервисов

```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### Остановка с удалением volumes (очистка БД)

```bash
# Production
docker-compose down -v

# Development
docker-compose -f docker-compose.dev.yml down -v
```

## Различия между Production и Development режимами

### Production (docker-compose.yml)
- ✅ Оптимизированные multi-stage образы
- ✅ Минимальный размер (~500MB total)
- ✅ Быстрый запуск
- ❌ Нет hot reload
- ❌ Требует пересборку при изменениях

### Development (docker-compose.dev.yml)
- ✅ Hot reload для frontend и backend
- ✅ Изменения кода применяются автоматически
- ✅ Volume mounts для исходного кода
- ✅ Spring DevTools активированы
- ❌ Больший размер образов
- ❌ Медленнее первый запуск

## Структура

### Сервисы

1. **db** - PostgreSQL 16
   - Порт: 5432
   - База данных: meetify
   - Credentials: postgres/postgres
   - Volume: postgres_data

2. **backend** - Spring Boot
   - Порт: 8080
   - Зависит от: db
   - Автоматически применяет миграции при старте

3. **frontend** - Next.js
   - Порт: 3000
   - Зависит от: backend
   - Подключается к backend через localhost:8080

## Makefile (рекомендуется)

Для удобства управления Docker командами используйте Makefile:

```bash
# Показать все доступные команды
make help

# Production
make up          # Запустить production
make down        # Остановить
make logs        # Просмотр логов
make clean       # Очистить всё (включая volumes)

# Development
make dev         # Запустить dev с hot reload
make dev-down    # Остановить dev
make dev-logs    # Логи dev

# Utility
make shell-backend   # Открыть shell в backend контейнере
make shell-frontend  # Открыть shell в frontend контейнере
make shell-db        # Открыть psql в database
```

## Полезные команды (без Makefile)

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Перезапуск отдельного сервиса

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Пересборка образов

```bash
# Пересобрать всё
docker-compose build --no-cache

# Пересобрать конкретный сервис
docker-compose build --no-cache backend
```

### Доступ к контейнеру

```bash
# Backend
docker exec -it meetify-backend sh

# Frontend
docker exec -it meetify-frontend sh

# Database
docker exec -it meetify-db psql -U postgres -d meetify
```

## Переменные окружения

### Backend (application.properties)
Переопределяются через docker-compose.yml:
- `SPRING_DATASOURCE_URL` - URL подключения к БД
- `SPRING_DATASOURCE_USERNAME` - Пользователь БД
- `SPRING_DATASOURCE_PASSWORD` - Пароль БД

### Frontend
Настраиваются в docker-compose.yml:
- `NEXT_PUBLIC_API_URL` - URL backend API
- `NEXT_PUBLIC_WS_URL` - WebSocket URL

## Production Deployment

Meetify включает полноценную production конфигурацию с nginx reverse proxy, SSL/TLS и автоматическим backup.

### Предварительные требования

1. Сервер (VPS/dedicated) с Docker и Docker Compose
2. Домен, указывающий на IP сервера
3. Открытые порты: 80 (HTTP), 443 (HTTPS), опционально 22 (SSH)

### Шаг 1: Создание .env файла

```bash
cp .env.example .env
nano .env
```

Обновите значения:

```env
# Database
POSTGRES_DB=meetify
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# Backend
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/meetify
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_secure_password_here

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
```

### Шаг 2: Обновление nginx.conf

Замените `yourdomain.com` на ваш реальный домен:

```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx.conf
```

### Шаг 3: Запуск без SSL (первый раз)

```bash
# Запустить только backend и frontend
docker-compose -f docker-compose.prod.yml up -d db backend frontend
```

### Шаг 4: Инициализация SSL сертификатов

```bash
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh yourdomain.com your-email@example.com
```

### Шаг 5: Запуск nginx

```bash
docker-compose -f docker-compose.prod.yml up -d nginx certbot
```

### Шаг 6: Проверка

Откройте https://yourdomain.com - ваш Meetify работает с SSL!

### Автоматический Backup

Настройте cron для ежедневного backup:

```bash
chmod +x scripts/backup-database.sh
crontab -e

# Добавьте строку (backup каждый день в 2 AM):
0 2 * * * cd /path/to/meetify && ./scripts/backup-database.sh >> /var/log/meetify-backup.log 2>&1
```

### Production Monitoring

Проверка статуса:
```bash
docker-compose -f docker-compose.prod.yml ps
```

Просмотр логов:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

Health checks:
```bash
# Backend health
curl https://yourdomain.com/api/actuator/health

# Frontend health
curl https://yourdomain.com
```

## Troubleshooting

### Backend не может подключиться к БД

Убедитесь, что:
1. БД полностью запустилась (проверьте логи)
2. Healthcheck проходит успешно
3. Правильные credentials в docker-compose.yml

### Frontend не может подключиться к Backend

Проверьте:
1. Backend запустился и отвечает на порту 8080
2. CORS настроен правильно в WebConfig.java
3. Переменные окружения NEXT_PUBLIC_API_URL корректны

### Порты заняты

Если порты 3000, 8080 или 5432 заняты, измените маппинг в docker-compose.yml:

```yaml
ports:
  - "8081:8080"  # Изменить внешний порт
```

## Оптимизация

### Multi-stage builds
Оба Dockerfile используют multi-stage builds для уменьшения размера образов:
- Backend: ~300MB (вместо ~600MB)
- Frontend: ~200MB (вместо ~1GB+)

### Кэширование слоёв
Dockerfile-ы оптимизированы для кэширования:
1. Сначала копируются зависимости
2. Потом исходный код
3. Изменения кода не инвалидируют слой зависимостей

### Volumes
PostgreSQL данные сохраняются в volume `postgres_data` для персистентности между перезапусками.
