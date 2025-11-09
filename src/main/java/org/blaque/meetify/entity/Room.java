package org.blaque.meetify.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String roomCode;

    @Column(nullable = false)
    private String roomName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime closedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Participant> participants = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (roomCode == null) {
            roomCode = generateRoomCode();
        }
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
