$content = Get-Content 'src\lib\win-print-bridge.ts' -Raw
if ($content -match '(?ms)const CSHARP_SOURCE = `\r?\n(.*?)\r?\n`;') {
    $csharp = $matches[1]
    Add-Type -TypeDefinition $csharp -Language CSharp
    [UsbPrintDirect]::GetDevices()
} else {
    Write-Host "No match found"
}
