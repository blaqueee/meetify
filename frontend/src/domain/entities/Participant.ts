export class Participant {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly sessionId: string,
    public readonly joinedAt: Date,
    public readonly isConnected: boolean,
    public readonly isMuted: boolean,
    public readonly isVideoEnabled: boolean
  ) {}

  static fromDTO(dto: any): Participant {
    return new Participant(
      dto.id,
      dto.username,
      dto.sessionId,
      new Date(dto.joinedAt),
      dto.isConnected,
      dto.isMuted,
      dto.isVideoEnabled
    );
  }

  withConnectionStatus(isConnected: boolean): Participant {
    return new Participant(
      this.id,
      this.username,
      this.sessionId,
      this.joinedAt,
      isConnected,
      this.isMuted,
      this.isVideoEnabled
    );
  }

  withAudioStatus(isMuted: boolean): Participant {
    return new Participant(
      this.id,
      this.username,
      this.sessionId,
      this.joinedAt,
      this.isConnected,
      isMuted,
      this.isVideoEnabled
    );
  }

  withVideoStatus(isVideoEnabled: boolean): Participant {
    return new Participant(
      this.id,
      this.username,
      this.sessionId,
      this.joinedAt,
      this.isConnected,
      this.isMuted,
      isVideoEnabled
    );
  }
}
