package com.example.pulse_spring.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class SocialStatsService {
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public SocialStats fetch(String instagramUrl, String youtubeUrl) {
        int instagramFollowers = fetchInstagramFollowers(instagramUrl).orElse(0);
        int youtubeSubscribers = fetchYoutubeSubscribers(youtubeUrl).orElse(0);
        return new SocialStats(instagramFollowers, youtubeSubscribers);
    }

    private Optional<Integer> fetchInstagramFollowers(String url) {
        if (url == null || url.isBlank()) {
            return Optional.empty();
        }

        try {
            String html = fetchHtml(url);
            return firstNumber(
                    html,
                    Pattern.compile("\"edge_followed_by\"\\s*:\\s*\\{\\s*\"count\"\\s*:\\s*(\\d+)"),
                    Pattern.compile("([\\d,.]+)\\s*Followers", Pattern.CASE_INSENSITIVE),
                    Pattern.compile("([\\d,.]+)\\s*followers", Pattern.CASE_INSENSITIVE)
            );
        } catch (Exception error) {
            log.info("Instagram follower crawling skipped: {}", error.getMessage());
            return Optional.empty();
        }
    }

    private Optional<Integer> fetchYoutubeSubscribers(String url) {
        if (url == null || url.isBlank()) {
            return Optional.empty();
        }

        try {
            String html = fetchHtml(url);
            return firstNumber(
                    html,
                    Pattern.compile("\"subscriberCountText\"\\s*:\\s*\\{[^}]*\"simpleText\"\\s*:\\s*\"([^\"]+)\""),
                    Pattern.compile("\"subscriberCountText\"\\s*:\\s*\\{[^}]*\"content\"\\s*:\\s*\"([^\"]+)\""),
                    Pattern.compile("([\\d,.]+)\\s*subscribers", Pattern.CASE_INSENSITIVE)
            );
        } catch (Exception error) {
            log.info("YouTube subscriber crawling skipped: {}", error.getMessage());
            return Optional.empty();
        }
    }

    private String fetchHtml(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(5))
                .header("User-Agent", "Mozilla/5.0")
                .GET()
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }

    private Optional<Integer> firstNumber(String text, Pattern... patterns) {
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                return Optional.of(parseCompactNumber(matcher.group(1)));
            }
        }
        return Optional.empty();
    }

    private int parseCompactNumber(String raw) {
        String normalized = raw == null ? "" : raw.trim().toLowerCase();
        normalized = normalized
                .replace("subscribers", "")
                .replace("subscriber", "")
                .replace("followers", "")
                .replace("follower", "")
                .replace("구독자", "")
                .replace("팔로워", "")
                .trim();

        double multiplier = 1;
        if (normalized.contains("만")) {
            multiplier = 10_000;
            normalized = normalized.replace("만", "");
        } else if (normalized.contains("k")) {
            multiplier = 1_000;
            normalized = normalized.replace("k", "");
        } else if (normalized.contains("m")) {
            multiplier = 1_000_000;
            normalized = normalized.replace("m", "");
        }

        normalized = normalized.replace(",", "").replaceAll("[^0-9.]", "");
        if (normalized.isBlank()) {
            return 0;
        }
        return (int) Math.round(Double.parseDouble(normalized) * multiplier);
    }

    public record SocialStats(int instagramFollowers, int youtubeSubscribers) {
    }
}
