package com.example.pulse_spring.dto;

import com.example.pulse_spring.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurrentUserProfileResponse {
    private String email;
    private String name;
    private UserRole role;
    private String ownerName;
    private String shopName;
    private String shopAddress;
    private String shopCategory;
    private InfluencerProfileResponse influencerProfile;
}
