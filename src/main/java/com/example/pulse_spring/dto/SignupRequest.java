package com.example.pulse_spring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/*
 * [SignupRequest DTO]
 * 
 * 이 클래스는 회원가입(사용자 + 가게 정보) 요청 시 클라이언트가 전달하는 데이터를 묶어서 받기 위한 데이터 전송 객체(DTO)입니다.
 * 
 * [주요 역할 및 협업 시 참고 사항]
 * - AuthController의 /signup 엔드포인트에서 RequestBody로 사용됩니다.
 * - 사용자(email, password, name 등) 정보와,
 *   사장님 회원의 경우 가게(Shop) 정보(shopInfo 객체)를 한 번에 수집할 수 있도록 설계되었습니다.
 * - 각 필드는 jakarta.validation의 @NotBlank, @NotNull 등의 어노테이션으로 유효성 검증을 지원합니다.
 * - shopInfo(name, address, category 등)는 내부 static 클래스로 분리되어 있어,
 *   가게 등록/AI 분석 등 비즈니스 로직에서 유연하게 활용할 수 있습니다.
 * - 팀원 여러분은 이 DTO를 참고하여 프론트와 API 인터페이스를 설계하거나, 
 *   도메인 객체 변환/유효성 체크를 구현할 때 활용하시면 됩니다.
 */

@Getter
@Setter
public class SignupRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String passwordConfirm;
    @NotBlank
    private String name;
    private String phone;
    private boolean isPrivacyAgreed;

    @NotNull
    private ShopInfoDto shopInfo;

    @Getter
    @Setter
    public static class ShopInfoDto {
        private String name;
        private String address;
        private String category;
        private String customCategory;
    }
}
