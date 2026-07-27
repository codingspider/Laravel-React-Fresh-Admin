Continue = 'SilentlyContinue'

function Fix-File {
    param([string], [hashtable])
     = Get-Content  -Raw -Encoding UTF8
    foreach ( in .Keys) {
         = .Replace(, [])
    }
    [System.IO.File]::WriteAllText((Resolve-Path ).Path, , [System.Text.Encoding]::UTF8)
    Write-Host  Fixed: 
}
