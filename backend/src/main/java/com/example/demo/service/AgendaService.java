package com.example.demo.service;

import com.example.demo.dto.SessionDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.AgendaEntry;
import com.example.demo.model.SessionEntry;
import com.example.demo.model.User;
import com.example.demo.repository.AgendaRepository;
import com.example.demo.repository.SessionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class AgendaService {
    private final AgendaRepository agendaRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    public AgendaService(AgendaRepository agendaRepository, UserRepository userRepository, SessionRepository sessionRepository) {
        this.agendaRepository = agendaRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    public List<SessionDTO> getAgenda(String username) {
        return agendaRepository.findByUserUsernameOrderBySessionDayOfWeekAscSessionStartTimeAsc(username)
                .stream().map(entry -> toDTO(entry.getSession())).toList();
    }

    public SessionDTO addToAgenda(String username, Long sessionId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        SessionEntry session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        if (agendaRepository.existsByUserUsernameAndSessionId(username, sessionId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is already in your agenda");
        }
        AgendaEntry entry = new AgendaEntry();
        entry.setUser(user);
        entry.setSession(session);
        try {
            return toDTO(agendaRepository.save(entry).getSession());
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is already in your agenda");
        }
    }

    public void removeFromAgenda(String username, Long sessionId) {
        AgendaEntry entry = agendaRepository.findByUserUsernameAndSessionId(username, sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session is not in your agenda: " + sessionId));
        agendaRepository.delete(entry);
    }

    private SessionDTO toDTO(SessionEntry session) {
        SessionDTO dto = new SessionDTO();
        dto.setId(session.getId());
        dto.setSessionName(session.getSessionName());
        dto.setTopic(session.getTopic());
        dto.setDayOfWeek(session.getDayOfWeek());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setRoomNote(session.getRoomNote());
        if (session.getSpeaker() != null) {
            dto.setSpeakerId(session.getSpeaker().getId());
            dto.setSpeakerName(session.getSpeaker().getName());
        }
        return dto;
    }
}