package com.example.pulse_spring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStoreResponse {
    private Long id;
    private String name;
    private String address;
    private String category;
    private String categoryLabel;
    private String customCategory;
    private Double lat;
    private Double lng;
}
