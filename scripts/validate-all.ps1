# Script principal pentru rularea tuturor validărilor
Write-Host "Începere validare completă DopaMind..." -ForegroundColor Cyan

$scripts = @(
    "validate-translations.ps1",
    "validate-components.ps1",
    "validate-types.ps1",
    "validate-project-structure.ps1"
)

$failedScripts = @()

foreach ($script in $scripts) {
    Write-Host "`n=== Rulare $script ===" -ForegroundColor Yellow
    & ".\scripts\$script"
    
    if ($LASTEXITCODE -ne 0) {
        $failedScripts += $script
    }
}

Write-Host "`n=== Raport Final ===" -ForegroundColor Cyan
Write-Host "Total scripturi rulate: $($scripts.Count)"
Write-Host "Scripturi cu succes: $($scripts.Count - $failedScripts.Count)"
Write-Host "Scripturi cu probleme: $($failedScripts.Count)"

if ($failedScripts.Count -gt 0) {
    Write-Host "`nScripturi care au eșuat:" -ForegroundColor Red
    foreach ($script in $failedScripts) {
        Write-Host "- $script"
    }
    exit 1
} else {
    Write-Host "`nToate validările au trecut cu succes!" -ForegroundColor Green
    exit 0
}
