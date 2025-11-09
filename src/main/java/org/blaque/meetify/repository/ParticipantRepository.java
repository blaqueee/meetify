package org.blaque.meetify.repository;

import org.blaque.meetify.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, UUID> {

    Optional<Participant> findBySessionId(String sessionId);

    List<Participant> findByRoomIdAndIsConnectedTrue(UUID roomId);

    List<Participant> findByRoomId(UUID roomId);
}
