@echo off
title Hey whatsup?.

:loop
  node arvis.js
  echo [%date% %time%] Bot eccorurec. Hata kodu: %errorlevel%.
  echo 5 Saniye sonra yeniden baslatilacak...
  timeout /t 5 /nobreak > nul
goto loop