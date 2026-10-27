package com.example.demo.repository;

import com.example.demo.model.AgendaEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AgendaRepository extends JpaRepository<AgendaEntry, Long> {
    List<AgendaEntry> findByUserUsernameOrderBySessionDayOfWeekAscSessionStartTimeAsc(String username);
    boolean existsByUserUsernameAndSessionId(String username, Long sessionId);
    Optional<AgendaEntry> findByUserUsernameAndSessionId(String username, Long sessionId);
}