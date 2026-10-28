@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 goto sempython
python servir.py
goto fim
:sempython
echo Instale o Python 3 em python.org (marque "Add Python to PATH") e rode este arquivo de novo.
pause
:fim
