package org.blaque.meetify.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRoomRequest {

    @NotBlank(message = "Room code is required")
    private String roomCode;

    @NotBlank(message = "Username is required")
    private String username;
}
