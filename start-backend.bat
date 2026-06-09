@echo off
echo Starting Drug Nova Backend...
cd /d "%~dp0"
call venv\Scripts\activate.bat
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
