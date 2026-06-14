@echo off
setlocal

cd /d "%~dp0"

set "APP_URL=http://localhost:3000"
set "APP_PORT=3000"
set "HMR_PORT=24678"
set "LOG_OUT=%~dp0start-app.out.log"
set "LOG_ERR=%~dp0start-app.err.log"

echo [1/4] Checking dependencies...
if not exist "node_modules" (
  echo node_modules not found. Running npm install...
  call npm.cmd install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo [2/4] Closing any process already using ports %APP_PORT% or %HMR_PORT%...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports=@(%APP_PORT%,%HMR_PORT%);" ^
  "$pids=Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort } | Select-Object -ExpandProperty OwningProcess -Unique;" ^
  "foreach ($pidValue in $pids) { try { Stop-Process -Id $pidValue -Force -ErrorAction Stop; Write-Output ('Stopped PID ' + $pidValue) } catch {} }"

echo [3/4] Starting development server...
if exist "%LOG_OUT%" del /f /q "%LOG_OUT%" >nul 2>nul
if exist "%LOG_ERR%" del /f /q "%LOG_ERR%" >nul 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory '%~dp0' -WindowStyle Hidden -RedirectStandardOutput '%LOG_OUT%' -RedirectStandardError '%LOG_ERR%'"

echo Waiting for port %APP_PORT% to become available...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$deadline=(Get-Date).AddMinutes(2);" ^
  "$ok=$false;" ^
  "do {" ^
  "  Start-Sleep -Milliseconds 800;" ^
  "  $ok = [bool](Get-NetTCPConnection -LocalPort %APP_PORT% -State Listen -ErrorAction SilentlyContinue);" ^
  "} until ($ok -or (Get-Date) -ge $deadline);" ^
  "if (-not $ok) { exit 1 }"

if errorlevel 1 (
  echo Server did not become ready within 2 minutes.
  echo Check %LOG_OUT% and %LOG_ERR% for details.
  pause
  exit /b 1
)

echo [4/4] Opening browser...
start "" "%APP_URL%"

echo App started successfully: %APP_URL%
exit /b 0
