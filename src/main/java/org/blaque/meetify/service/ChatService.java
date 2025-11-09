package org.blaque.meetify.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.blaque.meetify.dto.ChatMessageDTO;
import org.blaque.meetify.entity.ChatMessage;
import org.blaque.meetify.entity.Room;
import org.blaque.meetify.repository.ChatMessageRepository;
import org.blaque.meetify.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public ChatMessageDTO saveMessage(UUID roomId, String senderUsername, String senderSessionId, String message) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        ChatMessage chatMessage = ChatMessage.builder()
                .room(room)
                .senderUsername(senderUsername)
                .senderSessionId(senderSessionId)
                .message(message)
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);
        log.info("Chat message saved from {} in room {}", senderUsername, roomId);

        return mapToChatMessageDTO(chatMessage);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getRoomMessages(UUID roomId) {
        return chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId)
                .stream()
                .map(this::mapToChatMessageDTO)
                .collect(Collectors.toList());
    }

    private ChatMessageDTO mapToChatMessageDTO(ChatMessage chatMessage) {
        return ChatMessageDTO.builder()
                .senderUsername(chatMessage.getSenderUsername())
                .senderSessionId(chatMessage.getSenderSessionId())
                .message(chatMessage.getMessage())
                .sentAt(chatMessage.getSentAt())
                .build();
    }
}
