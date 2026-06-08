package com.example.pulse_spring.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StoreInsightDto {
    private Long shopId;
    private String shopName;
    private String category;
    private String address;
    private List<String> keywords;
}
