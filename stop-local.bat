@echo off
echo Stopping EventSphere local services...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$projectRoot = [regex]::Escape('%~dp0'); Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match $projectRoot -and $_.Name -in @('java.exe', 'node.exe', 'cmd.exe') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo Local services stopped.