package org.blaque.meetify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {

    private UUID id;
    private String roomCode;
    private String roomName;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private List<ParticipantResponse> participants;
}
