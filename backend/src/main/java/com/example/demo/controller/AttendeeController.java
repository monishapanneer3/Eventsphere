package com.example.demo.controller;

import com.example.demo.dto.AttendeeDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.AttendeeService;
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
@RequestMapping("/api/attendees")
@Tag(name = "Attendees", description = "Attendee management")
@SecurityRequirement(name = "bearerAuth")
public class AttendeeController {

    private final AttendeeService attendeeService;

    @Autowired
    public AttendeeController(AttendeeService attendeeService) {
        this.attendeeService = attendeeService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all attendees")
    public ResponseEntity<Page<AttendeeDTO>> getAllAttendees(Pageable pageable) {
        return ResponseEntity.ok(attendeeService.getAllAttendees(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get attendee by ID")
    public ResponseEntity<AttendeeDTO> getById(@PathVariable Long id) {
        return attendeeService.getAttendeeById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Attendee not found: " + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create attendee")
    public ResponseEntity<AttendeeDTO> createAttendee(@RequestBody AttendeeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendeeService.createAttendee(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update attendee")
    public ResponseEntity<AttendeeDTO> update(@PathVariable Long id, @RequestBody AttendeeDTO dto) {
        return ResponseEntity.ok(attendeeService.updateAttendee(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete attendee (Admin only)")
    public ResponseEntity<String> deleteAttendee(@PathVariable Long id) {
        attendeeService.deleteAttendee(id);
        return ResponseEntity.ok("Attendee deleted successfully.");
    }
}
