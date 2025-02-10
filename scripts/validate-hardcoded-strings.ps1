[CmdletBinding()]
param(
    [Parameter()]
    [string]$SourceDirectory = ".\src",
    
    [Parameter()]
    [string[]]$FileExtensions = @("*.ts", "*.tsx", "*.js", "*.jsx"),
    
    [Parameter()]
    [ValidateSet("text", "json")]
    [string]$OutputFormat = "text",
    
    [Parameter()]
    [string]$ConfigFile = $null
)

# Import modul de logging
Import-Module (Join-Path $PSScriptRoot "modules\Write-ValidationLog.psm1")

# Clasa pentru stocarea rezultatelor validării
class ValidationResult {
    [string]$FilePath
    [int]$LineNumber
    [string]$Text
    [string]$Context
    [string]$Level
    
    ValidationResult([string]$filePath, [int]$lineNumber, [string]$text, [string]$context, [string]$level) {
        $this.FilePath = $filePath
        $this.LineNumber = $lineNumber
        $this.Text = $text
        $this.Context = $context
        $this.Level = $level
    }
}

# Funcție pentru încărcarea configurației
function Get-ValidationConfig {
    param (
        [string]$ConfigFile
    )
    
    $defaultConfig = @{
        # Pattern-uri pentru a ignora linii întregi
        IgnorePatterns = @(
            @{
                Pattern = '^\s*import\s+.*from\s+[''"]'
                Description = 'Import statements'
            },
            @{
                Pattern = '^\s*\/\/'
                Description = 'Single-line comments'
            },
            @{
                Pattern = '^\s*\/\*\*'
                Description = 'JSDoc comment start'
            },
            @{
                Pattern = '^\s*\*'
                Description = 'Multi-line comment content'
            },
            @{
                Pattern = '^\s*\*\s+@'
                Description = 'JSDoc tags'
            },
            @{
                Pattern = '^\s*\*\/'
                Description = 'Comment end'
            },
            @{
                Pattern = '^\s*console\.(log|error|warn|info)'
                Description = 'Console statements'
            },
            @{
                Pattern = 'testID=["''][^"'']+["'']'
                Description = 'Test IDs'
            },
            @{
                Pattern = '^\s*export\s+(type|interface|enum)'
                Description = 'TypeScript type definitions'
            },
            @{
                Pattern = '^\s*type\s+\w+\s*='
                Description = 'TypeScript type aliases'
            },
            @{
                Pattern = '^\s*interface\s+\w+\s*{'
                Description = 'TypeScript interfaces'
            },
            @{
                Pattern = '^\s*const\s+\w+:\s*\w+'
                Description = 'TypeScript variable declarations with type'
            },
            @{
                Pattern = 'style(s)?=["''][^"'']+["'']'
                Description = 'Style props'
            },
            @{
                Pattern = 'className=["''][^"'']+["'']'
                Description = 'CSS class names'
            },
            @{
                Pattern = 'accessibilityRole=["''][^"'']+["'']'
                Description = 'React Native accessibility roles'
            },
            @{
                Pattern = 'keyExtractor=["''][^"'']+["'']'
                Description = 'FlatList key extractors'
            },
            @{
                Pattern = 'ref=["''][^"'']+["'']'
                Description = 'React refs'
            },
            @{
                Pattern = 'data-(testid|cy)=["''][^"'']+["'']'
                Description = 'Testing attributes'
            },
            @{
                Pattern = 'nativeID=["''][^"'']+["'']'
                Description = 'Native IDs'
            },
            @{
                Pattern = 'key=["''][^"'']+["'']'
                Description = 'React keys'
            },
            @{
                Pattern = 'require\([''"]\.\/[^''"]+\.(png|jpg|jpeg|gif|svg)[''"]'
                Description = 'Image requires'
            },
            @{
                Pattern = 'from\s+[''"][^''"]+[''"]'
                Description = 'Import from statements'
            },
            @{
                Pattern = '^\s*throw new Error\('
                Description = 'Error throwing'
            }
        )
        
        # Pattern-uri pentru valori care nu necesită traducere
        ValuePatterns = @(
            @{
                Pattern = '^\d+%?$'
                Description = 'Numbers with optional percent'
            },
            @{
                Pattern = '^\d+\.\d+%?$'
                Description = 'Decimal numbers with optional percent'
            },
            @{
                Pattern = '^\d+(?:px|rem|em|vh|vw|s|ms)$'
                Description = 'Numbers with CSS units'
            },
            @{
                Pattern = '^#[0-9a-fA-F]{3,8}$'
                Description = 'Hex colors'
            },
            @{
                Pattern = '^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$'
                Description = 'RGB/RGBA colors'
            },
            @{
                Pattern = '^[A-Z][A-Z0-9_]*$'
                Description = 'Constants and enum values'
            },
            @{
                Pattern = '^[a-z]+:\/\/\S+$'
                Description = 'URLs and protocols'
            },
            @{
                Pattern = '^\w+\.(png|jpg|jpeg|gif|svg)$'
                Description = 'Image file names'
            },
            @{
                Pattern = '^(true|false|null|undefined|void|any|never)$'
                Description = 'TypeScript/JavaScript keywords'
            },
            @{
                Pattern = '^[a-zA-Z]+\([^)]*\)$'
                Description = 'Function calls without string arguments'
            },
            @{
                Pattern = '^\$\{.*\}$'
                Description = 'Template literal expressions'
            },
            @{
                Pattern = '^[<>]=?\s*\d+$'
                Description = 'Comparison operators with numbers'
            },
            @{
                Pattern = '^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9]+$'
                Description = 'Object property access'
            },
            @{
                Pattern = '^[a-z][a-zA-Z0-9]*\[[''"][a-zA-Z0-9]+[''"]\]$'
                Description = 'Object bracket notation access'
            },
            @{
                Pattern = '^[.\\/@]'
                Description = 'Path segments'
            },
            @{
                Pattern = '^[\r\n\t\s]*$'
                Description = 'Whitespace and newlines'
            },
            @{
                Pattern = '^[a-z-]+/[a-z-]+$'
                Description = 'Package paths'
            },
            @{
                Pattern = '^[a-z]+\.[a-z]+(\.[a-z]+)*$'
                Description = 'Translation keys'
            },
            @{
                Pattern = '^[a-z-]+(-[a-z]+)*$'
                Description = 'Material Icons names'
            },
            @{
                Pattern = '^(HH|mm|ss|DD|MM|YYYY|hh|a)([:]|[/]|[-])?(\s+)?(HH|mm|ss|DD|MM|YYYY|hh|a)?$'
                Description = 'Date and time formats'
            }
        )
        
        # Cuvinte cheie și tipuri care nu necesită traducere
        IgnoreKeywords = @(
            'Promise',
            'Array',
            'string',
            'number',
            'boolean',
            'null',
            'undefined',
            'void',
            'any',
            'object',
            'Function',
            'Date',
            'Error'
        )
    }
    
    if ($ConfigFile -and (Test-Path $ConfigFile)) {
        $customConfig = Get-Content $ConfigFile | ConvertFrom-Json
        # Combină configurația personalizată cu cea implicită
        # TODO: Implementează logica de combinare
        return $customConfig
    }
    
    return $defaultConfig
}

