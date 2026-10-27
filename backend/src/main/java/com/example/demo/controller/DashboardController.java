package com.example.demo.controller;

import com.example.demo.dto.SessionDTO;
import com.example.demo.repository.AttendeeRepository;
import com.example.demo.repository.SessionRepository;
import com.example.demo.repository.SpeakerRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.SessionService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final SessionRepository sessionRepository;
    private final SpeakerRepository speakerRepository;
    private final AttendeeRepository attendeeRepository;
    private final UserRepository userRepository;
    private final SessionService sessionService;

    public DashboardController(SessionRepository sessionRepository,
                               SpeakerRepository speakerRepository,
                               AttendeeRepository attendeeRepository,
                               UserRepository userRepository,
                               SessionService sessionService) {
        this.sessionRepository = sessionRepository;
        this.speakerRepository = speakerRepository;
        this.attendeeRepository = attendeeRepository;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String username = authentication.getName();
        String role = userRepository.findByUsername(username)
                .map(user -> user.getRole() == null ? "ROLE_USER" : user.getRole())
                .orElse("ROLE_USER");

        List<SessionDTO> recentSessions = sessionService
            .getAllSessions(PageRequest.of(0, 100, Sort.by(
                Sort.Order.asc("dayOfWeek"),
                Sort.Order.asc("startTime"))))
                .getContent();

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("username", username);
        dashboard.put("role", role);
        dashboard.put("sessionCount", sessionRepository.count());
        dashboard.put("speakerCount", speakerRepository.count());
        dashboard.put("attendeeCount", attendeeRepository.count());
        dashboard.put("userCount", userRepository.count());
        dashboard.put("recentSessions", recentSessions);
        dashboard.put("upcomingSessions", recentSessions);
        return ResponseEntity.ok(dashboard);
    }
}