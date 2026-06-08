param(
    [string]$FrontendUrl = "http://127.0.0.1:4173",
    [string]$SpringUrl = "http://127.0.0.1:8080",
    [string]$FastApiUrl = "http://127.0.0.1:8000",
    [switch]$KeepServersRunning
)

$ErrorActionPreference = "Stop"
$rootPath = "C:\programworks\PULSE"
$startedProcesses = @()

function Invoke-Step {
    param(
        [string]$Message,
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
    & $Action
}

function Test-UrlReady {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        return $true
    } catch {
        if ($_.Exception.Response) {
            return $true
        }

        return $false
    }
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [string]$Name,
        [int]$TimeoutSec = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-UrlReady -Url $Url) {
            Write-Host "   $Name ready: $Url" -ForegroundColor Green
            return
        }

        Start-Sleep -Seconds 2
    }

    throw "$Name did not become ready within $TimeoutSec seconds: $Url"
}

function Start-IfNeeded {
    param(
        [string]$Name,
        [string]$Url,
        [scriptblock]$Starter
    )

    if (Test-UrlReady -Url $Url) {
        Write-Host "   $Name already running: $Url" -ForegroundColor Yellow
        return
    }

    Write-Host "   Starting $Name..." -ForegroundColor Yellow
    $process = & $Starter
    if ($process) {
        $script:startedProcesses += $process
    }
    Wait-ForUrl -Url $Url -Name $Name
}

try {
    Invoke-Step -Message "Frontend lint" -Action {
        Set-Location "$rootPath\pulse_FE"
        & npm.cmd run lint
    }

    Invoke-Step -Message "Frontend build" -Action {
        Set-Location "$rootPath\pulse_FE"
        & npm.cmd run build
    }

    Invoke-Step -Message "Spring tests" -Action {
        Set-Location "$rootPath\pulse_spring"
        & .\gradlew.bat test
    }

    Invoke-Step -Message "Python pytest" -Action {
        Set-Location "$rootPath\pulse_python"
        & .\.venv\Scripts\python.exe -m pytest -q
    }

    Invoke-Step -Message "Ensure FastAPI, Spring, and Vite servers are running" -Action {
        Start-IfNeeded -Name "FastAPI" -Url "$FastApiUrl/" -Starter {
            Start-Process powershell.exe `
                -WorkingDirectory "$rootPath\pulse_python" `
                -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "& '.\.venv\Scripts\python.exe' 'run_server.py'" `
                -WindowStyle Minimized `
                -PassThru
        }

        Start-IfNeeded -Name "Spring Boot" -Url "$SpringUrl/api/auth/login" -Starter {
            Start-Process cmd.exe `
                -WorkingDirectory "$rootPath\pulse_spring" `
                -ArgumentList "/c", "gradlew.bat bootRun --console=plain" `
                -WindowStyle Minimized `
                -PassThru
        }

        Start-IfNeeded -Name "Vite frontend" -Url "$FrontendUrl/" -Starter {
            Start-Process cmd.exe `
                -WorkingDirectory "$rootPath\pulse_FE" `
                -ArgumentList "/c", "npm run dev -- --host 127.0.0.1 --port 4173" `
                -WindowStyle Minimized `
                -PassThru
        }
    }

    Invoke-Step -Message "Playwright smoke E2E" -Action {
        Set-Location "$rootPath\pulse_FE"
        $env:PULSE_FRONTEND_URL = $FrontendUrl
        $env:PULSE_SPRING_URL = $SpringUrl
        $env:PULSE_FASTAPI_URL = $FastApiUrl
        $env:PULSE_PLAYWRIGHT_ARTIFACTS_DIR = "$rootPath\output\playwright"

        & npm.cmd run e2e:smoke -- `
            --frontend-url $FrontendUrl `
            --spring-url $SpringUrl `
            --fastapi-url $FastApiUrl `
            --artifacts-dir "$rootPath\output\playwright"
    }
}
finally {
    if (-not $KeepServersRunning) {
        foreach ($process in $startedProcesses) {
            if ($process -and -not $process.HasExited) {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
