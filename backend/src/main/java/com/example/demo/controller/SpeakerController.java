package com.example.demo.controller;

import com.example.demo.dto.SpeakerDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.SpeakerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/speakers")
@Tag(name = "Speakers", description = "Speaker management")
@SecurityRequirement(name = "bearerAuth")
public class SpeakerController {

    private final SpeakerService speakerService;

    @Autowired
    public SpeakerController(SpeakerService speakerService) {
        this.speakerService = speakerService;
    }

    @GetMapping
    @Operation(summary = "Get all speakers")
    public ResponseEntity<Page<SpeakerDTO>> getAllSpeakers(Pageable pageable) {
        return ResponseEntity.ok(speakerService.getAllSpeakers(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get speaker by ID")
    public ResponseEntity<SpeakerDTO> getById(@PathVariable Long id) {
        return speakerService.getSpeakerById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Speaker not found: " + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create speaker")
    public ResponseEntity<SpeakerDTO> createSpeaker(@RequestBody SpeakerDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(speakerService.createSpeaker(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update speaker")
    public ResponseEntity<SpeakerDTO> update(@PathVariable Long id, @RequestBody SpeakerDTO dto) {
        return ResponseEntity.ok(speakerService.updateSpeaker(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete speaker (Admin only)")
    public ResponseEntity<String> deleteSpeaker(@PathVariable Long id) {
        speakerService.deleteSpeaker(id);
        return ResponseEntity.ok("Speaker deleted successfully.");
    }
}
