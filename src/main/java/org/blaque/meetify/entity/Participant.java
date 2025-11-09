package org.blaque.meetify.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    @Column
    private LocalDateTime leftAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isConnected = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isMuted = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVideoEnabled = true;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
