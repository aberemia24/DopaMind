# Script pentru validarea componentelor React
function Test-ComponentNaming {
    param (
        [string]$FilePath
    )
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    $content = Get-Content $FilePath -Raw
    
    # Verifică dacă numele componentei începe cu literă mare
    if ($fileName -cmatch '^[a-z]') {
        Write-Warning "Componenta '$fileName' ar trebui să înceapă cu literă mare"
        return $false
    }
    
    # Verifică dacă componenta are Props interface
    if (-not ($content -match 'interface\s+\w+Props')) {
        Write-Warning "Componenta '$fileName' ar trebui să aibă o interfață Props definită"
        return $false
    }
    
    # Verifică dacă componenta folosește React.FC
    if (-not ($content -match 'React\.FC<\w+Props>')) {
        Write-Warning "Componenta '$fileName' ar trebui să folosească React.FC cu Props"
        return $false
    }
    
    return $true
}

function Test-AccessibilityProps {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    
    # Verifică prezența props-urilor de accesibilitate
    $requiredProps = @(
        'accessibilityLabel',
        'accessibilityRole',
        'accessibilityHint'
    )
    
    $missingProps = @()
    foreach ($prop in $requiredProps) {
        if (-not ($content -match $prop)) {
            $missingProps += $prop
        }
    }
    
    if ($missingProps.Count -gt 0) {
        Write-Warning ("Lipsesc următoarele props-uri de accesibilitate în '{0}': {1}" -f $FilePath, ($missingProps -join ', '))
        return $false
    }
    
    return $true
}

function Test-TranslationUsage {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    
    # Verifică dacă se folosește useTranslation
    if (-not ($content -match 'useTranslation')) {
        Write-Warning "Componenta nu folosește hook-ul useTranslation în '$FilePath'"
        return $false
    }
    
    # Verifică dacă există text hardcodat
    $hardcodedTextPattern = '>[^{]+<'
    if ($content -match $hardcodedTextPattern) {
        Write-Warning "Text hardcodat găsit în '$FilePath'"
        return $false
    }
    
    return $true
}

# Inițializare validare
Write-Host "Validare componente React..."

$componentFiles = Get-ChildItem -Path ".\src" -Recurse -Include "*.tsx" | 
    Where-Object { $_.FullName -match "\\components\\" }

$totalComponents = $componentFiles.Count
$validComponents = 0

foreach ($file in $componentFiles) {
    $isValid = $true
    Write-Host "`nValidare '$($file.Name)'..."
    
    if (-not (Test-ComponentNaming -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-AccessibilityProps -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-TranslationUsage -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if ($isValid) {
        $validComponents++
    }
}

Write-Host "`nRezultat validare:"
Write-Host "Total componente: $totalComponents"
Write-Host "Componente valide: $validComponents"
Write-Host "Componente cu probleme: $($totalComponents - $validComponents)"

if ($validComponents -lt $totalComponents) {
    exit 1
} else {
    Write-Host "Toate componentele respectă convențiile!" -ForegroundColor Green
    exit 0
}
