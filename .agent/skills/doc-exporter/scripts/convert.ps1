<#
.SYNOPSIS
    마크다운 파일을 DOCX 또는 PDF로 변환합니다.
.PARAMETER InputFile
    변환할 마크다운 파일의 절대 경로
.PARAMETER Format
    출력 형식: "docx" 또는 "pdf"
.PARAMETER OutputFile
    (선택) 출력 파일 경로. 지정하지 않으면 입력 파일과 같은 위치에 같은 이름으로 생성
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [Parameter(Mandatory = $true)]
    [ValidateSet("docx", "pdf")]
    [string]$Format,

    [string]$OutputFile = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Document Exporter" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validate input file
if (-not (Test-Path $InputFile)) {
    Write-Host "  ERROR: 입력 파일을 찾을 수 없습니다: $InputFile" -ForegroundColor Red
    exit 1
}

# Check pandoc
$pandocCmd = Get-Command pandoc -ErrorAction SilentlyContinue
if (-not $pandocCmd) {
    Write-Host "  ERROR: pandoc이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "  install_pandoc.ps1을 먼저 실행하세요." -ForegroundColor Yellow
    exit 1
}

# Determine output file path
if (-not $OutputFile) {
    $dir = Split-Path $InputFile -Parent
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
    $OutputFile = Join-Path $dir "$baseName.$Format"
}

Write-Host "  입력: $InputFile" -ForegroundColor White
Write-Host "  출력: $OutputFile" -ForegroundColor White
Write-Host "  형식: $Format" -ForegroundColor White
Write-Host ""

# Convert
if ($Format -eq "docx") {
    Write-Host "  DOCX 변환 중..." -ForegroundColor Yellow
    pandoc $InputFile -o $OutputFile --from markdown --to docx --standalone 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  DOCX 변환 완료!" -ForegroundColor Green
        Write-Host "  출력 파일: $OutputFile" -ForegroundColor Cyan
    }
    else {
        Write-Host "  DOCX 변환 실패." -ForegroundColor Red
        exit 1
    }
}
elseif ($Format -eq "pdf") {
    Write-Host "  PDF 변환 시도 (LaTeX 엔진)..." -ForegroundColor Yellow

    # Try with default LaTeX engine first
    pandoc $InputFile -o $OutputFile --from markdown --pdf-engine=xelatex -V mainfont="Malgun Gothic" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  PDF 변환 완료! (xelatex)" -ForegroundColor Green
        Write-Host "  출력 파일: $OutputFile" -ForegroundColor Cyan
    }
    else {
        Write-Host "  LaTeX 엔진 실패. HTML 경유 방식 시도..." -ForegroundColor Yellow

        # Fallback: try wkhtmltopdf
        $wkhtml = Get-Command wkhtmltopdf -ErrorAction SilentlyContinue
        if ($wkhtml) {
            $htmlTemp = Join-Path (Split-Path $OutputFile -Parent) "temp_export.html"
            pandoc $InputFile -o $htmlTemp --from markdown --to html --standalone --metadata title="PULSE" 2>&1
            wkhtmltopdf $htmlTemp $OutputFile 2>&1
            Remove-Item $htmlTemp -ErrorAction SilentlyContinue

            if ($LASTEXITCODE -eq 0) {
                Write-Host "  PDF 변환 완료! (wkhtmltopdf)" -ForegroundColor Green
                Write-Host "  출력 파일: $OutputFile" -ForegroundColor Cyan
            }
            else {
                Write-Host "  PDF 변환 실패. LaTeX(MiKTeX) 또는 wkhtmltopdf 설치가 필요합니다." -ForegroundColor Red
                exit 1
            }
        }
        else {
            # Final fallback: DOCX conversion suggestion
            Write-Host "  PDF 엔진을 찾을 수 없습니다." -ForegroundColor Red
            Write-Host "  대안: DOCX로 먼저 변환 후, Word에서 PDF로 저장하세요." -ForegroundColor Yellow
            Write-Host "  또는: winget install MiKTeX.MiKTeX" -ForegroundColor White
            exit 1
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  변환 완료" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
