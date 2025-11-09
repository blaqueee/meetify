export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly senderUsername: string,
    public readonly senderSessionId: string,
    public readonly message: string,
    public readonly sentAt: Date
  ) {}

  static fromDTO(dto: any): ChatMessage {
    return new ChatMessage(
      dto.id || `${dto.senderSessionId}-${dto.sentAt}`,
      dto.senderUsername,
      dto.senderSessionId,
      dto.message,
      new Date(dto.sentAt)
    );
  }

  isFromUser(sessionId: string): boolean {
    return this.senderSessionId === sessionId;
  }

  get formattedTime(): string {
    return this.sentAt.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
