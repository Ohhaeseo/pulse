package com.example.pulse_spring.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreateInfluencerProposalRequest {
    @NotNull
    private Long influencerProfileId;

    private String campaignType;
    private Integer budget;
    private boolean provideFood;
    private LocalDate desiredDate;
    private String contact;
    private String message;
}
