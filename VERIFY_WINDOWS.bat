@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo Weather App - verification
echo ========================================

echo.
echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 goto :fail

echo.
echo [2/3] Running tests...
call npm test
if errorlevel 1 goto :fail

echo.
echo [3/3] Building production bundle...
call npm run build
if errorlevel 1 goto :fail

echo.
echo ========================================
echo PASS - install, tests and build succeeded.
echo ========================================
exit /b 0

:fail
echo.
echo ========================================
echo FAIL - see the error above.
echo ========================================
exit /b 1
