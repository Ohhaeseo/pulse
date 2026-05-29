package com.example.pulse_spring.controller;

import com.example.pulse_spring.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserStoreController {
    private final AuthService authService;

    @GetMapping("/me/store")
    public ResponseEntity<?> getCurrentStore(Authentication authentication) {
        try {
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "data", authService.getCurrentStore(authentication.getName())
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
