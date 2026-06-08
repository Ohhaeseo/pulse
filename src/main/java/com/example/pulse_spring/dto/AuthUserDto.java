package com.example.pulse_spring.dto;

import com.example.pulse_spring.domain.User;
import com.example.pulse_spring.domain.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthUserDto {
    private Long id;
    private String email;
    private String name;
    private UserRole role;

    public static AuthUserDto from(User user) {
        return AuthUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
