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
public class LoginResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private AuthUserDto user;

    public static LoginResponse of(String accessToken) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public static LoginResponse of(String accessToken, User user) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(AuthUserDto.from(user))
                .build();
    }
}
