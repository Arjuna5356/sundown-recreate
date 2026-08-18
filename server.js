const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = process.cwd();

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function resolvePath(reqUrl) {
    let cleanUrl = reqUrl.split('?')[0].split('#')[0];
    if (cleanUrl === '/' || cleanUrl === '') {
        return path.join(PUBLIC_DIR, 'index.html');
    }

    let decoded = decodeURIComponent(cleanUrl);
    let target = path.join(PUBLIC_DIR, decoded);

    // Special case: /work or /work/ should serve work.html
    if (decoded === '/work' || decoded === '/work/') {
        const workHtml = path.join(PUBLIC_DIR, 'work.html');
        if (fs.existsSync(workHtml) && fs.statSync(workHtml).isFile()) {
            return workHtml;
        }
    }

    // 1. Direct file check
    if (fs.existsSync(target)) {
        const stat = fs.statSync(target);
        if (stat.isFile()) return target;
        if (stat.isDirectory()) {
            // Check for index.html inside directory
            const dirIndex = path.join(target, 'index.html');
            if (fs.existsSync(dirIndex) && fs.statSync(dirIndex).isFile()) {
                return dirIndex;
            }
        }
    }

    // 2. Try with .html extension
    const withHtml = target + '.html';
    if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
        return withHtml;
    }

    return null;
}

const server = http.createServer((req, res) => {
    try {
        const resolved = resolvePath(req.url);

        if (!resolved || !resolved.startsWith(PUBLIC_DIR)) {
            // Serve 404
            const notFoundPath = path.join(PUBLIC_DIR, '404.html');
            fs.readFile(notFoundPath, (err404, data404) => {
                if (err404) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                    res.end(data404);
                }
            });
            return;
        }

        const stats = fs.statSync(resolved);
        const ext = path.extname(resolved).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Support video byte ranges for smooth streaming
        const range = req.headers.range;
        if (range && ext === '.mp4') {
            const total = stats.size;
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
            const chunksize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType
            });

            const stream = fs.createReadStream(resolved, { start, end });
            stream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': stats.size,
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });

            const stream = fs.createReadStream(resolved);
            stream.pipe(res);
        }
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Sundown Studio local server is live!`);
    console.log(`   URL: http://localhost:${PORT}\n`);
});
