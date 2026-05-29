package com.example.pulse_spring.controller;

import com.example.pulse_spring.dto.MapInsightActionRequest;
import com.example.pulse_spring.dto.MapInsightReportRequest;
import com.example.pulse_spring.service.FastApiClient;
import com.example.pulse_spring.service.MapInsightReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/map-insight")
@RequiredArgsConstructor
public class MapInsightController {
    private final FastApiClient fastApiClient;
    private final MapInsightReportService mapInsightReportService;

    @PostMapping("/actions")
    public ResponseEntity<?> generateActions(
            Authentication authentication,
            @RequestBody MapInsightActionRequest request
    ) {
        try {
            return ResponseEntity.ok(fastApiClient.generateMapInsightActions(request));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/report")
    public ResponseEntity<?> generateReport(
            Authentication authentication,
            @RequestBody MapInsightReportRequest request
    ) {
        try {
            return ResponseEntity.ok(mapInsightReportService.buildReport(request));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
