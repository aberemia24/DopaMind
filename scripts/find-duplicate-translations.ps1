# Script pentru identificarea cheilor duplicate în fișierele de traduceri
# Utilizare: .\find-duplicate-translations.ps1 [-Path <path>] [-OutputFile <file>]

param (
    [Parameter(Mandatory=$false)]
    [string]$Path = "src/i18n/translations/ro.json",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile
)

function Get-JsonKeys {
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Object,
        
        [Parameter(Mandatory=$false)]
        [string]$Prefix = "",
        
        [Parameter(Mandatory=$false)]
        [int]$MaxDepth = 10,
        
        [Parameter(Mandatory=$false)]
        [int]$CurrentDepth = 0
    )
    
    $keys = [System.Collections.ArrayList]::new()
    
    if ($CurrentDepth -gt $MaxDepth) {
        Write-Warning "S-a atins adâncimea maximă la calea: $Prefix"
        return $keys
    }
    
    foreach ($property in $Object.PSObject.Properties) {
        $currentPath = if ($Prefix) { "$Prefix.$($property.Name)" } else { $property.Name }
        
        if ($property.Value -is [PSCustomObject]) {
            $childKeys = Get-JsonKeys -Object $property.Value -Prefix $currentPath -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            [void]$keys.AddRange($childKeys)
        }
        elseif ($property.Value -is [Array]) {
            Write-Warning "Array găsit la calea: $currentPath. Arrays nu sunt recomandate în fișierele de traduceri."
        }
        else {
            if (![string]::IsNullOrWhiteSpace($property.Value)) {
                [void]$keys.Add(@{
                    Path = $currentPath
                    Value = $property.Value
                    Depth = $CurrentDepth
                })
            }
        }
    }
    
    return $keys
}

# Script principal
try {
    if (!(Test-Path $Path)) {
        throw "Fișierul $Path nu există!"
    }
    
    $jsonContent = Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
    $allKeys = Get-JsonKeys -Object $jsonContent
    
    $duplicates = $allKeys | Group-Object -Property Value | Where-Object { $_.Count -gt 1 }
    
    $report = @"
Raport duplicate în fișierul de traduceri
=======================================
Data generării: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Fișier analizat: $Path

"@
    
    foreach ($duplicate in $duplicates) {
        $report += "`nValoarea: '$($duplicate.Name)'`n"
        $report += "Apare în $($duplicate.Count) locații:`n"
        $duplicate.Group | ForEach-Object {
            $report += "  - $($_.Path)`n"
        }
        $report += "-" * 50 + "`n"
    }
    
    # Afișăm în consolă
    Write-Host $report
    
    # Salvăm în fișier dacă s-a specificat
    if ($OutputFile) {
        $report | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Host "`nRaportul a fost salvat în: $OutputFile"
    }
    
    Write-Host "`nSugestii pentru rezolvare:"
    Write-Host "1. Mută textele comune în secțiunea 'common'"
    Write-Host "2. Folosește referințe pentru texte identice"
    Write-Host "3. Verifică dacă duplicatele sunt necesare în contextul lor"
}
catch {
    Write-Error "A apărut o eroare: $_"
    exit 1
}
