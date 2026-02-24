@echo off
echo Fixing Tailwind CSS setup...
echo.
echo Uninstalling old packages...
call npm uninstall tailwindcss postcss autoprefixer
echo.
echo Installing correct Tailwind v4 packages...
call npm install -D tailwindcss @tailwindcss/postcss
echo.
echo Done! Now restart your dev server (npm run dev)
pause
