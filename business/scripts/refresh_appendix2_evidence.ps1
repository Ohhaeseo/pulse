Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$generatedDir = 'C:\PULSE\business\generated'
$imagesDir = 'C:\PULSE\images'

$appendixPath = Join-Path $generatedDir '사업계획서_PULSE_2026_별첨2_최종제출본.docx'
$appendixPdfPath = Join-Path $generatedDir '사업계획서_PULSE_2026_별첨2_최종제출본.pdf'
$appendixBackupPath = Join-Path $generatedDir '사업계획서_PULSE_2026_별첨2_최종제출본_before_appendix_refresh.docx'

$imageMap = @(
    @{
        Title = '[붙임 7-1] KCI 논문 등재 증빙'
        Note = '연구 기반 문제 정의와 고객 분석 구조의 신뢰도를 보강하는 참고 증빙입니다.'
        Path = (Join-Path $imagesDir 'KCI논문사진.png')
        Width = 360
    },
    @{
        Title = '[붙임 7-2] MVP 상세 화면 - 리뷰 분석 및 페르소나 도출 화면'
        Note = '리뷰 분석 결과를 바탕으로 대표 페르소나와 고객 여정이 도출되는 실제 구현 화면입니다.'
        Path = (Join-Path $imagesDir 'MVP상세사진1-고객페르소나및여정지도.png')
        Width = 430
    },
    @{
        Title = '[붙임 7-3] MVP 상세 화면 - 홍보영상 생성 화면'
        Note = '분석 결과를 홍보 실행 단계로 연결하는 AI 릴스 생성 기능의 실제 구현 화면입니다.'
        Path = (Join-Path $imagesDir 'MVP상세사진2-릴스생성.png')
        Width = 430
    },
    @{
        Title = '[붙임 7-4] 프로젝트 전체 기술적 아키텍처 도표'
        Note = '프론트엔드, 메인 백엔드, AI 서버와 데이터 저장 흐름을 함께 보여주는 구조도입니다.'
        Path = (Join-Path $imagesDir '기술아키텍처.png')
        Width = 430
    },
    @{
        Title = '[붙임 7-5] 사용자 입장 서비스 흐름도'
        Note = '고객 이해에서 콘텐츠 생성과 실행 제안까지 이어지는 서비스 흐름을 한 장으로 정리한 도식입니다.'
        Path = (Join-Path $imagesDir '차별성.png')
        Width = 340
    },
    @{
        Title = '[붙임 7-6] 문제 검증 자료'
        Note = '외식업 자영업자가 실제로 겪는 마케팅 실행 장벽을 직관적으로 보여주는 참고 자료입니다.'
        Path = (Join-Path $imagesDir '문제검증자료.png')
        Width = 430
    },
    @{
        Title = '[붙임 7-7] 비즈니스모델 구체화'
        Note = '무료 진입, 유료 전환, 업셀과 제휴 확장까지 이어지는 사업 구조를 요약한 도식입니다.'
        Path = (Join-Path $imagesDir '비즈니스모델.png')
        Width = 390
    }
)

function Find-ParagraphIndex {
    param(
        $Document,
        [string]$MatchText
    )

    for ($i = 1; $i -le $Document.Paragraphs.Count; $i++) {
        $text = $Document.Paragraphs.Item($i).Range.Text.Replace("`r", '').Trim()
        if ($text -eq $MatchText) {
            return $i
        }
    }

    throw "Paragraph not found: $MatchText"
}

function Set-ParagraphText {
    param(
        $Paragraph,
        [string]$Text
    )

    $range = $Paragraph.Range
    $range.End = $range.End - 1
    $range.Text = $Text
    $range.Font.NameFarEast = '맑은 고딕'
    $range.Font.NameAscii = 'Malgun Gothic'
    $range.Font.NameOther = 'Malgun Gothic'
    $range.Font.Size = 10
}