function Test-HardcodedStrings {
    param (
        [string]$FilePath,
        [hashtable]$Config
    )
    
    $valid = $true
    $results = [System.Collections.ArrayList]::new()
    
    try {
        $lines = Get-Content $FilePath -ErrorAction Stop
        $lineNumber = 0
        
        foreach ($line in $lines) {
            $lineNumber++
            
            # Verifică dacă linia trebuie ignorată
            $shouldIgnore = $false
            foreach ($pattern in $Config.IgnorePatterns) {
                if ($line -match $pattern.Pattern) {
                    $shouldIgnore = $true
                    break
                }
            }
            
            # Ignoră linii goale sau doar cu spații
            if ($line -match '^\s*$') {
                continue
            }
            
            if ($shouldIgnore) { continue }
            
            # Verifică text între > și < în JSX, excluzând cazurile speciale
            $jsxMatch = [regex]::Match($line, '>([^{}<>]+)<')
            if ($jsxMatch.Success) {
                # Verifică dacă nu este deja tradus sau marcat ca netradus
                if (-not ($line -match '>\s*{\s*t\s*\(' -or 
                    $line -match 'translate={false}' -or 
                    $line -match 'accessibilityLabel=' -or
                    $line -match 'testID=' -or
                    $line -match 'nativeID=' -or
                    $line -match 'key=' -or
                    $line -match 'data-testid=' -or
                    $line -match 'data-cy=')) {
                    
                    $text = $jsxMatch.Groups[1].Value.Trim()
                    if ($text -and -not ($text -match '^\s*$')) {
                        # Verifică dacă textul nu este o valoare care nu necesită traducere
                        $isValue = $false
                        foreach ($pattern in $Config.ValuePatterns) {
                            if ($text -match $pattern.Pattern) {
                                $isValue = $true
                                break
                            }
                        }
                        
                        if (-not $isValue) {
                            $result = [ValidationResult]::new(
                                $FilePath,
                                $lineNumber,
                                $text,
                                "Text hardcodat în JSX",
                                "Warning"
                            )
                            [void]$results.Add($result)
                            $valid = $false
                        }
                    }
                }
            }
            
            # Verifică stringuri care ar putea fi texte hardcodate
            $stringPattern = '([''"])((?:(?!\1).)*)\1'
            $stringMatches = [regex]::Matches($line, $stringPattern)
            foreach ($match in $stringMatches) {
                $text = $match.Groups[2].Value
                
                # Ignoră stringuri goale sau doar cu spații
                if (-not $text -or $text -match '^\s*$') {
                    continue
                }
                
                # Verifică dacă textul se potrivește cu vreun pattern de valori
                $isValue = $false
                foreach ($pattern in $Config.ValuePatterns) {
                    if ($text -match $pattern.Pattern) {
                        $isValue = $true
                        break
                    }
                }
                
                # Verifică dacă textul este în lista de cuvinte cheie de ignorat
                if (-not $isValue -and $Config.IgnoreKeywords -contains $text) {
                    $isValue = $true
                }
                
                if (-not $isValue) {
                    $result = [ValidationResult]::new(
                        $FilePath,
                        $lineNumber,
                        $text,
                        "String hardcodat",
                        "Warning"
                    )
                    [void]$results.Add($result)
                    $valid = $false
                }
            }
        }
    }
    catch {
        Write-ValidationLog "Eroare la procesarea fișierului $FilePath : $_" -Level "Error"
        return @{
            Valid = $false
            Results = @()
        }
    }
    
    return @{
        Valid = $valid
        Results = $results
    }
}

