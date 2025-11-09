package org.blaque.meetify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {

    private String senderUsername;
    private String senderSessionId;
    private String message;
    private LocalDateTime sentAt;
}
