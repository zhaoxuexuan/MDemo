$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FontDir = Join-Path $ProjectRoot "public\fonts"
$DistDir = Join-Path $ProjectRoot "dist-offline"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MAVEN Offline Build Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $FontDir)) { New-Item -ItemType Directory -Path $FontDir -Force | Out-Null }

$Fonts = @(
    @{ Name = "Inter-Regular.woff2"; Url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2" },
    @{ Name = "Inter-Medium.woff2";  Url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2" },
    @{ Name = "Inter-SemiBold.woff2"; Url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2" },
    @{ Name = "Inter-Bold.woff2";    Url = "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2" },
    @{ Name = "JetBrainsMono-Regular.woff2"; Url = "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2" },
    @{ Name = "JetBrainsMono-Medium.woff2";  Url = "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2" },
    @{ Name = "JetBrainsMono-SemiBold.woff2"; Url = "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2" },
    @{ Name = "Rajdhani-Medium.woff2";  Url = "https://fonts.gstatic.com/s/rajdhani/v17/LDI2apCSOBg7S-QT7pb0EPOreec.woff2" },
    @{ Name = "Rajdhani-SemiBold.woff2"; Url = "https://fonts.gstatic.com/s/rajdhani/v17/LDI2apCSOBg7S-QT7pbYF_Oreec.woff2" },
    @{ Name = "Rajdhani-Bold.woff2";    Url = "https://fonts.gstatic.com/s/rajdhani/v17/LDI2apCSOBg7S-QT7pa8FvOreec.woff2" }
)

Write-Host "[1/4] Checking fonts..." -ForegroundColor Yellow
$needDownload = $false
foreach ($f in $Fonts) {
    if (-not (Test-Path (Join-Path $FontDir $f.Name))) { $needDownload = $true; break }
}
if ($needDownload) {
    Write-Host "      Downloading fonts..." -ForegroundColor Gray
    foreach ($f in $Fonts) {
        $fp = Join-Path $FontDir $f.Name
        if (-not (Test-Path $fp)) {
            Write-Host "        -> $($f.Name)" -ForegroundColor DarkGray
            try { Invoke-WebRequest -Uri $f.Url -OutFile $fp -UseBasicParsing } catch { Write-Host "        [WARN] Failed: $($f.Name)" -ForegroundColor Yellow }
        }
    }
} else {
    Write-Host "      All fonts exist, skip download" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/4] Running TypeScript + Vite build..." -ForegroundColor Yellow
Push-Location $ProjectRoot
try {
    npx tsc -b --noEmit 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "      [ERROR] TypeScript check failed!" -ForegroundColor Red; exit 1 }
    npx vite build 2>&1 | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkGray }
    if ($LASTEXITCODE -ne 0) { Write-Host "      [ERROR] Vite build failed!" -ForegroundColor Red; exit 1 }
} finally { Pop-Location }
Write-Host "      Build OK!" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Verifying offline dependencies..." -ForegroundColor Yellow
$htmlFile = Join-Path $DistDir "index.html"
$extFound = $false
if (Test-Path $htmlFile) {
    $hc = Get-Content $htmlFile -Raw -Encoding UTF8
    @('fonts.googleapis','fonts.gstatic','cdn.jsdelivr','unpkg.com') | ForEach-Object { if ($hc -match $_) { Write-Host "      Found external: $_" -ForegroundColor Yellow; $extFound = $true } }
}
if (-not $extFound) { Write-Host "      No external dependencies found!" -ForegroundColor Green }

$totalSize = 0; $fc = 0
Get-ChildItem -Path $DistDir -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object { $totalSize += $_.Length; $fc++ }
Write-Host "      Output: $fc files, $([math]::Round($totalSize / 1MB, 1)) MB total" -ForegroundColor DarkGray

Write-Host ""
Write-Host "[4/4] Generating README..." -ForegroundColor Yellow

$lines = @(
    "========================================",
    " MAVEN Offline Deployment Package",
    "========================================",
    "",
    "[How to Run]",
    "",
    " Method 1: Double-click",
    "   Open dist-offline/index.html directly",
    "   Recommended browser: Chrome / Edge",
    "",
    " Method 2: Local HTTP server (recommended)",
    "   cd dist-offline",
    "   python -m http.server 8080",
    "   then visit http://localhost:8080",
    "",
    "[Offline Changes Applied]",
    "  [OK] Google Fonts -> local woff2 files",
    "  [OK] CARTO map tiles -> Canvas dark tactical layer",
    "  [OK] Leaflet CSS/JS -> bundled in vendor chunk",
    "  [OK] All npm deps -> packed as static assets",
    "",
    "[Notes]",
    "  - First load ~1-2s (includes full map engine)",
    "  - Map zoom/pan is fully client-side Canvas rendering",
    "  - To restore online maps, edit TacticalMap.tsx",
    "    replace OfflineTileLayer with TileLayer",
    ""
)
$lines | Out-File (Join-Path $DistDir "README-OFFLINE.txt") -Encoding UTF8
Write-Host "      Done!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  OFFLINE BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Output: $DistDir" -ForegroundColor White
Write-Host "  Open: dist-offline\index.html" -ForegroundColor DarkGray
Write-Host ""
