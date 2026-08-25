/**
 * win-print-bridge.ts
 *
 * Server-side (Node.js on Windows) bridge that sends raw ESC/POS bytes
 * to a thermal printer via two strategies:
 *
 * STRATEGY 1 — Direct usbprint.sys (GUID_DEVINTERFACE_USBPRINT):
 *   Uses SetupAPI to enumerate USB printers registered under usbprint.sys,
 *   then calls CreateFile on the device interface path and writes bytes directly.
 *   Works even when the printer is NOT installed in the Windows Print Spooler.
 *   No Zadig, no WinUSB, no driver replacement. Windows' own usbprint.sys handles it.
 *
 * STRATEGY 2 — Windows Print Spooler (Winspool RAW):
 *   Classic OpenPrinter → StartDocPrinter("RAW") → WritePrinter flow.
 *   Used when the printer IS installed in the Windows Spooler (vendor driver installed).
 *
 * listWindowsPrinters() returns both Spooler-installed printers AND
 * raw usbprint.sys devices so the user can pick from either.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// ─── Inline C# compiled at runtime via Add-Type ──────────────────────────────

const CSHARP_SOURCE = `
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;

// ── Winspool RAW (for Spooler-installed printers) ──────────────────────────
public class WinSpoolRaw {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint="OpenPrinterA", SetLastError=true,
        CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool OpenPrinter(
        [MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint="ClosePrinter", SetLastError=true,
        ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint="StartDocPrinterA", SetLastError=true,
        CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(
        IntPtr hPrinter, Int32 level,
        [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

    [DllImport("winspool.Drv", EntryPoint="EndDocPrinter", SetLastError=true,
        ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint="StartPagePrinter", SetLastError=true,
        ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint="EndPagePrinter", SetLastError=true,
        ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint="WritePrinter", SetLastError=true,
        ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool WritePrinter(
        IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

    public static bool SendBytesToPrinter(string szPrinterName, byte[] data) {
        IntPtr hPrinter = IntPtr.Zero;
        var di = new DOCINFOA { pDocName = "ESC/POS Receipt", pOutputFile = null, pDataType = "RAW" };
        bool bSuccess = false;
        if (!OpenPrinter(szPrinterName, out hPrinter, IntPtr.Zero)) return false;
        try {
            if (StartDocPrinter(hPrinter, 1, di)) {
                try {
                    if (StartPagePrinter(hPrinter)) {
                        IntPtr pBytes = Marshal.AllocCoTaskMem(data.Length);
                        try {
                            Marshal.Copy(data, 0, pBytes, data.Length);
                            Int32 written = 0;
                            bSuccess = WritePrinter(hPrinter, pBytes, data.Length, out written);
                        } finally { Marshal.FreeCoTaskMem(pBytes); }
                        EndPagePrinter(hPrinter);
                    }
                } finally { EndDocPrinter(hPrinter); }
            }
        } finally { ClosePrinter(hPrinter); }
        return bSuccess;
    }
}

// ── Direct usbprint.sys via SetupAPI + CreateFile ──────────────────────────
public class UsbPrintDirect {
    // GUID_DEVINTERFACE_USBPRINT
    static readonly Guid GUID_USBPRINT = new Guid("{28D78FAD-5A12-11D1-AE5B-0000F803A8C2}");

    const uint DIGCF_PRESENT         = 0x02;
    const uint DIGCF_DEVICEINTERFACE = 0x10;
    const uint GENERIC_WRITE         = 0x40000000;
    const uint FILE_SHARE_READ       = 0x01;
    const uint OPEN_EXISTING         = 3;
    static readonly IntPtr INVALID_HANDLE = new IntPtr(-1);

    [StructLayout(LayoutKind.Sequential)]
    struct SP_DEVICE_INTERFACE_DATA {
        public uint cbSize;
        public Guid InterfaceClassGuid;
        public uint Flags;
        public IntPtr Reserved;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    struct SP_DEVICE_INTERFACE_DETAIL_DATA {
        public uint cbSize;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 512)]
        public string DevicePath;
    }

    [DllImport("setupapi.dll", SetLastError = true)]
    static extern IntPtr SetupDiGetClassDevs(
        ref Guid ClassGuid, IntPtr Enumerator, IntPtr hwndParent, uint Flags);

    [DllImport("setupapi.dll", SetLastError = true)]
    static extern bool SetupDiEnumDeviceInterfaces(
        IntPtr DeviceInfoSet, IntPtr DeviceInfoData,
        ref Guid InterfaceClassGuid, uint MemberIndex,
        ref SP_DEVICE_INTERFACE_DATA DeviceInterfaceData);

    [StructLayout(LayoutKind.Sequential)]
    struct SP_DEVINFO_DATA {
        public uint cbSize;
        public Guid classGuid;
        public uint devInst;
        public IntPtr reserved;
    }

    [DllImport("setupapi.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern bool SetupDiGetDeviceInterfaceDetail(
        IntPtr DeviceInfoSet, ref SP_DEVICE_INTERFACE_DATA DeviceInterfaceData,
        IntPtr DeviceInterfaceDetailData, uint DeviceInterfaceDetailDataSize,
        out uint RequiredSize, IntPtr DeviceInfoData);

    [DllImport("setupapi.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern bool SetupDiGetDeviceInterfaceDetail(
        IntPtr DeviceInfoSet, ref SP_DEVICE_INTERFACE_DATA DeviceInterfaceData,
        ref SP_DEVICE_INTERFACE_DETAIL_DATA DeviceInterfaceDetailData,
        uint DeviceInterfaceDetailDataSize, out uint RequiredSize, ref SP_DEVINFO_DATA DeviceInfoData);

    [DllImport("setupapi.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern bool SetupDiGetDeviceRegistryProperty(
        IntPtr DeviceInfoSet, ref SP_DEVINFO_DATA DeviceInfoData,
        uint Property, out uint PropertyRegDataType,
        byte[] PropertyBuffer, uint PropertyBufferSize, out uint RequiredSize);

    const uint SPDRP_DEVICEDESC = 0x00000000;
    const uint SPDRP_FRIENDLYNAME = 0x0000000C;

    [DllImport("setupapi.dll")]
    static extern bool SetupDiDestroyDeviceInfoList(IntPtr DeviceInfoSet);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern IntPtr CreateFile(
        string lpFileName, uint dwDesiredAccess, uint dwShareMode,
        IntPtr lpSecurityAttributes, uint dwCreationDisposition,
        uint dwFlagsAndAttributes, IntPtr hTemplateFile);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool WriteFile(
        IntPtr hFile, byte[] lpBuffer, uint nNumberOfBytesToWrite,
        out uint lpNumberOfBytesWritten, IntPtr lpOverlapped);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool CloseHandle(IntPtr hObject);

    static string GetStringPropertyForDevice(IntPtr devInfo, ref SP_DEVINFO_DATA devData, uint propId) {
        uint type;
        uint reqSize;
        SetupDiGetDeviceRegistryProperty(devInfo, ref devData, propId, out type, null, 0, out reqSize);
        if (reqSize == 0) return null;
        byte[] buffer = new byte[reqSize];
        if (SetupDiGetDeviceRegistryProperty(devInfo, ref devData, propId, out type, buffer, reqSize, out reqSize)) {
            return System.Text.Encoding.Unicode.GetString(buffer).TrimEnd((char)0);
        }
        return null;
    }

    public static List<string> GetDevices() {
        var devices = new List<string>();
        Guid g = GUID_USBPRINT;
        IntPtr devInfo = SetupDiGetClassDevs(ref g, IntPtr.Zero, IntPtr.Zero,
            DIGCF_PRESENT | DIGCF_DEVICEINTERFACE);
        if (devInfo == INVALID_HANDLE) {
            Console.WriteLine("DEBUG: INVALID_HANDLE from SetupDiGetClassDevs");
            return devices;
        }
        try {
            var ifData = new SP_DEVICE_INTERFACE_DATA();
            ifData.cbSize = (uint)Marshal.SizeOf(ifData);
            uint idx = 0;
            while (SetupDiEnumDeviceInterfaces(devInfo, IntPtr.Zero, ref g, idx++, ref ifData)) {
                uint size = 0;
                SetupDiGetDeviceInterfaceDetail(devInfo, ref ifData, IntPtr.Zero, 0, out size, IntPtr.Zero);
                var detail = new SP_DEVICE_INTERFACE_DETAIL_DATA();
                detail.cbSize = IntPtr.Size == 8 ? 8u : 6u;
                
                var devData = new SP_DEVINFO_DATA();
                devData.cbSize = (uint)Marshal.SizeOf(devData);

                if (SetupDiGetDeviceInterfaceDetail(devInfo, ref ifData, ref detail, size, out size, ref devData)) {
                    string path = detail.DevicePath;
                    string name = GetStringPropertyForDevice(devInfo, ref devData, SPDRP_FRIENDLYNAME);
                    if (string.IsNullOrEmpty(name)) name = GetStringPropertyForDevice(devInfo, ref devData, SPDRP_DEVICEDESC);
                    if (string.IsNullOrEmpty(name)) name = "Unknown USB Printer";
                    
                    devices.Add(path + "[USB_SEP]" + name);
                } else {
                    Console.WriteLine("DEBUG: SetupDiGetDeviceInterfaceDetail second call failed");
                }
            }
            if (idx == 1) {
                Console.WriteLine("DEBUG: Found 0 devices in SetupDiEnumDeviceInterfaces");
            }
        } finally {
            SetupDiDestroyDeviceInfoList(devInfo);
        }
        return devices;
    }

    public static string SendBytes(string devicePath, byte[] data) {
        IntPtr hFile = CreateFile(devicePath, GENERIC_WRITE, FILE_SHARE_READ,
            IntPtr.Zero, OPEN_EXISTING, 0, IntPtr.Zero);
        if (hFile == INVALID_HANDLE) {
            int err = Marshal.GetLastWin32Error();
            return "OPEN_FAILED:" + err;
        }
        try {
            uint written = 0;
            if (!WriteFile(hFile, data, (uint)data.Length, out written, IntPtr.Zero)) {
                int err = Marshal.GetLastWin32Error();
                return "WRITE_FAILED:" + err;
            }
            return "OK:" + written;
        } finally {
            CloseHandle(hFile);
        }
    }
}
`;

// ─── PowerShell runner ────────────────────────────────────────────────────────

function runPowerShell(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ps = spawn('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script,
    ]);
    let stdout = '';
    let stderr = '';
    ps.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    ps.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    ps.on('close', (code: number) => {
      if (code !== 0) reject(new Error(`PowerShell exited ${code}: ${(stderr || stdout).trim()}`));
      else resolve(stdout.trim());
    });
    ps.on('error', (err: Error) => reject(new Error(`Failed to spawn PowerShell: ${err.message}`)));
  });
}

// Build the Add-Type block (compiled once per PS process)
function addTypeScript(): string {
  return `
$csharp = @'
${CSHARP_SOURCE}
'@
if (-not ([System.Management.Automation.PSTypeName]'UsbPrintDirect').Type) {
    Add-Type -TypeDefinition $csharp -Language CSharp -ReferencedAssemblies @('System.Collections')
}
`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface PrinterEntry {
  name: string;         // Display name shown in UI
  kind: 'spooler' | 'usbdirect'; // How to print
  devicePath?: string;  // For usbdirect: SetupAPI device path
}

/**
 * Returns all printable destinations:
 *   - Printers in the Windows Print Spooler (kind=spooler)
 *   - USB devices registered under usbprint.sys (kind=usbdirect)
 */
