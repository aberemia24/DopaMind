# Import modul de logging
Import-Module (Join-Path $PSScriptRoot "modules\Write-ValidationLog.psm1")

function Test-ComponentNaming {
    param (
        [string]$FilePath
    )
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    $content = Get-Content $FilePath -Raw
    $lines = Get-Content $FilePath
    
    $valid = $true
    
    # Verifică dacă numele componentei începe cu literă mare
    if ($fileName -cmatch '^[a-z]') {
        Write-ValidationLog -Message "Componenta ar trebui să înceapă cu literă mare" -FilePath $FilePath -Level "Warning"
        $valid = $false
    }
    
    # Verifică dacă componenta are Props interface
    $propsMatch = [regex]::Match($content, 'interface\s+(\w+Props)')
    if (-not $propsMatch.Success) {
        Write-ValidationLog -Message "Componenta ar trebui să aibă o interfață Props definită" -FilePath $FilePath -Level "Warning"
        $valid = $false
    } else {
        # Verifică documentația pentru Props
        $propsLine = 0
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $propsMatch.Value) {
                $propsLine = $i + 1
                break
            }
        }
        
        if ($propsLine -gt 1) {
            $hasJSDoc = $false
            for ($i = $propsLine - 2; $i -ge [Math]::Max(0, $propsLine - 5); $i--) {
                if ($lines[$i] -match '\/\*\*') {
                    $hasJSDoc = $true
                    break
                }
            }
            
            if (-not $hasJSDoc) {
                Write-ValidationLog -Message "Props interface ar trebui să aibă documentație JSDoc" -FilePath $FilePath -LineNumber $propsLine -Level "Warning"
                $valid = $false
            }
        }
    }
    
    # Verifică dacă componenta folosește React.FC cu Props
    if (-not ($content -match 'React\.FC<\w+Props>')) {
        Write-ValidationLog -Message "Componenta ar trebui să folosească React.FC cu Props" -FilePath $FilePath -Level "Warning"
        $valid = $false
    }
    
    # Verifică dacă componenta are un export default
    if (-not ($content -match 'export\s+default\s+\w+')) {
        Write-ValidationLog -Message "Componenta ar trebui să aibă un export default" -FilePath $FilePath -Level "Warning"
        $valid = $false
    }
    
    return $valid
}

function Test-AccessibilityProps {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $lines = Get-Content $FilePath
    $valid = $true
    
    # Verifică prezența props-urilor de accesibilitate
    $accessibilityProps = @{
        'accessibilityLabel' = 'Etichetă pentru cititor de ecran'
        'accessibilityRole' = 'Rol pentru cititor de ecran'
        'accessibilityHint' = 'Indicație pentru cititor de ecran'
        'accessibilityState' = 'Stare pentru cititor de ecran'
        'accessibilityValue' = 'Valoare pentru cititor de ecran'
    }
    
    # Verifică dacă componenta are elemente interactive
    $hasInteractiveElements = $content -match '<(TouchableOpacity|Button|Pressable|TextInput)'
    
    if ($hasInteractiveElements) {
        $missingProps = @()
        foreach ($prop in $accessibilityProps.Keys) {
            if (-not ($content -match $prop)) {
                $missingProps += "$prop ($($accessibilityProps[$prop]))"
            }
        }
        
        if ($missingProps.Count -gt 0) {
            Write-ValidationLog -Message ("Lipsesc următoarele props-uri de accesibilitate: {0}" -f ($missingProps -join ', ')) -FilePath $FilePath -Level "Warning"
            $valid = $false
        }
        
        # Verifică dacă există testID pentru testare
        if (-not ($content -match 'testID=')) {
            Write-ValidationLog -Message "Componenta interactivă ar trebui să aibă testID pentru testare" -FilePath $FilePath -Level "Warning"
            $valid = $false
        }
    }
    
    return $valid
}

