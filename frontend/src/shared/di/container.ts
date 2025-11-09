import { apiClient, RoomApiRepository, ChatApiRepository } from '../../infrastructure/api';
import { WebSocketRepositoryImpl } from '../../infrastructure/websocket';
import { WebRTCRepositoryImpl } from '../../infrastructure/webrtc';
import { IRoomRepository } from '../../domain/repositories/IRoomRepository';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { IWebSocketRepository } from '../../domain/repositories/IWebSocketRepository';
import { IWebRTCRepository } from '../../domain/repositories/IWebRTCRepository';
import {
  CreateRoomUseCase,
  JoinRoomUseCase,
  GetRoomUseCase,
  LeaveRoomUseCase,
  SendChatMessageUseCase,
  GetChatHistoryUseCase,
} from '../../domain/usecases';

class DIContainer {
  private roomRepository: IRoomRepository;
  private chatRepository: IChatRepository;
  private wsRepository: IWebSocketRepository | null = null;
  private webrtcRepository: IWebRTCRepository | null = null;

  constructor() {
    this.roomRepository = new RoomApiRepository(apiClient);
    this.chatRepository = new ChatApiRepository(apiClient);
  }

  getRoomRepository(): IRoomRepository {
    return this.roomRepository;
  }

  getChatRepository(): IChatRepository {
    return this.chatRepository;
  }

  getWebSocketRepository(): IWebSocketRepository {
    if (!this.wsRepository) {
      this.wsRepository = new WebSocketRepositoryImpl();
    }
    return this.wsRepository;
  }

  getWebRTCRepository(sessionId: string): IWebRTCRepository {
    if (!this.webrtcRepository) {
      const wsRepo = this.getWebSocketRepository();
      this.webrtcRepository = new WebRTCRepositoryImpl(wsRepo, sessionId);
    }
    return this.webrtcRepository;
  }

  resetWebSocketRepository(): void {
    this.wsRepository = null;
  }

  resetWebRTCRepository(): void {
    this.webrtcRepository = null;
  }

  getCreateRoomUseCase(): CreateRoomUseCase {
    return new CreateRoomUseCase(this.getRoomRepository());
  }

  getJoinRoomUseCase(): JoinRoomUseCase {
    return new JoinRoomUseCase(this.getRoomRepository());
  }

  getGetRoomUseCase(): GetRoomUseCase {
    return new GetRoomUseCase(this.getRoomRepository());
  }

  getLeaveRoomUseCase(): LeaveRoomUseCase {
    return new LeaveRoomUseCase(this.getRoomRepository());
  }

  getSendChatMessageUseCase(): SendChatMessageUseCase {
    return new SendChatMessageUseCase(this.getChatRepository());
  }

  getGetChatHistoryUseCase(): GetChatHistoryUseCase {
    return new GetChatHistoryUseCase(this.getChatRepository());
  }
}

export const container = new DIContainer();
