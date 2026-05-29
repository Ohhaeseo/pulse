package com.example.pulse_spring.domain;

import jakarta.persistence.*;
import lombok.*;

/*
 * Shop 엔티티 클래스
 *
 * 이 클래스는 "가게(Shop)" 정보를 데이터베이스에 저장하기 위한 JPA 엔티티입니다.
 * - 각 Shop 객체는 하나의 User(사장님) 계정과 1:1로 매핑됩니다.
 * - 주요 필드로는 가게 이름(name), 카테고리(category), 주소(address), 분석 상태(status) 등이 있습니다.
 * - 카테고리가 기타(ETC)일 경우 customCategory 값을 추가로 입력받을 수 있습니다.
 * - status는 AI 분석 상태(PENDING, COMPLETED, FAILED)를 추적하는 용도로 사용됩니다.
 *
 * 팀원 참고사항:
 * - User, Category 등 관련 엔티티/Enum과의 관계를 유념하시고, 가입/등록/조회 로직 구현 시 필드를 참조하세요.
 * - 가게 등록, 조회, 분석 요청 등 도메인 관련 로직에서 이 엔티티를 주로 다루게 됩니다.
 */
@Entity
@Table(name = "shops")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 이 가게를 등록한 User(사장님)와 1:1 관계

    @Column(nullable = false)
    private String name; // 가게 이름

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category; // 가게 카테고리 (한식, 일식 등)

    private String customCategory; // 카테고리가 ETC(기타)일 경우 직접 입력하는 값

    @Column(nullable = false)
    private String address; // 가게 주소

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    private AnalysisStatus status; // AI 분석 상태 (PENDING, COMPLETED, FAILED)

    public enum AnalysisStatus {
        PENDING, COMPLETED, FAILED
    }

    public void updateCoordinates(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
