@echo off
setlocal enabledelayedexpansion

rem Ustawienie ścieżki do folderu bieżącego
set "folder=%cd%"

echo Lista plików w folderze %folder%:
echo.

rem Ustawienie flagi określającej, czy jest to pierwszy plik w liście
set "firstFile=true"

rem Iteracja przez wszystkie pliki w folderze
for %%F in ("%folder%\*.*") do (
    rem Wyodrębnienie nazwy pliku z pełną ścieżką
    set "filename=%%~nxF"
    rem Pominięcie pliku skryptu oraz pliku pustego
    if /I not "!filename!"=="%~nx0" if not "!filename!"=="" (
        rem Jeśli to nie jest pierwszy plik, wyświetl przecinek
        if not "!firstFile!"=="true" (
            echo ,
        ) else (
            rem Ustaw flagę na false po pierwszym pliku
            set "firstFile=false"
        )
        rem Wyświetl nazwę pliku
        echo "!filename!"
    )
)

pause
