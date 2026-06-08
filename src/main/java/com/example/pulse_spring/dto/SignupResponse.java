package com.example.pulse_spring.dto;

import com.example.pulse_spring.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignupResponse {
    private String message;
    private String accessToken;
    private String analysisTaskId;
    private AuthUserDto user;
    @Builder.Default
    private String tokenType = "Bearer";

    public static SignupResponse of(String message, String accessToken, String analysisTaskId) {
        return SignupResponse.builder()
                .message(message)
                .accessToken(accessToken)
                .analysisTaskId(analysisTaskId)
                .build();
    }

    public static SignupResponse of(String message, String accessToken, String analysisTaskId, User user) {
        return SignupResponse.builder()
                .message(message)
                .accessToken(accessToken)
                .analysisTaskId(analysisTaskId)
                .user(AuthUserDto.from(user))
                .build();
    }
}
