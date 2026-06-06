@echo off
cd /d "%~dp0backend"
echo Installing backend dependencies...
pip install -r requirements.txt
echo.
echo Starting VibeUI backend on http://localhost:8000
echo.
uvicorn main:app --reload --port 8000
