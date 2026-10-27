package com.example.demo.service;

import com.example.demo.dto.AttendeeDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Attendee;
import com.example.demo.model.SessionEntry;
import com.example.demo.model.User;
import com.example.demo.repository.AttendeeRepository;
import com.example.demo.repository.SessionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;

@Service
public class AttendeeService {

    private final AttendeeRepository attendeeRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    public AttendeeService(AttendeeRepository attendeeRepository, UserRepository userRepository, SessionRepository sessionRepository) {
        this.attendeeRepository = attendeeRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    private AttendeeDTO toDTO(Attendee a) {
        AttendeeDTO dto = new AttendeeDTO();
        dto.setId(a.getId());
        dto.setFullName(a.getFullName());
        dto.setEmail(a.getEmail());
        dto.setRegistrationType(a.getRegistrationType());
        if (a.getUser() != null) {
            dto.setUserId(a.getUser().getId());
            dto.setUserName(a.getUser().getUsername());
        }
        if (a.getSession() != null) {
            dto.setSessionId(a.getSession().getId());
            dto.setSessionName(a.getSession().getSessionName());
        }
        return dto;
    }

    public Page<AttendeeDTO> getAllAttendees(Pageable pageable) {
        return attendeeRepository.findAll(pageable).map(this::toDTO);
    }

    public Optional<AttendeeDTO> getAttendeeById(Long id) {
        return attendeeRepository.findById(id).map(this::toDTO);
    }

    public AttendeeDTO createAttendee(AttendeeDTO attendeeDto) {
        if (attendeeDto.getEmail() != null && attendeeRepository.existsByEmail(attendeeDto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        Attendee a = new Attendee();
        String name = attendeeDto.getFullName() != null ? attendeeDto.getFullName() : attendeeDto.getName();
        a.setFullName(name);
        a.setEmail(attendeeDto.getEmail());
        a.setRegistrationType(attendeeDto.getRegistrationType());
        if (attendeeDto.getUserId() != null) {
            User user = userRepository.findById(attendeeDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + attendeeDto.getUserId()));
            a.setUser(user);
        } else if (attendeeDto.getUserName() != null && !attendeeDto.getUserName().isBlank()) {
            userRepository.findByUsername(attendeeDto.getUserName()).ifPresent(a::setUser);
        }
        if (attendeeDto.getSessionId() != null) {
            SessionEntry session = sessionRepository.findById(attendeeDto.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + attendeeDto.getSessionId()));
            a.setSession(session);
        }
        return toDTO(attendeeRepository.save(a));
    }

    public AttendeeDTO updateAttendee(Long id, AttendeeDTO updatedDto) {
        Attendee a = attendeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendee not found: " + id));

        if (updatedDto.getEmail() != null && !updatedDto.getEmail().equalsIgnoreCase(a.getEmail())) {
            if (attendeeRepository.existsByEmail(updatedDto.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            a.setEmail(updatedDto.getEmail());
        }

        String name = updatedDto.getFullName() != null ? updatedDto.getFullName() : updatedDto.getName();
        if (name != null) {
            a.setFullName(name);
        }
        if (updatedDto.getRegistrationType() != null) {
            a.setRegistrationType(updatedDto.getRegistrationType());
        }
        if (updatedDto.getUserId() != null) {
            User user = userRepository.findById(updatedDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + updatedDto.getUserId()));
            a.setUser(user);
        } else if (updatedDto.getUserName() != null && !updatedDto.getUserName().isBlank()) {
            userRepository.findByUsername(updatedDto.getUserName()).ifPresent(a::setUser);
        }
        if (updatedDto.getSessionId() != null) {
            SessionEntry session = sessionRepository.findById(updatedDto.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + updatedDto.getSessionId()));
            a.setSession(session);
        } else {
            a.setSession(null);
        }
        return toDTO(attendeeRepository.save(a));
    }

    public void deleteAttendee(Long id) {
        if (!attendeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendee not found: " + id);
        }
        attendeeRepository.deleteById(id);
    }
}
