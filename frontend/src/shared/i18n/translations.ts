export const translations = {
  en: {
    home: {
      title: "Meetify",
      subtitle: "Connect. Collaborate. Create.",
      tagline: "WebRTC-Powered Video Conferencing",
      hero: {
        title: "Meet. Connect. Anywhere.",
        description: "Experience seamless video conferencing with crystal-clear quality and real-time collaboration."
      },
      features: {
        video: {
          title: "HD Video",
          description: "Crystal-clear video quality with P2P WebRTC technology"
        },
        multiUser: {
          title: "Multi-User",
          description: "Connect with multiple participants in one room"
        },
        chat: {
          title: "Live Chat",
          description: "Real-time messaging during video calls"
        }
      },
      form: {
        yourName: "Your Name",
        yourNamePlaceholder: "Enter your name to continue",
        roomName: "Room Name",
        roomNamePlaceholder: "Enter room name",
        roomCode: "Room Code",
        roomCodePlaceholder: "Enter room code",
        createRoom: "Create Room",
        joinRoom: "Join Room",
        creating: "Creating...",
        joining: "Joining...",
        createRoomTitle: "Create Room",
        createRoomSubtitle: "Start a new meeting instantly",
        joinRoomTitle: "Join Room",
        joinRoomSubtitle: "Enter a room code to join"
      }
    },
    room: {
      chat: "Chat",
      noMessages: "No messages yet",
      startConversation: "Send a message to start the conversation",
      typeMessage: "Type a message...",
      shareLink: "Share Link",
      linkCopied: "Link copied!",
      copyLink: "Copy link",
      roomCode: "Room Code",
      connected: "Connected",
      connecting: "Connecting...",
      participant: "participant",
      participants: "participants",
      mute: "Mute",
      unmute: "Unmute",
      turnOffCamera: "Turn off camera",
      turnOnCamera: "Turn on camera",
      toggleChat: "Toggle chat",
      leaveRoom: "Leave room"
    },
    footer: {
      copyright: "© 2025 Meetify. Built with Next.js and Spring Boot."
    }
  },
  ru: {
    home: {
      title: "Meetify",
      subtitle: "Связь. Сотрудничество. Творчество.",
      tagline: "Видеоконференции на основе WebRTC",
      hero: {
        title: "Встречайтесь. Общайтесь. Везде.",
        description: "Наслаждайтесь плавными видеоконференциями с кристально чистым качеством и совместной работой в реальном времени."
      },
      features: {
        video: {
          title: "HD Видео",
          description: "Кристально чистое качество видео с технологией P2P WebRTC"
        },
        multiUser: {
          title: "Многопользовательский",
          description: "Подключайтесь с несколькими участниками в одной комнате"
        },
        chat: {
          title: "Живой Чат",
          description: "Обмен сообщениями в реальном времени во время видеозвонков"
        }
      },
      form: {
        yourName: "Ваше Имя",
        yourNamePlaceholder: "Введите ваше имя для продолжения",
        roomName: "Название Комнаты",
        roomNamePlaceholder: "Введите название комнаты",
        roomCode: "Код Комнаты",
        roomCodePlaceholder: "Введите код комнаты",
        createRoom: "Создать Комнату",
        joinRoom: "Присоединиться",
        creating: "Создание...",
        joining: "Присоединение...",
        createRoomTitle: "Создать Комнату",
        createRoomSubtitle: "Начните новую встречу мгновенно",
        joinRoomTitle: "Присоединиться",
        joinRoomSubtitle: "Введите код комнаты для присоединения"
      }
    },
    room: {
      chat: "Чат",
      noMessages: "Пока нет сообщений",
      startConversation: "Отправьте сообщение, чтобы начать разговор",
      typeMessage: "Напишите сообщение...",
      shareLink: "Поделиться Ссылкой",
      linkCopied: "Ссылка скопирована!",
      copyLink: "Копировать ссылку",
      roomCode: "Код Комнаты",
      connected: "Подключено",
      connecting: "Подключение...",
      participant: "участник",
      participants: "участников",
      mute: "Отключить микрофон",
      unmute: "Включить микрофон",
      turnOffCamera: "Выключить камеру",
      turnOnCamera: "Включить камеру",
      toggleChat: "Переключить чат",
      leaveRoom: "Покинуть комнату"
    },
    footer: {
      copyright: "© 2025 Meetify. Создано с Next.js и Spring Boot."
    }
  }
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof translations.en;
