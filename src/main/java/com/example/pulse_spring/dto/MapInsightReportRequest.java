package com.example.pulse_spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MapInsightReportRequest {
    private Double latitude;
    private Double longitude;
    private Integer radius;
    private String category;
}
