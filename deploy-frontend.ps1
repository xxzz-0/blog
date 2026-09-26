# 前端一键部署脚本（在 vue3-project 目录下执行）
# 用法: powershell -ExecutionPolicy Bypass -File .\deploy-frontend.ps1
# 前提: 本机 ssh/scp 对 root@192.168.142.133 已配置免密登录

$ErrorActionPreference = "Stop"

Write-Host "=== 1/3 npm run build ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "build failed" }
if (-not (Test-Path ".\dist\index.html")) { throw "dist/index.html not found" }

Write-Host "=== 2/3 clean & upload dist to 133 ===" -ForegroundColor Cyan
# 先清空远端旧产物（避免旧哈希文件残留），再整体上传
ssh root@192.168.142.133 "rm -rf /usr/local/nginx/html/blog/*"
scp -r dist\* root@192.168.142.133:/usr/local/nginx/html/blog/
if ($LASTEXITCODE -ne 0) { throw "scp failed" }

Write-Host "=== 3/3 reload nginx ===" -ForegroundColor Cyan
ssh root@192.168.142.133 "/usr/local/nginx/sbin/nginx -s reload"
if ($LASTEXITCODE -ne 0) { throw "nginx reload failed" }

Write-Host "Frontend deployed. https://192.168.142.133" -ForegroundColor Green
