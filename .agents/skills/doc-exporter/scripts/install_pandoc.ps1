<#
.SYNOPSIS
    pandoc을 winget으로 설치합니다.
.DESCRIPTION
    pandoc이 설치되어 있지 않은 경우 winget을 통해 자동 설치합니다.
#>

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  pandoc 설치 확인" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if pandoc is already installed
$pandocPath = Get-Command pandoc -ErrorAction SilentlyContinue
if ($pandocPath) {
    $version = pandoc --version | Select-Object -First 1
    Write-Host "  pandoc이 이미 설치되어 있습니다: $version" -ForegroundColor Green
    exit 0
}

Write-Host "  pandoc이 설치되어 있지 않습니다. 설치를 시작합니다..." -ForegroundColor Yellow

# Try winget first
$wingetPath = Get-Command winget -ErrorAction SilentlyContinue
if ($wingetPath) {
    Write-Host "  winget으로 pandoc 설치 중..." -ForegroundColor White
    winget install --id JohnMacFarlane.Pandoc --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  pandoc 설치 완료!" -ForegroundColor Green
        Write-Host "  ※ PATH 반영을 위해 새 터미널을 열어야 할 수 있습니다." -ForegroundColor Yellow
        exit 0
    }
    else {
        Write-Host "  winget 설치 실패. chocolatey를 시도합니다..." -ForegroundColor Yellow
    }
}

# Try chocolatey
$chocoPath = Get-Command choco -ErrorAction SilentlyContinue
if ($chocoPath) {
    Write-Host "  chocolatey로 pandoc 설치 중..." -ForegroundColor White
    choco install pandoc -y
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  pandoc 설치 완료!" -ForegroundColor Green
        exit 0
    }
}

# Manual download fallback
Write-Host "  자동 설치 실패. 수동 설치가 필요합니다." -ForegroundColor Red
Write-Host "  다운로드: https://github.com/jgm/pandoc/releases" -ForegroundColor White
Write-Host "  또는: winget install JohnMacFarlane.Pandoc" -ForegroundColor White
exit 1
