param([string]$TaskName = "Nomikos Tools Hourly Sync")

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -ne $task) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Task '$TaskName' removed. Files and outputs were kept."
} else {
    Write-Host "Task '$TaskName' is not installed."
}
