package org.blaque.meetify.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.blaque.meetify.dto.ChatMessageDTO;
import org.blaque.meetify.dto.WebRTCSignalDTO;
import org.blaque.meetify.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /**
     * Handle WebRTC signaling messages (offer, answer, ice-candidate)
     * Client sends to: /app/signal/{roomCode}
     * Server broadcasts to: /topic/room/{roomCode}/signal
     */
    @MessageMapping("/signal/{roomCode}")
    public void handleSignaling(@DestinationVariable String roomCode, @Payload WebRTCSignalDTO signal) {
        log.info("WebRTC signal received in room {}: type={}, from={}, to={}",
                roomCode, signal.getType(), signal.getSenderSessionId(), signal.getTargetSessionId());

        // If targetSessionId is specified, send to specific user
        if (signal.getTargetSessionId() != null && !signal.getTargetSessionId().isEmpty()) {
            messagingTemplate.convertAndSend(
                    "/queue/signal/" + signal.getTargetSessionId(),
                    signal
            );
        } else {
            // Broadcast to all participants in the room
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomCode + "/signal",
                    signal
            );
        }
    }

    /**
     * Handle chat messages
     * Client sends to: /app/chat/{roomCode}
     * Server broadcasts to: /topic/room/{roomCode}/chat
     */
    @MessageMapping("/chat/{roomCode}")
    public void handleChatMessage(@DestinationVariable String roomCode, @Payload Map<String, String> payload) {
        String roomIdStr = payload.get("roomId");
        String senderUsername = payload.get("senderUsername");
        String senderSessionId = payload.get("senderSessionId");
        String message = payload.get("message");

        log.info("Chat message received in room {}: from={}, message={}",
                roomCode, senderUsername, message);

        try {
            UUID roomId = UUID.fromString(roomIdStr);

            // Save message to database
            ChatMessageDTO chatMessage = chatService.saveMessage(roomId, senderUsername, senderSessionId, message);

            // Broadcast to all participants in the room
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomCode + "/chat",
                    chatMessage
            );
        } catch (Exception e) {
            log.error("Error handling chat message", e);
        }
    }

    /**
     * Handle participant status updates (mute/unmute, video on/off)
     * Client sends to: /app/participant/{roomCode}/status
     * Server broadcasts to: /topic/room/{roomCode}/participant
     */
    @MessageMapping("/participant/{roomCode}/status")
    public void handleParticipantStatus(@DestinationVariable String roomCode, @Payload Map<String, Object> status) {
        log.info("Participant status update in room {}: {}", roomCode, status);

        // Broadcast status update to all participants
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/participant",
                status
        );
    }

    /**
     * Handle participant join notification
     * Client sends to: /app/participant/{roomCode}/join
     * Server broadcasts to: /topic/room/{roomCode}/participant
     */
    @MessageMapping("/participant/{roomCode}/join")
    public void handleParticipantJoin(@DestinationVariable String roomCode, @Payload Map<String, String> participant) {
        log.info("Participant joined room {}: {}", roomCode, participant);

        // Broadcast join event to all participants
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/participant",
                Map.of(
                        "type", "join",
                        "participant", participant,
                        "timestamp", LocalDateTime.now().toString()
                )
        );
    }

    /**
     * Handle participant leave notification
     * Client sends to: /app/participant/{roomCode}/leave
     * Server broadcasts to: /topic/room/{roomCode}/participant
     */
    @MessageMapping("/participant/{roomCode}/leave")
    public void handleParticipantLeave(@DestinationVariable String roomCode, @Payload Map<String, String> participant) {
        log.info("Participant left room {}: {}", roomCode, participant);

        // Broadcast leave event to all participants
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/participant",
                Map.of(
                        "type", "leave",
                        "participant", participant,
                        "timestamp", LocalDateTime.now().toString()
                )
        );
    }
}
