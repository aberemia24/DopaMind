# Script pentru validarea fișierelor de traduceri
param (
    [Parameter(Mandatory=$false)]
    [string]$TranslationsPath = "src/i18n/translations"
)

function Get-JsonContent {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    try {
        $content = Get-Content $Path -Raw -Encoding UTF8
        return $content | ConvertFrom-Json
    }
    catch {
        Write-Error "Eroare la citirea fișierului $Path : $_"
        exit 1
    }
}

function Get-AllKeys {
    param (
        [Parameter(Mandatory=$true)]
        [object]$Object,
        
        [Parameter(Mandatory=$false)]
        [string]$Prefix = ""
    )
    
    $keys = @()
    
    if ($Object -is [PSCustomObject]) {
        foreach ($property in $Object.PSObject.Properties) {
            $currentPath = if ($Prefix) { "$Prefix.$($property.Name)" } else { $property.Name }
            $value = $property.Value
            
            if ($value -is [PSCustomObject]) {
                $keys += Get-AllKeys -Object $value -Prefix $currentPath
            }
            elseif ($value -is [Array]) {
                $index = 0
                foreach ($item in $value) {
                    if ($item -is [PSCustomObject]) {
                        $keys += Get-AllKeys -Object $item -Prefix "$currentPath[$index]"
                    }
                    else {
                        $keys += "$currentPath[$index]"
                    }
                    $index++
                }
            }
            else {
                $keys += $currentPath
            }
        }
    }
    elseif ($Object -is [Array]) {
        $index = 0
        foreach ($item in $Object) {
            if ($item -is [PSCustomObject]) {
                $keys += Get-AllKeys -Object $item -Prefix "[$index]"
            }
            else {
                $keys += "[$index]"
            }
            $index++
        }
    }
    
    return $keys
}

function Test-KeyNamingConvention {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Key
    )
    
    $segments = $Key.Split('.')
    $isValid = $true
    
    foreach ($segment in $segments) {
        # Ignoră indexul array-ului din segmente de tipul "array[0]"
        if ($segment -match '\[\d+\]$') {
            $segment = $segment -replace '\[\d+\]$', ''
        }
        
        if ($segment -cmatch '^[A-Z]' -or $segment -match '[^a-zA-Z0-9\[\]]') {
            Write-TranslationLog "WARNING: Segmentul '$segment' din cheia '$Key' nu respectă convenția camelCase." -Warning
            $isValid = $false
        }
    }
    
    if ($segments.Count -gt 4) {
        Write-TranslationLog "WARNING: Cheia '$Key' depășește adâncimea maximă permisă (4 nivele)." -Warning
        $isValid = $false
    }
    
    return $isValid
}

function Write-TranslationLog {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [switch]$Warning,
        
        [Parameter(Mandatory=$false)]
        [switch]$Error
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    Add-Content -Path $script:reportPath -Value $logMessage
    
    if ($Warning) {
        Write-Warning $Message
    } elseif ($Error) {
        Write-Error $Message
    } else {
        Write-Host $Message
    }
}

function Compare-TranslationValues {
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$RoContent,
        
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$EnContent
    )
    
    function Get-FlattenedValues {
        param (
            [Parameter(Mandatory=$true)]
            [PSCustomObject]$Object,
            
            [Parameter(Mandatory=$false)]
            [string]$Prefix = ""
        )
        
        $values = @{}
        
        foreach ($property in $Object.PSObject.Properties) {
            $currentPath = if ($Prefix) { "$Prefix.$($property.Name)" } else { $property.Name }
            $value = $property.Value
            
            if ($value -is [PSCustomObject]) {
                $nestedValues = Get-FlattenedValues -Object $value -Prefix $currentPath
                $values += $nestedValues
            } else {
                $values[$currentPath] = $value
            }
        }
        
        return $values
    }
    
    $roValues = Get-FlattenedValues -Object $RoContent
    $enValues = Get-FlattenedValues -Object $EnContent
    
    $commonKeys = $roValues.Keys | Where-Object { $enValues.ContainsKey($_) }
    
    foreach ($key in $commonKeys) {
        $roValue = $roValues[$key]
        $enValue = $enValues[$key]
        
        if ($roValue -eq $enValue) {
            Write-TranslationLog "WARNING: Valoare identică găsită pentru cheia '$key': RO='$roValue', EN='$enValue'" -Warning
        }
    }
}

# Inițializare raport
$script:reportPath = "translation_validation_report.txt"
Remove-Item $script:reportPath -ErrorAction SilentlyContinue

Write-TranslationLog "Validare fișiere de traduceri..."

try {
    # Citire fișiere JSON
    $roContent = Get-Content ".\src\i18n\translations\ro.json" -Raw | ConvertFrom-Json
    $enContent = Get-Content ".\src\i18n\translations\en.json" -Raw | ConvertFrom-Json
    
    # Obținere chei
    $roKeys = Get-AllKeys -Object $roContent | Sort-Object
    $enKeys = Get-AllKeys -Object $enContent | Sort-Object
    
    # Verificare chei lipsă
    $missingInEn = $roKeys | Where-Object { $_ -notin $enKeys }
    $missingInRo = $enKeys | Where-Object { $_ -notin $roKeys }
    
    if ($missingInEn) {
        Write-TranslationLog "WARNING: Chei lipsă în en.json:" -Warning
        foreach ($key in $missingInEn) {
            Write-TranslationLog "WARNING:   - $key" -Warning
        }
    }
    
    if ($missingInRo) {
        Write-TranslationLog "WARNING: Chei lipsă în ro.json:" -Warning
        foreach ($key in $missingInRo) {
            Write-TranslationLog "WARNING:   - $key" -Warning
        }
    }
    
    # Verificare convenție denumire
    $invalidKeys = @()
    foreach ($key in ($roKeys + $enKeys | Sort-Object -Unique)) {
        if (-not (Test-KeyNamingConvention -Key $key)) {
            $invalidKeys += $key
        }
    }
    
    # Verificare duplicate și diferențe
    Compare-TranslationValues -RoContent $roContent -EnContent $enContent
    
    # Raport final
    Write-TranslationLog "`nRezultat validare:"
    Write-TranslationLog "Total chei în ro.json: $($roKeys.Count)"
    Write-TranslationLog "Total chei în en.json: $($enKeys.Count)"
    Write-TranslationLog "Chei lipsă în en.json: $($missingInEn.Count)"
    Write-TranslationLog "Chei lipsă în ro.json: $($missingInRo.Count)"
    Write-TranslationLog "Chei cu probleme de convenție: $($invalidKeys.Count)"
    
    # Verificare succes/eșec
    $hasErrors = $missingInEn.Count -gt 0 -or $missingInRo.Count -gt 0 -or $invalidKeys.Count -gt 0
    
    if ($hasErrors) {
        Write-TranslationLog "ERROR: S-au găsit probleme în fișierele de traduceri!" -Error
        exit 1
    } else {
        Write-TranslationLog "`nValidare completă cu succes!"
        exit 0
    }
} catch {
    Write-TranslationLog "ERROR: A apărut o eroare în timpul validării: $_" -Error
    exit 1
}
