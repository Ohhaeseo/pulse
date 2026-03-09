<#
.SYNOPSIS
    메인 레포와 모든 서브모듈을 최신 상태로 동기화합니다.
.DESCRIPTION
    1. 메인 레포 pull
    2. 서브모듈 업데이트 (--remote --merge)
    3. Detached HEAD 자동 복구
#>

param(
    [string]$RootPath = "c:\PULSE"
)

$submodules = @("pulse_FE", "pulse_python", "pulse_spring")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PULSE Pull & Sync" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ===== STEP 1: Check for uncommitted changes =====
Write-Host "[Pre-check] Checking for uncommitted changes..." -ForegroundColor Yellow

$hasUncommitted = $false
foreach ($sub in $submodules) {
    $subPath = Join-Path $RootPath $sub
    if (Test-Path $subPath) {
        $status = git -C $subPath status --porcelain 2>$null
        if ($status) {
            $changedCount = ($status | Measure-Object -Line).Lines
            Write-Host "  WARNING: $sub has $changedCount uncommitted file(s)" -ForegroundColor Red
            $hasUncommitted = $true
        }
    }
}

if ($hasUncommitted) {
    Write-Host ""
    Write-Host "  Uncommitted changes detected! Pull may cause conflicts." -ForegroundColor Red
    Write-Host "  Consider committing or stashing changes first." -ForegroundColor Red
    Write-Host "  Continuing anyway..." -ForegroundColor Yellow
    Write-Host ""
}

# ===== STEP 2: Pull main repo =====
Write-Host "[Main Repo] Pulling latest..." -ForegroundColor Yellow
$pullResult = git -C $RootPath pull origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  $pullResult" -ForegroundColor Green
}
else {
    Write-Host "  Pull FAILED: $pullResult" -ForegroundColor Red
    Write-Host "  Aborting sync." -ForegroundColor Red
    exit 1
}
Write-Host ""

# ===== STEP 3: Update submodules =====
Write-Host "[Submodules] Updating with --remote --merge..." -ForegroundColor Yellow
$subUpdateResult = git -C $RootPath submodule update --remote --merge 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Submodules updated successfully" -ForegroundColor Green
}
else {
    Write-Host "  Submodule update result: $subUpdateResult" -ForegroundColor Yellow
}
Write-Host ""

# ===== STEP 4: Fix Detached HEADs =====
Write-Host "[Post-check] Verifying submodule branches..." -ForegroundColor Yellow

foreach ($sub in $submodules) {
    $subPath = Join-Path $RootPath $sub

    if (-not (Test-Path $subPath)) {
        Write-Host "  $sub - NOT FOUND" -ForegroundColor Red
        continue
    }

    $branch = git -C $subPath branch --show-current 2>$null
    if (-not $branch) {
        Write-Host "  $sub - Detached HEAD detected, recovering..." -ForegroundColor Yellow
        git -C $subPath checkout main 2>$null
        git -C $subPath pull 2>$null
        $branch = git -C $subPath branch --show-current 2>$null
        if ($branch) {
            Write-Host "  $sub - Recovered to: $branch" -ForegroundColor Green
        }
        else {
            Write-Host "  $sub - Recovery FAILED. Manual intervention needed." -ForegroundColor Red
        }
    }
    else {
        Write-Host "  $sub - OK (branch: $branch)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pull & Sync complete." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
