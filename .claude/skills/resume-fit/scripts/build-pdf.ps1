# Compiles resume .tex files to PDF with Tectonic (no Overleaf needed).
#
# Resumes live in the portfolio repo, one folder per version:
#   docs\resumes\<folder>\Luis_Alarcon_Resume.tex   -> builds Luis_Alarcon_Resume.pdf beside it
#
# Usage (from the portfolio repo root):
#   powershell -ExecutionPolicy Bypass -File .claude/skills/resume-fit/scripts/build-pdf.ps1 docs/resumes/cloud/Luis_Alarcon_Resume.tex
#   powershell -ExecutionPolicy Bypass -File .claude/skills/resume-fit/scripts/build-pdf.ps1 -All   # every docs\resumes\<folder>\*.tex
#
# The PDF is written next to its .tex unless -OutDir is given. Source .tex files are
# never modified: Tectonic uses the XeTeX engine, which does not understand the
# pdfLaTeX-only lines `\input{glyphtounicode}` and `\pdfgentounicode=1`, so the script
# strips them from a temporary copy before compiling (XeTeX emits Unicode text anyway).

param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$TexFiles,
    [switch]$All,
    [string]$OutDir,
    [string]$ResumesRoot
)

$ErrorActionPreference = 'Stop'
# $PSScriptRoot is empty inside param() defaults on Windows PowerShell 5.1, so resolve here.
if (-not $ResumesRoot) { $ResumesRoot = Join-Path (Resolve-Path "$PSScriptRoot\..\..\..\..").Path 'docs\resumes' }

$tectonic = (Get-Command tectonic -ErrorAction SilentlyContinue).Source
if (-not $tectonic) { $tectonic = Join-Path $env:LOCALAPPDATA 'Programs\tectonic\tectonic.exe' }
if (-not (Test-Path $tectonic)) {
    Write-Error "Tectonic not found. Expected it on PATH or at $tectonic."
}

if ($All) {
    $TexFiles = Get-ChildItem $ResumesRoot -Directory | ForEach-Object { Get-ChildItem $_.FullName -Filter *.tex -File } | ForEach-Object FullName
}
if (-not $TexFiles) { Write-Error 'Pass a .tex path, or -All.' }

$work = Join-Path ([IO.Path]::GetTempPath()) ("resume-build-" + [guid]::NewGuid())
New-Item -ItemType Directory $work | Out-Null

$failed = @()
try {
    foreach ($f in $TexFiles) {
        $src = (Resolve-Path $f).Path
        $name = [IO.Path]::GetFileNameWithoutExtension($src)
        $label = "{0}\{1}" -f (Split-Path (Split-Path $src -Parent) -Leaf), $name
        $dest = if ($OutDir) { $OutDir } else { Split-Path $src -Parent }
        $tmp = Join-Path $work "$name.tex"

        $text = [IO.File]::ReadAllText($src)

        # A single trailing backslash is almost always a `\\` line break that got mangled
        # (e.g. by a shell heredoc). It compiles fine but merges lines, so flag it.
        $lineNo = 0
        foreach ($line in ($text -split "`n")) {
            $lineNo++
            if ($line -match '(^|[^\\])\\\s*\r?$' -or $line -match '\} \\ \\vspace') {
                Write-Host ("WARN    {0}:{1} single '\' where '\\' (line break) was probably meant: {2}" -f $label, $lineNo, $line.Trim()) -ForegroundColor Yellow
            }
        }

        $text = $text -replace '(?m)^\s*\\input\{glyphtounicode\}\s*$', '% (removed for XeTeX) \input{glyphtounicode}'
        $text = $text -replace '(?m)^\s*\\pdfgentounicode\s*=\s*1\s*$', '% (removed for XeTeX) \pdfgentounicode=1'
        [IO.File]::WriteAllText($tmp, $text, (New-Object Text.UTF8Encoding $false))

        # Tectonic writes progress to stderr; don't let PowerShell 5.1 treat that as fatal.
        $ErrorActionPreference = 'Continue'
        $log = & $tectonic -X compile $tmp --outdir $work --keep-logs 2>&1 | ForEach-Object { "$_" }
        $ErrorActionPreference = 'Stop'
        $pdf = Join-Path $work "$name.pdf"
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $pdf)) {
            Write-Host "FAILED  $label" -ForegroundColor Red
            $log | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
            $failed += $label
            Remove-Item (Join-Path $work '*') -Force -ErrorAction SilentlyContinue
            continue
        }
        New-Item -ItemType Directory -Force $dest | Out-Null
        $outPdf = Join-Path $dest "$name.pdf"
        Copy-Item $pdf $outPdf -Force

        # Tectonic's PDFs use compressed object streams, so read the LaTeX log instead.
        $texLog = Join-Path $work "$name.log"
        $logText = if (Test-Path $texLog) { [IO.File]::ReadAllText($texLog) } else { $log -join "`n" }
        $m = [regex]::Match($logText, '\((\d+) pages?')
        $pages = if ($m.Success) { $m.Groups[1].Value } else { '?' }
        $warn = ([regex]::Matches($logText, 'Overfull \\hbox')).Count
        Write-Host ("OK      {0}.pdf  pages={1}  overfull-hbox-warnings={2}" -f $label, $pages, $warn) -ForegroundColor Green
        Write-Host "        -> $outPdf"

        # Every resume compiles from the same temp folder, so clear it between files.
        Remove-Item (Join-Path $work '*') -Force -ErrorAction SilentlyContinue
    }
}
finally {
    Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
}

if ($failed) { exit 1 }
