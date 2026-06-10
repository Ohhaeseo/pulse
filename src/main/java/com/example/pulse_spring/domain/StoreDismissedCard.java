package com.example.pulse_spring.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 대시보드 추천 카드(aiSuggestion/operational) 숨김(dismiss) 이력.
 * 가게별로 숨긴 카드 id를 영속화해, 새로고침/재로그인 후에도 유지한다.
 */
@Entity
@Table(
        name = "store_dismissed_cards",
        uniqueConstraints = @UniqueConstraint(name = "uq_store_card", columnNames = {"store_id", "card_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class StoreDismissedCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "card_id", nullable = false)
    private String cardId;

    @Column(name = "dismissed_at", nullable = false)
    private LocalDateTime dismissedAt;
}