# Inițializare validare
Write-ValidationLog "Verificare texte hardcodate..." -Level "Info"

# Încarcă configurația
$config = Get-ValidationConfig -ConfigFile $ConfigFile

# Găsește toate fișierele sursă
$sourceFiles = Get-ChildItem -Path $SourceDirectory -Recurse -Include $FileExtensions
$totalFiles = $sourceFiles.Count
$validFiles = 0
$allResults = [System.Collections.ArrayList]::new()

foreach ($file in $sourceFiles) {
    Write-ValidationLog "`nVerificare '$($file.Name)'..." -Level "Info"
    
    $result = Test-HardcodedStrings -FilePath $file.FullName -Config $config
    if ($result.Valid) {
        $validFiles++
    }
    else {
        foreach ($issue in $result.Results) {
            Write-ValidationLog "  [Linia $($issue.LineNumber)] $($issue.Text)" -Level "Warning"
            Write-ValidationLog "    Context: $($issue.Context)" -Level "Info"
        }
    }
    if ($result.Results) {
        [void]$allResults.AddRange($result.Results)
    }
}

# Generează raportul
Write-ValidationLog "`nRezultat validare:" -Level "Info"
Write-ValidationLog "Total fișiere verificate: $totalFiles" -Level "Info"
Write-ValidationLog "Fișiere fără texte hardcodate: $validFiles" -Level "Info"
Write-ValidationLog "Fișiere cu probleme: $($totalFiles - $validFiles)" -Level "Info"
Write-ValidationLog "Total probleme găsite: $($allResults.Count)" -Level "Info"

# Grupează rezultatele pe fișiere pentru un raport mai clar
$groupedResults = $allResults | Group-Object -Property FilePath

foreach ($group in $groupedResults) {
    Write-ValidationLog "`nProbleme în $($group.Name):" -Level "Warning"
    foreach ($issue in $group.Group) {
        Write-ValidationLog "  [Linia $($issue.LineNumber)] $($issue.Text)" -Level "Warning"
        Write-ValidationLog "    Context: $($issue.Context)" -Level "Info"
    }
}

# Exportă rezultatele în format JSON dacă este specificat
if ($OutputFormat -eq "json") {
    $jsonReport = @{
        Summary = @{
            TotalFiles = $totalFiles
            ValidFiles = $validFiles
            FilesWithIssues = $totalFiles - $validFiles
            TotalIssues = $allResults.Count
        }
        IssuesByFile = $groupedResults | ForEach-Object {
            @{
                FilePath = $_.Name
                Issues = $_.Group | ForEach-Object {
                    @{
                        LineNumber = $_.LineNumber
                        Text = $_.Text
                        Context = $_.Context
                        Level = $_.Level
                    }
                }
            }
        }
    } | ConvertTo-Json -Depth 10
    
    $reportPath = Join-Path $PSScriptRoot "translation-validation-report.json"
    $jsonReport | Out-File $reportPath -Encoding UTF8
    Write-ValidationLog "Raport JSON generat la: $reportPath" -Level "Info"
}

if ($allResults.Count -gt 0) {
    Write-ValidationLog "`nAtenție: Există texte hardcodate în proiect!" -Level "Error"
    Write-ValidationLog "Verifică raportul pentru detalii și asigură-te că toate textele sunt traduse." -Level "Info"
    exit 1
} else {
    Write-ValidationLog "`nFelicitări! Nu s-au găsit texte hardcodate." -Level "Success"
    exit 0
}
