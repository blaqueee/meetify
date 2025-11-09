package org.blaque.meetify.repository;

import org.blaque.meetify.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByRoomCode(String roomCode);

    Optional<Room> findByRoomCodeAndIsActiveTrue(String roomCode);
}
