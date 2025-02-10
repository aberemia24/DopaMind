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
    param (
        [string]$Directory
    )
    
    $valid = $true
    $files = Get-ChildItem -Path $Directory -Recurse -File
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace($Directory, '').TrimStart('\')
        $parentDir = Split-Path -Parent $relativePath
        
        # Verifică extensia fișierului și locația sa
        switch ($file.Extension) {
            '.tsx' {
                if (-not ($parentDir -match '(components|screens|pages)')) {
                    Write-ValidationLog "Fișierul .tsx nu este în directorul corect: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
            '.ts' {
                if (-not ($parentDir -match '(types|utils|hooks|services|constants)')) {
                    Write-ValidationLog "Fișierul .ts nu este în directorul corect: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
            '.css' {
                if (-not ($parentDir -match 'styles')) {
                    Write-ValidationLog "Fișierul .css nu este în directorul styles: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
            '.json' {
                if (-not ($parentDir -match '(translations|config)')) {
                    Write-ValidationLog "Fișierul .json nu este în directorul corect: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
        }
    }
    
    return $valid
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
if (-not (Test-FileOrganization -Directory ".\src")) {
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

# Import modul de logging
Import-Module (Join-Path $PSScriptRoot "modules\Write-ValidationLog.psm1")

# Funcție pentru validarea fișierelor de configurare
function Test-ConfigurationFiles {
    $packageJson = Get-Content ".\package.json" -Raw | ConvertFrom-Json
    $tsconfigJson = Get-Content ".\tsconfig.json" -Raw | ConvertFrom-Json

    if ($null -eq $packageJson.name -or 
        $null -eq $packageJson.version -or 
        $null -eq $packageJson.scripts -or 
        $null -eq $packageJson.dependencies -or 
        $null -eq $packageJson.devDependencies) {
        Write-ValidationLog "package.json nu conține toate câmpurile necesare" -Level "Error"
        return $false
    }

    if ($null -eq $tsconfigJson.compilerOptions -or 
        $null -eq $tsconfigJson.include -or 
        $null -eq $tsconfigJson.exclude) {
        Write-ValidationLog "tsconfig.json nu conține toate câmpurile necesare" -Level "Error"
        return $false
    }
    return $true
}

function Test-RequiredDirectories {
    $requiredDirs = @{
        ".\src\components" = "Componente React reutilizabile"
        ".\src\screens" = "Ecrane/pagini ale aplicației"
        ".\src\navigation" = "Configurare navigare"
        ".\src\hooks" = "Custom hooks"
        ".\src\utils" = "Funcții utilitare"
        ".\src\constants" = "Constante și configurări"
        ".\src\types" = "Definiții de tipuri TypeScript"
        ".\src\i18n" = "Resurse de traducere"
        ".\src\assets" = "Resurse statice"
        ".\src\services" = "Servicii și API-uri"
        ".\src\context" = "Context providers"
        ".\src\styles" = "Stiluri și teme"
        ".\src\__tests__" = "Teste unitare"
        ".\src\__mocks__" = "Mock-uri pentru teste"
    }
    
    $valid = $true
    foreach ($dir in $requiredDirs.Keys) {
        if (-not (Test-Path $dir)) {
            Write-ValidationLog -Message "Directorul '$dir' lipsește (${$requiredDirs[$dir]})" -Level "Warning"
            $valid = $false
        }
    }
    return $valid
}

function Test-FileOrganization {
    param (
        [string]$Directory
    )
    
    $valid = $true
    $files = Get-ChildItem -Path $Directory -Recurse -File
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace($Directory, '').TrimStart('\')
        $parentDir = Split-Path -Parent $relativePath
        
        # Verifică extensia fișierului și locația sa
        switch ($file.Extension) {
            '.tsx' {
                if (-not ($parentDir -match '(components|screens|pages)')) {
                    Write-ValidationLog "Fișierul .tsx nu este în directorul corect: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
            '.ts' {
                if (-not ($parentDir -match '(types|utils|hooks|services|constants)')) {
                    Write-ValidationLog "Fișierul .ts nu este în directorul corect: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
            '.css' {
                if (-not ($parentDir -match 'styles')) {
                    Write-ValidationLog "Fișierul .css nu este în directorul styles: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
            '.json' {
                if (-not ($parentDir -match '(translations|config)')) {
                    Write-ValidationLog "Fișierul .json nu este în directorul corect: $relativePath" -Level "Warning"
                    $valid = $false
                }
            }
        }
    }
    
    return $valid
}

function Test-ImportPaths {
    param (
        [string]$FilePath
    )
    
    $lines = Get-Content $FilePath
    $valid = $true
    
    foreach ($line in $lines) {
        if ($line -match '^import.*from\s+[''"](.+)[''"]') {
            $importPath = $matches[1]
            
            # Verifică importurile relative
            if ($importPath -match '^\.\./') {
                Write-ValidationLog "Import relativ găsit: $importPath" -FilePath $FilePath -Level "Warning"
                $valid = $false
            }
        }
    }
    
    return $valid
}

function Test-AssetOrganization {
    param (
        [string]$FilePath
    )
    
    $lines = Get-Content $FilePath
    $valid = $true
    
    foreach ($line in $lines) {
        if ($line -match '(src=|require\(|import\s+.*from\s+)[''"](.+\.(png|jpg|svg))[''"]') {
            $assetPath = $matches[2]
            
            # Verifică dacă asset-ul este în directorul corect
            if (-not ($assetPath -match '^@/assets/')) {
                Write-ValidationLog "Asset-ul nu este în directorul @/assets/: $assetPath" -FilePath $FilePath -Level "Warning"
                $valid = $false
            }
        }
    }
    
    return $valid
}

# Inițializare validare
Write-ValidationLog "Începere validare structură proiect..." -Level "Info"

$isValid = $true

Write-ValidationLog "Verificare fișiere configurare..." -Level "Info"
if (-not (Test-ConfigurationFiles)) {
    $isValid = $false
}

Write-ValidationLog "Verificare directoare necesare..." -Level "Info"
if (-not (Test-RequiredDirectories)) {
    $isValid = $false
}

Write-ValidationLog "Verificare organizare fișiere..." -Level "Info"
if (-not (Test-FileOrganization -Directory ".\src")) {
    $isValid = $false
}

Write-ValidationLog "Verificare căi import..." -Level "Info"
if (-not (Test-ImportPaths -FilePath ".\src")) {
    $isValid = $false
}

Write-ValidationLog "Verificare organizare resurse..." -Level "Info"
if (-not (Test-AssetOrganization -FilePath ".\src")) {
    $isValid = $false
}

if (-not $isValid) {
    Write-ValidationLog "Structura proiectului are probleme care trebuie rezolvate!" -Level "Error"
    exit 1
} else {
    Write-ValidationLog "Structura proiectului respectă toate convențiile!" -Level "Success"
    exit 0
}
