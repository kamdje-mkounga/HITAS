@echo off
cd /d "%~dp0"

echo ===============================
echo Git Auto Backup Started...
echo ===============================

git add .

git diff --cached --quiet
if %errorlevel%==0 (
    echo No changes detected.
    exit /b 0
)

git commit -m "Auto Backup %date% %time%"

git push origin main

echo Backup completed.