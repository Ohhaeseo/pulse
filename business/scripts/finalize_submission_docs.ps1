Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$generatedDir = Join-Path $root 'generated'
$imagesDir = Join-Path (Split-Path -Parent $root) 'images'

$bodySource = Join-Path $generatedDir '사업계획서_PULSE_2026_실제입력본_도식반영본.docx'
$appendixSource = Join-Path $generatedDir '사업계획서_PULSE_2026_별첨2_증빙서류_입력본_도식반영본.docx'

$bodyOutput = Join-Path $generatedDir '사업계획서_PULSE_2026_최종제출본.docx'
$bodyPdfOutput = Join-Path $generatedDir '사업계획서_PULSE_2026_최종제출본.pdf'
$appendixOutput = Join-Path $generatedDir '사업계획서_PULSE_2026_별첨2_최종제출본.docx'
$appendixPdfOutput = Join-Path $generatedDir '사업계획서_PULSE_2026_별첨2_최종제출본.pdf'

$serviceImage = Join-Path $imagesDir '서비스대표사진.png'

$nameReplacements = [ordered]@{
    '윤준하' = '윤*하'
    '노태경' = '노*경'
    '김혜린' = '김*린'
    '오해서' = '오*서'
}

$sensitivePhraseReplacements = [ordered]@{
    '대학생(4학년 재학) / 미디어소프트웨어학과 / AI·CTO' = '대학생(4학년 재학) / AI·CTO'
    '미디어소프트웨어학과' = '전공 비공개'
}

function Copy-SourceFiles {
    Copy-Item -Path $bodySource -Destination $bodyOutput -Force
    Copy-Item -Path $appendixSource -Destination $appendixOutput -Force
}

function Replace-AllText {
    param(
        $Document,
        [string]$FindText,
        [string]$ReplaceText
    )

    $range = $Document.Content
    $null = $range.Find.Execute(
        $FindText,
        $false,
        $false,
        $false,
        $false,
        $false,
        $true,
        1,
        $false,
        $ReplaceText,
        2
    )
}

function Apply-Replacements {
    param($Document)

    foreach ($entry in $nameReplacements.GetEnumerator()) {
        Replace-AllText -Document $Document -FindText $entry.Key -ReplaceText $entry.Value
    }

    foreach ($entry in $sensitivePhraseReplacements.GetEnumerator()) {
        Replace-AllText -Document $Document -FindText $entry.Key -ReplaceText $entry.Value
    }
}

function Set-DocumentBodyFont {
    param($Document)

    $range = $Document.Content
    $range.Font.NameFarEast = '맑은 고딕'
    $range.Font.NameAscii = 'Malgun Gothic'
    $range.Font.NameOther = 'Malgun Gothic'
    $range.Font.Size = 10
}

function Apply-BodyEnrichment {
    param($Document)

    $replacements = [ordered]@{
        '[별첨2제출: MVP 상세 화면 - 리뷰 분석 및 페르소나 도출 화면]' = '별첨2에는 리뷰 분석, 고객 페르소나 도출, 콘텐츠 생성 화면과 기술 아키텍처, 연구 근거를 함께 정리해 제품 완성도와 사업화 준비도를 검증할 수 있도록 구성하였습니다.'
        '[별첨2제출: MVP 상세 화면 - 홍보영상 생성 화면]' = '핵심 차별점은 리뷰를 단순 리포트로 끝내지 않고, 수집-이해-생성-실행의 흐름으로 연결해 사장님이 실제 행동으로 옮길 수 있는 운영 도구로 전환한다는 점입니다.'
        '[별첨2제출: 프로젝트 전체 기술적 아키텍처 도표]' = ''
        '[별첨2제출: 사용자 입장 서비스 흐름도]' = ''
        '[별첨2제출: KCI 논문 등재 사진 - KCI 논문 검색 결과 또는 논문 첫 페이지 캡처]' = ''
        '[본문삽입: 비즈니스 모델 도식 또는 사업 확장 로드맵 중 1개 선택]' = '무료 진입 구간에서는 리뷰 분석과 고객 이해 경험을 통해 핵심 가치를 빠르게 체감하게 하고, 반복 사용 구간에서는 Basic 구독 전환으로 이어지도록 설계하였습니다.'
        '[별첨2제출 가능: 사업 확장 로드맵 도표 또는 추가 설명 이미지]' = '이후 Pro 기능과 B2B 제휴로 확장하며 다점포 운영 및 지역 제휴 수요를 흡수하는 구조를 구축합니다.'
    }

    foreach ($entry in $replacements.GetEnumerator()) {
        Replace-AllText -Document $Document -FindText $entry.Key -ReplaceText $entry.Value
    }
}

function Center-CellText {
    param($Cell, [string]$Text)

    $range = $Cell.Range
    $range.End = $range.End - 1
    $range.Text = $Text
    $range.ParagraphFormat.Alignment = 1
    $range.Font.NameFarEast = '맑은 고딕'
    $range.Font.NameAscii = 'Malgun Gothic'
    $range.Font.NameOther = 'Malgun Gothic'
    $range.Font.Size = 10
}

