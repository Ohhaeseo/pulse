package com.example.pulse_spring.controller;

import com.example.pulse_spring.service.InfluencerRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/influencers")
@RequiredArgsConstructor
public class InfluencerRecommendationController {
    private final InfluencerRecommendationService recommendationService;

    @GetMapping("/recommendations")
    public ResponseEntity<?> recommendations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요합니다."));
        }

        try {
            return ResponseEntity.ok(recommendationService.recommendForOwner(authentication.getName()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
