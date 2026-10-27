package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "agenda_entries", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "session_id"}))
public class AgendaEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private SessionEntry session;

    public AgendaEntry() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public SessionEntry getSession() { return session; }
    public void setSession(SessionEntry session) { this.session = session; }
}