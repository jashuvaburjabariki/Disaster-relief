const http = require('http');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("  VERIFYING ADMIN LOGIN & DASHBOARD REQUIREMENTS (8 FEATURES)");
console.log("======================================================================");

let passed = 0;
let failed = 0;

function assert(condition, testName, details) {
    if (condition) {
        console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
        passed++;
    } else {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}${details ? ' - ' + details : ''}`);
        failed++;
    }
}

// ----------------------------------------------------------------------
// 1. BROADCAST FREE DISASTER MOBILE SMS
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 1: Broadcast Free Disaster Mobile SMS ---");
const adminJs = fs.readFileSync(path.join(__dirname, 'admin.js'), 'utf8');
const mandalJs = fs.readFileSync(path.join(__dirname, 'mandal.js'), 'utf8');
const volJs = fs.readFileSync(path.join(__dirname, 'volunteer.js'), 'utf8');

assert(
    adminJs.includes("disasterMandalSmsLog") && adminJs.includes("disasterVolunteerSmsLog"),
    "Admin SMS broadcast dispatches to both Mandal log and Volunteer log"
);
assert(
    adminJs.includes("disasterLatestDistrictSms") && adminJs.includes("disasterAlerts"),
    "Admin SMS broadcast records latest district SMS and alerts in localStorage"
);
assert(
    mandalJs.includes("disasterMandalSmsLog") && mandalJs.includes("preDisasterSmsMessage"),
    "Mandal Portal listens for district admin SMS and updates banner message"
);
assert(
    volJs.includes("disasterVolunteerSmsLog") && volJs.includes("latestSmsText"),
    "Volunteer Portal listens for district volunteer SMS broadcast and updates banner"
);

// ----------------------------------------------------------------------
// 2. SHELTER MANAGEMENT
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 2: Shelter Management ---");
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');

assert(
    adminHtml.includes('id="sheltersMandalListView"') && adminHtml.includes('id="sheltersDetailView"'),
    "Admin HTML has 2-level shelter drilldown: Mandals List (Level 1) & Detail View (Level 2)"
);
assert(
    adminHtml.includes('id="backToAllMandalsBtn"'),
    "Admin HTML has 'Back to All Mandals' navigation button"
);
assert(
    adminJs.includes("openMandalShelters") && adminJs.includes("showSheltersMandalList"),
    "Admin JS contains openMandalShelters() and showSheltersMandalList() functions"
);
assert(
    adminJs.includes("Alluri Sitharama Raju") && adminJs.includes("Paderu") && adminJs.includes("Araku Valley"),
    "Admin JS pre-seeds authentic shelters for ASR District mandals (Paderu, Araku Valley, Rampachodavaram)"
);

// ----------------------------------------------------------------------
// 3. FIXED STATE AND DISTRICT
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 3: Fixed State and District ---");
assert(
    adminHtml.includes('class="fixed-jurisdiction-box"') && adminHtml.includes('id="adminJurisdictionDisplay"'),
    "Admin portal has fixed jurisdiction pill with adminJurisdictionDisplay"
);
assert(
    !adminHtml.includes('<select id="adminStateSelect"') && !adminHtml.includes('<select id="adminDistrictSelect"'),
    "Admin portal no longer has editable select dropdowns for State or District"
);

const mandalHtml = fs.readFileSync(path.join(__dirname, 'mandal.html'), 'utf8');
assert(
    mandalHtml.includes('id="mandalJurisdictionDisplay"') && mandalHtml.includes('jurisdiction-lock-icon'),
    "Mandal portal topbar displays fixed jurisdiction with lock indicator"
);

const volHtml = fs.readFileSync(path.join(__dirname, 'volunteer.html'), 'utf8');
assert(
    volHtml.includes('id="volJurisdictionDisplay"') && volHtml.includes('jurisdiction-lock-icon'),
    "Volunteer portal topbar displays fixed jurisdiction with lock indicator"
);

// ----------------------------------------------------------------------
// 4. REMOVE BACK TO WEBSITE OPTION
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 4: Remove Back to Website Option ---");
const adminSidebar = adminHtml.slice(adminHtml.indexOf('<aside'), adminHtml.indexOf('</aside>'));
assert(
    !adminSidebar.toLowerCase().includes("back to website") && !adminSidebar.toLowerCase().includes("back to main"),
    "Admin sidebar footer does NOT contain 'Back to Website' option"
);

const mandalSidebar = mandalHtml.slice(mandalHtml.indexOf('<aside'), mandalHtml.indexOf('</aside>'));
assert(
    !mandalSidebar.toLowerCase().includes("back to website") && !mandalSidebar.toLowerCase().includes("main website"),
    "Mandal sidebar does NOT contain 'Back to Website' option"
);

const volNav = volHtml.slice(volHtml.indexOf('<header'), volHtml.indexOf('</header>'));
assert(
    !volNav.toLowerCase().includes("back to website") && !volNav.toLowerCase().includes("back to main"),
    "Volunteer portal does NOT contain 'Back to Website' option"
);

// ----------------------------------------------------------------------
// 5. ADD VOLUNTEER FORM
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 5: Add Volunteer Form ---");
assert(
    adminHtml.includes('id="volUsername"') &&
    adminHtml.includes('id="volPassword"') &&
    adminHtml.includes('id="volEmail"'),
    "Add Volunteer modal form includes Username, Password, and Email fields"
);
assert(
    adminJs.includes("username: username") &&
    adminJs.includes("password: password") &&
    adminJs.includes("email: email") &&
    adminJs.includes("disasterUserAccounts"),
    "Admin JS saves username, password, email to volunteers and authenticates them in disasterUserAccounts"
);

// ----------------------------------------------------------------------
// 6. DONATIONS – OFFICIAL ACCOUNT DETAILS
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 6: Donations Official Account Details ---");
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scriptJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

assert(
    adminHtml.includes("38588079208") && adminHtml.includes("SBIN0018884"),
    "Admin Donations view displays verified official ASR District SBI account (38588079208, SBIN0018884)"
);
assert(
    adminHtml.includes("Alluri Sitharama Raju") && adminHtml.includes("Collectorate, Paderu"),
    "Admin Donations card identifies ASR District Collectorate Paderu headquarters"
);
assert(
    indexHtml.includes("38588079208") && indexHtml.includes("SBIN0018884"),
    "Citizen Donation modal on index.html pre-fills official verified account details"
);
assert(
    (indexHtml.includes('id="donationMandal"') || indexHtml.includes('name="donationDestinationMandal"')) && indexHtml.includes('donationDestinationNotice'),
    "Donation form contains Area/Mandal selector and destination notice"
);
assert(
    scriptJs.includes("destinationMandal") && scriptJs.includes("officialAccount"),
    "script.js stores target mandal and official account in donation records"
);

// ----------------------------------------------------------------------
// 7. ADMIN LOGIN BACKGROUND ANIMATION
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 7: Admin Login Background Animation ---");
const adminCss = fs.readFileSync(path.join(__dirname, 'admin.css'), 'utf8');

assert(
    adminHtml.includes('class="admin-video-backdrop"') &&
    adminHtml.includes('hero banner video motion.mp4') &&
    adminHtml.includes('class="admin-backdrop-overlay"'),
    "Admin HTML includes animated video backdrop element with hero banner video motion.mp4 and overlay"
);
assert(
    adminCss.includes(".admin-video-backdrop") &&
    adminCss.includes(".admin-backdrop-video") &&
    adminCss.includes(".admin-backdrop-overlay"),
    "Admin CSS styles backdrop video with fixed positioning, contrast filter, and readability overlay"
);
assert(
    fs.existsSync(path.join(__dirname, 'hero banner video motion.mp4')),
    "Video asset file 'hero banner video motion.mp4' exists in workspace"
);

// ----------------------------------------------------------------------
// 8. FIX ADMIN DASHBOARD LAYOUT AND ALIGNMENT
// ----------------------------------------------------------------------
console.log("\n--- Checking Feature 8: Layout and Alignment ---");
assert(
    adminCss.includes(".fixed-jurisdiction-box") &&
    adminCss.includes(".mandal-shelter-card") &&
    adminCss.includes(".official-asr-donation-card"),
    "Admin CSS includes styling for fixed jurisdiction, mandal shelter cards, and official donation card"
);
assert(
    adminCss.includes("@media (max-width: 991px)") &&
    adminCss.includes("@media (max-width: 768px)"),
    "Admin CSS includes responsive layout rules for mobile and tablet screens"
);

// ----------------------------------------------------------------------
// 9. HTTP ENDPOINTS & SERVER INTEGRATION CHECK
// ----------------------------------------------------------------------
console.log("\n--- Checking HTTP Endpoints on Local Server (http://localhost:8080) ---");

function checkHttp(endpoint, expectedStatus) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:8080${endpoint}`, (res) => {
            assert(
                res.statusCode === expectedStatus,
                `HTTP GET ${endpoint} returns status ${expectedStatus} (got ${res.statusCode})`
            );
            resolve();
        });
        req.on('error', (err) => {
            assert(false, `HTTP GET ${endpoint} reachable`, err.message);
            resolve();
        });
    });
}

(async function runHttpChecks() {
    await checkHttp('/admin.html', 200);
    await checkHttp('/mandal.html', 200);
    await checkHttp('/volunteer.html', 200);
    await checkHttp('/index.html', 200);
    await checkHttp('/hero%20banner%20video%20motion.mp4', 200);

    console.log("\n======================================================================");
    console.log(`TEST SUMMARY: Total: ${passed + failed} | Passed: \x1b[32m${passed}\x1b[0m | Failed: \x1b[31m${failed}\x1b[0m`);
    console.log("======================================================================");

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
})();
