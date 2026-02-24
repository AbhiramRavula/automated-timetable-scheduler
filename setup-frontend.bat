@echo off
cd client
echo Installing frontend dependencies...
call npm install react react-dom
call npm install -D @vitejs/plugin-react vite typescript @types/react @types/react-dom
call npm install -D tailwindcss @tailwindcss/postcss
echo Frontend setup complete!
pause
