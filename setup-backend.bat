@echo off
cd server
echo Installing backend dependencies...
call npm install express mongoose cors dotenv @google/generative-ai
call npm install -D typescript ts-node-dev @types/node @types/express @types/cors
echo Backend setup complete!
pause
