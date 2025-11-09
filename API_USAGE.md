# Meetify API Usage Guide

Руководство по использованию API для фронтенд разработчиков.

## Настройка и запуск

### Предварительные требования

1. Установите PostgreSQL
2. Создайте базу данных:
```bash
psql -U postgres
CREATE DATABASE meetify;
```

3. Обновите `src/main/resources/application.properties` при необходимости:
```properties
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### Запуск приложения

```bash
./gradlew bootRun
```

Сервер запустится на `http://localhost:8080`

## REST API Endpoints

### 1. Создание комнаты

**Endpoint:** `POST /api/rooms`

**Request:**
```json
{
  "roomName": "Team Meeting"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "roomCode": "A1B2C3D4",
  "roomName": "Team Meeting",
  "createdAt": "2025-01-15T10:30:00",
  "isActive": true,
  "participants": []
}
```

### 2. Получение информации о комнате

**Endpoint:** `GET /api/rooms/{roomCode}`

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "roomCode": "A1B2C3D4",
  "roomName": "Team Meeting",
  "createdAt": "2025-01-15T10:30:00",
  "isActive": true,
  "participants": [
    {
      "id": "participant-uuid",
      "username": "John",
      "sessionId": "session-uuid",
      "joinedAt": "2025-01-15T10:35:00",
      "isConnected": true,
      "isMuted": false,
      "isVideoEnabled": true
    }
  ]
}
```

### 3. Присоединение к комнате

**Endpoint:** `POST /api/rooms/join`

**Request:**
```json
{
  "roomCode": "A1B2C3D4",
  "username": "John Doe"
}
```

**Response:**
```json
{
  "id": "participant-uuid",
  "username": "John Doe",
  "sessionId": "unique-session-id",
  "joinedAt": "2025-01-15T10:35:00",
  "isConnected": true,
  "isMuted": false,
  "isVideoEnabled": true
}
```

**Важно:** Сохраните `sessionId` - он нужен для дальнейшей работы с WebSocket.

### 4. Выход из комнаты

**Endpoint:** `POST /api/rooms/leave/{sessionId}`

**Response:** 200 OK

## WebSocket API (STOMP)

### Подключение

Используйте STOMP клиент (например, `@stomp/stompjs` для JavaScript):

```javascript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  onConnect: () => {
    console.log('Connected to WebSocket');
  }
});

client.activate();
```

### WebRTC Signaling

#### Отправка сигнала (Offer/Answer/ICE)

```javascript
// Отправка WebRTC offer
client.publish({
  destination: `/app/signal/${roomCode}`,
  body: JSON.stringify({
    type: 'offer',
    senderSessionId: mySessionId,
    targetSessionId: targetSessionId, // или null для broadcast
    data: {
      sdp: offerSDP,
      type: 'offer'
    }
  })
});
```

#### Подписка на сигналы

```javascript
// Broadcast сигналы для всех в комнате
client.subscribe(`/topic/room/${roomCode}/signal`, (message) => {
  const signal = JSON.parse(message.body);
  console.log('Received signal:', signal);

  if (signal.type === 'offer') {
    // Обработать offer
  } else if (signal.type === 'answer') {
    // Обработать answer
  } else if (signal.type === 'ice-candidate') {
    // Обработать ICE candidate
  }
});

// Прямые сигналы для конкретного участника
client.subscribe(`/queue/signal/${mySessionId}`, (message) => {
  const signal = JSON.parse(message.body);
  // Обработать прямой сигнал
});
```

### Чат

#### Отправка сообщения

```javascript
client.publish({
  destination: `/app/chat/${roomCode}`,
  body: JSON.stringify({
    roomId: roomId,
    senderUsername: 'John',
    senderSessionId: mySessionId,
    message: 'Hello everyone!'
  })
});
```

#### Подписка на сообщения чата

```javascript
client.subscribe(`/topic/room/${roomCode}/chat`, (message) => {
  const chatMessage = JSON.parse(message.body);
  console.log(`${chatMessage.senderUsername}: ${chatMessage.message}`);

  // Отобразить сообщение в UI
  displayChatMessage(chatMessage);
});
```

### События участников

#### Уведомление о присоединении

```javascript
client.publish({
  destination: `/app/participant/${roomCode}/join`,
  body: JSON.stringify({
    username: 'John',
    sessionId: mySessionId
  })
});
```

#### Уведомление о выходе

```javascript
client.publish({
  destination: `/app/participant/${roomCode}/leave`,
  body: JSON.stringify({
    username: 'John',
    sessionId: mySessionId
  })
});
```

#### Обновление статуса (mute/video)

```javascript
client.publish({
  destination: `/app/participant/${roomCode}/status`,
  body: JSON.stringify({
    sessionId: mySessionId,
    username: 'John',
    isMuted: true,
    isVideoEnabled: false
  })
});
```

#### Подписка на события участников

```javascript
client.subscribe(`/topic/room/${roomCode}/participant`, (message) => {
  const event = JSON.parse(message.body);

  if (event.type === 'join') {
    console.log('Participant joined:', event.participant);
    // Добавить участника в UI
  } else if (event.type === 'leave') {
    console.log('Participant left:', event.participant);
    // Удалить участника из UI
  } else {
    // Обновление статуса участника
    console.log('Participant status update:', event);
  }
});
```

## Полный пример WebRTC Flow

### 1. Создание/присоединение к комнате

```javascript
// Создать комнату
const createResponse = await fetch('http://localhost:8080/api/rooms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roomName: 'My Meeting' })
});
const room = await createResponse.json();
const roomCode = room.roomCode;

