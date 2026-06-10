package com.example.pulse_spring.util;

import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * 외부 API(DataLab/날씨) 호출량을 줄이기 위한 경량 인메모리 TTL 캐시.
 * Redis 도입 전 단계의 임시 캐시 — 단일 인스턴스 기준으로만 동작한다.
 */
public class TtlCache<V> {
    private record Entry<V>(V value, long expiresAtMs) {}

    private final ConcurrentHashMap<String, Entry<V>> store = new ConcurrentHashMap<>();
    private final long ttlMs;

    public TtlCache(long ttlMs) {
        this.ttlMs = ttlMs;
    }

    /**
     * 키가 유효하면 캐시값을, 아니면 loader로 새로 만들어 저장 후 반환한다.
     * loader가 null을 반환하면 캐시하지 않는다(실패값 캐싱 방지).
     */
    public V get(String key, long nowMs, Supplier<V> loader) {
        Entry<V> cached = store.get(key);
        if (cached != null && cached.expiresAtMs() > nowMs) {
            return cached.value();
        }
        V fresh = loader.get();
        if (fresh != null) {
            store.put(key, new Entry<>(fresh, nowMs + ttlMs));
        }
        return fresh;
    }
}
