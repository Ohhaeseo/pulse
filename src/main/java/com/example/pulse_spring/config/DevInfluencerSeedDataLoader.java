package com.example.pulse_spring.config;

import com.example.pulse_spring.domain.InfluencerProfile;
import com.example.pulse_spring.domain.User;
import com.example.pulse_spring.domain.UserRole;
import com.example.pulse_spring.repository.InfluencerProfileRepository;
import com.example.pulse_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DevInfluencerSeedDataLoader implements CommandLineRunner {
    private static final String DEFAULT_PASSWORD = "Password123!";

    private final UserRepository userRepository;
    private final InfluencerProfileRepository influencerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (influencerProfileRepository.count() >= 50) {
            return;
        }

        for (Seed seed : seeds()) {
            String email = seed.email();
            if (userRepository.existsByEmail(email) || influencerProfileRepository.existsByUserEmail(email)) {
                continue;
            }

            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .name(seed.name())
                    .phone("010-0000-" + seed.email().substring(7, 9).repeat(2))
                    .isPrivacyAgreed(true)
                    .role(UserRole.INFLUENCER)
                    .build();
            userRepository.save(user);

            InfluencerProfile profile = InfluencerProfile.builder()
                    .user(user)
                    .displayName(seed.name())
                    .bio(seed.bio())
                    .location(seed.location())
                    .profileImageUrl(seed.imageUrl())
                    .instagramUrl("https://instagram.com/" + seed.handle())
                    .youtubeUrl("https://youtube.com/@" + seed.handle())
                    .instagramFollowers(seed.followers())
                    .youtubeSubscribers(seed.followers() / 2)
                    .avgViews(seed.avgViews())
                    .engagementRate(BigDecimal.valueOf(seed.engagementRate()))
                    .minBudget(seed.minBudget())
                    .verified(seed.followers() >= 70000)
                    .niches(list(seed.niches()))
                    .keywords(list(seed.keywords()))
                    .activityAreas(list(seed.areas()))
                    .audienceKeywords(list(seed.audience()))
                    .build();
            influencerProfileRepository.save(profile);
        }
    }

    private List<String> list(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }

    private List<Seed> seeds() {
        return List.of(
                seed(1, "민지테이블", "서울 마포", "food,cafe", "감성맛집,연남동,디저트", "마포,홍대,연남", "20대여성,데이트", 84500, 32000, 4.8, 450000, "따뜻한 톤의 맛집과 카페를 소개하는 로컬 크리에이터입니다."),
                seed(2, "준호푸드맵", "서울 강남", "food", "가성비,점심맛집,직장인", "강남,역삼,선릉", "직장인,혼밥", 62300, 25000, 4.1, 350000, "직장인 점심과 회식 장소를 빠르게 정리합니다."),
                seed(3, "서아카페로그", "서울 성동", "cafe,dessert", "카페투어,디저트,성수", "성수,뚝섬,서울숲", "20대여성,카페러버", 118000, 47000, 5.2, 600000, "성수권 카페와 디저트 신상을 감각적으로 담습니다."),
                seed(4, "태윤한입", "서울 용산", "food,bar", "와인바,데이트,분위기", "용산,이태원,한남", "커플,퇴근후", 51200, 21000, 3.9, 300000, "분위기 좋은 식당과 바를 짧은 영상으로 소개합니다."),
                seed(5, "하린맛노트", "부산 해운대", "food", "해산물,부산맛집,여행", "해운대,광안리,부산", "여행객,가족", 73000, 30000, 4.6, 400000, "부산 여행 동선에 맞는 맛집 큐레이션을 합니다."),
                seed(6, "도윤서울픽", "서울 종로", "food,traditional", "한식,노포,전통", "종로,을지로,광화문", "3040,회식", 90500, 38000, 4.4, 500000, "한식과 노포의 이야기를 차분하게 전합니다."),
                seed(7, "유나디저트", "대구 중구", "cafe,dessert", "디저트,케이크,감성", "대구,동성로,중구", "20대여성,선물", 43100, 19000, 5.5, 250000, "디저트와 케이크 리뷰에 강한 크리에이터입니다."),
                seed(8, "현우먹방랩", "인천 송도", "food", "푸짐함,가족외식,고기", "송도,인천,연수", "가족,남성", 154000, 81000, 3.7, 800000, "푸짐한 한상과 고기 메뉴를 먹방형 영상으로 만듭니다."),
                seed(9, "예린브런치", "경기 판교", "cafe,western", "브런치,샐러드,건강", "판교,분당,정자", "직장인,건강식", 67700, 27000, 4.9, 380000, "브런치와 건강식 매장을 밝은 톤으로 소개합니다."),
                seed(10, "시우야식", "서울 관악", "food,bar", "야식,치킨,술집", "신림,서울대입구,관악", "대학생,친구모임", 58900, 24000, 4.2, 320000, "대학생과 동네 모임이 찾는 야식 맛집을 다룹니다."),
                seed(11, "나은핫플", "서울 강남", "food,cafe,bar", "핫플,신상,데이트", "압구정,청담,강남", "2030,트렌드", 132000, 54000, 5.0, 750000, "신상 핫플과 데이트 코스를 빠르게 확산시킵니다."),
                seed(12, "지훈면생활", "서울 송파", "food", "라멘,국수,혼밥", "잠실,송파,석촌", "혼밥,면러버", 38400, 16000, 4.7, 220000, "라멘과 면 요리에 특화된 리뷰를 올립니다."),
                seed(13, "소민비건", "서울 마포", "vegan,cafe", "비건,건강,친환경", "합정,망원,홍대", "비건,건강식", 46700, 18000, 6.1, 280000, "비건 메뉴와 친환경 브랜드를 진정성 있게 소개합니다."),
                seed(14, "건우회식록", "서울 영등포", "food,bar", "회식,고기,직장인", "여의도,영등포,문래", "직장인,단체", 79600, 34000, 4.0, 450000, "회식 장소와 단체석 정보를 실용적으로 전달합니다."),
                seed(15, "채원플레이트", "서울 서초", "western,food", "파스타,와인,데이트", "서초,교대,방배", "커플,2030", 52100, 22000, 4.8, 360000, "양식과 와인 페어링 콘텐츠를 만듭니다."),
                seed(16, "민규커피", "광주 동구", "cafe", "커피,로스터리,카페", "광주,동명동,충장로", "커피러버,2030", 31500, 12500, 5.4, 200000, "로스터리와 원두 이야기에 강합니다."),
                seed(17, "다은데이트", "서울 용산", "food,cafe", "데이트코스,뷰맛집,감성", "한남,이태원,용산", "커플,기념일", 88200, 36500, 5.1, 520000, "데이트 코스형 숏폼 콘텐츠를 제작합니다."),
                seed(18, "승민동네밥", "경기 수원", "food", "동네맛집,가성비,한식", "수원,영통,광교", "가족,직장인", 40200, 15500, 4.3, 230000, "지역 기반 실속 맛집 소개에 강합니다."),
                seed(19, "아린베이커리", "대전 유성", "bakery,cafe", "빵지순례,베이커리,디저트", "대전,유성,둔산", "디저트,여행객", 55800, 21000, 5.7, 330000, "빵과 베이커리 신메뉴 리뷰가 주력입니다."),
                seed(20, "재현술상", "서울 마포", "bar,food", "술집,안주,친구모임", "홍대,상수,합정", "2030,친구모임", 61000, 25500, 4.5, 350000, "안주와 술 조합을 재밌게 풀어냅니다."),
                seed(21, "수아제주맛", "제주 제주시", "food,travel", "제주맛집,해산물,여행", "제주,애월,제주시", "여행객,커플", 102000, 42000, 4.9, 650000, "제주 여행객에게 필요한 식당 정보를 전합니다."),
                seed(22, "동현버거", "서울 강동", "western,food", "버거,수제버거,미국식", "강동,천호,잠실", "남성,혼밥", 44600, 17500, 4.2, 260000, "수제버거와 캐주얼 다이닝을 리뷰합니다."),
                seed(23, "혜린샐러드", "서울 강남", "healthy,cafe", "샐러드,다이어트,건강식", "강남,역삼,선릉", "직장인,헬시", 39100, 14800, 5.6, 240000, "다이어트와 건강식 소비자에게 잘 닿습니다."),
                seed(24, "우진노포", "부산 중구", "food,traditional", "노포,국밥,부산", "부산,남포,서면", "3040,로컬", 69200, 28000, 4.1, 400000, "오래된 맛집과 로컬 식당을 소개합니다."),
                seed(25, "연우중식", "서울 구로", "chinese,food", "중식,짜장면,탕수육", "구로,가산,신도림", "직장인,가족", 36600, 14200, 4.4, 220000, "중식과 배달 맛집 리뷰가 주력입니다."),
                seed(26, "지아스시", "서울 강남", "japanese,food", "스시,오마카세,일식", "강남,청담,압구정", "커플,기념일", 74600, 31000, 4.8, 550000, "일식과 오마카세를 정갈하게 소개합니다."),
                seed(27, "로운분식", "서울 동대문", "food", "분식,떡볶이,가성비", "동대문,청량리,회기", "대학생,10대", 50700, 20500, 5.0, 280000, "분식과 가성비 메뉴 숏폼에 강합니다."),
                seed(28, "서윤키즈맘", "경기 일산", "food,cafe", "가족외식,키즈,브런치", "일산,파주,김포", "가족,맘", 48200, 16500, 4.9, 300000, "아이와 함께 가기 좋은 매장을 소개합니다."),
                seed(29, "태경피자", "서울 관악", "western,food", "피자,파스타,배달", "관악,사당,신림", "대학생,친구모임", 33400, 13500, 4.3, 210000, "피자와 캐주얼 양식을 빠르게 리뷰합니다."),
                seed(30, "나경혼밥", "서울 중구", "food", "혼밥,점심,직장인", "을지로,명동,시청", "직장인,혼밥", 59700, 23800, 4.7, 340000, "혼밥 가능한 점심 장소를 명확하게 정리합니다."),
                seed(31, "유겸로스터", "서울 성동", "cafe", "스페셜티,로스터리,커피", "성수,서울숲,건대", "커피러버,2030", 42100, 15400, 5.3, 260000, "커피 원두와 매장 분위기를 깊게 다룹니다."),
                seed(32, "하윤감성샷", "서울 마포", "cafe,food", "인스타감성,사진맛집,카페", "망원,합정,홍대", "20대여성,사진", 97300, 39000, 5.8, 580000, "사진이 잘 나오는 매장 콘텐츠에 강합니다."),
                seed(33, "찬호고기집", "서울 강서", "food", "고기,삼겹살,회식", "마곡,발산,강서", "직장인,단체", 78200, 33500, 4.0, 480000, "고기집과 단체 회식 장소를 활기 있게 보여줍니다."),
                seed(34, "소율티타임", "서울 서대문", "cafe,dessert", "홍차,디저트,조용한카페", "연희,신촌,서대문", "여성,조용한공간", 29400, 11000, 5.9, 190000, "차분한 카페와 티룸을 소개합니다."),
                seed(35, "규빈푸드트립", "강원 강릉", "food,travel", "강릉맛집,여행,해산물", "강릉,속초,양양", "여행객,커플", 86400, 35000, 4.6, 520000, "강원 여행 맛집 동선을 잘 만듭니다."),
                seed(36, "은채야채생활", "서울 송파", "healthy,vegan", "샐러드,비건,클린식", "잠실,송파,문정", "헬시,직장인", 35200, 12600, 5.5, 230000, "클린식과 비건 옵션을 꼼꼼히 봅니다."),
                seed(37, "민석술집탐방", "대구 수성", "bar,food", "술집,안주,대구", "대구,수성,동성로", "2030,친구모임", 54000, 22000, 4.2, 320000, "지역 술집과 안주 메뉴 소개가 주력입니다."),
                seed(38, "예준일식노트", "부산 해운대", "japanese,food", "일식,라멘,스시", "해운대,광안리,부산", "여행객,일식", 46600, 17800, 4.5, 300000, "부산권 일식 매장을 깔끔하게 소개합니다."),
                seed(39, "지민브랜드맛집", "서울 강남", "food,cafe", "프리미엄,브랜드,신상", "청담,압구정,강남", "트렌드,소비력", 141000, 61000, 4.7, 900000, "브랜드 협업 경험이 많은 프리미엄 크리에이터입니다."),
                seed(40, "도하캠퍼스밥", "서울 서대문", "food", "대학생,가성비,분식", "신촌,이대,연세대", "대학생,10대", 37200, 15000, 5.1, 220000, "대학생 타깃 매장 홍보에 적합합니다."),
                seed(41, "라온골목식탁", "서울 은평", "food", "골목맛집,한식,동네", "은평,불광,연신내", "동네주민,가족", 28600, 9800, 4.8, 180000, "동네 주민에게 닿는 생활형 콘텐츠를 만듭니다."),
                seed(42, "세린파인다이닝", "서울 용산", "western,japanese", "파인다이닝,기념일,코스", "한남,이태원,용산", "기념일,커플", 63800, 26000, 4.3, 700000, "고급 식사 경험을 섬세하게 전달합니다."),
                seed(43, "원준디저트헌터", "경기 부천", "dessert,cafe", "디저트,크림,카페", "부천,상동,중동", "20대여성,디저트", 41700, 16200, 5.6, 260000, "디저트 신메뉴 반응이 좋습니다."),
                seed(44, "해린로컬부산", "부산 부산진", "food,cafe", "서면맛집,카페,로컬", "서면,전포,부산진", "2030,로컬", 75500, 30000, 5.0, 430000, "부산 젊은 층 타깃 콘텐츠를 잘 만듭니다."),
                seed(45, "태오비어로그", "서울 마포", "bar", "수제맥주,펍,안주", "홍대,합정,상수", "친구모임,퇴근후", 49900, 19800, 4.6, 300000, "펍과 수제맥주 콘텐츠에 특화되어 있습니다."),
                seed(46, "유리파스타", "인천 구월", "western,food", "파스타,리조또,데이트", "구월,인천,부평", "커플,2030", 44300, 17000, 4.7, 280000, "인천권 양식 데이트 장소를 소개합니다."),
                seed(47, "찬이국밥", "대전 중구", "food,traditional", "국밥,한식,든든함", "대전,중구,서대전", "남성,직장인", 53100, 21400, 4.1, 310000, "든든한 한식과 국밥 리뷰가 자연스럽습니다."),
                seed(48, "리아무드카페", "서울 강남", "cafe,dessert", "무드카페,디저트,압구정", "압구정,청담,신사", "20대여성,데이트", 109000, 45200, 5.4, 650000, "감각적인 카페 영상과 사진 톤이 강점입니다."),
                seed(49, "성훈푸드챌린지", "서울 노원", "food", "먹방,푸짐함,챌린지", "노원,도봉,창동", "남성,친구모임", 126000, 70000, 3.8, 720000, "먹방형 확산 콘텐츠와 대용량 메뉴에 강합니다."),
                seed(50, "다빈여행식탁", "전주 완산", "food,travel", "전주맛집,한옥마을,한식", "전주,완산,전북", "여행객,가족", 68700, 27200, 4.9, 420000, "전주 여행 맛집과 한식 콘텐츠를 제작합니다.")
        );
    }

    private Seed seed(int index, String name, String location, String niches, String keywords, String areas,
                      String audience, int followers, int avgViews, double engagementRate, int minBudget, String bio) {
        String handle = "pulse_creator_" + String.format("%02d", index);
        return new Seed(
                "creator" + String.format("%02d", index) + "@pulse.test",
                name,
                handle,
                location,
                niches,
                keywords,
                areas,
                audience,
                followers,
                avgViews,
                engagementRate,
                minBudget,
                bio,
                "https://images.unsplash.com/photo-" + imageIds().get(index - 1) + "?auto=format&fit=crop&w=640&q=80&sig=" + index
        );
    }

    private List<String> imageIds() {
        return List.of(
                "1494790108377-be9c29b29330", "1500648767791-00dcc994a43e", "1534528741775-53994a69daeb",
                "1506794778202-cad84cf45f1d", "1544005313-94ddf0286df2", "1507003211169-0a1dd7228f2d",
                "1524504388940-b1c1722653e1", "1507003211169-0a1dd7228f2d", "1517841905240-472988babdf9",
                "1547425260-76bcadfb4f2c", "1531123897727-8f129e1688ce", "1527980965255-d3b416303d12",
                "1548142813-c348350df52b", "1519345182560-3f2917c472ef", "1520813792240-56fc4a3765a7",
                "1530268729831-4b0b9e170218", "1517365830460-955ce3ccd263", "1529626455594-4ff0802cfb7e",
                "1521572267360-ee0c2909d518", "1545167622-3a6ac756afa4", "1487412720507-e7ab37603c6f",
                "1506794778202-cad84cf45f1d", "1524504388940-b1c1722653e1", "1500648767791-00dcc994a43e",
                "1494790108377-be9c29b29330", "1534528741775-53994a69daeb", "1544005313-94ddf0286df2",
                "1517841905240-472988babdf9", "1547425260-76bcadfb4f2c", "1531123897727-8f129e1688ce",
                "1527980965255-d3b416303d12", "1548142813-c348350df52b", "1519345182560-3f2917c472ef",
                "1520813792240-56fc4a3765a7", "1530268729831-4b0b9e170218", "1517365830460-955ce3ccd263",
                "1529626455594-4ff0802cfb7e", "1521572267360-ee0c2909d518", "1545167622-3a6ac756afa4",
                "1487412720507-e7ab37603c6f", "1494790108377-be9c29b29330", "1500648767791-00dcc994a43e",
                "1534528741775-53994a69daeb", "1506794778202-cad84cf45f1d", "1544005313-94ddf0286df2",
                "1507003211169-0a1dd7228f2d", "1524504388940-b1c1722653e1", "1517841905240-472988babdf9",
                "1547425260-76bcadfb4f2c", "1531123897727-8f129e1688ce"
        );
    }

    private record Seed(
            String email,
            String name,
            String handle,
            String location,
            String niches,
            String keywords,
            String areas,
            String audience,
            int followers,
            int avgViews,
            double engagementRate,
            int minBudget,
            String bio,
            String imageUrl
    ) {
    }
}