// Присоединиться к комнате
const joinResponse = await fetch('http://localhost:8080/api/rooms/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomCode: roomCode,
    username: 'John'
  })
});
const participant = await joinResponse.json();
const mySessionId = participant.sessionId;
```

### 2. Подключение к WebSocket

```javascript
const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  onConnect: () => {
    // Подписаться на сигналы
    client.subscribe(`/topic/room/${roomCode}/signal`, handleSignal);
    client.subscribe(`/queue/signal/${mySessionId}`, handleDirectSignal);

    // Подписаться на чат
    client.subscribe(`/topic/room/${roomCode}/chat`, handleChatMessage);

    // Подписаться на события участников
    client.subscribe(`/topic/room/${roomCode}/participant`, handleParticipantEvent);

    // Уведомить о присоединении
    client.publish({
      destination: `/app/participant/${roomCode}/join`,
      body: JSON.stringify({ username: 'John', sessionId: mySessionId })
    });
  }
});
client.activate();
```

### 3. WebRTC Connection

```javascript
// Создать peer connection
const peerConnection = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// Добавить локальные медиа потоки
const localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});

// Обработать ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    client.publish({
      destination: `/app/signal/${roomCode}`,
      body: JSON.stringify({
        type: 'ice-candidate',
        senderSessionId: mySessionId,
        targetSessionId: remoteSessionId,
        data: event.candidate
      })
    });
  }
};

// Создать и отправить offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

client.publish({
  destination: `/app/signal/${roomCode}`,
  body: JSON.stringify({
    type: 'offer',
    senderSessionId: mySessionId,
    targetSessionId: remoteSessionId,
    data: offer
  })
});
```

### 4. Обработка сигналов

```javascript
function handleSignal(message) {
  const signal = JSON.parse(message.body);

  // Игнорировать свои собственные сигналы
  if (signal.senderSessionId === mySessionId) return;

  if (signal.type === 'offer') {
    handleOffer(signal);
  } else if (signal.type === 'answer') {
    handleAnswer(signal);
  } else if (signal.type === 'ice-candidate') {
    handleIceCandidate(signal);
  }
}

async function handleOffer(signal) {
  await peerConnection.setRemoteDescription(signal.data);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  client.publish({
    destination: `/app/signal/${roomCode}`,
    body: JSON.stringify({
      type: 'answer',
      senderSessionId: mySessionId,
      targetSessionId: signal.senderSessionId,
      data: answer
    })
  });
}

async function handleAnswer(signal) {
  await peerConnection.setRemoteDescription(signal.data);
}

async function handleIceCandidate(signal) {
  await peerConnection.addIceCandidate(signal.data);
}
```

## Обработка ошибок

```javascript
try {
  const response = await fetch('http://localhost:8080/api/rooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode: 'INVALID', username: 'John' })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error joining room:', error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Тестирование API

### С помощью curl

```bash
# Создать комнату
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"roomName":"Test Room"}'

# Получить комнату
curl http://localhost:8080/api/rooms/A1B2C3D4

# Присоединиться к комнате
curl -X POST http://localhost:8080/api/rooms/join \
  -H "Content-Type: application/json" \
  -d '{"roomCode":"A1B2C3D4","username":"Test User"}'
```

## Рекомендации

1. **Сохраняйте sessionId** - он нужен для всех WebSocket операций
2. **Обрабатывайте разрыв соединения** - реализуйте reconnection logic
3. **ICE кандидаты** - отправляйте сразу после генерации
4. **Mesh vs SFU** - текущая реализация поддерживает mesh (каждый с каждым), для большего количества участников рассмотрите SFU
5. **TURN сервер** - для работы за NAT настройте TURN сервер

## Следующие шаги

- Добавьте аутентификацию (JWT)
- Реализуйте screen sharing
- Добавьте запись встреч
- Настройте TURN сервер для работы за NAT
