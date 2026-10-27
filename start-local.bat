@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"

if not exist "%BACKEND_DIR%\mvnw.cmd" (
  echo Backend wrapper not found: %BACKEND_DIR%\mvnw.cmd
  exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
  echo Frontend package file not found: %FRONTEND_DIR%\package.json
  exit /b 1
)

echo Starting Spring Boot on http://localhost:8080 ...
start "EventSphere Backend" /D "%BACKEND_DIR%" cmd /c "mvnw.cmd spring-boot:run"

echo Starting React on http://localhost:3000 ...
start "EventSphere Frontend" /D "%FRONTEND_DIR%" cmd /c "npm start"

echo.
echo Services started in independent Windows processes.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
echo Close this window or VS Code safely. Use stop-local.bat to stop them.
endlocal