function Test-TranslationUsage {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $lines = Get-Content $FilePath
    $valid = $true
    
    # Verifică dacă se folosește useTranslation
    if (-not ($content -match 'useTranslation')) {
        Write-ValidationLog -Message "Componenta nu folosește hook-ul useTranslation" -FilePath $FilePath -Level "Warning"
        $valid = $false
    }
    
    # Verifică dacă există text hardcodat
    $lineNumber = 0
    foreach ($line in $lines) {
        $lineNumber++
        
        # Ignoră comentarii și JSX care nu conține text
        if ($line -match '^\s*\/\/' -or $line -match '^\s*\*' -or -not ($line -match '>.*<')) {
            continue
        }
        
        # Verifică text între > și < care nu este o expresie {t('...')}
        if ($line -match '>([^{}<>]+)<' -and -not ($line -match '>\s*{\s*t\s*\(' -or $line -match 'translate={false}')) {
            Write-ValidationLog -Message "Text hardcodat găsit: '$($matches[1].Trim())'" -FilePath $FilePath -LineNumber $lineNumber -Level "Warning"
            $valid = $false
        }
    }
    
    # Verifică dacă cheile de traducere există în fișierele de traduceri
    $translationKeys = [regex]::Matches($content, "t\(['""]([^'""]+)['""]\)")
    $translationFiles = @(
        ".\src\i18n\translations\ro.json",
        ".\src\i18n\translations\en.json"
    )
    
    foreach ($key in $translationKeys) {
        $translationKey = $key.Groups[1].Value
        $keyExists = $false
        
        foreach ($file in $translationFiles) {
            if (Test-Path $file) {
                $translations = Get-Content $file -Raw | ConvertFrom-Json
                $keyParts = $translationKey -split '\.'
                $current = $translations
                
                foreach ($part in $keyParts) {
                    if ($current.PSObject.Properties[$part]) {
                        $current = $current.$part
                    } else {
                        Write-ValidationLog -Message "Cheia de traducere '$translationKey' nu există în $file" -FilePath $FilePath -Level "Warning"
                        $valid = $false
                        break
                    }
                }
            }
        }
    }
    
    return $valid
}

function Test-ComponentDocumentation {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $lines = Get-Content $FilePath
    $valid = $true
    
    # Verifică dacă componenta are documentație JSDoc
    if (-not ($content -match '\/\*\*[\s\S]*?\*\/\s*export')) {
        Write-ValidationLog -Message "Componenta ar trebui să aibă documentație JSDoc" -FilePath $FilePath -Level "Warning"
        $valid = $false
    }
    
    # Verifică dacă documentația include @description, @param pentru props și @returns
    if ($content -match '\/\*\*[\s\S]*?\*\/') {
        $docBlock = $matches[0]
        
        if (-not ($docBlock -match '@description')) {
            Write-ValidationLog -Message "Documentația ar trebui să includă @description" -FilePath $FilePath -Level "Warning"
            $valid = $false
        }
        
        if (-not ($docBlock -match '@param')) {
            Write-ValidationLog -Message "Documentația ar trebui să includă @param pentru props" -FilePath $FilePath -Level "Warning"
            $valid = $false
        }
        
        if (-not ($docBlock -match '@returns')) {
            Write-ValidationLog -Message "Documentația ar trebui să includă @returns" -FilePath $FilePath -Level "Warning"
            $valid = $false
        }
    }
    
    return $valid
}

# Inițializare validare
Write-ValidationLog "Validare componente React..." -Level "Info"

$componentFiles = Get-ChildItem -Path ".\src" -Recurse -Include "*.tsx" | 
    Where-Object { $_.FullName -match "\\components\\" }

$totalComponents = $componentFiles.Count
$validComponents = 0

foreach ($file in $componentFiles) {
    $isValid = $true
    Write-ValidationLog "`nValidare '$($file.Name)'..." -Level "Info"
    
    if (-not (Test-ComponentNaming -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-AccessibilityProps -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-TranslationUsage -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-ComponentDocumentation -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if ($isValid) {
        $validComponents++
    }
}

Write-ValidationLog "`nRezultat validare:" -Level "Info"
Write-ValidationLog "Total componente: $totalComponents" -Level "Info"
Write-ValidationLog "Componente valide: $validComponents" -Level "Info"
Write-ValidationLog "Componente cu probleme: $($totalComponents - $validComponents)" -Level "Info"

if ($validComponents -lt $totalComponents) {
    Write-ValidationLog "Există componente care nu respectă toate convențiile!" -Level "Error"
    exit 1
} else {
    Write-ValidationLog "Toate componentele respectă convențiile!" -Level "Success"
    exit 0
}
