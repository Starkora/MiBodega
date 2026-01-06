# Script para iniciar MiBodega
Set-Location -Path $PSScriptRoot
Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Green
Write-Host "Iniciando MiBodega..." -ForegroundColor Cyan
npm run dev
