package org.blaque.meetify.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.blaque.meetify.dto.*;
import org.blaque.meetify.service.ChatService;
import org.blaque.meetify.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomResponse room = roomService.createRoom(request.getRoomName());
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<RoomResponse> getRoomByCode(@PathVariable String roomCode) {
        RoomResponse room = roomService.getRoomByCode(roomCode);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/join")
    public ResponseEntity<ParticipantResponse> joinRoom(@Valid @RequestBody JoinRoomRequest request) {
        String sessionId = UUID.randomUUID().toString();
        ParticipantResponse participant = roomService.joinRoom(
                request.getRoomCode(),
                request.getUsername(),
                sessionId
        );
        return ResponseEntity.ok(participant);
    }

    @PostMapping("/leave/{sessionId}")
    public ResponseEntity<Void> leaveRoom(@PathVariable String sessionId) {
        roomService.leaveRoom(sessionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomCode}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@PathVariable String roomCode) {
        RoomResponse room = roomService.getRoomByCode(roomCode);
        List<ChatMessageDTO> messages = chatService.getRoomMessages(UUID.fromString(String.valueOf(room.getId())));
        return ResponseEntity.ok(messages);
    }
}
