<#
.SYNOPSIS
    변경된 모든 서브모듈을 커밋/푸시하고 메인 레포 참조를 업데이트합니다.
.DESCRIPTION
    PULSE 모노레포의 2단계 커밋 워크플로를 자동화합니다:
    1단계: 각 서브모듈에서 변경사항 감지 → 커밋 → 푸시
    2단계: 메인 레포에서 서브모듈 참조 업데이트 → 커밋 → 푸시
.PARAMETER CommitMessage
    모든 서브모듈에 적용할 커밋 메시지. 지정하지 않으면 서브모듈별 기본 메시지가 사용됩니다.
.PARAMETER DryRun
    실제 실행하지 않고 어떤 작업이 수행될지 미리보기합니다.
#>

param(
    [string]$CommitMessage = "",
    [switch]$DryRun,
    [string]$RootPath = "c:\PULSE"
)

$submodules = @(
    @{ Name = "pulse_FE";     DefaultMsg = "Update frontend" },
    @{ Name = "pulse_python";  DefaultMsg = "Update Python backend" },
    @{ Name = "pulse_spring";  DefaultMsg = "Update Spring Boot backend" }
)

$changedSubmodules = @()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  PULSE Sync - DRY RUN MODE" -ForegroundColor Yellow
} else {
    Write-Host "  PULSE Sync All" -ForegroundColor Cyan
}
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ===== STEP 1: Process each submodule =====
foreach ($sub in $submodules) {
    $subPath = Join-Path $RootPath $sub.Name

    if (-not (Test-Path $subPath)) {
        Write-Host "[$($sub.Name)] SKIPPED - path not found" -ForegroundColor Red
        continue
    }

    # Check for changes
    $status = git -C $subPath status --porcelain 2>$null
    if (-not $status) {
        Write-Host "[$($sub.Name)] No changes - skipping" -ForegroundColor DarkGray
        continue
    }

    $changedCount = ($status | Measure-Object -Line).Lines
    $msg = if ($CommitMessage) { $CommitMessage } else { $sub.DefaultMsg }

    Write-Host "[$($sub.Name)] $changedCount changed file(s)" -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkYellow }

    # Check for detached HEAD
    $branch = git -C $subPath branch --show-current 2>$null
    if (-not $branch) {
        Write-Host "  ERROR: Detached HEAD! Attempting to checkout main..." -ForegroundColor Red
        if (-not $DryRun) {
            git -C $subPath checkout main 2>$null
            $branch = git -C $subPath branch --show-current 2>$null
            if (-not $branch) {
                Write-Host "  FAILED: Could not checkout main. Skipping this submodule." -ForegroundColor Red
                continue
            }
            Write-Host "  Recovered to branch: $branch" -ForegroundColor Green
        } else {
            Write-Host "  [DRY RUN] Would attempt: git checkout main" -ForegroundColor Gray
        }
    }

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would run:" -ForegroundColor Gray
        Write-Host "    git add ." -ForegroundColor Gray
        Write-Host "    git commit -m `"$msg`"" -ForegroundColor Gray
        Write-Host "    git push origin $branch" -ForegroundColor Gray
    } else {
        Write-Host "  Committing: $msg" -ForegroundColor White

        git -C $subPath add .
        $commitResult = git -C $subPath commit -m $msg 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Committed successfully" -ForegroundColor Green
            
            $pushResult = git -C $subPath push origin $branch 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Pushed to origin/$branch" -ForegroundColor Green
            } else {
                Write-Host "  Push FAILED: $pushResult" -ForegroundColor Red
            }
        } else {
            Write-Host "  Commit skipped (no changes or error): $commitResult" -ForegroundColor DarkYellow
        }
    }

    $changedSubmodules += $sub.Name
    Write-Host ""
}

# ===== STEP 2: Update main repo references =====
if ($changedSubmodules.Count -gt 0) {
    Write-Host "---" -ForegroundColor DarkGray
    Write-Host "[Main Repo] Updating submodule references..." -ForegroundColor Yellow

    $refMsg = "Update submodule reference: $($changedSubmodules -join ', ')"

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would run:" -ForegroundColor Gray
        foreach ($changed in $changedSubmodules) {
            Write-Host "    git add $changed" -ForegroundColor Gray
        }
        Write-Host "    git commit -m `"$refMsg`"" -ForegroundColor Gray
        Write-Host "    git push origin main" -ForegroundColor Gray
    } else {
        foreach ($changed in $changedSubmodules) {
            git -C $RootPath add $changed
        }

        $commitResult = git -C $RootPath commit -m $refMsg 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Main repo committed: $refMsg" -ForegroundColor Green

            $pushResult = git -C $RootPath push origin main 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Main repo pushed to origin/main" -ForegroundColor Green
            } else {
                Write-Host "  Main repo push FAILED: $pushResult" -ForegroundColor Red
            }
        } else {
            Write-Host "  Main repo commit skipped: $commitResult" -ForegroundColor DarkYellow
        }
    }
} else {
    Write-Host "No submodules had changes. Nothing to sync." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sync complete." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
