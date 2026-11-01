$ErrorActionPreference = 'Stop'
$state = Join-Path (Split-Path $PSScriptRoot) 'service.json'
if (Test-Path -LiteralPath $state) {
 $record = Get-Content -LiteralPath $state -Raw | ConvertFrom-Json
 $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($record.pid)"
 if ($proc -and $proc.Name -eq 'node.exe' -and $proc.CommandLine.Contains($PSScriptRoot) -and $proc.CommandLine.Contains('vite')) { Stop-Process -Id $record.pid }
}