export async function listWindowsPrinters(): Promise<string[]> {
  const script = `
${addTypeScript()}
$results = @()

# Spooler-installed printers
try {
    $spooler = Get-Printer | Select-Object -ExpandProperty Name
    foreach ($p in $spooler) { $results += "SPOOLER|" + $p }
} catch {}

# Direct usbprint.sys devices
$usbDevices = [UsbPrintDirect]::GetDevices()
foreach ($dev in $usbDevices) {
    $parts = $dev.Split([string[]]@('[USB_SEP]'), [System.StringSplitOptions]::None)
    if ($parts.Length -eq 2) {
        $results += "USBDIRECT|" + $parts[1] + "|" + $parts[0]
    }
}

$results | ForEach-Object { Write-Output $_ }
`;

  try {
    const out = await runPowerShell(script);
    if (!out) return [];

    const lines = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const names: string[] = [];

    for (const line of lines) {
      if (line.startsWith('SPOOLER|')) {
        names.push(line.substring('SPOOLER|'.length));
      } else if (line.startsWith('USBDIRECT|')) {
        const parts = line.split('|');
        names.push(parts[1]); // Friendly name like "USB Thermal Printer #1"
      }
    }
    return names;
  } catch (e: any) {
    console.warn('[win-print-bridge] listWindowsPrinters failed:', e.message);
    return [];
  }
}

