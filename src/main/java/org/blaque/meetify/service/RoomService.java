package org.blaque.meetify.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.blaque.meetify.dto.ParticipantResponse;
import org.blaque.meetify.dto.RoomResponse;
import org.blaque.meetify.entity.Participant;
import org.blaque.meetify.entity.Room;
import org.blaque.meetify.repository.ParticipantRepository;
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
public class RoomService {

    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;

    @Transactional
    public RoomResponse createRoom(String roomName) {
        Room room = Room.builder()
                .roomName(roomName)
                .isActive(true)
                .build();

        room = roomRepository.save(room);
        log.info("Created room: {} with code: {}", room.getRoomName(), room.getRoomCode());

        return mapToRoomResponse(room);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomByCode(String roomCode) {
        Room room = roomRepository.findByRoomCodeAndIsActiveTrue(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found or inactive"));

        return mapToRoomResponse(room);
    }

    @Transactional
    public ParticipantResponse joinRoom(String roomCode, String username, String sessionId) {
        Room room = roomRepository.findByRoomCodeAndIsActiveTrue(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found or inactive"));

        Participant participant = Participant.builder()
                .username(username)
                .sessionId(sessionId)
                .room(room)
                .isConnected(true)
                .isMuted(false)
                .isVideoEnabled(true)
                .build();

        participant = participantRepository.save(participant);
        log.info("Participant {} joined room {}", username, roomCode);

        return mapToParticipantResponse(participant);
    }

    @Transactional
    public void leaveRoom(String sessionId) {
        Participant participant = participantRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setIsConnected(false);
        participant.setLeftAt(LocalDateTime.now());
        participantRepository.save(participant);

        log.info("Participant {} left room", participant.getUsername());
    }

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getActiveParticipants(UUID roomId) {
        return participantRepository.findByRoomIdAndIsConnectedTrue(roomId)
                .stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateParticipantStatus(String sessionId, Boolean isMuted, Boolean isVideoEnabled) {
        Participant participant = participantRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (isMuted != null) {
            participant.setIsMuted(isMuted);
        }
        if (isVideoEnabled != null) {
            participant.setIsVideoEnabled(isVideoEnabled);
        }

        participantRepository.save(participant);
    }

    private RoomResponse mapToRoomResponse(Room room) {
        List<ParticipantResponse> participants = participantRepository
                .findByRoomIdAndIsConnectedTrue(room.getId())
                .stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());

        return RoomResponse.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .roomName(room.getRoomName())
                .createdAt(room.getCreatedAt())
                .isActive(room.getIsActive())
                .participants(participants)
                .build();
    }

    private ParticipantResponse mapToParticipantResponse(Participant participant) {
        return ParticipantResponse.builder()
                .id(participant.getId())
                .username(participant.getUsername())
                .sessionId(participant.getSessionId())
                .joinedAt(participant.getJoinedAt())
                .isConnected(participant.getIsConnected())
                .isMuted(participant.getIsMuted())
                .isVideoEnabled(participant.getIsVideoEnabled())
                .build();
    }
}
