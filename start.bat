@echo off
echo Checking environment configuration...
if not exist .env.local (
    echo WARNING: .env.local not found! Please create it with your API keys.
)
echo.
echo Starting FlowSync development server...
echo.
npm run dev
