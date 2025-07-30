// server.js
const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

// CORS ayarları
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// M3U playlist endpoint
app.get('/playlist.m3u', (req, res) => {
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(`#EXTM3U
#EXTINF:-1 tvg-logo="https://kick.com/favicon.ico" group-title="Kick Streams",İlker Fırat
${req.protocol}://${req.get('host')}/kick/ilkerfirat
#EXTINF:-1 tvg-logo="https://kick.com/favicon.ico" group-title="Kick Streams",İkinci Yayıncı
${req.protocol}://${req.get('host')}/kick/IKINCI_YAYINCI_ADI`);
});

// Kick stream proxy
app.get('/kick/:channel', (req, res) => {
    const channel = req.params.channel;
    console.log(`Stream request for: ${channel}`);
    
    // Stream headers
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // yt-dlp process
    const ytdlp = spawn('yt-dlp', [
        '--output', '-',
        '--format', 'best[ext=mp4]/best',
        `https://kick.com/${channel}`
    ]);
    
    // Pipe stream to response
    ytdlp.stdout.pipe(res);
    
    // Error handling
    ytdlp.stderr.on('data', (data) => {
        console.error(`yt-dlp error: ${data}`);
    });
    
    ytdlp.on('close', (code) => {
        console.log(`yt-dlp process exited with code ${code}`);
        if (!res.headersSent) {
            res.status(500).send('Stream ended');
        }
    });
    
    // Cleanup on client disconnect
    req.on('close', () => {
        ytdlp.kill();
    });
});

// Health check
app.get('/', (req, res) => {
    res.send(`
    <h1>Kick Stream Proxy</h1>
    <p>✅ Server running</p>
    <p>📺 Playlist: <a href="/playlist.m3u">/playlist.m3u</a></p>
    <p>🎮 İlker Fırat: <a href="/kick/ilkerfirat">/kick/ilkerfirat</a></p>
    <p>🎮 İkinci Yayıncı: <a href="/kick/IKINCI_YAYINCI_ADI">/kick/IKINCI_YAYINCI_ADI</a></p>
    `);
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