function Insert-ServiceImageIntoOverview {
    param($Document)

    $table = $Document.Tables.Item(2)

    try {
        $table.Cell(7, 2).Merge($table.Cell(7, 4))
    } catch {
    }

    try {
        $table.Cell(8, 2).Merge($table.Cell(8, 4))
    } catch {
    }

    try {
        Center-CellText -Cell $table.Cell(7, 1) -Text '이미지'
    } catch {
    }

    try {
        Center-CellText -Cell $table.Cell(8, 1) -Text ''
    } catch {
    }

    try {
        Center-CellText -Cell $table.Cell(7, 3) -Text ''
    } catch {
    }

    try {
        Center-CellText -Cell $table.Cell(8, 3) -Text ''
    } catch {
    }

    Center-CellText -Cell $table.Cell(8, 2) -Text '서비스 대표 화면'

    $imageRange = $table.Cell(7, 2).Range
    $imageRange.End = $imageRange.End - 1
    $imageRange.Text = ''
    $shape = $imageRange.InlineShapes.AddPicture($serviceImage)
    $shape.LockAspectRatio = -1
    if ($shape.Width -gt 320) {
        $shape.Width = 320
    }

    $imageRange.ParagraphFormat.Alignment = 1
    $imageRange.Font.NameFarEast = '맑은 고딕'
    $imageRange.Font.NameAscii = 'Malgun Gothic'
    $imageRange.Font.NameOther = 'Malgun Gothic'
    $imageRange.Font.Size = 10
}

function Remove-ProblemImageFromBody {
    param($Document)

    $paragraphs = $Document.Paragraphs
    for ($i = 1; $i -le $paragraphs.Count; $i++) {
        $text = $paragraphs.Item($i).Range.Text.Replace("`r", '').Trim()
        if ($text -eq '외식업 자영업자 문제 검증 자료') {
            if ($i -gt 1) {
                $prevText = $paragraphs.Item($i - 1).Range.Text.Replace("`r", '').Trim()
                if ([string]::IsNullOrWhiteSpace($prevText) -or $prevText -eq '/') {
                    $paragraphs.Item($i - 1).Range.Delete()
                    $i--
                }
            }

            $paragraphs.Item($i).Range.Delete()
            break
        }
    }

    $content = $Document.Content
    $null = $content.Find.Execute(
        '[이미지삽입: 사업화 확장 단계 또는 사회적 가치 구조도]',
        $false,
        $false,
        $false,
        $false,
        $false,
        $true,
        1,
        $false,
        '[별첨2 제출: 외식업 자영업자 문제 검증 자료]',
        2
    )
}

function Remove-FirstPageIfGuide {
    param($Word, $Document)

    $selection = $Word.Selection
    $selection.GoTo(1, 1, 1, 1) | Out-Null
    $pageRange = $selection.Bookmarks.Item('\Page').Range
    $pageText = $pageRange.Text
    if ($pageText -match '목차' -or $pageText -match '사업계획서 작성' -or $pageText -match '작성 목차') {
        $pageRange.Delete()
    }
}

function Export-Pdf {
    param($Document, [string]$PdfPath)

    $Document.ExportAsFixedFormat($PdfPath, 17)
}

function Get-PageCount {
    param($Document)

    $Document.Repaginate()
    return $Document.ComputeStatistics(2)
}

function Finalize-BodyDoc {
    param($Word)

    $document = $Word.Documents.Open($bodyOutput)
    try {
        Remove-FirstPageIfGuide -Word $Word -Document $document
        Apply-Replacements -Document $document
        Insert-ServiceImageIntoOverview -Document $document
        Remove-ProblemImageFromBody -Document $document
        Set-DocumentBodyFont -Document $document
        $document.Save()
        Export-Pdf -Document $document -PdfPath $bodyPdfOutput
        $pageCount = Get-PageCount -Document $document
        Write-Host "Body pages: $pageCount"
        if ($pageCount -gt 10) {
            throw "본문 페이지 수가 10페이지를 초과했습니다: $pageCount"
        }
    } finally {
        $document.Close([ref]0)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null
    }
}

function Finalize-AppendixDoc {
    param($Word)

    $document = $Word.Documents.Open($appendixOutput)
    try {
        Apply-Replacements -Document $document
        $document.Save()
        Export-Pdf -Document $document -PdfPath $appendixPdfOutput
    } finally {
        $document.Close([ref]0)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null
    }
}

function Assert-NoUnmaskedNames {
    param($Word, [string]$Path)

    $document = $Word.Documents.Open($Path)
    try {
        $fullText = $document.Content.Text
        foreach ($name in $nameReplacements.Keys) {
            if ($fullText.Contains($name)) {
                throw "실명 마스킹이 누락되었습니다: $name ($Path)"
            }
        }
    } finally {
        $document.Close([ref]0)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null
    }
}

Copy-SourceFiles

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    Finalize-BodyDoc -Word $word
    Finalize-AppendixDoc -Word $word
    Assert-NoUnmaskedNames -Word $word -Path $bodyOutput
    Assert-NoUnmaskedNames -Word $word -Path $appendixOutput
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Host "Created:"
Write-Host $bodyOutput
Write-Host $bodyPdfOutput
Write-Host $appendixOutput
Write-Host $appendixPdfOutput
