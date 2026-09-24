$ErrorActionPreference = "Stop"
$AutomationDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonExe = Join-Path $AutomationDir ".venv\Scripts\python.exe"
if (-not (Test-Path -LiteralPath $PythonExe)) {
    throw "Python environment not found. Run install_task.ps1 first."
}
& $PythonExe (Join-Path $AutomationDir "sync_products.py")
exit $LASTEXITCODE
