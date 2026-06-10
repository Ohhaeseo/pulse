package com.example.pulse_spring.controller;

import com.example.pulse_spring.dto.dashboard.DismissRequest;
import com.example.pulse_spring.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * 가게 현황 대시보드 집계 API. (스펙 §2)
 * 응답 봉투는 FE 기대값 { success, data } / { success:false, error } 에 맞춘다.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/{storeId}/store-status")
    public ResponseEntity<?> getStoreStatus(
            Authentication authentication,
            @PathVariable Long storeId
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", dashboardService.getStoreStatus(authentication.getName(), storeId)
            ));
        } catch (ResponseStatusException e) {
            return errorResponse(e);
        }
    }

    @PostMapping("/{storeId}/dismiss")
    public ResponseEntity<?> dismiss(
            Authentication authentication,
            @PathVariable Long storeId,
            @RequestBody DismissRequest request
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "dismissedIds", dashboardService.dismissCard(authentication.getName(), storeId, request.getCardId())
            ));
        } catch (ResponseStatusException e) {
            return errorResponse(e);
        }
    }

    private ResponseEntity<?> errorResponse(ResponseStatusException e) {
        HttpStatus status = HttpStatus.valueOf(e.getStatusCode().value());
        String error = switch (status) {
            case FORBIDDEN -> "FORBIDDEN";
            case NOT_FOUND -> "STORE_NOT_FOUND";
            case BAD_REQUEST -> "INVALID_REQUEST";
            default -> "INTERNAL_ERROR";
        };
        return ResponseEntity.status(status).body(Map.of("success", false, "error", error));
    }
}
