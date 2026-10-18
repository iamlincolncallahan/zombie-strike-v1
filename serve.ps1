param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Dead Hours is running at http://localhost:$Port - press Ctrl+C to stop."
try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $client.ReceiveTimeout = 3000
        $stream = $client.GetStream()
        $reader = [IO.StreamReader]::new($stream)
        try { $request = $reader.ReadLine() } catch { $client.Close(); continue }
        if (-not $request) { $client.Close(); continue }
        while ($reader.ReadLine()) { }
        $relative = [Uri]::UnescapeDataString(($request.Split(' ')[1].Split('?')[0])).TrimStart('/')
        if (-not $relative) { $relative = 'index.html' }
        $path = [IO.Path]::GetFullPath((Join-Path $root $relative))
        if (-not $path.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or -not [IO.File]::Exists($path)) {
            $status = '404 Not Found'
            $contentType = 'text/plain'
            $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
        } else {
            $types = @{ '.html'='text/html'; '.js'='text/javascript'; '.css'='text/css'; '.jpg'='image/jpeg'; '.png'='image/png'; '.svg'='image/svg+xml' }
            $status = '200 OK'
            $contentType = $types[[IO.Path]::GetExtension($path)]
            if (-not $contentType) { $contentType = 'application/octet-stream' }
            $bytes = [IO.File]::ReadAllBytes($path)
        }
        $header = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n")
        try { $stream.Write($header, 0, $header.Length); $stream.Write($bytes, 0, $bytes.Length) } catch { }
        $client.Close()
    }
} finally { $listener.Stop() }
