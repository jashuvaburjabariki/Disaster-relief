const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const DEFAULT_PORT = 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf"
};

function serveFile(req, res, filePath) {
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            res.end("<h1>404 Not Found</h1><p>The requested file does not exist.</p><p><a href='/'>Return to Home</a></p>");
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        // Video Range Request handling (smooth video streaming)
        const range = req.headers.range;
        if (range && (ext === ".mp4" || ext === ".webm")) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            const chunkSize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${stats.size}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": contentType
            });
            fileStream.pipe(res);
            return;
        }

        res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": contentType,
            "Cache-Control": "no-cache"
        });
        fs.createReadStream(filePath).pipe(res);
    });
}

const server = http.createServer((req, res) => {
    // CORS headers for local development
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === "/") {
        pathname = "/index.html";
    }

    const safePath = path.normalize(path.join(ROOT_DIR, pathname));
    if (!safePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("403 Forbidden");
        return;
    }

    serveFile(req, res, safePath);
});

function startServer(port) {
    server.listen(port, () => {
        console.log(`\n======================================================`);
        console.log(`  DISASTER RELIEF PLATFORM IS LIVE LOCALLY!`);
        console.log(`  -> URL: http://localhost:${port}`);
        console.log(`  -> Admin: http://localhost:${port}/admin.html`);
        console.log(`  -> Volunteer: http://localhost:${port}/volunteer.html`);
        console.log(`  -> About: http://localhost:${port}/about.html`);
        console.log(`======================================================\n`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error("Server error:", err);
        }
    });
}

startServer(DEFAULT_PORT);
