package org.blaque.meetify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebRTCSignalDTO {

    private String type; // "offer", "answer", "ice-candidate"
    private String senderSessionId;
    private String targetSessionId;
    private Object data; // SDP or ICE candidate data
}
