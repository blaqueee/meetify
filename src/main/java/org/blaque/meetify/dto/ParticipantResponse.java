package org.blaque.meetify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantResponse {

    private UUID id;
    private String username;
    private String sessionId;
    private LocalDateTime joinedAt;
    private Boolean isConnected;
    private Boolean isMuted;
    private Boolean isVideoEnabled;
}
