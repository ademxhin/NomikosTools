param(
    [string]$TaskName = "Nomikos Tools Hourly Sync",
    [switch]$SkipInitialRun
)

$ErrorActionPreference = "Stop"
$AutomationDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $AutomationDir ".venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$Requirements = Join-Path $AutomationDir "requirements.txt"
$SyncScript = Join-Path $AutomationDir "sync_products.py"

if (-not (Test-Path -LiteralPath (Join-Path $AutomationDir ".env"))) {
    throw "Missing automation\.env. Copy .env.example and fill in the real values."
}

if (-not (Test-Path -LiteralPath $PythonExe)) {
    & py -3.14 -m venv $VenvDir
}
& $PythonExe -m pip install --disable-pip-version-check -r $Requirements

$Action = New-ScheduledTaskAction -Execute $PythonExe -Argument ('"{0}"' -f $SyncScript) -WorkingDirectory $AutomationDir
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Hours 1)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Updates the Nomikos Tools Excel workbook from the supplier XML feed every hour." -Force | Out-Null

if (-not $SkipInitialRun) {
    & $PythonExe $SyncScript
    if ($LASTEXITCODE -ne 0) {
        throw "The initial run failed. Check automation\logs\sync.log."
    }
}

Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName, State, TaskPath
