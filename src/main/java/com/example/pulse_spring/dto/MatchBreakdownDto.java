package com.example.pulse_spring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MatchBreakdownDto {
    private int category;
    private int location;
    private int keyword;
    private int performance;
    private int budget;
}
