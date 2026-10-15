<#
Deploy manual de Viva Resource al VPS (GitHub Actions esta desactivado).

A diferencia del metodo viejo (extraer el tar ENCIMA del directorio del VPS, que
acumulaba archivos obsoletos y ya rompio un build), este sincroniza LIMPIO:
sube el working tree, lo extrae en un temporal y hace `rsync --delete` hacia el
directorio de deploy. Asi lo que ya no existe en el repo desaparece del VPS.

Nunca toca `.env` ni `docker-compose.migracion.yml` del VPS (excluidos del rsync
y protegidos de --delete).

Uso:
  pwsh scripts/deploy-vps.ps1              # build --no-cache + up -d
  pwsh scripts/deploy-vps.ps1 -SkipBuild   # solo sincroniza (sin reconstruir)
#>
param(
  [string]$SshHost = "vps",
  [string]$RemoteDir = "/opt/codigo-guerrero/viva-migracion",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$tar = Join-Path $env:SystemRoot "System32\tar.exe"
$pkg = Join-Path $env:TEMP "viva-code.tar.gz"
if (Test-Path $pkg) { Remove-Item $pkg -Force }

Write-Host "[1/3] Empaquetando el working tree..." -ForegroundColor Cyan
& $tar -czf $pkg -C $repo `
  --exclude "node_modules" --exclude ".next" --exclude ".git" `
  --exclude ".env" --exclude ".env.*" --exclude "docker-compose.migracion.yml" `
  --exclude "find-colorado-game" .

Write-Host "[2/3] Subiendo al VPS ($SshHost)..." -ForegroundColor Cyan
scp $pkg "${SshHost}:/tmp/viva-code.tar.gz"

if ($SkipBuild) { $buildStep = "echo '(-SkipBuild) sin reconstruir'" }
else            { $buildStep = "docker compose -f docker-compose.migracion.yml build --no-cache" }

$remoteScript = @"
set -e
rm -rf /tmp/viva-deploy && mkdir -p /tmp/viva-deploy
tar -xzf /tmp/viva-code.tar.gz -C /tmp/viva-deploy
rm -f /tmp/viva-code.tar.gz
rsync -a --delete \
  --exclude '.env' --exclude '.env.*' \
  --exclude 'docker-compose.migracion.yml' --exclude '.git' \
  /tmp/viva-deploy/ $RemoteDir/
rm -rf /tmp/viva-deploy
cd $RemoteDir
$buildStep
if [ "$SkipBuild" != "True" ]; then docker compose -f docker-compose.migracion.yml up -d; fi
echo DEPLOY_OK
"@

Write-Host "[3/3] Sincronizando limpio y desplegando en el VPS..." -ForegroundColor Cyan
$remoteScript | ssh $SshHost "bash -s"

Remove-Item $pkg -Force -ErrorAction SilentlyContinue
Write-Host "Listo." -ForegroundColor Green
