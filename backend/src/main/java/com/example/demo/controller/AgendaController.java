package com.example.demo.controller;

import com.example.demo.dto.SessionDTO;
import com.example.demo.service.AgendaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/agenda")
@SecurityRequirement(name = "bearerAuth")
public class AgendaController {
    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<SessionDTO>> getAgenda(Authentication authentication) {
        return ResponseEntity.ok(agendaService.getAgenda(authentication.getName()));
    }

    @PostMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SessionDTO> addToAgenda(Authentication authentication, @PathVariable Long sessionId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendaService.addToAgenda(authentication.getName(), sessionId));
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> removeFromAgenda(Authentication authentication, @PathVariable Long sessionId) {
        agendaService.removeFromAgenda(authentication.getName(), sessionId);
        return ResponseEntity.noContent().build();
    }
}