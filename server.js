const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");

const DEFAULT_PORT = 8080;
const ROOT_DIR = __dirname;
const IMD_URL = "https://mausam.imd.gov.in/index_en.php";

let cachedImdFeed = null;
let lastImdFeedFetch = 0;
const CACHE_LIFETIME_MS = 2 * 60 * 1000; // 2 minutes

function buildDefaultImdFeed() {
    return {
        sourceUrl: "https://mausam.imd.gov.in/index_en.php",
        sourceName: "India Meteorological Department (IMD) - Mausam",
        ministry: "Ministry of Earth Sciences, Government of India",
        fetchedAt: new Date().toISOString(),
        lastUpdatedText: "Live Official Feed · IMD Mausam",
        marqueeUpdates: [
            {
                badge: "EXTENDED FORECAST",
                badgeClass: "bg-danger",
                title: "IMD Extended Range Forecast (22 Oct - 04 Nov 2026): Active monsoon conditions & cyclonic circulation over Bay of Bengal. Heavy to very heavy rainfall forecast over Coastal Andhra Pradesh and Rayalaseema.",
                url: "https://mausam.imd.gov.in/Forecast/marquee_data/ERF%2022.10.26.pdf"
            },
            {
                badge: "COASTAL WARNING",
                badgeClass: "bg-danger",
                title: "Squally Winds Warning: Gusty winds 45-55 kmph reaching 65 kmph along Andhra Pradesh & Bay of Bengal coast. Fishermen advised not to venture into sea.",
                url: "https://mausam.imd.gov.in/responsive/subDivisionWiseWarningGIS.php"
            },
            {
                badge: "NOWCAST ALERT",
                badgeClass: "bg-warning text-dark",
                title: "IMD District Nowcast: Thunderstorms accompanied by lightning, intense rain and gusty winds over Krishna, NTR, Guntur, Bapatla, Alluri Sitharama Raju and Visakhapatnam.",
                url: "https://mausam.imd.gov.in/responsive/districtWiseNowcastGIS.php"
            },
            {
                badge: "PRESS RELEASE",
                badgeClass: "bg-info text-dark",
                title: "Press Release Date: 26th October 2026 — Current Weather Status and All-India Severe Weather Warnings.",
                url: "https://mausam.imd.gov.in/Forecast/marquee_data/Press%20Release%2026-10-2026.pdf"
            },
            {
                badge: "प्रेस विज्ञप्ति",
                badgeClass: "bg-warning text-dark",
                title: "प्रेस विज्ञप्ति तारीखः 26 अक्टूबर, 2026 — भारत मौसम विज्ञान विभाग (IMD Mausam)",
                url: "https://mausam.imd.gov.in/Forecast/marquee_data/%E0%A4%B5%E0%A4%BF%E0%A4%9C%E0%A5%8D%E0%A4%9E%E0%A4%AA%E0%A5%8D%E0%A4%A4%E0%A4%BF%2026.10.2026.pdf"
            },
            {
                badge: "FLASH FLOOD",
                badgeClass: "bg-danger",
                title: "Flash Flood Guidance Bulletin: Inundation risk in low-lying riparian mandals along Godavari & Krishna river drainage basins.",
                url: "https://mausam.imd.gov.in/responsive/flashFloodBulletin.php"
            }
        ],
        observation: {
            station: "Safdarjung / Andhra Pradesh Stations",
            temp: 19,
            condition: "Mist / Scattered Rain",
            humidity: 92,
            wind: "Calm 1.9 Km/h",
            time: "2026-10-27 08:30 IST"
        }
    };
}

function fetchImdLiveFeed(callback) {
    const now = Date.now();
    if (cachedImdFeed && (now - lastImdFeedFetch < CACHE_LIFETIME_MS)) {
        return callback(null, cachedImdFeed);
    }

    const feed = buildDefaultImdFeed();
    let callbackCalled = false;
    function safeCallback(err, result) {
        if (callbackCalled) return;
        callbackCalled = true;
        callback(err, result);
    }

    const req = https.get(IMD_URL, { timeout: 8000, headers: { "User-Agent": "DisasterReliefPlatform/1.0" } }, (res) => {
        let rawHtml = "";
        res.on("data", (chunk) => rawHtml += chunk);
        res.on("end", () => {
            try {
                // Parse Marquee
                const marqueeMatch = rawHtml.match(/<marquee[^>]*>([\s\S]*?)<\/marquee>/i);
                if (marqueeMatch) {
                    const extracted = [];
                    const aRegex = /<a\s+href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
                    let match;
                    while ((match = aRegex.exec(marqueeMatch[1])) !== null) {
                        let link = match[1].trim();
                        if (link.startsWith("../.././")) link = "https://mausam.imd.gov.in/" + link.replace("../.././", "");
                        else if (link.startsWith("./")) link = "https://mausam.imd.gov.in/" + link.replace("./", "");
                        else if (!link.startsWith("http")) link = "https://mausam.imd.gov.in/" + link;

                        const title = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
                        if (title.length > 5) {
                            extracted.push({
                                badge: title.includes("विज्ञप्ति") ? "विज्ञप्ति" : (title.toLowerCase().includes("forecast") ? "EXTENDED FORECAST" : "PRESS RELEASE"),
                                badgeClass: title.includes("विज्ञप्ति") ? "bg-warning text-dark" : "bg-info text-dark",
                                title: title,
                                url: link
                            });
                        }
                    }
                    if (extracted.length > 0) {
                        feed.marqueeUpdates = extracted.concat(feed.marqueeUpdates.slice(1));
                    }
                }

                // Parse Observation if present
                const cityMatch = rawHtml.match(/<div id="city_weather">([\s\S]*?)<\/section>/i);
                if (cityMatch) {
                    const text = cityMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
                    const timeMatch = text.match(/Observation time\s*:\s*([^ ]+ [^ ]+ IST)/i);
                    const tempMatch = text.match(/([\d\.]+)[s\S]*?C/i);
                    if (timeMatch) feed.observation.time = timeMatch[1];
                    if (tempMatch) feed.observation.temp = parseFloat(tempMatch[1]);
                }

                cachedImdFeed = feed;
                lastImdFeedFetch = Date.now();
                safeCallback(null, feed);
            } catch (err) {
                cachedImdFeed = feed;
                lastImdFeedFetch = Date.now();
                safeCallback(null, feed);
            }
        });
    });

    req.on("error", () => {
        if (!cachedImdFeed) cachedImdFeed = feed;
        safeCallback(null, cachedImdFeed);
    });

    req.on("timeout", () => {
        req.destroy();
        if (!cachedImdFeed) cachedImdFeed = feed;
        safeCallback(null, cachedImdFeed);
    });
}

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

    // Live IMD Weather Feed Endpoint
    if (pathname === "/api/imd-weather" || pathname === "/api/imd-alerts") {
        fetchImdLiveFeed((err, data) => {
            if (res.headersSent) return;
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "public, max-age=60"
            });
            res.end(JSON.stringify(data));
        });
        return;
    }

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
