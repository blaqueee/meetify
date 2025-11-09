export class Room {
  constructor(
    public readonly id: string,
    public readonly roomCode: string,
    public readonly roomName: string,
    public readonly createdAt: Date,
    public readonly isActive: boolean,
    public readonly participants: string[]
  ) {}

  static fromDTO(dto: any): Room {
    return new Room(
      dto.id,
      dto.roomCode,
      dto.roomName,
      new Date(dto.createdAt),
      dto.isActive,
      dto.participants?.map((p: any) => p.id) || []
    );
  }

  hasParticipant(participantId: string): boolean {
    return this.participants.includes(participantId);
  }

  get participantCount(): number {
    return this.participants.length;
  }
}
