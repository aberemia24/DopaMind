# Modul pentru logare uniformă în scripturile de validare
function Write-ValidationLog {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$Context = "",
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("Info", "Warning", "Error", "Success")]
        [string]$Level = "Info",
        
        [Parameter(Mandatory=$false)]
        [string]$FilePath = "",
        
        [Parameter(Mandatory=$false)]
        [int]$LineNumber = 0
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $contextInfo = if ($Context) { "[$Context] " } else { "" }
    $locationInfo = if ($FilePath -and $LineNumber -gt 0) { " at '$FilePath':$LineNumber" } else { if ($FilePath) { " in '$FilePath'" } else { "" } }
    
    $logMessage = "[$timestamp] ${contextInfo}$Message$locationInfo"
    
    # Adaugă în fișierul de log global
    $logPath = Join-Path $PSScriptRoot ".." "validation.log"
    Add-Content -Path $logPath -Value $logMessage
    
    # Afișează în consolă cu formatare corespunzătoare
    switch ($Level) {
        "Warning" { 
            Write-Warning $Message
            if ($FilePath) { Write-Warning "  Location: $FilePath$(if ($LineNumber -gt 0) { ":$LineNumber" })" }
        }
        "Error" { 
            Write-Error $Message
            if ($FilePath) { Write-Error "  Location: $FilePath$(if ($LineNumber -gt 0) { ":$LineNumber" })" }
        }
        "Success" { 
            Write-Host $Message -ForegroundColor Green
            if ($FilePath) { Write-Host "  Location: $FilePath$(if ($LineNumber -gt 0) { ":$LineNumber" })" -ForegroundColor Green }
        }
        default { 
            Write-Host $Message
            if ($FilePath) { Write-Host "  Location: $FilePath$(if ($LineNumber -gt 0) { ":$LineNumber" })" }
        }
    }
}

# Exportă funcția pentru a fi folosită în alte scripturi
Export-ModuleMember -Function Write-ValidationLog
