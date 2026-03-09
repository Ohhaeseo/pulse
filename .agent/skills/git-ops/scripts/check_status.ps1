<#
.SYNOPSIS
    PULSE 모노레포 전체 Git 상태를 점검합니다.
.DESCRIPTION
    메인 레포와 모든 서브모듈(pulse_FE, pulse_python, pulse_spring)의
    브랜치, 변경사항, Detached HEAD 여부를 한눈에 보여줍니다.
#>

param(
    [string]$RootPath = "c:\PULSE"
)

$submodules = @("pulse_FE", "pulse_python", "pulse_spring")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PULSE Git Status Report" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Main Repo Status ---
Write-Host "[Main Repo] $RootPath" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor DarkGray

$mainBranch = git -C $RootPath branch --show-current 2>$null
if (-not $mainBranch) { $mainBranch = "(detached)" }
Write-Host "  Branch: $mainBranch"

$mainStatus = git -C $RootPath status --porcelain 2>$null
$mainChangedCount = 0
if ($mainStatus) {
    $mainChangedCount = ($mainStatus | Measure-Object -Line).Lines
    Write-Host "  Status: MODIFIED ($mainChangedCount files)" -ForegroundColor Yellow
    $mainStatus | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
} else {
    Write-Host "  Status: CLEAN" -ForegroundColor Green
}

Write-Host ""

# --- Submodule Status ---
Write-Host "[Submodule Summary]" -ForegroundColor Yellow
$submoduleStatus = git -C $RootPath submodule status 2>$null
if ($submoduleStatus) {
    $submoduleStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
}
Write-Host ""

# --- Each Submodule Detail ---
foreach ($sub in $submodules) {
    $subPath = Join-Path $RootPath $sub
    
    if (-not (Test-Path $subPath)) {
        Write-Host "[$sub] NOT FOUND at $subPath" -ForegroundColor Red
        Write-Host ""
        continue
    }

    Write-Host "[$sub]" -ForegroundColor Yellow
    Write-Host "---" -ForegroundColor DarkGray

    # Branch check
    $branch = git -C $subPath branch --show-current 2>$null
    $isDetached = $false
    if (-not $branch) {
        $branch = "(detached HEAD)"
        $isDetached = $true
        Write-Host "  Branch: $branch" -ForegroundColor Red
        Write-Host "  WARNING: Detached HEAD detected! Run 'git checkout main' to fix." -ForegroundColor Red
    } else {
        Write-Host "  Branch: $branch" -ForegroundColor White
    }

    # Status check
    $status = git -C $subPath status --porcelain 2>$null
    $changedCount = 0
    if ($status) {
        $changedCount = ($status | Measure-Object -Line).Lines
        Write-Host "  Status: MODIFIED ($changedCount files)" -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
    } else {
        Write-Host "  Status: CLEAN" -ForegroundColor Green
    }

    # Unpushed commits
    if (-not $isDetached) {
        $unpushed = git -C $subPath log "origin/$branch..$branch" --oneline 2>$null
        if ($unpushed) {
            $unpushedCount = ($unpushed | Measure-Object -Line).Lines
            Write-Host "  Unpushed: $unpushedCount commit(s)" -ForegroundColor Magenta
            $unpushed | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkMagenta }
        }
    }

    Write-Host ""
}

# --- Summary ---
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Check complete." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
