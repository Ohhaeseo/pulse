package com.example.pulse_spring.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class InfluencerSignupRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String passwordConfirm;

    @NotBlank
    private String name;

    private String phone;
    private boolean privacyAgreed;

    @Valid
    private ProfileDto profile;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ProfileDto {
        private String displayName;
        private String bio;
        private String location;
        private String profileImageUrl;
        private String instagramUrl;
        private String youtubeUrl;
        private Integer instagramFollowers;
        private Integer youtubeSubscribers;
        private Integer avgViews;
        private Double engagementRate;
        private Integer minBudget;
        private List<String> niches;
        private List<String> keywords;
        private List<String> activityAreas;
        private List<String> audienceKeywords;
    }
}
