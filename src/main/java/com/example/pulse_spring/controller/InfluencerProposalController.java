package com.example.pulse_spring.controller;

import com.example.pulse_spring.dto.AcceptInfluencerProposalRequest;
import com.example.pulse_spring.dto.CreateInfluencerProposalRequest;
import com.example.pulse_spring.dto.RejectInfluencerProposalRequest;
import com.example.pulse_spring.dto.UpdateProposalStatusRequest;
import com.example.pulse_spring.service.InfluencerProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/influencer-proposals")
@RequiredArgsConstructor
public class InfluencerProposalController {
    private final InfluencerProposalService proposalService;

    @PostMapping
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestBody @Valid CreateInfluencerProposalRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(proposalService.create(authentication.getName(), request));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @GetMapping("/owner")
    public ResponseEntity<?> ownerProposals(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.ownerProposals(authentication.getName()));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @GetMapping("/owner/{proposalId}")
    public ResponseEntity<?> ownerDetail(Authentication authentication, @PathVariable Long proposalId) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.ownerDetail(authentication.getName(), proposalId));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @GetMapping("/inbox")
    public ResponseEntity<?> inbox(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.inbox(authentication.getName()));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @GetMapping("/inbox/{proposalId}")
    public ResponseEntity<?> influencerDetail(Authentication authentication, @PathVariable Long proposalId) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.influencerDetail(authentication.getName(), proposalId));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @PatchMapping("/{proposalId}/accept")
    public ResponseEntity<?> accept(Authentication authentication,
                                    @PathVariable Long proposalId,
                                    @RequestBody(required = false) AcceptInfluencerProposalRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.accept(authentication.getName(), proposalId, request));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @PatchMapping("/{proposalId}/reject")
    public ResponseEntity<?> reject(Authentication authentication,
                                    @PathVariable Long proposalId,
                                    @RequestBody(required = false) RejectInfluencerProposalRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.reject(authentication.getName(), proposalId, request));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @PatchMapping("/{proposalId}/cancel")
    public ResponseEntity<?> cancel(Authentication authentication, @PathVariable Long proposalId) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.cancel(authentication.getName(), proposalId));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    @PatchMapping("/{proposalId}/status")
    public ResponseEntity<?> updateStatus(Authentication authentication,
                                          @PathVariable Long proposalId,
                                          @RequestBody @Valid UpdateProposalStatusRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok(proposalService.updateStatus(authentication.getName(), proposalId, request.getStatus()));
        } catch (IllegalArgumentException | IllegalStateException error) {
            return badRequest(error);
        }
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Login required."));
    }

    private ResponseEntity<Map<String, String>> badRequest(Exception error) {
        return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
    }
}