/**
 * Resolves a printer display name back to its kind + devicePath.
 * Used internally before printing.
 */
async function resolvePrinter(printerName: string): Promise<{ kind: 'spooler' | 'usbdirect'; devicePath?: string }> {
  const script = `
${addTypeScript()}
$results = @()
try {
    $spooler = Get-Printer | Select-Object -ExpandProperty Name
    foreach ($p in $spooler) { $results += "SPOOLER|" + $p }
} catch {}
try {
    $usbDevices = [UsbPrintDirect]::GetDevices()
    foreach ($dev in $usbDevices) {
        $parts = $dev.Split([string[]]@('[USB_SEP]'), [System.StringSplitOptions]::None)
        if ($parts.Length -eq 2) {
            $results += "USBDIRECT|" + $parts[1] + "|" + $parts[0]
        }
    }
} catch {}
$results | ForEach-Object { Write-Output $_ }
`;

  const out = await runPowerShell(script);
  const lines = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('SPOOLER|')) {
      const name = line.substring('SPOOLER|'.length);
      if (name === printerName) return { kind: 'spooler' };
    } else if (line.startsWith('USBDIRECT|')) {
      const parts = line.split('|');
      const name = parts[1];
      const devicePath = parts[2];
      if (name === printerName) return { kind: 'usbdirect', devicePath };
    }
  }

  // Fallback: treat as spooler name
  return { kind: 'spooler' };
}

