@echo off
echo.
echo ========================================
echo   Bot de WhatsApp para MiBodega
echo ========================================
echo.

cd whatsapp-bot

echo [1/3] Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias ya instaladas
)

echo.
echo [2/3] Iniciando bot...
echo.
echo IMPORTANTE:
echo - Escanea el codigo QR con WhatsApp
echo - Abre WhatsApp ^> Dispositivos vinculados ^> Vincular dispositivo
echo - NO cierres esta ventana mientras uses MiBodega
echo.
echo ========================================
echo.

call npm run dev
