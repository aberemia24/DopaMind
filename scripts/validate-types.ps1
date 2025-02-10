# Script pentru validarea tipurilor TypeScript
function Test-TypeNaming {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    
    # Verifică dacă interfețele încep cu I
    $interfaces = [regex]::Matches($content, 'interface\s+(\w+)')
    foreach ($interface in $interfaces) {
        $name = $interface.Groups[1].Value
        if (-not $name.StartsWith("I")) {
            Write-Warning "Interfața $name din $FilePath ar trebui să înceapă cu 'I'"
            return $false
        }
    }
    
    # Verifică dacă tipurile sunt PascalCase
    $types = [regex]::Matches($content, 'type\s+(\w+)')
    foreach ($type in $types) {
        $name = $type.Groups[1].Value
        if ($name -cmatch '^[a-z]') {
            Write-Warning "Tipul $name din $FilePath ar trebui să fie PascalCase"
            return $false
        }
    }
    
    return $true
}

function Test-TypeExports {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    
    # Verifică dacă tipurile sunt exportate
    $declarations = [regex]::Matches($content, '(interface|type)\s+(\w+)')
    foreach ($decl in $declarations) {
        $type = $decl.Groups[1].Value
        $name = $decl.Groups[2].Value
        
        if (-not ($content -match "export\s+$type\s+$name")) {
            Write-Warning "$type $name din $FilePath ar trebui să fie exportat"
            return $false
        }
    }
    
    return $true
}

function Test-TypeDocumentation {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $lines = Get-Content $FilePath
    
    $declarations = [regex]::Matches($content, '(interface|type)\s+(\w+)')
    foreach ($decl in $declarations) {
        $lineNumber = 0
        $found = $false
        
        foreach ($line in $lines) {
            $lineNumber++
            if ($line -match $decl.Groups[0].Value) {
                # Verifică dacă există comentariu JSDoc deasupra
                if ($lineNumber -gt 1) {
                    $prevLine = $lines[$lineNumber - 2]
                    if (-not ($prevLine -match '\/\*\*')) {
                        Write-Warning "$($decl.Groups[1].Value) $($decl.Groups[2].Value) din $FilePath ar trebui să aibă documentație JSDoc"
                        return $false
                    }
                }
                $found = $true
                break
            }
        }
    }
    
    return $true
}

# Inițializare validare
Write-Host "Validare tipuri TypeScript..."

$typeFiles = Get-ChildItem -Path ".\src" -Recurse -Include "*.ts", "*.tsx" |
    Where-Object { $_.Name -match "types|interfaces|models" }

$totalFiles = $typeFiles.Count
$validFiles = 0

foreach ($file in $typeFiles) {
    $isValid = $true
    Write-Host "`nValidare $($file.Name)..."
    
    if (-not (Test-TypeNaming -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-TypeExports -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if (-not (Test-TypeDocumentation -FilePath $file.FullName)) {
        $isValid = $false
    }
    
    if ($isValid) {
        $validFiles++
    }
}

Write-Host "`nRezultat validare:"
Write-Host "Total fișiere cu tipuri: $totalFiles"
Write-Host "Fișiere valide: $validFiles"
Write-Host "Fișiere cu probleme: $($totalFiles - $validFiles)"

if ($validFiles -lt $totalFiles) {
    exit 1
} else {
    Write-Host "Toate tipurile respectă convențiile!" -ForegroundColor Green
    exit 0
}
