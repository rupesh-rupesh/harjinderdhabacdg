import { spawn } from 'child_process';
import fs from 'fs';

const CSHARP_SOURCE = fs.readFileSync('src/lib/win-print-bridge.ts', 'utf8').match(/const CSHARP_SOURCE = `\r?\n(.*?)\r?\n`;/s)[1];

const script = `
$csharp = @'
${CSHARP_SOURCE}
'@
if (-not ([System.Management.Automation.PSTypeName]'UsbPrintDirect').Type) {
    Add-Type -TypeDefinition $csharp -Language CSharp -ReferencedAssemblies @('System.Collections')
}
$usbDevices = [UsbPrintDirect]::GetDevices()
$usbDevices | ForEach-Object { Write-Output $_ }
`;

const ps = spawn('powershell.exe', [
  '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script,
]);
let stdout = '';
let stderr = '';
ps.stdout.on('data', d => stdout += d.toString());
ps.stderr.on('data', d => stderr += d.toString());
ps.on('close', code => {
  console.log("CODE:", code);
  console.log("STDOUT:", stdout);
  console.log("STDERR:", stderr);
});
