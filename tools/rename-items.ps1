param(
    [string]$BasePath = "."
)

function Sanitize-Filename {
    param([string]$Name)

    # Use system-defined invalid characters for robustness
    $invalidChars = [System.IO.Path]::GetInvalidFileNameChars()
    foreach ($char in $invalidChars) {
        $Name = $Name.Replace($char, '_')
    }

    return $Name.Trim(" .")
}

# Process Emojis
Write-Host "Processing Emojis..."
if (Test-Path "$BasePath/emojis.json") {
    try {
        $emojis = Get-Content "$BasePath/emojis.json" -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($emoji in $emojis) {
            $id = $emoji.id
            $name = Sanitize-Filename $emoji.name

            # We search for the file by ID to find it regardless of its extension (.png, .gif, etc.)
            # Get-ChildItem returns a list, so we must iterate (even if it's just 1 file).
            $files = Get-ChildItem "$BasePath/emojis/$id.*" -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                $extension = $file.Extension
                $newName = "$name$extension"
                $targetPath = Join-Path $file.Directory.FullName $newName

                if (-not (Test-Path $targetPath)) {
                    Rename-Item -LiteralPath $file.FullName -NewName $newName -ErrorAction SilentlyContinue
                    Write-Host "Renamed emoji $($file.Name) to $newName"
                } else {
                    Write-Warning "Skipped emoji $id ($name) - target file already exists"
                }
            }
        }
    } catch {
        Write-Error "Failed to process emojis: $_"
    }
}

# Process Stickers
Write-Host "Processing Stickers..."
if (Test-Path "$BasePath/stickers.json") {
    try {
        $stickers = Get-Content "$BasePath/stickers.json" -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($sticker in $stickers) {
            $id = $sticker.id
            $name = Sanitize-Filename $sticker.name

            $files = Get-ChildItem "$BasePath/stickers/$id.*" -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                $extension = $file.Extension
                $newName = "$name$extension"
                $targetPath = Join-Path $file.Directory.FullName $newName

                if (-not (Test-Path $targetPath)) {
                    Rename-Item -LiteralPath $file.FullName -NewName $newName -ErrorAction SilentlyContinue
                    Write-Host "Renamed sticker $($file.Name) to $newName"
                } else {
                    Write-Warning "Skipped sticker $id ($name) - target file already exists"
                }
            }
        }
    } catch {
        Write-Error "Failed to process stickers: $_"
    }
}

# Process Sounds
Write-Host "Processing Sounds..."
if (Test-Path "$BasePath/sounds.json") {
    try {
        $sounds = Get-Content "$BasePath/sounds.json" -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($sound in $sounds) {
            $id = $sound.soundId
            $name = Sanitize-Filename $sound.name

            $files = Get-ChildItem "$BasePath/sounds/$id.*" -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                $extension = $file.Extension
                $newName = "$name$extension"
                $targetPath = Join-Path $file.Directory.FullName $newName

                if (-not (Test-Path $targetPath)) {
                    Rename-Item -LiteralPath $file.FullName -NewName $newName -ErrorAction SilentlyContinue
                    Write-Host "Renamed sound $($file.Name) to $newName"
                } else {
                    Write-Warning "Skipped sound $id ($name) - target file already exists"
                }
            }
        }
    } catch {
        Write-Error "Failed to process sounds: $_"
    }
}

Write-Host "Done!"
