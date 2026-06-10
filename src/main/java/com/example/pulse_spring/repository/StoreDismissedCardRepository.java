package com.example.pulse_spring.repository;

import com.example.pulse_spring.domain.StoreDismissedCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreDismissedCardRepository extends JpaRepository<StoreDismissedCard, Long> {
    List<StoreDismissedCard> findByStoreId(Long storeId);

    Optional<StoreDismissedCard> findByStoreIdAndCardId(Long storeId, String cardId);

    boolean existsByStoreIdAndCardId(Long storeId, String cardId);
}
