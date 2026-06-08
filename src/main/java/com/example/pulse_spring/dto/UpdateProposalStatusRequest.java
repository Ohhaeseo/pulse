package com.example.pulse_spring.dto;

import com.example.pulse_spring.domain.ProposalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProposalStatusRequest {
    @NotNull
    private ProposalStatus status;
}
