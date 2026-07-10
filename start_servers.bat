@echo off
echo Starting Drug Nova Servers...

:: Start the Python Backend in a new terminal window
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start the Next.js Frontend in a new terminal window
start cmd /k "cd frontend && npm run dev"

echo Both servers are launching! Opening browser...

:: Wait a few seconds for the frontend to boot, then open localhost
timeout /t 5 /nobreak > NUL
start http://localhost:3000

exit