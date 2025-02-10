# Script pentru validarea structurii proiectului
function Test-RequiredDirectories {
    $requiredDirs = @(
        ".\src\components",
        ".\src\screens",
        ".\src\navigation",
        ".\src\hooks",
        ".\src\utils",
        ".\src\constants",
        ".\src\types",
        ".\src\i18n",
        ".\src\assets",
        ".\src\services",
        ".\src\context",
        ".\src\styles"
    )
    
    $missingDirs = @()
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            $missingDirs += $dir
        }
    }
    
    if ($missingDirs.Count -gt 0) {
        Write-Warning "Lipsesc următoarele directoare: $($missingDirs -join ', ')"
        return $false
    }
    
    return $true
}

function Test-FileOrganization {
    # Verifică dacă fișierele sunt în directoarele corecte
    $rules = @{
        "components" = "*.tsx"
        "screens" = "*Screen.tsx"
        "hooks" = "use*.ts"
        "types" = "*.types.ts"
        "context" = "*Context.tsx"
        "utils" = "*.util.ts"
    }
    
    $violations = @()
    
    foreach ($dir in $rules.Keys) {
        $pattern = $rules[$dir]
        $files = Get-ChildItem -Path ".\src" -Recurse -Include $pattern
        
        foreach ($file in $files) {
            if (-not ($file.FullName -match "\\$dir\\")) {
                $violations += "Fișierul $($file.Name) ar trebui să fie în directorul $dir"
            }
        }
    }
    
    if ($violations.Count -gt 0) {
        Write-Warning ($violations -join "`n")
        return $false
    }
    
    return $true
}

function Test-ImportPaths {
    # Verifică dacă importurile folosesc alias-uri și calea corectă
    $tsFiles = Get-ChildItem -Path ".\src" -Recurse -Include "*.ts", "*.tsx"
    $violations = @()
    
    foreach ($file in $tsFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Verifică importuri relative adânci
        if ($content -match '(?m)^import.*from\s+[''"]\.\.\/\.\.\/') {
            $violations += "Fișierul $($file.Name) folosește importuri relative prea adânci. Folosește alias-uri."
        }
        
        # Verifică importuri din node_modules fără alias
        if ($content -match '(?m)^import.*from\s+[''"]@\/') {
            $violations += "Fișierul $($file.Name) folosește importuri din node_modules fără alias."
        }
    }
    
    if ($violations.Count -gt 0) {
        Write-Warning ($violations -join "`n")
        return $false
    }
    
    return $true
}

function Test-AssetOrganization {
    # Verifică organizarea resurselor
    $assetTypes = @{
        "images" = "*.png", "*.jpg", "*.jpeg", "*.svg"
        "fonts" = "*.ttf", "*.otf"
        "icons" = "*.svg"
    }
    
    $violations = @()
    
    foreach ($type in $assetTypes.Keys) {
        $patterns = $assetTypes[$type]
        foreach ($pattern in $patterns) {
            $files = Get-ChildItem -Path ".\src\assets" -Recurse -Include $pattern
            
            foreach ($file in $files) {
                if (-not ($file.FullName -match "\\$type\\")) {
                    $violations += "Resursa $($file.Name) ar trebui să fie în directorul assets\$type"
                }
            }
        }
    }
    
    if ($violations.Count -gt 0) {
        Write-Warning ($violations -join "`n")
        return $false
    }
    
    return $true
}

# Inițializare validare
Write-Host "Validare structură proiect..."

$isValid = $true

Write-Host "`nVerificare directoare necesare..."
if (-not (Test-RequiredDirectories)) {
    $isValid = $false
}

Write-Host "`nVerificare organizare fișiere..."
if (-not (Test-FileOrganization)) {
    $isValid = $false
}

Write-Host "`nVerificare căi import..."
if (-not (Test-ImportPaths)) {
    $isValid = $false
}

Write-Host "`nVerificare organizare resurse..."
if (-not (Test-AssetOrganization)) {
    $isValid = $false
}

if (-not $isValid) {
    Write-Host "`nStructura proiectului are probleme care trebuie rezolvate!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`nStructura proiectului respectă toate convențiile!" -ForegroundColor Green
    exit 0
}
