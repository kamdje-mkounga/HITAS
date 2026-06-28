@echo off

cd /d "%~dp0"

git add .

git diff --cached --quiet
if %errorlevel%==0 (
    exit
)

for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set d=%%d-%%b-%%c
)

for /f "tokens=1-2 delims=:." %%a in ("%time%") do (
    set t=%%a-%%b
)

git commit -m "Auto Backup"

git push origin main