function Add-Section {
    param(
        $Word,
        $Document,
        [hashtable]$Section,
        [bool]$InsertPageBreak = $true
    )

    $selection = $Word.Selection
    $selection.SetRange($Document.Content.End - 1, $Document.Content.End - 1)

    if ($InsertPageBreak) {
        $selection.InsertBreak(7)
    }

    $selection.TypeText($Section.Title)
    $selection.TypeParagraph()
    $selection.ParagraphFormat.Alignment = 0
    $selection.Font.NameFarEast = '맑은 고딕'
    $selection.Font.NameAscii = 'Malgun Gothic'
    $selection.Font.NameOther = 'Malgun Gothic'
    $selection.Font.Size = 14
    $selection.Font.Bold = 1

    $selection.TypeText($Section.Note)
    $selection.TypeParagraph()
    $selection.ParagraphFormat.Alignment = 0
    $selection.Font.NameFarEast = '맑은 고딕'
    $selection.Font.NameAscii = 'Malgun Gothic'
    $selection.Font.NameOther = 'Malgun Gothic'
    $selection.Font.Size = 10
    $selection.Font.Bold = 0

    $selection.ParagraphFormat.Alignment = 1
    $shape = $selection.InlineShapes.AddPicture($Section.Path)
    $shape.LockAspectRatio = -1
    if ($shape.Width -gt $Section.Width) {
        $shape.Width = $Section.Width
    }

    $selection.TypeParagraph()
}

Copy-Item -Path $appendixPath -Destination $appendixBackupPath -Force

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Open($appendixPath)

    try {
        $summaryText = "(해당 시) 제출한 자료 외 사업계획서 평가 참고용 증빙 [붙임 7]`r1. KCI 논문 등재 증빙`r2. MVP 상세 화면 캡처`r3. 프로젝트 전체 기술적 아키텍처 도표`r4. 사용자 입장 서비스 흐름도`r5. 문제 검증 자료`r6. 비즈니스모델 구체화"
        Set-ParagraphText -Paragraph $doc.Paragraphs.Item(34) -Text $summaryText

        $guideText = "[붙임 7] 기타 증빙서류 제출 순서`r`r1. [붙임 7-1] KCI 논문 등재 증빙`r   - KCI 검색 결과 화면 또는 논문 첫 페이지 캡처 삽입`r`r2. [붙임 7-2] MVP 상세 화면 - 리뷰 분석 및 페르소나 도출 화면`r   - 고객 페르소나 및 고객 여정 도출 화면 삽입`r`r3. [붙임 7-3] MVP 상세 화면 - 홍보영상 생성 화면`r   - AI 릴스 생성 화면 삽입`r`r4. [붙임 7-4] 프로젝트 전체 기술적 아키텍처 도표`r   - 프론트엔드, 메인 백엔드, AI 서버 구조가 보이도록 삽입`r`r5. [붙임 7-5] 사용자 입장 서비스 흐름도`r   - 고객 이해 → 홍보 제작 → 실행 제안 흐름이 보이도록 삽입`r`r6. [붙임 7-6] 문제 검증 자료`r   - 외식업 자영업자 실행 장벽 도식 삽입`r`r7. [붙임 7-7] 비즈니스모델 구체화`r   - 무료 진입부터 업셀·제휴 확장까지의 구조 삽입"
        Set-ParagraphText -Paragraph $doc.Paragraphs.Item(74) -Text $guideText

        $startIndex = Find-ParagraphIndex -Document $doc -MatchText '[붙임 7-1] KCI 논문 등재 증빙'
        $start = $doc.Paragraphs.Item($startIndex).Range.Start
        $deleteRange = $doc.Range($start, $doc.Content.End - 1)
        $deleteRange.Delete()

        foreach ($section in $imageMap) {
            Add-Section -Word $word -Document $doc -Section $section -InsertPageBreak $true
        }

        $doc.Save()
        $doc.ExportAsFixedFormat($appendixPdfPath, 17)
    }
    finally {
        $doc.Close([ref]0)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
    }
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Host $appendixPath
Write-Host $appendixPdfPath
