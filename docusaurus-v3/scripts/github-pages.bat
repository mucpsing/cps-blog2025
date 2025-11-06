@REM @Author: CPS
@REM @email: 373704015@qq.com
@REM @Date: 2024-03-04 09:30:09.644322
@REM Last Modified by: CPS
@REM Last Modified time: 2024-03-04 09:29:27.259878
@REM Modified time: 2024-03-04 09:29:27.259878
@REM @file_path "W:\CPS\MyProject\cps\cps-blog-docusaurus-v3\sctipts"
@REM @Filename "github-pages.bat"
@REM 自动推送build后的文件到github-pages

@echo off && setlocal enabledelayedexpansion
@chcp 65001

cd ../build

del /s /q "%CD%\screenshot"
rd /s /q "%CD%\screenshot"

git init
git add .
git commit -m "test1"
git push -f "git@github.com:mucpsing/blog-docusaurus-v3.git" "master:pages"