/**
 * Sends raw ESC/POS bytes to the given printer (by display name).
 * Automatically uses usbprint.sys direct path if it's a USB device,
 * or Winspool RAW if it's a Spooler-installed printer.
 */
export async function sendRawToWindowsPrinter(
  printerName: string,
  data: Buffer
): Promise<void> {
  const resolved = await resolvePrinter(printerName);

  // Write ESC/POS bytes to a temp file (forward slashes — work fine in PowerShell)
  const tmpFile = path.join(os.tmpdir(), `escpos_${Date.now()}.bin`).replace(/\\/g, '/');
  fs.writeFileSync(tmpFile, data);

  let script: string;

  if (resolved.kind === 'usbdirect' && resolved.devicePath) {
    // ── Strategy 1: Direct usbprint.sys write ──────────────────────────────
    const safeDevicePath = resolved.devicePath.replace(/'/g, "''");
    script = `
$ErrorActionPreference = 'Stop'
${addTypeScript()}
$tmpFile = '${tmpFile}'
try {
    $bytes = [System.IO.File]::ReadAllBytes($tmpFile)
    $result = [UsbPrintDirect]::SendBytes('${safeDevicePath}', $bytes)
    if ($result.StartsWith('OK')) {
        Write-Output "OK:$result"
    } else {
        throw "Direct USB write failed: $result"
    }
} finally {
    if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }
}
`;
  } else {
    // ── Strategy 2: Winspool RAW (Spooler-installed printer) ──────────────
    const safePrinterName = printerName.replace(/'/g, "''");
    script = `
$ErrorActionPreference = 'Stop'
${addTypeScript()}
$tmpFile = '${tmpFile}'
try {
    $bytes = [System.IO.File]::ReadAllBytes($tmpFile)
    $ok = [WinSpoolRaw]::SendBytesToPrinter('${safePrinterName}', $bytes)
    if (-not $ok) {
        $err = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()
        throw "WinSpool WritePrinter failed. Win32 error: $err"
    }
    Write-Output "OK"
} finally {
    if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }
}
`;
  }

  try {
    const result = await runPowerShell(script);
    if (!result.startsWith('OK')) {
      throw new Error(`Unexpected bridge output: ${result}`);
    }
    console.log(`[win-print-bridge] Printed to "${printerName}" (${resolved.kind}): ${result}`);
  } catch (e: any) {
    try { fs.unlinkSync(tmpFile.replace(/\//g, '\\')); } catch {}
    throw new Error(`Windows print failed [${resolved.kind}]: ${e.message}`);
  }
}
