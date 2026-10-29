// ========================================================
// MANDAL OFFICER PORTAL LOGIC & AUTO-ROUTING SYSTEM
// ========================================================

let currentMandal = null;
let pendingOfficerPhotoDraft = null; // Buffered profile picture for delayed save
let activeView = "dashboard";
let reqOverviewModalInstance = null;
let volOverviewModalInstance = null;
let idCardModalInstance = null;
let activeOverviewRequestId = null;

// ========================================================
// 1. HELPERS & STORAGE MANAGEMENT
// ========================================================
function readRecords(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
        return [];
    }
}

function writeRecords(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Error writing records to " + key, e);
    }
}

function escapeHtml(str) {
    return String(str || "").replace(/[&<>'"]/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
}

function showToast(message) {
    const toast = document.getElementById("mandalToast");
    const msgEl = document.getElementById("mandalToastMsg");
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.add("show");
    setTimeout(function () {
        toast.classList.remove("show");
    }, 3200);
}

function downloadCsvFile(csvContent, filename) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}.`);
}

// Default Data Seed Fallbacks (Matching Admin Portal & Mandal Jurisdictions)
const defaultSheltersData = [
    // ALLURI SITHARAMA RAJU (ASR) DISTRICT SHELTERS (11 TARGET MANDALS)
    { id: 101, district: "Alluri Sitharama Raju", mandal: "Paderu", name: "Paderu Tribal Welfare Residential School Shelter", location: "Collectorate Road, Paderu", capacity: 350, occupied: 180, contact: "08935-242222", status: "Active" },
    { id: 102, district: "Alluri Sitharama Raju", mandal: "Paderu", name: "Paderu ITDA Community Cyclone & Flood Shelter", location: "ITDA Grounds, Paderu", capacity: 250, occupied: 110, contact: "08935-242333", status: "Active" },
    { id: 103, district: "Alluri Sitharama Raju", mandal: "Araku Valley", name: "Araku Valley Emergency Relief Camp & Youth Centre", location: "Main Road, Araku Valley", capacity: 300, occupied: 140, contact: "08936-249111", status: "Active" },
    { id: 104, district: "Alluri Sitharama Raju", mandal: "Araku Valley", name: "Araku Hill Station High Ground Shelter", location: "Padmapuram Junction, Araku", capacity: 200, occupied: 65, contact: "08936-249222", status: "Active" },
    { id: 105, district: "Alluri Sitharama Raju", mandal: "Ananthagiri", name: "Ananthagiri Ghats Emergency Evacuation Shelter", location: "Coffee Board Campus, Ananthagiri", capacity: 160, occupied: 50, contact: "08936-244010", status: "Active" },
    { id: 106, district: "Alluri Sitharama Raju", mandal: "Chintapalle (Chinthapalli)", name: "Chintapalle Hill Area Disaster Relief Depot & Shelter", location: "Bus Stand Road, Chintapalle", capacity: 220, occupied: 75, contact: "08937-241050", status: "Active" },
    { id: 107, district: "Alluri Sitharama Raju", mandal: "Dumbriguda", name: "Dumbriguda Tribal Community Cyclone Refuge", location: "Govt High School, Dumbriguda", capacity: 200, occupied: 45, contact: "08936-247111", status: "Active" },
    { id: 108, district: "Alluri Sitharama Raju", mandal: "G. Madugula", name: "G. Madugula Agency Flood Relief Shelter", location: "Main Junction, G. Madugula", capacity: 210, occupied: 60, contact: "08935-245020", status: "Active" },
    { id: 109, district: "Alluri Sitharama Raju", mandal: "Gudem Kotha Veedhi (G.K. Veedhi)", name: "G.K. Veedhi Tribal High School Relief Shelter", location: "Ashram High School, G.K. Veedhi", capacity: 200, occupied: 60, contact: "08937-247015", status: "Active" },
    { id: 110, district: "Alluri Sitharama Raju", mandal: "Hukumpeta", name: "Hukumpeta High Ground Evacuation Center", location: "Mandal Office Road, Hukumpeta", capacity: 180, occupied: 40, contact: "08935-244030", status: "Active" },
    { id: 111, district: "Alluri Sitharama Raju", mandal: "Koyyuru", name: "Koyyuru Agency Disaster Mitigation Shelter", location: "Mandal Parishad Hall, Koyyuru", capacity: 190, occupied: 45, contact: "08937-243005", status: "Active" },
    { id: 112, district: "Alluri Sitharama Raju", mandal: "Munchingi Puttu", name: "Munchingi Puttu Interstate Border Disaster Camp", location: "Munchingi Puttu Govt School", capacity: 180, occupied: 55, contact: "08935-248012", status: "Active" },
    { id: 113, district: "Alluri Sitharama Raju", mandal: "Peda Bayalu", name: "Peda Bayalu High Altitude Relief Station", location: "Main Center, Peda Bayalu", capacity: 150, occupied: 30, contact: "08935-246010", status: "Active" },

    // KRISHNA DISTRICT SHELTERS (FOR TEST SUITE)
    { id: 201, district: "Krishna", mandal: "Vijayawada Rural", name: "Krishna District Primary Relief Shelter", location: "Nunna, Vijayawada Rural", capacity: 350, occupied: 210, contact: "0866-248900", status: "Active" },
    { id: 202, district: "Krishna", mandal: "Vijayawada Rural", name: "Enikepadu Community Disaster Refuge", location: "Enikepadu, Vijayawada Rural", capacity: 250, occupied: 120, contact: "0866-248911", status: "Active" },
    { id: 203, district: "Krishna", mandal: "Machilipatnam", name: "Machilipatnam Coastal Cyclone Refuge Centre", location: "Bandar Coast, Machilipatnam", capacity: 500, occupied: 320, contact: "08672-252100", status: "Active" },
    { id: 204, district: "Krishna", mandal: "Gudivada", name: "Gudivada Municipal Relief Shelter", location: "Municipal High School, Gudivada", capacity: 300, occupied: 110, contact: "08674-243200", status: "Active" },
    { id: 205, district: "Krishna", mandal: "Avanigadda", name: "Avanigadda Krishna Estuary Multi-Purpose Cyclone Shelter", location: "Delta Main Center, Avanigadda", capacity: 450, occupied: 290, contact: "08671-272300", status: "Active" },
    { id: 206, district: "Krishna", mandal: "Gannavaram", name: "Gannavaram Buffer Relief & Logistics Center", location: "Near Airport, Gannavaram", capacity: 320, occupied: 140, contact: "0866-284500", status: "Active" }
];

const defaultInventoryData = [
    { id: 1, item: "Ready-to-Eat Food Ration Kits", category: "Nutrition", stock: 1450, unit: "kits", min: 300 },
    { id: 2, item: "Bottled Mineral Water Cases", category: "Water", stock: 2800, unit: "cases", min: 500 },
    { id: 3, item: "Emergency First Aid & Trauma Kits", category: "Medical", stock: 620, unit: "kits", min: 150 },
    { id: 4, item: "Woolen Thermal Blankets", category: "Shelter", stock: 1950, unit: "blankets", min: 400 },
    { id: 5, item: "Inflatable Motorized Rescue Boats", category: "Rescue", stock: 18, unit: "boats", min: 5 },
    { id: 6, item: "Standard Life Jackets (Adult & Child)", category: "Safety", stock: 450, unit: "jackets", min: 100 },
    { id: 7, item: "High-Beam Emergency Flashlights", category: "Lighting", stock: 850, unit: "units", min: 200 },
    { id: 8, item: "Weatherproof Relief Family Tents", category: "Shelter", stock: 320, unit: "tents", min: 80 }
];

function getVolunteerPhotoSrc(vol) {
    if (!vol) return "";
    if (vol.profilePhoto && vol.profilePhoto.data) return vol.profilePhoto.data;
    if (typeof vol.profilePhoto === "string" && vol.profilePhoto.length > 5) return vol.profilePhoto;
    if (vol.photoData && vol.photoData.data) return vol.photoData.data;
    if (typeof vol.photoData === "string" && vol.photoData.length > 5) return vol.photoData;
    if (vol.photo) return vol.photo;
    return "";
}

// ========================================================
// 2. AUTHENTICATION & ACCESS GUARD
// ========================================================
function checkMandalSession() {
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem("disasterCurrentMandal") || "null");
    } catch (e) { }

    // If no session found, pick or create default approved Vijayawada Rural mandal account
    if (!session || !session.mandal) {
        const accounts = readRecords("disasterMandalAccounts");
        const approvedAcc = accounts.find(function (acc) { return acc.status === "Approved"; });
        if (approvedAcc) {
            session = approvedAcc;
            localStorage.setItem("disasterCurrentMandal", JSON.stringify(session));
        } else {
            session = {
                id: "mandal_asr_paderu",
                mandal: "Paderu",
                district: "Alluri Sitharama Raju",
                state: "Andhra Pradesh",
                officerName: "Dr. K. Someswara Rao",
                employeeId: "MND-ASR-1001",
                phone: "08935-242222",
                email: "paderu.relief@asr.ap.gov.in",
                status: "Approved",
                role: "Mandal Employee",
                profilePhoto: ""
            };
            localStorage.setItem("disasterCurrentMandal", JSON.stringify(session));
        }
    }

    if (session.status !== "Approved") {
        alert("Access Denied: Your Mandal Employee login is pending approval from the District Admin.");
        window.location.href = "index.html";
        return null;
    }

    currentMandal = session;
    return currentMandal;
}

// ========================================================
// 3. INITIALIZE HEADER & METADATA
// ========================================================
function initMandalHeaderAndMeta() {
    if (!currentMandal) return;

    const initials = (currentMandal.officerName || "MO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "MO";

    // Sidebar Officer Meta
    const sbName = document.getElementById("sidebarOfficerName");
    if (sbName) sbName.textContent = currentMandal.officerName || "Mandal Officer";
    const sbEmp = document.getElementById("sidebarEmpId");
    if (sbEmp) sbEmp.textContent = currentMandal.employeeId || "EMP-001";
    const sbMandal = document.getElementById("sidebarMandalName");
    if (sbMandal) sbMandal.textContent = `Mandal: ${currentMandal.mandal}`;
    const sbDist = document.getElementById("sidebarDistrictName");
    if (sbDist) sbDist.textContent = `District: ${currentMandal.district}`;

    // Sidebar Avatar
    const sbAvatar = document.getElementById("sidebarOfficerAvatar");
    if (sbAvatar) {
        if (currentMandal.profilePhoto) {
            sbAvatar.innerHTML = `<img src="${currentMandal.profilePhoto}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            sbAvatar.textContent = initials;
        }
    }

    // Topbar Meta
    const topHeading = document.getElementById("topbarMandalHeading");
    if (topHeading) topHeading.textContent = `${currentMandal.mandal} Mandal Operations`;
    const topBreadcrumb = document.getElementById("topbarBreadcrumb");
    if (topBreadcrumb) topBreadcrumb.textContent = `${(currentMandal.district || "KRISHNA").toUpperCase()} DISTRICT / ${currentMandal.mandal.toUpperCase()}`;
    const topOfficer = document.getElementById("topbarOfficerName");
    if (topOfficer) topOfficer.textContent = currentMandal.officerName || "Mandal Officer";

    // Topbar Avatar
    const topAvatar = document.getElementById("topbarAvatarDisplay");
    if (topAvatar) {
        if (currentMandal.profilePhoto) {
            topAvatar.innerHTML = `<img src="${currentMandal.profilePhoto}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            topAvatar.textContent = initials;
        }
    }

    // Topbar Fixed Jurisdiction Display
    const jurDisplay = document.getElementById("mandalJurisdictionDisplay");
    if (jurDisplay) {
        jurDisplay.textContent = `${currentMandal.state || 'Andhra Pradesh'} / ${currentMandal.district || 'Krishna'} / ${currentMandal.mandal || 'Vijayawada Rural'}`;
    }

    // Command desk text
    const dashMandalText = document.getElementById("dashCurrentMandalText");
    if (dashMandalText) dashMandalText.textContent = currentMandal.mandal;
    const dashDistText = document.getElementById("dashCurrentDistrictText");
    if (dashDistText) dashDistText.textContent = currentMandal.district;
    const dashStateText = document.getElementById("dashCurrentStateText");
    if (dashStateText) dashStateText.textContent = currentMandal.state || "Andhra Pradesh";
    const dashOfficerText = document.getElementById("dashOfficerDisplayName");
    if (dashOfficerText) dashOfficerText.textContent = currentMandal.officerName || "Mandal Officer";
}

// ========================================================
// 4. NAVIGATION VIEW SWITCHER
// ========================================================
function switchMandalView(viewName) {
    // Treat 'overview' as alias for 'dashboard'
    if (viewName === "overview") viewName = "dashboard";

    const validViews = ["dashboard", "requests", "volunteers", "shelters", "inventory", "donations", "reports", "profile"];
    if (!validViews.includes(viewName)) viewName = "dashboard";
    activeView = viewName;

    // Toggle active classes on view containers
    document.querySelectorAll(".mandal-view").forEach(function (viewEl) {
        viewEl.classList.remove("active");
    });
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add("active");

    // Toggle active link in sidebar navigation
    document.querySelectorAll(".mandal-nav-item[data-view]").forEach(function (link) {
        if (link.dataset.view === viewName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Close mobile drawer if open
    const sidebar = document.getElementById("mandalSidebar");
    if (sidebar) sidebar.classList.remove("open");

    // Update topbar breadcrumb & header
    const breadcrumbLabels = {
        dashboard: { breadcrumb: "MANDAL OPERATIONS / DASHBOARD", title: `${currentMandal.mandal} Mandal Operations` },
        requests: { breadcrumb: "MANDAL OPERATIONS / HELP REQUESTS", title: "Routed Citizen Help Requests" },
        volunteers: { breadcrumb: "MANDAL OPERATIONS / VOLUNTEERS", title: "Mandal Volunteer Force & ID Cards" },
        shelters: { breadcrumb: "MANDAL OPERATIONS / SHELTERS", title: "Emergency Shelters & Relief Camps" },
        inventory: { breadcrumb: "MANDAL OPERATIONS / RELIEF INVENTORY", title: "Relief Inventory & Supplies" },
        assign: { breadcrumb: "MANDAL OPERATIONS / ASSIGN VOLUNTEERS", title: "Assign Volunteers to Help Requests" },
        donations: { breadcrumb: "MANDAL OPERATIONS / DONATIONS", title: "Donations & Relief Materials" },
        reports: { breadcrumb: "MANDAL OPERATIONS / REPORTS", title: "Disaster Operations Reports & Annual Statements" },
        profile: { breadcrumb: "MANDAL OPERATIONS / OFFICER PROFILE", title: "Mandal Officer Profile & Settings" }
    };
    const info = breadcrumbLabels[viewName] || breadcrumbLabels.dashboard;
    const breadcrumbEl = document.getElementById("topbarBreadcrumb");
    const h2El = document.getElementById("topbarMandalHeading");
    if (breadcrumbEl) breadcrumbEl.textContent = info.breadcrumb;
    if (h2El) h2El.textContent = info.title;

    // Refresh view data
    if (viewName === "dashboard") renderDashboardView();
    else if (viewName === "requests") renderRequestsTable();
    else if (viewName === "volunteers") renderVolunteersTable();
    else if (viewName === "assign") populateMandalAssignView();
    else if (viewName === "shelters") renderSheltersView();
    else if (viewName === "inventory") renderInventoryView();
    else if (viewName === "donations") renderDonationsView();
    else if (viewName === "reports") {
        renderReportsView();
        renderAnnualStatements();
    } else if (viewName === "profile") populateProfileForm();
}
window.switchMandalView = switchMandalView;

// ========================================================
// 5. LIVE WEATHER REPORT WIDGET
// ========================================================
async function loadMandalLiveWeather() {
    const tempEl = document.getElementById("mandalWeatherTemp");
    const condEl = document.getElementById("mandalWeatherCondition");
    const badgeEl = document.getElementById("mandalWeatherBadge");
    const iconEl = document.getElementById("mandalWeatherIcon");
    if (!tempEl || !condEl) return;

    const districtCoords = {
        "alluri sitharama raju": { lat: 18.0833, lon: 82.6667, name: "Paderu (Alluri Sitharama Raju)" },
        "alluri": { lat: 18.0833, lon: 82.6667, name: "Paderu (Alluri Sitharama Raju)" },
        "paderu": { lat: 18.0833, lon: 82.6667, name: "Paderu" },
        "krishna": { lat: 16.5062, lon: 80.6480, name: "Krishna" },
        "chennai": { lat: 13.0827, lon: 80.2707, name: "Chennai" },
        "wayanad": { lat: 11.6854, lon: 76.1320, name: "Wayanad" },
        "guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
        "visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" }
    };

    const key = (currentMandal && currentMandal.district ? currentMandal.district : "alluri sitharama raju").toLowerCase().trim();
    const loc = districtCoords[key] || { lat: 16.5062, lon: 80.6480, name: currentMandal ? currentMandal.mandal : "Vijayawada Rural" };

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const current = data.current_weather;
        if (!current) throw new Error("No weather data");

        const temp = Math.round(current.temperature);
        const code = current.weathercode;
        const wind = current.windspeed;

        let condition = "Clear Skies";
        let iconClass = "bi-sun-fill text-warning";
        let badgeText = "Normal";
        let badgeClass = "bg-success";

        if (code >= 51 && code <= 67) {
            condition = "Scattered Rain";
            iconClass = "bi-cloud-rain-fill text-info";
            badgeText = "Rain Watch";
            badgeClass = "bg-danger";
        } else if (code >= 71 && code <= 77) {
            condition = "Precipitation";
            iconClass = "bi-cloud-snow text-primary";
            badgeText = "Advisory";
            badgeClass = "bg-warning text-dark";
        } else if (code >= 80 && code <= 82) {
            condition = "Heavy Downpour";
            iconClass = "bi-cloud-lightning-rain-fill text-danger";
            badgeText = "Heavy Rain Alert";
            badgeClass = "bg-danger";
        } else if (code >= 95) {
            condition = "Thunderstorm Warning";
            iconClass = "bi-lightning-charge-fill text-danger";
            badgeText = "Storm Alert";
            badgeClass = "bg-danger";
        } else if (code >= 1 && code <= 3) {
            condition = "Partly Cloudy";
            iconClass = "bi-cloud-sun-fill text-warning";
            badgeText = "Monitoring";
            badgeClass = "bg-info text-dark";
        }

        if (wind > 35) {
            badgeText = "High Winds";
            badgeClass = "bg-danger";
        }

        tempEl.textContent = `${temp}°C`;
        condEl.textContent = `${condition} · ${currentMandal ? currentMandal.mandal : "Mandal"}`;
        if (badgeEl) {
            badgeEl.className = `badge ${badgeClass} text-white py-0 px-1`;
            badgeEl.textContent = badgeText;
            badgeEl.style.fontSize = "8px";
        }
        if (iconEl) {
            iconEl.innerHTML = `<i class="bi ${iconClass}"></i>`;
        }
    } catch (e) {
        tempEl.textContent = "29°C";
        condEl.textContent = `Live Weather · ${currentMandal ? currentMandal.mandal : "Mandal"}`;
        if (badgeEl) {
            badgeEl.className = "badge bg-success text-white py-0 px-1";
            badgeEl.textContent = "Normal";
        }
        if (iconEl) {
            iconEl.innerHTML = '<i class="bi bi-cloud-sun-fill text-warning"></i>';
        }
    }
}
window.loadMandalLiveWeather = loadMandalLiveWeather;

async function openWeatherDetailModal(districtName) {
    const targetDist = districtName || (currentMandal ? currentMandal.district : "Krishna");
    const AP_DISTRICT_COORDS = {
        "alluri sitharama raju": { lat: 18.0667, lon: 82.5333, name: "Alluri Sitharama Raju" },
        "anakapalli": { lat: 17.6896, lon: 83.0032, name: "Anakapalli" },
        "ananthapuramu": { lat: 14.6819, lon: 77.6006, name: "Ananthapuramu" },
        "annamayya": { lat: 14.0167, lon: 78.7500, name: "Annamayya" },
        "bapatla": { lat: 15.9042, lon: 80.4674, name: "Bapatla" },
        "chittoor": { lat: 13.2172, lon: 79.1003, name: "Chittoor" },
        "east godavari": { lat: 17.0005, lon: 81.8040, name: "East Godavari (Rajahmundry)" },
        "eluru": { lat: 16.7107, lon: 81.0952, name: "Eluru" },
        "guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
        "kakinada": { lat: 16.9891, lon: 82.2475, name: "Kakinada" },
        "konaseema": { lat: 16.5700, lon: 82.0000, name: "Dr. B.R. Ambedkar Konaseema" },
        "krishna": { lat: 16.1800, lon: 81.1300, name: "Krishna (Vijayawada / Machilipatnam)" },
        "kurnool": { lat: 15.8281, lon: 78.0373, name: "Kurnool" },
        "nandyal": { lat: 15.4886, lon: 78.4836, name: "Nandyal" },
        "ntr": { lat: 16.5062, lon: 80.6480, name: "NTR District (Vijayawada)" },
        "palnadu": { lat: 16.2333, lon: 80.0500, name: "Palnadu (Narasaraopet)" },
        "parvathipuram manyam": { lat: 18.7800, lon: 83.4300, name: "Parvathipuram Manyam" },
        "prakasam": { lat: 15.5057, lon: 80.0499, name: "Prakasam (Ongole)" },
        "srikakulam": { lat: 18.2969, lon: 83.8968, name: "Srikakulam" },
        "sri potti sriramulu nellore": { lat: 14.4426, lon: 79.9865, name: "SPS Nellore" },
        "sri sathya sai": { lat: 14.1667, lon: 77.8167, name: "Sri Sathya Sai (Puttaparthi)" },
        "tirupati": { lat: 13.6288, lon: 79.4192, name: "Tirupati" },
        "visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" },
        "vizianagaram": { lat: 18.1133, lon: 83.4072, name: "Vizianagaram" },
        "west godavari": { lat: 16.5449, lon: 81.5212, name: "West Godavari (Bhimavaram)" },
        "ysr kadapa": { lat: 14.4673, lon: 78.8242, name: "YSR Kadapa" }
    };

    let loc = { lat: 16.5062, lon: 80.6480, name: targetDist };
    const key = (targetDist || "").toLowerCase().trim();
    for (const dKey in AP_DISTRICT_COORDS) {
        if (key.includes(dKey) || dKey.includes(key)) {
            loc = AP_DISTRICT_COORDS[dKey];
            break;
        }
    }

    const distSelect = document.getElementById("weatherDistrictSelect");
    if (distSelect) {
        for (let i = 0; i < distSelect.options.length; i++) {
            if (distSelect.options[i].value.toLowerCase().includes(key) || key.includes(distSelect.options[i].value.toLowerCase())) {
                distSelect.selectedIndex = i;
                break;
            }
        }
    }

    const modalEl = document.getElementById("weatherDetailModal");
    if (!modalEl) return;
    const modalInst = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInst.show();

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m`;
        const res = await fetch(url);
        const data = await res.json();
        const cur = data.current_weather || { temperature: 29, weathercode: 61, windspeed: 18 };

        const temp = Math.round(cur.temperature);
        const code = cur.weathercode;
        const wind = Math.round(cur.windspeed);

        let condition = "Scattered Showers";
        let iconHtml = '<i class="bi bi-cloud-rain-fill text-info"></i>';
        if (code === 0) { condition = "Clear Sunny"; iconHtml = '<i class="bi bi-sun-fill text-warning"></i>'; }
        else if (code <= 3) { condition = "Partly Cloudy"; iconHtml = '<i class="bi bi-cloud-sun-fill text-warning"></i>'; }
        else if (code >= 80) { condition = "Heavy Downpour"; iconHtml = '<i class="bi bi-cloud-lightning-rain-fill text-danger"></i>'; }
        else if (code >= 95) { condition = "Severe Thunderstorm"; iconHtml = '<i class="bi bi-lightning-charge-fill text-danger"></i>'; }

        let rain24h = 8.5;
        let rainProb = 65;
        if (data.hourly && data.hourly.precipitation && data.hourly.precipitation.length) {
            rain24h = (data.hourly.precipitation.slice(0, 24).reduce((a, b) => a + Number(b || 0), 0)).toFixed(1);
        }
        if (data.hourly && data.hourly.precipitation_probability && data.hourly.precipitation_probability.length) {
            rainProb = Math.round(data.hourly.precipitation_probability.slice(0, 12).reduce((a, b) => a + Number(b || 0), 0) / 12) || 70;
        }

        let humidity = 76;
        if (data.hourly && data.hourly.relative_humidity_2m && data.hourly.relative_humidity_2m.length) {
            humidity = Math.round(data.hourly.relative_humidity_2m[0]);
        }

        const heroTemp = document.getElementById("weatherModalHeroTemp");
        if (heroTemp) heroTemp.textContent = `${temp}°C`;
        const heroCond = document.getElementById("weatherModalHeroCondition");
        if (heroCond) heroCond.textContent = condition;
        const heroIcon = document.getElementById("weatherModalHeroIcon");
        if (heroIcon) heroIcon.innerHTML = iconHtml;
        const heroLoc = document.getElementById("weatherModalHeroLocation");
        if (heroLoc) heroLoc.textContent = `${loc.name}, Andhra Pradesh`;

        const humEl = document.getElementById("weatherModalHumidity");
        if (humEl) humEl.textContent = `${humidity}%`;
        const windEl = document.getElementById("weatherModalWind");
        if (windEl) windEl.textContent = `${wind} km/h`;
        const rainVolEl = document.getElementById("weatherModalRainVolume");
        if (rainVolEl) rainVolEl.textContent = `${rain24h} mm`;
        const rainProbEl = document.getElementById("weatherModalRainProb");
        if (rainProbEl) rainProbEl.textContent = `${rainProb}%`;

        const windSpeedEl = document.getElementById("weatherModalWindSpeed");
        if (windSpeedEl) windSpeedEl.textContent = `${wind} km/h`;
        const windCatEl = document.getElementById("weatherModalWindCategory");
        const windWarningBox = document.getElementById("weatherModalWindWarningBox");

        if (wind > 50) {
            if (windCatEl) { windCatEl.className = "badge bg-danger"; windCatEl.textContent = "Gale Warning (>50 km/h)"; }
            if (windWarningBox) {
                windWarningBox.style.background = "#fef2f2";
                windWarningBox.style.borderColor = "#fca5a5";
                windWarningBox.style.color = "#991b1b";
                windWarningBox.innerHTML = `⚠️ <strong>SEVERE WIND WARNING:</strong> Wind speeds exceeding 50 km/h. High risk of uprooted trees and fallen power lines.`;
            }
        } else if (wind > 35) {
            if (windCatEl) { windCatEl.className = "badge bg-warning text-dark"; windCatEl.textContent = "Strong Breeze (35-50 km/h)"; }
            if (windWarningBox) {
                windWarningBox.style.background = "#fffbeb";
                windWarningBox.style.borderColor = "#fde68a";
                windWarningBox.style.color = "#92400e";
                windWarningBox.innerHTML = `⚠️ <strong>STRONG WIND ADVISORY:</strong> Gusty winds active. Exercise caution during relief transport.`;
            }
        } else {
            if (windCatEl) { windCatEl.className = "badge bg-success"; windCatEl.textContent = "Moderate Breeze"; }
            if (windWarningBox) {
                windWarningBox.style.background = "#f0fdf4";
                windWarningBox.style.borderColor = "#bbf7d0";
                windWarningBox.style.color = "#166534";
                windWarningBox.textContent = `Wind conditions within safe operational limits for field volunteers and boats.`;
            }
        }
    } catch (e) {
        console.warn("Weather modal fetch fallback:", e);
    }
}
window.openWeatherDetailModal = openWeatherDetailModal;

// Connect Mandal weather widget triggers
const mandalWeatherWidget = document.getElementById("mandalWeatherWidget");
if (mandalWeatherWidget) {
    mandalWeatherWidget.addEventListener("click", function () {
        openWeatherDetailModal(currentMandal ? currentMandal.district : "Krishna");
    });
}
const refreshMandalWeatherBtn = document.getElementById("refreshMandalWeatherBtn");
if (refreshMandalWeatherBtn) {
    refreshMandalWeatherBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        loadMandalLiveWeather();
        loadImdLiveWeatherFeed();
        showToast("Live weather report refreshed.");
    });
}
const btnRefreshWeatherModal = document.getElementById("btnRefreshWeatherModal");
if (btnRefreshWeatherModal) {
    btnRefreshWeatherModal.addEventListener("click", function () {
        const sel = document.getElementById("weatherDistrictSelect");
        openWeatherDetailModal(sel ? sel.value : null);
    });
}
const weatherDistrictSelect = document.getElementById("weatherDistrictSelect");
if (weatherDistrictSelect) {
    weatherDistrictSelect.addEventListener("change", function () {
        openWeatherDetailModal(this.value);
    });
}

// ========================================================
// 6. DATA ROUTING HELPERS (AUTOMATIC ROUTING BY MANDAL)
// ========================================================
function getRoutedHelpRequests() {
    const all = readRecords("disasterHelpRequests");
    if (!currentMandal) return all;

    const mTarget = (currentMandal.mandal || "").toLowerCase().trim();
    const dTarget = (currentMandal.district || "").toLowerCase().trim();

    const routed = all.filter(function (req) {
        const rMandal = (req.mandal || "").toLowerCase().trim();
        const rDist = (req.district || "").toLowerCase().trim();
        // Strict automatic routing: routed by mandal
        return rMandal === mTarget && (dTarget === "" || rDist === dTarget);
    });

    return routed;
}

function getRoutedVolunteers() {
    const all = readRecords("disasterVolunteers");
    if (!currentMandal) return all;

    const mTarget = (currentMandal.mandal || "").toLowerCase().trim();
    const dTarget = (currentMandal.district || "").toLowerCase().trim();

    const routed = all.filter(function (vol) {
        const vMandal = (vol.mandal || "").toLowerCase().trim();
        const vDist = (vol.district || "").toLowerCase().trim();
        return vMandal === mTarget && (dTarget === "" || vDist === dTarget);
    });

    return routed;
}

// ========================================================
// 7. VIEW 1: DASHBOARD
// ========================================================
function renderDashboardView() {
    const requests = getRoutedHelpRequests();
    const volunteers = getRoutedVolunteers();
    const shelters = readRecords("disasterSheltersData").length ? readRecords("disasterSheltersData") : defaultSheltersData;
    const inventory = readRecords("disasterReliefInventory").length ? readRecords("disasterReliefInventory") : defaultInventoryData;
    const donations = readRecords("disasterDonations");

    const activeRequests = requests.filter(function (r) { return r.status !== "Resolved"; });
    const criticalRequests = activeRequests.filter(function (r) { return (r.priority || "").toLowerCase() === "critical" || (r.priority || "").toLowerCase() === "high"; });
    const resolvedRequests = requests.filter(function (r) { return r.status === "Resolved"; });
    const pendingCount = activeRequests.filter(function (r) { return !r.status || r.status.toLowerCase() === "pending"; }).length;

    // Stat Cards
    const actReqEl = document.getElementById("activeRequestsCount");
    if (actReqEl) actReqEl.textContent = activeRequests.length;

    const critReqEl = document.getElementById("criticalRequestsCount");
    if (critReqEl) critReqEl.textContent = criticalRequests.length;

    const volCountEl = document.getElementById("volunteersCount");
    if (volCountEl) volCountEl.textContent = volunteers.length;

    const resReqEl = document.getElementById("resolvedRequestsCount");
    if (resReqEl) resReqEl.textContent = resolvedRequests.length;

    const statSheltersEl = document.getElementById("statSheltersCount");
    if (statSheltersEl) statSheltersEl.textContent = shelters.length;

    const statInvEl = document.getElementById("statInventoryCount");
    if (statInvEl) statInvEl.textContent = inventory.length;

    const statDonEl = document.getElementById("statDonationsCount");
    if (statDonEl) statDonEl.textContent = donations.length;

    // Badges in sidebar navigation
    const navReqPendingEl = document.getElementById("navRequestsPendingCount");
    if (navReqPendingEl) navReqPendingEl.textContent = pendingCount;

    const navVolCountEl = document.getElementById("navVolunteersCount");
    if (navVolCountEl) navVolCountEl.textContent = volunteers.length;

    document.querySelectorAll("#donationsBadgeCount").forEach(function (el) {
        el.textContent = donations.length;
    });

    // Populate Live Operational Queue Snapshot Table
    renderDashRequestTable();

    // Populate Priority Help Requests list
    const priorityListEl = document.getElementById("dashPriorityRequestsList");
    if (priorityListEl) {
        if (!activeRequests.length) {
            priorityListEl.innerHTML = '<div class="p-4 text-center text-muted"><i class="bi bi-shield-check text-success fs-3 d-block mb-1"></i>No pending emergency requests in this mandal right now.</div>';
        } else {
            priorityListEl.innerHTML = activeRequests.slice(0, 5).map(function (req) {
                const priorityBadge = req.priority === "Critical" ? "bg-danger" : req.priority === "High" ? "bg-warning text-dark" : "bg-primary";
                const displayId = req.trackId || ("#" + String(req.id).slice(-6));
                return `<div class="list-group-item p-3 d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge ${priorityBadge}">${escapeHtml(req.priority || "Medium")}</span>
                            <strong>${escapeHtml(req.help || req.disasterType || "Emergency Help")}</strong>
                            <small class="text-muted font-monospace">${escapeHtml(displayId)}</small>
                        </div>
                        <div class="text-muted small">
                            <i class="bi bi-geo-alt"></i> ${escapeHtml(req.village || req.location || "Local Area")} · 
                            <i class="bi bi-person"></i> ${escapeHtml(req.name || "Citizen")} (${escapeHtml(req.mobileNumber || req.phone || "No phone")})
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" type="button" onclick="openRequestOverview('${req.id}')">Overview</button>
                </div>`;
            }).join("");
        }
    }

    // Populate Mandal Response Force list
    const volListEl = document.getElementById("dashVolunteersList");
    if (volListEl) {
        if (!volunteers.length) {
            volListEl.innerHTML = '<div class="p-4 text-center text-muted">No volunteers enrolled in this mandal yet.</div>';
        } else {
            volListEl.innerHTML = volunteers.slice(0, 5).map(function (vol) {
                const statusBadge = vol.status === "Unavailable" ? "bg-secondary" : vol.status === "Assigned" ? "bg-primary" : "bg-success";
                const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
                const photoSrc = getVolunteerPhotoSrc(vol);
                return `<div class="list-group-item p-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <div style="width:34px;height:34px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;overflow:hidden;">
                            ${photoSrc ? `<img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;">` : initials}
                        </div>
                        <div>
                            <strong>${escapeHtml(vol.name)}</strong>
                            <div class="text-muted small">${escapeHtml(vol.skills || "Disaster Response")}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge ${statusBadge}">${escapeHtml(vol.status || "Available")}</span>
                        <button class="btn btn-sm btn-light border" type="button" onclick="openVolunteerIdCard('${vol.id}')" title="View Official ID Card"><i class="bi bi-person-vcard"></i></button>
                    </div>
                </div>`;
            }).join("");
        }
    }
}

function renderDashRequestTable() {
    const tableBody = document.getElementById("dashRequestTable");
    if (!tableBody) return;

    const allRequests = getRoutedHelpRequests();
    const searchVal = (document.getElementById("dashRequestSearch") ? document.getElementById("dashRequestSearch").value : "").toLowerCase().trim();
    const statusVal = (document.getElementById("dashStatusFilter") ? document.getElementById("dashStatusFilter").value : "all").toLowerCase().trim();

    const filtered = allRequests.filter(function (req) {
        const status = (req.status || "Pending").toLowerCase();
        if (statusVal !== "all" && status !== statusVal) return false;
        if (searchVal) {
            const track = (req.trackId || String(req.id)).toLowerCase();
            const name = (req.name || "").toLowerCase();
            const loc = (req.village || req.location || "").toLowerCase();
            const disaster = (req.disasterType || "").toLowerCase();
            if (!track.includes(searchVal) && !name.includes(searchVal) && !loc.includes(searchVal) && !disaster.includes(searchVal)) return false;
        }
        return true;
    });

    if (!filtered.length) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No help requests matching your dashboard filters.</td></tr>';
        return;
    }

    tableBody.innerHTML = filtered.slice(0, 10).map(function (req) {
        const displayId = req.trackId || ("#" + String(req.id).slice(-6));
        const priority = (req.priority || "Medium").toLowerCase();
        const status = (req.status || "Pending").toLowerCase();
        const statusClass = status === "in progress" ? "progress" : status;

        return `<tr>
            <td><strong class="font-monospace text-primary">${escapeHtml(displayId)}</strong></td>
            <td><strong>${escapeHtml(req.name || "N/A")}</strong></td>
            <td><a href="tel:${escapeHtml(req.mobileNumber || req.phone || '')}" class="text-muted text-decoration-none small"><i class="bi bi-telephone"></i> ${escapeHtml(req.mobileNumber || req.phone || 'N/A')}</a></td>
            <td>${escapeHtml(req.village || req.location || "N/A")}</td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(req.disasterType || "Emergency")}</span></td>
            <td><span class="status-pill ${priority}">${escapeHtml(req.priority || "Medium")}</span></td>
            <td><span class="status-pill ${statusClass}">${escapeHtml(req.status || "Pending")}</span></td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary py-0 px-2" type="button" onclick="openRequestOverview('${req.id}')" title="View Application Details"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-light border py-0 px-2" type="button" onclick="advanceRequestStatus('${req.id}')" title="Advance Status &rarr;"><i class="bi bi-arrow-right-short"></i></button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

// ========================================================
// 8. VIEW 2: ROUTED HELP REQUESTS TABLE & MANAGEMENT
// ========================================================
function renderRequestsTable() {
    const all = getRoutedHelpRequests();
    const searchVal = (document.getElementById("requestSearchInput") ? document.getElementById("requestSearchInput").value : "").toLowerCase().trim();
    const statusVal = (document.getElementById("requestStatusFilter") ? document.getElementById("requestStatusFilter").value : "all").toLowerCase().trim();
    const prioVal = (document.getElementById("requestPriorityFilter") ? document.getElementById("requestPriorityFilter").value : "all").toLowerCase().trim();

    const filtered = all.filter(function (req) {
        const status = (req.status || "Pending").toLowerCase();
        const priority = (req.priority || "Medium").toLowerCase();

        if (statusVal !== "all" && status !== statusVal) return false;
        if (prioVal !== "all" && priority !== prioVal) return false;

        if (searchVal) {
            const track = (req.trackId || String(req.id)).toLowerCase();
            const name = (req.name || "").toLowerCase();
            const phone = (req.mobileNumber || req.phone || "").toLowerCase();
            const loc = (req.village || req.location || "").toLowerCase();
            const help = (req.help || req.disasterType || "").toLowerCase();
            if (!track.includes(searchVal) && !name.includes(searchVal) && !phone.includes(searchVal) && !loc.includes(searchVal) && !help.includes(searchVal)) return false;
        }
        return true;
    });

    const badgeEl = document.getElementById("requestFilterCountBadge");
    if (badgeEl) badgeEl.textContent = `Showing ${filtered.length} of ${all.length}`;

    const tbody = document.getElementById("mandalRequestsTableBody");
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-muted">No citizen help requests match the selected filters in this mandal.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function (req) {
        const displayId = req.trackId || ("#" + String(req.id).slice(-6));
        const priority = (req.priority || "Medium").toLowerCase();
        const status = (req.status || "Pending").toLowerCase();
        const statusClass = status === "in progress" ? "progress" : status;

        let proofMarkup = '<span class="text-muted">None</span>';
        if (req.proof && req.proof.data) {
            proofMarkup = `<a class="text-link proof-link btn btn-sm btn-outline-secondary py-0 px-2" href="${req.proof.data}" target="_blank" rel="noopener" title="Open proof document"><i class="bi bi-paperclip"></i> View</a>`;
        }

        let lossesMarkup = '<span class="text-muted small">None reported</span>';
        if (req.losses) {
            const l = req.losses.toLowerCase();
            lossesMarkup = '<div class="d-flex flex-wrap gap-1">';
            if (l.includes("house") || l.includes("shelter")) lossesMarkup += '<span class="loss-badge loss-house">🏠 House</span>';
            if (l.includes("animal") || l.includes("livestock")) lossesMarkup += '<span class="loss-badge loss-animals">🐄 Animals</span>';
            if (l.includes("agri") || l.includes("crop")) lossesMarkup += '<span class="loss-badge loss-agriculture">🌾 Crops</span>';
            if (l.includes("injur") || l.includes("casualt")) lossesMarkup += '<span class="loss-badge loss-injury">🩹 Injured</span>';
            lossesMarkup += '</div>';
        }

        return `<tr>
            <td><strong class="font-monospace text-primary">${escapeHtml(displayId)}</strong><br><small class="text-muted">${escapeHtml(req.createdAt || "Recent")}</small></td>
            <td><strong>${escapeHtml(req.name || "N/A")}</strong></td>
            <td>${escapeHtml(req.fatherName || "N/A")}</td>
            <td><a href="tel:${escapeHtml(req.mobileNumber || req.phone || '')}" class="text-muted small text-decoration-none"><i class="bi bi-telephone"></i> ${escapeHtml(req.mobileNumber || req.phone || "N/A")}</a></td>
            <td><strong>${escapeHtml(req.village || req.location || "N/A")}</strong><br><small class="text-muted">${escapeHtml(req.mandal || currentMandal.mandal)}, ${escapeHtml(req.district || currentMandal.district)}</small></td>
            <td>${lossesMarkup}</td>
            <td>${escapeHtml(req.help || "Relief Assistance")}</td>
            <td>${proofMarkup}</td>
            <td><span class="status-pill ${priority}">${escapeHtml(req.priority || "Medium")}</span></td>
            <td><span class="status-pill ${statusClass}">${escapeHtml(req.status || "Pending")}</span></td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-primary py-1 px-2" type="button" onclick="openRequestOverview('${req.id}')" title="Application Overview">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${!req.assignedVolunteer && req.status !== "Resolved" ? `
                        <button class="btn btn-sm btn-outline-primary py-1 px-2" type="button" onclick="openAssignVolunteerForRequest('${req.id}')" title="Assign Volunteer">
                            <i class="bi bi-person-plus"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-light border py-1 px-2" type="button" onclick="advanceRequestStatus('${req.id}')" title="Advance Status">
                        <i class="bi bi-arrow-right-short"></i>
                    </button>
                    ${req.status !== "Resolved" ? `
                        <button class="btn btn-sm btn-outline-success py-1 px-2" type="button" onclick="quickResolveRequest('${req.id}')" title="Mark Resolved">
                            <i class="bi bi-check2"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>`;
    }).join("");
}

// Open Citizen Application Overview Modal (Full Details, Call/WhatsApp, Google Maps, Proof Preview)
function openRequestOverview(requestId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(requestId); });
    if (!req) return;

    activeOverviewRequestId = req.id;
    const displayId = req.trackId || ("#" + String(req.id).slice(-6));
    const priority = req.priority || "Medium";
    const status = req.status || "Pending";
    const priorityClass = priority.toLowerCase();
    const statusClass = status.toLowerCase() === "in progress" ? "progress" : status.toLowerCase();

    // Top Header
    const trackBadge = document.getElementById("modalTrackId");
    if (trackBadge) trackBadge.textContent = displayId;
    const trackText = document.getElementById("modalTrackIdText");
    if (trackText) trackText.textContent = displayId;

    const prioBadge = document.getElementById("modalPriorityBadge");
    if (prioBadge) {
        prioBadge.className = `status-pill ${priorityClass}`;
        prioBadge.textContent = priority;
    }
    const prioText = document.getElementById("modalPriorityText");
    if (prioText) prioText.textContent = priority;

    const statBadge = document.getElementById("modalStatusBadge");
    if (statBadge) {
        statBadge.className = `status-pill ${statusClass}`;
        statBadge.textContent = status;
    }

    const createdEl = document.getElementById("modalCreatedAt");
    if (createdEl) createdEl.innerHTML = `<i class="bi bi-clock"></i> Submitted: ${escapeHtml(req.createdAt || "Recent")}`;

    // Applicant Information
    const nameEl = document.getElementById("modalName");
    if (nameEl) nameEl.textContent = req.name || "N/A";
    const fatherEl = document.getElementById("modalFatherName");
    if (fatherEl) fatherEl.textContent = req.fatherName || "N/A";

    const phoneVal = req.mobileNumber || req.phone || "N/A";
    const phoneEl = document.getElementById("modalPhone");
    if (phoneEl) phoneEl.textContent = phoneVal;

    const callBtn = document.getElementById("modalCallBtn");
    const waBtn = document.getElementById("modalWhatsAppBtn");
    if (phoneVal !== "N/A") {
        const cleanPhone = String(phoneVal).replace(/\D/g, "");
        if (callBtn) {
            callBtn.href = `tel:${cleanPhone}`;
            callBtn.style.display = "inline-flex";
        }
        if (waBtn) {
            waBtn.href = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${req.name}, regarding your emergency help request ${displayId} on Disaster Relief network:`)}`;
            waBtn.style.display = "inline-flex";
        }
    } else {
        if (callBtn) callBtn.style.display = "none";
        if (waBtn) waBtn.style.display = "none";
    }

    // Location & Geo-Coordinates
    const villEl = document.getElementById("modalVillage");
    if (villEl) villEl.textContent = req.village || req.location || "N/A";
    const mandalEl = document.getElementById("modalMandal");
    if (mandalEl) mandalEl.textContent = req.mandal || currentMandal.mandal;
    const distStateEl = document.getElementById("modalDistrictState");
    if (distStateEl) distStateEl.textContent = `${req.district || currentMandal.district}, ${req.state || currentMandal.state}`;

    const gpsVal = req.gps || req.coordinates || "";
    const gpsEl = document.getElementById("modalGps");
    const gpsLink = document.getElementById("modalGpsLink");
    if (gpsVal && gpsVal.trim()) {
        if (gpsEl) gpsEl.textContent = gpsVal;
        if (gpsLink) {
            gpsLink.href = `https://www.google.com/maps?q=${encodeURIComponent(gpsVal.trim())}`;
            gpsLink.style.display = "inline-flex";
        }
    } else {
        if (gpsEl) gpsEl.textContent = "16.5062° N, 80.6480° E (Panchayat Sector)";
        if (gpsLink) {
            gpsLink.href = `https://www.google.com/maps?q=16.5062,80.6480`;
            gpsLink.style.display = "inline-flex";
        }
    }

    // Disaster & Relief Requirements
    const disTypeEl = document.getElementById("modalDisasterType");
    if (disTypeEl) disTypeEl.textContent = req.disasterType || "Emergency Incident";

    const lossesContainer = document.getElementById("modalLossesReported");
    if (lossesContainer) {
        if (req.losses) {
            const l = req.losses.toLowerCase();
            let badges = "";
            if (l.includes("house") || l.includes("shelter")) badges += '<span class="loss-badge loss-house">🏠 House / Shelter Damaged</span> ';
            if (l.includes("animal") || l.includes("livestock")) badges += '<span class="loss-badge loss-animals">🐄 Animals / Livestock Lost</span> ';
            if (l.includes("agri") || l.includes("crop")) badges += '<span class="loss-badge loss-agriculture">🌾 Agriculture / Crops Destroyed</span> ';
            if (l.includes("injur") || l.includes("casualt")) badges += '<span class="loss-badge loss-injury">🩹 Person Injured / Casualties</span> ';
            lossesContainer.innerHTML = badges || `<span class="badge bg-secondary-subtle text-secondary">${escapeHtml(req.losses)}</span>`;
        } else {
            lossesContainer.innerHTML = '<span class="text-muted small">No specific property or livestock loss declared.</span>';
        }
    }

    const helpCatEl = document.getElementById("modalHelpCategories");
    if (helpCatEl) {
        const categories = (req.help || "Relief Assistance").split(",").map(function (c) { return c.trim(); }).filter(Boolean);
        helpCatEl.innerHTML = categories.map(function (cat) {
            let icon = "bi-life-preserver";
            const lower = cat.toLowerCase();
            if (lower.includes("food") || lower.includes("water")) icon = "bi-cup-straw";
            else if (lower.includes("medical") || lower.includes("medicine")) icon = "bi-bandaid-fill";
            else if (lower.includes("rescue")) icon = "bi-shield-shaded";
            else if (lower.includes("shelter")) icon = "bi-house-heart-fill";
            return `<span class="badge bg-secondary-subtle text-secondary border me-1 mb-1"><i class="bi ${icon} me-1"></i>${escapeHtml(cat)}</span>`;
        }).join("");
    }

    const detailsEl = document.getElementById("modalDetails");
    if (detailsEl) detailsEl.textContent = req.details || req.description || "Citizen submitted request for urgent disaster assistance.";

    // Proof Document Attachment
    const proofContainer = document.getElementById("modalProofContainer");
    if (proofContainer) {
        if (req.proof && req.proof.data) {
            const isPdf = (req.proof.type && req.proof.type.includes("pdf")) || (req.proof.name && req.proof.name.toLowerCase().endsWith(".pdf")) || req.proof.data.startsWith("data:application/pdf");
            if (isPdf) {
                proofContainer.innerHTML = `
                    <div class="d-flex align-items-center gap-3 p-3 bg-white border rounded-3">
                        <div class="stat-icon stat-red"><i class="bi bi-file-earmark-pdf-fill"></i></div>
                        <div class="flex-grow-1">
                            <strong class="d-block mb-1">${escapeHtml(req.proof.name || "Incident_Proof_Document.pdf")}</strong>
                            <small class="text-muted d-block mb-2">Attached verification document (PDF)</small>
                            <a href="${req.proof.data}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-danger py-1 px-3"><i class="bi bi-box-arrow-up-right me-1"></i> Open PDF</a>
                        </div>
                    </div>`;
            } else {
                proofContainer.innerHTML = `
                    <div class="d-flex align-items-center gap-3 p-3 bg-white border rounded-3">
                        <img src="${req.proof.data}" alt="Proof" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; cursor: pointer;" onclick="window.open('${req.proof.data}', '_blank')">
                        <div class="flex-grow-1">
                            <strong class="d-block mb-1">${escapeHtml(req.proof.name || "Incident_Photo.jpg")}</strong>
                            <small class="text-muted d-block mb-2">Attached incident photo proof</small>
                            <a href="${req.proof.data}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary py-1 px-3"><i class="bi bi-eye-fill me-1"></i> View Full Resolution</a>
                        </div>
                    </div>`;
            }
        } else {
            proofContainer.innerHTML = '<div class="text-muted small py-2 px-3 bg-white border rounded-3"><i class="bi bi-info-circle me-1"></i> No verification document or image was attached to this application.</div>';
        }
    }

    // Modal Status Selector
    const statusSelect = document.getElementById("modalStatusSelect");
    if (statusSelect) statusSelect.value = req.status || "Pending";

    // Modal Volunteer Assignment Selector
    const volSelect = document.getElementById("modalVolunteerSelect");
    if (volSelect) {
        const volunteers = getRoutedVolunteers();
        volSelect.innerHTML = '<option value="">-- Select Volunteer --</option>' + volunteers.map(function (v) {
            const isSelected = String(req.assignedVolunteerId || (req.assignedVolunteer ? req.assignedVolunteer.id : "")) === String(v.id);
            return `<option value="${v.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(v.name)} (${escapeHtml(v.phone || v.mobileNumber)}) [${escapeHtml(v.status || "Available")}]</option>`;
        }).join("");
    }

    const modalEl = document.getElementById("requestOverviewModal");
    if (!reqOverviewModalInstance && modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        reqOverviewModalInstance = new bootstrap.Modal(modalEl);
    }
    if (reqOverviewModalInstance) reqOverviewModalInstance.show();
}
window.openRequestOverview = openRequestOverview;

// Save Modal Updates Button
function saveRequestModalAction() {
    if (!activeOverviewRequestId) return;
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(activeOverviewRequestId); });
    if (!req) return;

    const newStatus = document.getElementById("modalStatusSelect") ? document.getElementById("modalStatusSelect").value : req.status;
    const assignedVolId = document.getElementById("modalVolunteerSelect") ? document.getElementById("modalVolunteerSelect").value : "";

    req.status = newStatus;
    if (assignedVolId) {
        const volunteers = readRecords("disasterVolunteers");
        const assignedVol = volunteers.find(function (v) { return String(v.id) === String(assignedVolId); });
        if (assignedVol) {
            req.assignedVolunteer = { id: assignedVol.id, name: assignedVol.name, phone: assignedVol.phone || assignedVol.mobileNumber };
            req.assignedVolunteerId = assignedVol.id;
            assignedVol.status = "Assigned";
            writeRecords("disasterVolunteers", volunteers);
        }
        if (req.status === "Pending") req.status = "Assigned";
    }

    if (newStatus === "Resolved") {
        req.resolvedDate = req.resolvedDate || new Date().toLocaleString();
        req.resolvedAt = req.resolvedAt || new Date().toISOString();
        req.resolvedYear = req.resolvedYear || new Date().getFullYear();
        req.resolvedBy = `${currentMandal.officerName} (${currentMandal.employeeId})`;
    }

    writeRecords("disasterHelpRequests", requests);

    const modalEl = document.getElementById("requestOverviewModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }

    showToast(`Request #${req.trackId || req.id} updated to ${req.status}.`);
    renderDashboardView();
    renderRequestsTable();
    renderAnnualStatements();
}
window.saveRequestModalAction = saveRequestModalAction;

function advanceRequestStatus(requestId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(requestId); });
    if (!req) return;

    const currentStatus = (req.status || "Pending").toLowerCase();
    let nextStatus = "Verified";
    if (currentStatus === "pending") nextStatus = "Verified";
    else if (currentStatus === "verified") nextStatus = "Assigned";
    else if (currentStatus === "assigned") nextStatus = "In Progress";
    else if (currentStatus === "in progress") nextStatus = "Resolved";
    else if (currentStatus === "resolved") nextStatus = "Pending";

    req.status = nextStatus;
    if (nextStatus === "Resolved") {
        req.resolvedDate = new Date().toLocaleString();
        req.resolvedAt = new Date().toISOString();
        req.resolvedYear = new Date().getFullYear();
        req.resolvedBy = `${currentMandal.officerName} (${currentMandal.employeeId})`;
    }

    writeRecords("disasterHelpRequests", requests);
    showToast(`Request #${req.trackId || req.id} status updated to ${nextStatus}.`);

    renderDashboardView();
    renderRequestsTable();
    renderAnnualStatements();
}
window.advanceRequestStatus = advanceRequestStatus;

function quickResolveRequest(requestId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(requestId); });
    if (!req) return;

    if (!confirm(`Mark Emergency Request #${req.trackId || req.id} as Resolved and archive to Annual Statement?`)) return;

    req.status = "Resolved";
    req.resolvedDate = new Date().toLocaleString();
    req.resolvedAt = new Date().toISOString();
    req.resolvedYear = new Date().getFullYear();
    req.resolvedBy = `${currentMandal.officerName} (${currentMandal.employeeId})`;

    writeRecords("disasterHelpRequests", requests);
    showToast(`Request #${req.trackId || req.id} marked as Resolved and archived.`);

    renderDashboardView();
    renderRequestsTable();
    renderAnnualStatements();
}
window.quickResolveRequest = quickResolveRequest;

// ========================================================
// 9. VIEW 3: VOLUNTEERS & DUAL-SIDED ID CARD
// ========================================================
function renderVolunteersTable() {
    const all = getRoutedVolunteers();
    const searchVal = (document.getElementById("volSearchInput") ? document.getElementById("volSearchInput").value : "").toLowerCase().trim();
    const statusVal = (document.getElementById("volStatusFilter") ? document.getElementById("volStatusFilter").value : "all").toLowerCase().trim();
    const skillVal = (document.getElementById("volSkillFilter") ? document.getElementById("volSkillFilter").value : "all").toLowerCase().trim();

    const filtered = all.filter(function (vol) {
        const status = (vol.status || "Available").toLowerCase();
        const approval = (vol.approvalStatus || "").toLowerCase();

        if (statusVal === "pending") {
            if (status !== "pending" && approval !== "pending" && status !== "new") return false;
        } else if (statusVal !== "all" && status !== statusVal) {
            return false;
        }

        if (skillVal !== "all") {
            const skills = (vol.skills || "").toLowerCase();
            if (!skills.includes(skillVal)) return false;
        }

        if (searchVal) {
            const id = (vol.volunteerId || String(vol.id)).toLowerCase();
            const name = (vol.name || "").toLowerCase();
            const phone = (vol.phone || vol.mobileNumber || "").toLowerCase();
            const skills = (vol.skills || "").toLowerCase();
            const blood = (vol.bloodGroup || "").toLowerCase();
            if (!id.includes(searchVal) && !name.includes(searchVal) && !phone.includes(searchVal) && !skills.includes(searchVal) && !blood.includes(searchVal)) return false;
        }
        return true;
    });

    const badgeEl = document.getElementById("volFilterCountBadge");
    if (badgeEl) badgeEl.textContent = `Showing ${filtered.length} of ${all.length}`;

    const tbody = document.getElementById("mandalVolunteersTableBody");
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No volunteers matching your filters in this mandal.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function (vol) {
        const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
        const volId = vol.volunteerId || ("DRVOL-" + String(vol.id).slice(-4).padStart(4, "0"));
        const isPending = (vol.status || "").toLowerCase() === "pending" || (vol.approvalStatus || "").toLowerCase() === "pending" || (vol.status || "").toLowerCase() === "new";
        const isAvailable = (vol.status || "Available") !== "Unavailable" && !isPending;
        const photoSrc = getVolunteerPhotoSrc(vol);

        let statusBadge = `<span class="status-pill ${isAvailable ? 'available' : 'unavailable'}">${escapeHtml(vol.status || "Available")}</span>`;
        if (isPending) {
            statusBadge = `<span class="badge bg-warning text-dark border px-2 py-1"><i class="bi bi-clock-history me-1"></i> Pending Approval</span>`;
        }

        return `<tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div style="width:38px;height:38px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:bold;overflow:hidden;flex-shrink:0;">
                        ${photoSrc ? `<img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;">` : initials}
                    </div>
                    <div>
                        <strong>${escapeHtml(vol.name)}</strong><br>
                        <small class="text-muted">${escapeHtml(vol.role || "Disaster Relief Volunteer")}</small>
                    </div>
                </div>
            </td>
            <td class="font-monospace text-primary fw-bold">${escapeHtml(volId)}</td>
            <td>
                <div class="font-monospace">${escapeHtml(vol.phone || vol.mobileNumber || "N/A")}</div>
                <span class="badge bg-danger">${escapeHtml(vol.bloodGroup || "O+")}</span>
            </td>
            <td>
                <div>${escapeHtml(vol.mandal || currentMandal.mandal)}</div>
                <small class="text-muted">${escapeHtml(vol.district || currentMandal.district)}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(vol.skills || "Disaster Relief")}</span></td>
            <td>${statusBadge}</td>
            <td>
                <div class="d-flex gap-1 flex-wrap">
                    ${isPending ? `
                        <button class="btn btn-sm btn-success py-1 px-2" type="button" onclick="approveVolunteerApplication('${vol.id}')" title="Approve Volunteer Application">
                            <i class="bi bi-check-circle-fill"></i> Approve
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-primary py-1 px-2" type="button" onclick="openVolunteerOverview('${vol.id}')" title="Application Details">
                        <i class="bi bi-eye"></i> Details
                    </button>
                    <button class="btn btn-sm btn-primary py-1 px-2" type="button" onclick="openVolunteerIdCard('${vol.id}')" title="Official Dual-Sided ID Card">
                        <i class="bi bi-person-vcard"></i> ID Card
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

// APPROVE VOLUNTEER APPLICATION FUNCTION
function approveVolunteerApplication(volId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (v) { return String(v.id) === String(volId); });
    if (!vol) return;

    vol.status = "Available";
    vol.approvalStatus = "Approved";
    vol.approvedBy = `${currentMandal.officerName || "Mandal Officer"} (${currentMandal.mandal || "Mandal"} Desk)`;
    vol.approvedAt = new Date().toLocaleString();
    writeRecords("disasterVolunteers", volunteers);

    // Synchronize account in disasterUserAccounts
    const accounts = readRecords("disasterUserAccounts");
    let accountUpdated = false;
    accounts.forEach(function (acc) {
        if (acc.role === "Volunteer" && (
            (vol.username && acc.username && acc.username.toLowerCase() === vol.username.toLowerCase()) ||
            acc.profileName === vol.name ||
            (vol.phone && acc.phone === vol.phone)
        )) {
            acc.status = "Active";
            acc.approvalStatus = "Approved";
            accountUpdated = true;
        }
    });
    if (accountUpdated) {
        writeRecords("disasterUserAccounts", accounts);
    }

    const modalEl = document.getElementById("volunteerOverviewModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
    }

    renderVolunteersTable();
    renderDashboardView();
    showToast(`Volunteer application for ${vol.name} has been APPROVED! Volunteer can now log in to the portal.`);
}
window.approveVolunteerApplication = approveVolunteerApplication;

// Volunteer Overview modal
function openVolunteerOverview(volId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (v) { return String(v.id) === String(volId); });
    if (!vol) return;

    const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
    const formattedId = vol.volunteerId || ("DRVOL-" + String(vol.id).slice(-4).padStart(4, "0"));
    const photoSrc = getVolunteerPhotoSrc(vol);

    const img = document.getElementById("volOvImg");
    const initEl = document.getElementById("volOvInitials");
    if (photoSrc) {
        if (img) {
            img.src = photoSrc;
            img.style.display = "block";
        }
        if (initEl) initEl.style.display = "none";
    } else {
        if (img) img.style.display = "none";
        if (initEl) {
            initEl.textContent = initials;
            initEl.style.display = "block";
        }
    }

    const nameEl = document.getElementById("volOvName");
    if (nameEl) nameEl.textContent = vol.name;
    const idEl = document.getElementById("volOvId");
    if (idEl) idEl.textContent = formattedId;
    const distEl = document.getElementById("volOvDistrict");
    if (distEl) distEl.textContent = vol.district || currentMandal.district;
    const mandalEl = document.getElementById("volOvMandal");
    if (mandalEl) mandalEl.textContent = vol.mandal || currentMandal.mandal;
    const mobileEl = document.getElementById("volOvMobile");
    if (mobileEl) mobileEl.textContent = vol.phone || vol.mobileNumber || "N/A";
    const bloodEl = document.getElementById("volOvBloodGroup");
    if (bloodEl) bloodEl.textContent = vol.bloodGroup || "O+";
    const skillsEl = document.getElementById("volOvSkills");
    if (skillsEl) skillsEl.textContent = vol.skills || "General Relief";

    const badge = document.getElementById("volOvStatusBadge");
    if (badge) {
        badge.textContent = vol.status || "Available";
        badge.className = `status-pill ${(vol.status || 'Available').toLowerCase()}`;
    }

    const approveBtn = document.getElementById("volOvApproveBtn");
    if (approveBtn) {
        const isPending = (vol.status || "").toLowerCase() === "pending" || (vol.approvalStatus || "").toLowerCase() === "pending" || (vol.status || "").toLowerCase() === "new";
        if (isPending) {
            approveBtn.style.display = "inline-flex";
            approveBtn.onclick = function () {
                approveVolunteerApplication(vol.id);
            };
        } else {
            approveBtn.style.display = "none";
        }
    }

    const phoneClean = String(vol.phone || vol.mobileNumber || "").replace(/\D/g, "");
    const callBtn = document.getElementById("volCallBtn");
    if (callBtn) {
        if (phoneClean) {
            callBtn.href = `tel:${phoneClean}`;
            callBtn.style.display = "inline-flex";
        } else {
            callBtn.style.display = "none";
        }
    }
    const waBtn = document.getElementById("volWhatsAppBtn");
    if (waBtn) {
        if (phoneClean) {
            waBtn.href = `https://wa.me/91${phoneClean}?text=${encodeURIComponent(`Hello ${vol.name}, message from ${currentMandal.mandal} Disaster Control Room:`)}`;
            waBtn.style.display = "inline-flex";
        } else {
            waBtn.style.display = "none";
        }
    }

    const btn = document.getElementById("volOvOpenIdCardBtn");
    if (btn) {
        btn.onclick = function () {
            if (volOverviewModalInstance) volOverviewModalInstance.hide();
            openVolunteerIdCard(vol.id);
        };
    }

    const modalEl = document.getElementById("volunteerOverviewModal");
    if (!volOverviewModalInstance && modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        volOverviewModalInstance = new bootstrap.Modal(modalEl);
    }
    if (volOverviewModalInstance) volOverviewModalInstance.show();
}
window.openVolunteerOverview = openVolunteerOverview;

// ========================================================
// JURISDICTIONAL DIRECTORY & EMERGENCY DEPARTMENT MAPPING
// (Strictly routes to local Police, Fire & Medical facilities)
// ========================================================
const jurisdictionalDirectory = {
    "paderu": {
        police: { name: "Paderu Police Station (Town Station)", incharge: "CI K. Srinivas Rao", phone: "+91 8935 252233", emergency: "112 / 100", jurisdiction: "Paderu Mandal", address: "Main Road, Near Collectorate, Paderu" },
        fire: { name: "Paderu Fire & Emergency Services Station", officer: "Station Officer M. Appa Rao", phone: "+91 8935 252101", emergency: "101", jurisdiction: "Paderu & Surrounding Agencies", address: "Opp. Sub-Collector Office, Paderu" },
        hospital: { name: "Paderu District Area Hospital & Community Health Centre (CHC)", superintendent: "Dr. T. Venkata Ramana", phone: "+91 8935 252244", emergency: "108 / 104", jurisdiction: "Paderu Mandal & Tribal Agency Network", address: "Hospital Road, Paderu - 531024" }
    },
    "araku valley": {
        police: { name: "Araku Police Station", incharge: "SI G. Someswara Rao", phone: "+91 8936 249633", emergency: "112", jurisdiction: "Araku Valley Mandal", address: "Near Post Office, Araku Valley" },
        fire: { name: "Araku Valley Fire Station", officer: "Station Officer K. Satyanarayana", phone: "+91 8936 249101", emergency: "101", jurisdiction: "Araku Valley Mandal", address: "Main Ghat Road, Araku Valley" },
        hospital: { name: "Araku Valley Area Hospital & Tribal Medical Centre", superintendent: "Dr. P. Swaroopa Rani", phone: "+91 8936 249222", emergency: "108", jurisdiction: "Araku Valley Mandal", address: "Agency Hospital Road, Araku Valley" }
    },
    "rampachodavaram": {
        police: { name: "Rampachodavaram Police Station", incharge: "CI B. Venkateswara Rao", phone: "+91 8864 243233", emergency: "112", jurisdiction: "Rampachodavaram Mandal", address: "Main Road, Rampachodavaram" },
        fire: { name: "Rampachodavaram Fire & Emergency Station", officer: "Station Officer C. Ravi Kumar", phone: "+91 8864 243101", emergency: "101", jurisdiction: "Rampachodavaram Agency Division", address: "Govt Hospital Junction, Rampachodavaram" },
        hospital: { name: "Rampachodavaram Community Health Centre (CHC)", superintendent: "Dr. V. Prasad", phone: "+91 8864 243222", emergency: "108", jurisdiction: "Rampachodavaram Mandal", address: "Agency Highway, Rampachodavaram" }
    },
    "chintapalli": {
        police: { name: "Chintapalli Police Station", incharge: "SI D. Ramu", phone: "+91 8937 254233", emergency: "112", jurisdiction: "Chintapalli Mandal", address: "Main Road, Chintapalli" },
        fire: { name: "Chintapalli Fire Station", officer: "Station Officer N. Ramesh", phone: "+91 8937 254101", emergency: "101", jurisdiction: "Chintapalli Mandal", address: "RTC Bus Stand Road, Chintapalli" },
        hospital: { name: "Chintapalli Community Health Centre (CHC)", superintendent: "Dr. K. Madhavi", phone: "+91 8937 254222", emergency: "108", jurisdiction: "Chintapalli Mandal", address: "Forest Office Road, Chintapalli" }
    },
    "maredumilli": {
        police: { name: "Maredumilli Police Station", incharge: "SI S. Durga Rao", phone: "+91 8864 245233", emergency: "112", jurisdiction: "Maredumilli Mandal", address: "Forest Ghat Road, Maredumilli" },
        fire: { name: "Maredumilli Emergency Unit (Rampachodavaram Division)", officer: "Station Officer C. Ravi Kumar", phone: "+91 8864 243101", emergency: "101", jurisdiction: "Maredumilli & Agency Forest Sector", address: "Rampachodavaram Fire Division HQ" },
        hospital: { name: "Maredumilli Primary Health Centre (PHC)", superintendent: "Dr. A. Srinivas", phone: "+91 8864 245222", emergency: "108", jurisdiction: "Maredumilli Mandal", address: "Eco-Tourism Junction, Maredumilli" }
    },
    "vijayawada rural": {
        police: { name: "Nunna Police Station (Vijayawada Rural Jurisdiction)", incharge: "CI M. Suresh Babu", phone: "+91 866 2882233", emergency: "112 / 100", jurisdiction: "Vijayawada Rural Mandal", address: "Nunna Junction, Vijayawada Rural" },
        fire: { name: "Vijayawada Rural Fire Station (Auto Nagar / Enikepadu)", officer: "Station Officer P. Narayana", phone: "+91 866 2543101", emergency: "101", jurisdiction: "Vijayawada Rural Mandal", address: "NH-16 Bypass, Enikepadu, Vijayawada Rural" },
        hospital: { name: "Vijayawada Rural Community Health Centre (CHC) & Gollapudi PHC", superintendent: "Dr. K. V. Subba Rao", phone: "+91 866 2412244", emergency: "108", jurisdiction: "Vijayawada Rural Mandal", address: "Gollapudi Bypass Road, Vijayawada Rural" }
    }
};

function getJurisdictionalDepartments(mandalName, districtName) {
    const key = (mandalName || (currentMandal ? currentMandal.mandal : "") || "").toLowerCase().trim();
    if (jurisdictionalDirectory[key]) {
        return jurisdictionalDirectory[key];
    }
    const m = mandalName || (currentMandal ? currentMandal.mandal : "Local");
    const d = districtName || (currentMandal ? currentMandal.district : "District");
    return {
        police: { name: `${m} Police Station`, incharge: "Circle Inspectorate Desk", phone: "112 / 100", emergency: "112", jurisdiction: `${m} Mandal, ${d}`, address: `Main Station, ${m}` },
        fire: { name: `${m} Fire & Emergency Response Station`, officer: "Divisional Fire Officer", phone: "101", emergency: "101", jurisdiction: `${m} Mandal`, address: `Civil Emergency Complex, ${m}` },
        hospital: { name: `${m} Community Health Centre (CHC) & Area Hospital`, superintendent: "Civil Surgeon RMO", phone: "108 / 104", emergency: "108", jurisdiction: `${m} Mandal & Surrounding Villages`, address: `Government Hospital Road, ${m}` }
    };
}
window.getJurisdictionalDepartments = getJurisdictionalDepartments;

// ========================================================
// SECTION: MANDAL VOLUNTEER ASSIGNMENT DISPATCH & TRACKING
// (Requirements 3, 4, 5)
// ========================================================
let activeAssignSelectedRequestId = null;
let currentDeptNotificationStep = "police";
let currentDeptNotificationAnswers = { police: false, fire: false, hospital: false };

function populateMandalAssignView() {
    const requests = getRoutedHelpRequests().filter(function (r) { return r.status !== "Resolved"; });
    const reqSelect = document.getElementById("mandalAssignSelectRequest");
    const reqBadge = document.getElementById("assignRequestCountBadge");

    if (reqBadge) reqBadge.textContent = `${requests.length} Pending`;

    if (reqSelect) {
        reqSelect.innerHTML = '<option value="">-- Choose Emergency Request --</option>' + requests.map(function (r) {
            const id = r.trackId || ("#" + String(r.id).slice(-6));
            const volCount = (r.assignedVolunteers && r.assignedVolunteers.length) ? r.assignedVolunteers.length : (r.assignedVolunteer ? 1 : 0);
            const assignedTxt = volCount > 0 ? ` [${volCount} Volunteer(s) Assigned]` : " [Unassigned]";
            return `<option value="${r.id}">${escapeHtml(id)} - ${escapeHtml(r.name)} (${escapeHtml(r.village || r.location || "Mandal Area")}) [${escapeHtml(r.priority || 'Medium')}]${assignedTxt}</option>`;
        }).join("");

        if (activeAssignSelectedRequestId && requests.some(function (r) { return String(r.id) === String(activeAssignSelectedRequestId); })) {
            reqSelect.value = String(activeAssignSelectedRequestId);
        } else if (requests.length > 0 && !reqSelect.value) {
            reqSelect.value = String(requests[0].id);
        }
    }

    handleAssignRequestChange();
    renderMandalActiveAssignmentsTable();
    renderMandalDepartmentDispatchesTable();
}
window.populateMandalAssignView = populateMandalAssignView;

function handleAssignRequestChange() {
    const reqSelect = document.getElementById("mandalAssignSelectRequest");
    const reqCard = document.getElementById("mandalAssignSelectedRequestCard");
    const btn = document.getElementById("executeMandalAssignmentBtn");
    const volList = document.getElementById("mandalAssignVolunteersChecklist");
    const badge = document.getElementById("selectedVolunteersCountBadge");

    const reqId = reqSelect ? reqSelect.value : "";
    activeAssignSelectedRequestId = reqId || null;

    if (!reqId) {
        if (reqCard) reqCard.style.display = "none";
        if (btn) btn.disabled = true;
        if (volList) volList.innerHTML = '<div class="text-muted small p-3 text-center">Select an emergency application to view and assign volunteers.</div>';
        if (badge) badge.textContent = "0 Selected";
        return;
    }

    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req) return;

    if (reqCard) {
        reqCard.style.display = "block";
        const nameEl = document.getElementById("assignCardApplicantName");
        if (nameEl) nameEl.textContent = req.name || "Citizen Beneficiary";
        const locEl = document.getElementById("assignCardLocation");
        if (locEl) locEl.textContent = `${req.village || req.location || "Village Area"}, ${req.mandal || currentMandal.mandal}`;
        const phoneEl = document.getElementById("assignCardPhone");
        if (phoneEl) phoneEl.textContent = req.phone || "No contact";
        const prioEl = document.getElementById("assignCardPriority");
        if (prioEl) {
            prioEl.textContent = (req.priority || "Medium").toUpperCase();
            prioEl.className = `badge ${req.priority === 'Critical' ? 'bg-danger' : (req.priority === 'High' ? 'bg-warning text-dark' : 'bg-primary')}`;
        }
        const lossesEl = document.getElementById("assignCardLosses");
        if (lossesEl) lossesEl.textContent = req.losses || req.assistanceNeeded || "Emergency Assistance Needed";

        const assignedEl = document.getElementById("assignCardCurrentAssigned");
        if (assignedEl) {
            const list = req.assignedVolunteers || (req.assignedVolunteer ? [req.assignedVolunteer] : []);
            if (list.length > 0) {
                assignedEl.innerHTML = list.map(function (v) {
                    return `<span class="badge bg-primary-subtle text-primary border me-1">${escapeHtml(v.name)} (${escapeHtml(v.status || 'Assigned')})</span>`;
                }).join(" ");
            } else {
                assignedEl.textContent = "None (Awaiting Dispatch)";
            }
        }
    }

    renderAssignVolunteersChecklist(req);
}
window.handleAssignRequestChange = handleAssignRequestChange;

function renderAssignVolunteersChecklist(selectedReq) {
    const container = document.getElementById("mandalAssignVolunteersChecklist");
    const badge = document.getElementById("selectedVolunteersCountBadge");
    const btn = document.getElementById("executeMandalAssignmentBtn");
    if (!container) return;

    const volunteers = getRoutedVolunteers();
    if (!volunteers.length) {
        container.innerHTML = '<div class="text-muted small p-3 text-center">No volunteers currently registered in this mandal. Click "Volunteers" &rarr; "Enroll Mandal Volunteer" to add personnel.</div>';
        if (badge) badge.textContent = "0 Selected";
        if (btn) btn.disabled = true;
        return;
    }

    const assignedIds = new Set();
    if (selectedReq) {
        if (Array.isArray(selectedReq.assignedVolunteers)) {
            selectedReq.assignedVolunteers.forEach(function (v) { assignedIds.add(String(v.id)); });
        } else if (selectedReq.assignedVolunteer && selectedReq.assignedVolunteer.id) {
            assignedIds.add(String(selectedReq.assignedVolunteer.id));
        }
    }

    container.innerHTML = volunteers.map(function (vol) {
        const isAssignedToThis = assignedIds.has(String(vol.id));
        const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
        const photoSrc = getVolunteerPhotoSrc(vol);
        const avatarHtml = photoSrc ? `<img src="${photoSrc}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : initials;
        const volId = vol.volunteerId || ("DRVOL-" + String(vol.id).slice(-4));

        return `<label class="assign-vol-item ${isAssignedToThis ? 'selected' : ''}" data-id="${vol.id}">
            <input type="checkbox" class="form-check-input mandal-assign-vol-chk" value="${vol.id}" ${isAssignedToThis ? 'checked' : ''} onchange="handleAssignVolunteerCheckboxChange(this)">
            <div class="assign-vol-avatar">${avatarHtml}</div>
            <div class="flex-grow-1" style="min-width:0;">
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="text-truncate" style="font-size: 13px;">${escapeHtml(vol.name)}</strong>
                    <span class="badge ${vol.status === 'Available' ? 'bg-success' : 'bg-secondary'}" style="font-size: 9px;">${escapeHtml(vol.status || 'Available')}</span>
                </div>
                <small class="text-muted d-block text-truncate"><span class="font-monospace text-primary">${escapeHtml(volId)}</span> · ${escapeHtml(vol.skills || 'Relief Team')} · <i class="bi bi-telephone"></i> ${escapeHtml(vol.phone || vol.mobileNumber || "N/A")}</small>
            </div>
        </label>`;
    }).join("");

    updateAssignVolunteersCount();
}

function handleAssignVolunteerCheckboxChange(chk) {
    const item = chk.closest(".assign-vol-item");
    if (item) {
        if (chk.checked) item.classList.add("selected");
        else item.classList.remove("selected");
    }
    updateAssignVolunteersCount();
}
window.handleAssignVolunteerCheckboxChange = handleAssignVolunteerCheckboxChange;

function updateAssignVolunteersCount() {
    const checked = document.querySelectorAll(".mandal-assign-vol-chk:checked");
    const badge = document.getElementById("selectedVolunteersCountBadge");
    const btn = document.getElementById("executeMandalAssignmentBtn");
    if (badge) badge.textContent = `${checked.length} Selected`;
    if (btn) btn.disabled = checked.length === 0 || !activeAssignSelectedRequestId;
}

function filterAssignVolunteersList() {
    const q = (document.getElementById("mandalAssignVolSearch") ? document.getElementById("mandalAssignVolSearch").value : "").toLowerCase().trim();
    document.querySelectorAll(".assign-vol-item").forEach(function (item) {
        const text = item.textContent.toLowerCase();
        item.style.display = (!q || text.includes(q)) ? "flex" : "none";
    });
}
window.filterAssignVolunteersList = filterAssignVolunteersList;

// REQUIREMENT 4: ASSIGN ANY NUMBER OF VOLUNTEERS TO A SINGLE APPLICATION
function executeMandalAssignment() {
    if (!activeAssignSelectedRequestId) {
        alert("Please select an emergency help request application first.");
        return;
    }
    const checkedBoxes = Array.from(document.querySelectorAll(".mandal-assign-vol-chk:checked"));
    if (!checkedBoxes.length) {
        alert("Please select at least one field volunteer to assign to this application.");
        return;
    }

    const selectedVolIds = checkedBoxes.map(function (c) { return c.value; });
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(activeAssignSelectedRequestId); });
    const volunteers = readRecords("disasterVolunteers");

    if (!req) return;

    // Existing assignments map to preserve their active status
    const existingMap = new Map();
    if (Array.isArray(req.assignedVolunteers)) {
        req.assignedVolunteers.forEach(function (av) {
            existingMap.set(String(av.id), av);
        });
    }

    const newlyAssignedVolunteers = [];
    selectedVolIds.forEach(function (vId) {
        const vol = volunteers.find(function (v) { return String(v.id) === String(vId); });
        if (vol) {
            const existing = existingMap.get(String(vol.id));
            newlyAssignedVolunteers.push({
                id: vol.id,
                volunteerId: vol.volunteerId || ("DRVOL-" + String(vol.id).slice(-4)),
                name: vol.name,
                phone: vol.phone || vol.mobileNumber,
                skills: vol.skills || "Relief Volunteer",
                role: vol.role || "Field Responder",
                status: existing ? existing.status : "Assigned",
                assignedAt: existing ? existing.assignedAt : new Date().toLocaleString(),
                assignedBy: `${currentMandal.officerName || "Mandal Officer"} (${currentMandal.mandal} Desk)`
            });
            vol.status = "Assigned";
        }
    });

    req.assignedVolunteers = newlyAssignedVolunteers;
    req.assignedVolunteer = newlyAssignedVolunteers[0] || null;
    req.assignedVolunteerId = newlyAssignedVolunteers[0] ? newlyAssignedVolunteers[0].id : null;
    req.status = "Assigned";
    req.assignedAt = req.assignedAt || new Date().toLocaleString();
    req.assignedBy = `${currentMandal.officerName || "Mandal Officer"} (${currentMandal.mandal} Desk)`;

    writeRecords("disasterHelpRequests", requests);
    writeRecords("disasterVolunteers", volunteers);

    populateMandalAssignView();
    renderRequestsTable();
    renderVolunteersTable();
    renderDashboardView();

    showToast(`Successfully assigned ${newlyAssignedVolunteers.length} volunteer(s) to application #${req.trackId || req.id}!`);

    // If departments have not been notified for this request, launch the 3-step notification wizard!
    if (!req.departmentNotifications || !req.departmentNotifications.completed) {
        setTimeout(function () {
            openDepartmentNotificationModal(req.id);
        }, 350);
    }
}
window.executeMandalAssignment = executeMandalAssignment;

// REQUIREMENT 4: DISPLAY ONLY VOLUNTEER DETAILS WITH ASSIGNMENT STATUSES TO TRACK PROGRESS
function renderMandalActiveAssignmentsTable() {
    const tbody = document.getElementById("mandalActiveAssignmentsTable");
    if (!tbody) return;

    const filterVal = (document.getElementById("volAssignmentStatusFilter") ? document.getElementById("volAssignmentStatusFilter").value : "all").toLowerCase();
    const requests = getRoutedHelpRequests();

    // Flatten volunteer-centric assignments across requests
    const volAssignments = [];
    requests.forEach(function (req) {
        const vList = req.assignedVolunteers || (req.assignedVolunteer ? [req.assignedVolunteer] : []);
        vList.forEach(function (v) {
            volAssignments.push({
                volunteer: v,
                request: req
            });
        });
    });

    const filtered = volAssignments.filter(function (item) {
        if (filterVal === "all") return true;
        return (item.volunteer.status || "Assigned").toLowerCase() === filterVal;
    });

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No volunteers currently deployed matching the status filter.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function (item) {
        const v = item.volunteer;
        const req = item.request;
        const initials = (v.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
        const curStatus = v.status || "Assigned";

        let statusBadgeClass = "bg-primary text-white";
        if (curStatus === "Verified / Completed" || curStatus === "Completed") statusBadgeClass = "bg-success text-white";
        else if (curStatus === "Assistance Required") statusBadgeClass = "bg-danger text-white";
        else if (curStatus === "Rejected / Rework Required") statusBadgeClass = "bg-danger text-white";
        else if (curStatus === "Submitted for Verification") statusBadgeClass = "bg-info text-dark";
        else if (curStatus === "Work in Progress" || curStatus === "In Progress" || curStatus === "On Scene") statusBadgeClass = "bg-warning text-dark";
        else if (curStatus === "On the Way" || curStatus === "En Route" || curStatus === "Reached Location") statusBadgeClass = "bg-primary text-white";

        const trackId = req.trackId || ("#" + String(req.id).slice(-6));
        const volKeyId = v.id || v.volunteerId;

        return `<tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <span class="mandal-avatar-circle" style="width: 32px; height: 32px; font-size: 11px;">${initials}</span>
                    <div>
                        <strong class="d-block" style="font-size: 13px;">${escapeHtml(v.name || v.volunteerName)}</strong>
                        <small class="text-muted font-monospace">${escapeHtml(v.volunteerId || 'DRVOL')}</small>
                    </div>
                </div>
            </td>
            <td>
                <a href="tel:${escapeHtml(v.phone)}" class="text-decoration-none small text-dark fw-bold">
                    <i class="bi bi-telephone-fill text-success me-1"></i>${escapeHtml(v.phone || "N/A")}
                </a>
            </td>
            <td><span class="badge bg-light text-dark border small">${escapeHtml(v.skills || 'Relief Team')}</span></td>
            <td>
                <div>
                    <a href="#" onclick="openApplicantDetailsModal('${req.id}'); return false;" class="font-monospace fw-bold text-primary text-decoration-none">${escapeHtml(trackId)}</a>
                    <small class="d-block text-muted">${escapeHtml(req.name)} (${escapeHtml(req.village || req.location || 'Mandal')})</small>
                </div>
            </td>
            <td><small class="text-muted">${escapeHtml(v.assignedAt || req.assignedAt || 'Today')}</small></td>
            <td>
                <span class="badge ${statusBadgeClass} py-1 px-2 border" id="volBadge_${volKeyId}_${req.id}">${escapeHtml(curStatus)}</span>
                ${curStatus === "Assistance Required" ? '<small class="d-block text-danger fw-bold mt-1"><i class="bi bi-megaphone-fill"></i> Supplies Needed</small>' : ''}
            </td>
            <td>
                <select class="form-select form-select-sm" style="font-size: 11px; max-width: 175px;" onchange="updateVolunteerAssignmentStatus('${volKeyId}', '${req.id}', this.value)" title="Update volunteer field workflow status">
                    <option value="Assigned" ${curStatus === 'Assigned' ? 'selected' : ''}>1. Assigned</option>
                    <option value="Accepted" ${curStatus === 'Accepted' ? 'selected' : ''}>2. Accepted</option>
                    <option value="On the Way" ${curStatus === 'On the Way' || curStatus === 'En Route' ? 'selected' : ''}>3. On the Way</option>
                    <option value="Reached Location" ${curStatus === 'Reached Location' || curStatus === 'On Scene' ? 'selected' : ''}>4. Reached Location</option>
                    <option value="Work in Progress" ${curStatus === 'Work in Progress' || curStatus === 'In Progress' ? 'selected' : ''}>5. Work in Progress</option>
                    <option value="Assistance Required" ${curStatus === 'Assistance Required' ? 'selected' : ''}>6. Assistance Required</option>
                    <option value="Submitted for Verification" ${curStatus === 'Submitted for Verification' ? 'selected' : ''}>7. Submitted for Verification</option>
                    <option value="Verified / Completed" ${curStatus === 'Verified / Completed' || curStatus === 'Completed' ? 'selected' : ''}>8. Verified / Completed</option>
                    <option value="Rejected / Rework Required" ${curStatus === 'Rejected / Rework Required' ? 'selected' : ''}>9. Rejected / Rework</option>
                </select>
            </td>
            <td>
                <div class="d-flex align-items-center gap-1">
                    ${(curStatus === 'Submitted for Verification' || (v.evidencePhotos && v.evidencePhotos.length > 0)) ? `
                        <button type="button" class="btn btn-sm btn-info py-0 px-2 fw-bold text-dark" onclick="openMandalReviewEvidenceModal('${volKeyId}', '${req.id}')" title="Review Evidence & Photos">
                            <i class="bi bi-shield-check"></i> Review
                        </button>
                    ` : ''}
                    ${curStatus === 'Assistance Required' ? `
                        <button type="button" class="btn btn-sm btn-warning py-0 px-2 fw-bold text-dark" onclick="openMandalReviewEvidenceModal('${volKeyId}', '${req.id}')" title="View Assistance Requirements">
                            <i class="bi bi-heart-pulse-fill text-danger"></i> Aid
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="unassignSpecificVolunteer('${volKeyId}', '${req.id}')" title="Unassign this volunteer">
                        <i class="bi bi-person-x"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

// UPDATE VOLUNTEER STATUS & MONITOR FIELD PROGRESS (REQUIREMENT 4)
function updateVolunteerAssignmentStatus(volId, reqId, newStatus, remarks) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (v) { return String(v.id) === String(volId) || String(v.volunteerId) === String(volId); });

    if (!req) return;

    if (Array.isArray(req.assignedVolunteers)) {
        const assignedVol = req.assignedVolunteers.find(function (av) {
            return String(av.id) === String(volId) || String(av.volunteerId) === String(volId);
        });
        if (assignedVol) {
            assignedVol.status = newStatus;
            assignedVol.lastStatusUpdate = new Date().toLocaleString();
            if (!assignedVol.statusHistory) assignedVol.statusHistory = [];
            assignedVol.statusHistory.unshift({
                status: newStatus,
                updatedBy: currentMandal ? currentMandal.mandal + " Officer" : "Mandal Officer",
                volunteerId: volId,
                timestamp: Date.now(),
                date: new Date().toLocaleString(),
                remarks: remarks || `Status updated to ${newStatus} by Mandal Officer`
            });
        }
    }
    if (req.assignedVolunteer && (String(req.assignedVolunteer.id) === String(volId) || String(req.assignedVolunteer.volunteerId) === String(volId))) {
        req.assignedVolunteer.status = newStatus;
    }

    if (vol) {
        if (newStatus === "Completed" || newStatus === "Verified / Completed") {
            vol.status = "Available";
        } else {
            vol.status = "Assigned";
        }
    }

    // Status reflection on request
    if (newStatus === "Verified / Completed" || newStatus === "Completed") {
        req.status = "Resolved";
        req.resolvedAt = new Date().toLocaleString();
        req.resolvedYear = new Date().getFullYear();
    } else if (newStatus === "Assistance Required") {
        req.status = "Assistance Required";
    } else if (newStatus === "Submitted for Verification") {
        req.status = "Submitted for Verification";
    } else if (newStatus === "Rejected / Rework Required") {
        req.status = "Rejected / Rework Required";
    } else if (newStatus === "Work in Progress" || newStatus === "On Scene" || newStatus === "En Route" || newStatus === "On the Way") {
        req.status = "In Progress";
    }

    writeRecords("disasterHelpRequests", requests);
    writeRecords("disasterVolunteers", volunteers);

    renderMandalActiveAssignmentsTable();
    renderRequestsTable();
    renderVolunteersTable();
    renderDashboardView();

    showToast(`Volunteer field status updated to: ${newStatus}`);
}
window.updateVolunteerAssignmentStatus = updateVolunteerAssignmentStatus;

// SECTION: REVIEW VOLUNTEER EVIDENCE & OFFICER VERIFICATION MODAL
let currentReviewVolId = null;
let currentReviewReqId = null;

function openMandalReviewEvidenceModal(volId, reqId) {
    currentReviewVolId = volId;
    currentReviewReqId = reqId;

    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req) return;

    let vEntry = null;
    if (Array.isArray(req.assignedVolunteers)) {
        vEntry = req.assignedVolunteers.find(function (v) {
            return String(v.volunteerId) === String(volId) || String(v.id) === String(volId);
        });
    }
    if (!vEntry && req.assignedVolunteer && (String(req.assignedVolunteer.id) === String(volId) || String(req.assignedVolunteer.volunteerId) === String(volId))) {
        vEntry = req.assignedVolunteer;
    }
    if (!vEntry) {
        vEntry = { volunteerName: "Assigned Volunteer", volunteerId: volId, status: req.status || "Assigned" };
    }

    const trackId = req.trackId || ("#" + String(req.id).slice(-6));
    const trackBadge = document.getElementById("mandalReviewTrackId");
    if (trackBadge) trackBadge.textContent = trackId;

    const citizenEl = document.getElementById("mandalReviewCitizenName");
    if (citizenEl) citizenEl.textContent = req.name || "Affected Citizen";

    const statusBadge = document.getElementById("mandalReviewStatusBadge");
    if (statusBadge) {
        const curSt = vEntry.status || req.status || "Submitted for Verification";
        statusBadge.textContent = curSt;
        statusBadge.className = `badge ${(curSt === 'Assistance Required' ? 'bg-danger' : (curSt === 'Verified / Completed' ? 'bg-success' : 'bg-info text-dark'))}`;
    }

    const volNameEl = document.getElementById("mandalReviewVolunteerName");
    if (volNameEl) volNameEl.textContent = vEntry.volunteerName || vEntry.name || "Volunteer";
    const volIdEl = document.getElementById("mandalReviewVolunteerId");
    if (volIdEl) volIdEl.textContent = vEntry.volunteerId || "DRVOL-0001";

    const locEl = document.getElementById("mandalReviewLocation");
    if (locEl) locEl.textContent = `${req.village || req.location || 'Local Area'}, ${req.mandal || (currentMandal ? currentMandal.mandal : 'Mandal')}`;

    const notesEl = document.getElementById("mandalReviewNotes");
    if (notesEl) {
        if (vEntry.assistanceNeeded && vEntry.assistanceNeeded.required) {
            notesEl.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill"></i> ASSISTANCE REQUESTED:</span> ${escapeHtml(vEntry.assistanceNeeded.supplies ? vEntry.assistanceNeeded.supplies.join(", ") : "Emergency Supplies")}. People needing aid: ${vEntry.assistanceNeeded.peopleCount || 1}. Specific notes: ${escapeHtml(vEntry.assistanceNeeded.notes || "Immediate dispatch required.")}`;
        } else {
            notesEl.textContent = vEntry.actionReport || req.reportNotes || "Rescue and relief operations carried out per Mandal instructions.";
        }
    }

    const peopleEl = document.getElementById("mandalReviewPeopleCount");
    if (peopleEl) peopleEl.textContent = vEntry.peopleAssisted || (vEntry.assistanceNeeded ? vEntry.assistanceNeeded.peopleCount : 1);
    const suppliesEl = document.getElementById("mandalReviewSuppliesCount");
    if (suppliesEl) suppliesEl.textContent = vEntry.suppliesDistributed || (vEntry.assistanceNeeded && vEntry.assistanceNeeded.supplies ? vEntry.assistanceNeeded.supplies.join(", ") : "Food & Drinking Water packets");

    const galleryEl = document.getElementById("mandalReviewPhotoGallery");
    const countBadge = document.getElementById("mandalReviewPhotoCount");
    const photos = Array.isArray(vEntry.evidencePhotos) ? vEntry.evidencePhotos : [];

    if (countBadge) countBadge.textContent = `${photos.length} Photo${photos.length === 1 ? '' : 's'}`;

    if (galleryEl) {
        if (!photos.length) {
            galleryEl.innerHTML = `<div class="text-muted small py-3 col-12">No photos uploaded by volunteer for this task.</div>`;
        } else {
            galleryEl.innerHTML = photos.map(function (src, i) {
                return `<div class="card p-1 shadow-sm border" style="height: 110px; overflow: hidden; border-radius: 6px;">
                    <img src="${src}" alt="Evidence ${i + 1}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open(this.src)" title="Click to view full image">
                </div>`;
            }).join("");
        }
    }

    const remarksInput = document.getElementById("mandalReviewOfficerRemarks");
    if (remarksInput) remarksInput.value = "";

    const modalEl = document.getElementById("mandalReviewEvidenceModal");
    if (modalEl) {
        const inst = bootstrap.Modal.getOrCreateInstance(modalEl);
        inst.show();
    }
}
window.openMandalReviewEvidenceModal = openMandalReviewEvidenceModal;

// Bind Review Modal Verification and Rejection Buttons
const btnMandalVerifyComplete = document.getElementById("btnMandalVerifyComplete");
if (btnMandalVerifyComplete) {
    btnMandalVerifyComplete.addEventListener("click", function () {
        if (!currentReviewVolId || !currentReviewReqId) return;
        const remarks = (document.getElementById("mandalReviewOfficerRemarks") ? document.getElementById("mandalReviewOfficerRemarks").value.trim() : "") || "Evidence verified by Mandal Officer. Task signed off and completed.";
        updateVolunteerAssignmentStatus(currentReviewVolId, currentReviewReqId, "Verified / Completed", remarks);

        const modalEl = document.getElementById("mandalReviewEvidenceModal");
        if (modalEl) {
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();
        }
        showToast("Field evidence verified & signed off! Task marked completed.");
    });
}

const btnMandalRejectRework = document.getElementById("btnMandalRejectRework");
if (btnMandalRejectRework) {
    btnMandalRejectRework.addEventListener("click", function () {
        if (!currentReviewVolId || !currentReviewReqId) return;
        const remarks = (document.getElementById("mandalReviewOfficerRemarks") ? document.getElementById("mandalReviewOfficerRemarks").value.trim() : "") || "Rework required: Please provide clearer photographic evidence and detailed casualty assessment.";
        updateVolunteerAssignmentStatus(currentReviewVolId, currentReviewReqId, "Rejected / Rework Required", remarks);

        const modalEl = document.getElementById("mandalReviewEvidenceModal");
        if (modalEl) {
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();
        }
        showToast("Rework request & directives dispatched to volunteer.");
    });
}

function unassignSpecificVolunteer(volId, reqId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (v) { return String(v.id) === String(volId); });

    if (!req) return;

    if (Array.isArray(req.assignedVolunteers)) {
        req.assignedVolunteers = req.assignedVolunteers.filter(function (av) { return String(av.id) !== String(volId); });
    }
    if (req.assignedVolunteer && String(req.assignedVolunteer.id) === String(volId)) {
        req.assignedVolunteer = (req.assignedVolunteers && req.assignedVolunteers[0]) || null;
        req.assignedVolunteerId = req.assignedVolunteer ? req.assignedVolunteer.id : null;
    }

    if (!req.assignedVolunteers || !req.assignedVolunteers.length) {
        req.status = "Pending";
    }

    if (vol) {
        vol.status = "Available";
    }

    writeRecords("disasterHelpRequests", requests);
    writeRecords("disasterVolunteers", volunteers);

    populateMandalAssignView();
    renderRequestsTable();
    renderVolunteersTable();
    renderDashboardView();

    showToast(`Volunteer unassigned from application #${req.trackId || req.id}.`);
}
window.unassignSpecificVolunteer = unassignSpecificVolunteer;

function unassignVolunteerInMandal(reqId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req) return;

    const volunteers = readRecords("disasterVolunteers");
    if (Array.isArray(req.assignedVolunteers)) {
        req.assignedVolunteers.forEach(function (av) {
            const vol = volunteers.find(function (v) { return String(v.id) === String(av.id); });
            if (vol) vol.status = "Available";
        });
    } else if (req.assignedVolunteer && req.assignedVolunteer.id) {
        const vol = volunteers.find(function (v) { return String(v.id) === String(req.assignedVolunteer.id); });
        if (vol) vol.status = "Available";
    }

    req.assignedVolunteers = [];
    req.assignedVolunteer = null;
    req.assignedVolunteerId = null;
    req.status = "Pending";

    writeRecords("disasterHelpRequests", requests);
    writeRecords("disasterVolunteers", volunteers);

    populateMandalAssignView();
    renderRequestsTable();
    renderVolunteersTable();
    renderDashboardView();

    showToast(`All responders unassigned from #${req.trackId || req.id}.`);
}
window.unassignVolunteerInMandal = unassignVolunteerInMandal;

function openAssignVolunteerForRequest(reqId) {
    activeAssignSelectedRequestId = reqId;
    switchMandalView("assign");
    setTimeout(function () {
        const reqSelect = document.getElementById("mandalAssignSelectRequest");
        if (reqSelect) {
            reqSelect.value = String(reqId);
            reqSelect.dispatchEvent(new Event("change"));
        }
    }, 120);
}
window.openAssignVolunteerForRequest = openAssignVolunteerForRequest;

// ========================================================
// REQUIREMENT 3: APPLICANT DETAILS & FAMILY PROOFS (FORM 3-A)
// (Family member roster: Name, Relationship, Gender, Phone,
//  Aadhaar, Bank A/C, Ration Card, Photo/Document uploads)
// ========================================================
function openApplicantDetailsForSelectedRequest() {
    if (!activeAssignSelectedRequestId) {
        alert("Please select a help request application first.");
        return;
    }
    openApplicantDetailsModal(activeAssignSelectedRequestId);
}
window.openApplicantDetailsForSelectedRequest = openApplicantDetailsForSelectedRequest;

function openApplicantDetailsModal(reqId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId || activeAssignSelectedRequestId); });
    if (!req) return;

    const idInput = document.getElementById("appDetailsRequestId");
    if (idInput) idInput.value = req.id;

    const badge = document.getElementById("appDetailsTrackIdBadge");
    if (badge) badge.textContent = `TRACK ID: ${req.trackId || req.id}`;

    const appDetails = req.applicantDetails || {};

    // Fill primary applicant details
    const nameEl = document.getElementById("appApplicantName");
    if (nameEl) nameEl.value = appDetails.name || req.name || "";
    const phoneEl = document.getElementById("appApplicantPhone");
    if (phoneEl) phoneEl.value = appDetails.phone || req.phone || "";
    const genderEl = document.getElementById("appApplicantGender");
    if (genderEl) genderEl.value = appDetails.gender || "Male";
    const aadhaarEl = document.getElementById("appApplicantAadhaar");
    if (aadhaarEl) aadhaarEl.value = appDetails.aadhaar || "9823-4412-7890";
    const bankEl = document.getElementById("appApplicantBank");
    if (bankEl) bankEl.value = appDetails.bankAccount || "38481029384 (SBI)";
    const rationEl = document.getElementById("appApplicantRation");
    if (rationEl) rationEl.value = appDetails.rationCard || "WAP048192834";
    const addrEl = document.getElementById("appApplicantAddress");
    if (addrEl) addrEl.value = appDetails.address || req.village || req.location || "";
    const mandalEl = document.getElementById("appApplicantMandal");
    if (mandalEl) mandalEl.value = req.mandal || currentMandal.mandal;
    const distEl = document.getElementById("appApplicantDistrict");
    if (distEl) distEl.value = req.district || currentMandal.district;

    // Render family members roster
    const container = document.getElementById("familyMembersContainer");
    if (container) {
        container.innerHTML = "";
        const familyList = req.familyMembers && req.familyMembers.length ? req.familyMembers : [
            { name: `${req.name || 'Citizen'} (Spouse)`, relation: "Spouse", gender: "Female", phone: req.phone || "9848011223", aadhaar: "9823-4412-7891", bank: "38481029385", ration: "WAP048192834" },
            { name: "Child 1", relation: "Child", gender: "Male", phone: "9848011224", aadhaar: "9823-4412-7892", bank: "Minor A/C Linked", ration: "WAP048192834" }
        ];

        familyList.forEach(function (fam, idx) {
            addNewFamilyMemberRow(fam);
        });
    }

    const modalEl = document.getElementById("applicantDetailsFormModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        let inst = bootstrap.Modal.getInstance(modalEl);
        if (!inst) inst = new bootstrap.Modal(modalEl);
        inst.show();
    }
}
window.openApplicantDetailsModal = openApplicantDetailsModal;

function addNewFamilyMemberRow(famData) {
    const container = document.getElementById("familyMembersContainer");
    if (!container) return;

    const data = famData || {
        name: "",
        relation: "Spouse",
        gender: "Male",
        phone: "",
        aadhaar: "",
        bank: "",
        ration: ""
    };

    const rowIdx = Date.now() + Math.floor(Math.random() * 1000);
    const card = document.createElement("div");
    card.className = "family-member-card";
    card.id = `famCard_${rowIdx}`;

    card.innerHTML = `
        <button type="button" class="btn btn-sm btn-outline-danger delete-member-btn py-0 px-2" onclick="removeFamilyMemberRow('famCard_${rowIdx}')" title="Remove Family Member">
            <i class="bi bi-trash"></i> Remove
        </button>
        <div class="row g-2">
            <div class="col-md-3">
                <label class="form-label small fw-bold">Family Member Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm fam-name" required value="${escapeHtml(data.name)}" placeholder="Member's full name">
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-bold">Relationship to Applicant <span class="text-danger">*</span></label>
                <select class="form-select form-select-sm fam-relation">
                    <option value="Spouse" ${data.relation === 'Spouse' ? 'selected' : ''}>Spouse</option>
                    <option value="Child" ${data.relation === 'Child' || data.relation === 'Son' || data.relation === 'Daughter' ? 'selected' : ''}>Child (Son / Daughter)</option>
                    <option value="Parent" ${data.relation === 'Parent' || data.relation === 'Father' || data.relation === 'Mother' ? 'selected' : ''}>Parent (Father / Mother)</option>
                    <option value="Sibling" ${data.relation === 'Sibling' || data.relation === 'Brother' || data.relation === 'Sister' ? 'selected' : ''}>Sibling</option>
                    <option value="Dependent" ${data.relation === 'Dependent' ? 'selected' : ''}>Dependent Relative</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label small fw-bold">Gender</label>
                <select class="form-select form-select-sm fam-gender">
                    <option value="Male" ${data.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${data.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${data.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold">Phone Number</label>
                <input type="tel" class="form-control form-control-sm fam-phone" maxlength="10" value="${escapeHtml(data.phone)}" placeholder="10-digit mobile">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold">Aadhaar UID Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm font-monospace fam-aadhaar" required value="${escapeHtml(data.aadhaar)}" placeholder="12-digit Aadhaar UID">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold">Bank Account Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm font-monospace fam-bank" required value="${escapeHtml(data.bank)}" placeholder="Bank A/C number & IFSC">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold">Ration Card Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-sm font-monospace fam-ration" required value="${escapeHtml(data.ration)}" placeholder="Ration card number">
            </div>
            <div class="col-md-6 mt-2">
                <label class="form-label small text-muted"><i class="bi bi-camera me-1"></i>Member Photo Proof Upload</label>
                <input type="file" class="form-control form-control-sm fam-photo" accept="image/*">
            </div>
            <div class="col-md-6 mt-2">
                <label class="form-label small text-muted"><i class="bi bi-file-earmark-check me-1"></i>Supporting Document Proof Upload (Aadhaar / ID)</label>
                <input type="file" class="form-control form-control-sm fam-proof" accept="image/*,.pdf">
            </div>
        </div>
    `;

    container.appendChild(card);
}
window.addNewFamilyMemberRow = addNewFamilyMemberRow;

function removeFamilyMemberRow(cardId) {
    const card = document.getElementById(cardId);
    if (card) card.remove();
}
window.removeFamilyMemberRow = removeFamilyMemberRow;

function handleSaveApplicantDetails(event) {
    if (event) event.preventDefault();
    const reqId = document.getElementById("appDetailsRequestId").value;
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req) return;

    const applicantDetails = {
        name: document.getElementById("appApplicantName").value.trim(),
        phone: document.getElementById("appApplicantPhone").value.trim(),
        gender: document.getElementById("appApplicantGender").value,
        aadhaar: document.getElementById("appApplicantAadhaar").value.trim(),
        bankAccount: document.getElementById("appApplicantBank").value.trim(),
        rationCard: document.getElementById("appApplicantRation").value.trim(),
        address: document.getElementById("appApplicantAddress").value.trim(),
        mandal: req.mandal || currentMandal.mandal,
        district: req.district || currentMandal.district,
        updatedAt: new Date().toLocaleString()
    };

    const familyCards = document.querySelectorAll(".family-member-card");
    const familyMembers = [];
    familyCards.forEach(function (card) {
        const name = (card.querySelector(".fam-name") ? card.querySelector(".fam-name").value : "").trim();
        if (name) {
            familyMembers.push({
                name: name,
                relation: card.querySelector(".fam-relation").value,
                gender: card.querySelector(".fam-gender").value,
                phone: (card.querySelector(".fam-phone") ? card.querySelector(".fam-phone").value : "").trim(),
                aadhaar: (card.querySelector(".fam-aadhaar") ? card.querySelector(".fam-aadhaar").value : "").trim(),
                bank: (card.querySelector(".fam-bank") ? card.querySelector(".fam-bank").value : "").trim(),
                ration: (card.querySelector(".fam-ration") ? card.querySelector(".fam-ration").value : "").trim(),
                hasProofAttached: true
            });
        }
    });

    req.applicantDetails = applicantDetails;
    req.familyMembers = familyMembers;
    req.hasFamilyProofs = true;
    req.proofsUpdatedAt = new Date().toLocaleString();

    writeRecords("disasterHelpRequests", requests);

    const modalEl = document.getElementById("applicantDetailsFormModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
    }

    handleAssignRequestChange();
    renderRequestsTable();
    showToast(`Saved applicant details & ${familyMembers.length} family member records with supporting proofs!`);
}
window.handleSaveApplicantDetails = handleSaveApplicantDetails;

// ========================================================
// REQUIREMENT 5: HELP REQUEST & DEPARTMENT NOTIFICATIONS
// Sequential interactive questions:
// A. Police Station (Yes/No)
// B. Fire Station (Yes/No)
// C. Hospital / PHC (Yes/No)
// Strictly routed by mandal incident jurisdiction.
// ========================================================
function openDeptNotificationForSelectedRequest() {
    if (!activeAssignSelectedRequestId) {
        alert("Please select a help request application first.");
        return;
    }
    openDepartmentNotificationModal(activeAssignSelectedRequestId);
}
window.openDeptNotificationForSelectedRequest = openDeptNotificationForSelectedRequest;

function openDepartmentNotificationModal(reqId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId || activeAssignSelectedRequestId); });
    if (!req) return;

    activeAssignSelectedRequestId = req.id;
    const idInput = document.getElementById("deptNotifyRequestId");
    if (idInput) idInput.value = req.id;

    const trackIdEl = document.getElementById("deptNotifyTrackId");
    if (trackIdEl) trackIdEl.textContent = `TRACK ID: ${req.trackId || req.id}`;

    const citizenEl = document.getElementById("deptNotifyCitizenName");
    if (citizenEl) citizenEl.textContent = req.name || "Citizen Beneficiary";

    const locEl = document.getElementById("deptNotifyLocation");
    if (locEl) locEl.textContent = `${req.village || req.location || "Mandal Area"}, ${req.mandal || currentMandal.mandal} Mandal`;

    const lossesEl = document.getElementById("deptNotifyLosses");
    if (lossesEl) lossesEl.textContent = req.losses || req.assistanceNeeded || "Emergency Rescue & Relief";

    const prioEl = document.getElementById("deptNotifyPriority");
    if (prioEl) prioEl.textContent = `${(req.priority || 'Critical').toUpperCase()} PRIORITY`;

    // Fetch jurisdictional stations for this mandal
    const depts = getJurisdictionalDepartments(req.mandal || currentMandal.mandal, req.district || currentMandal.district);

    const polEl = document.getElementById("deptJurisdictionalPolice");
    if (polEl) polEl.textContent = `${depts.police.name} (Contact: ${depts.police.phone}, Emergency: ${depts.police.emergency})`;

    const fireEl = document.getElementById("deptJurisdictionalFire");
    if (fireEl) fireEl.textContent = `${depts.fire.name} (Contact: ${depts.fire.phone}, Emergency: ${depts.fire.emergency})`;

    const hospEl = document.getElementById("deptJurisdictionalHospital");
    if (hospEl) hospEl.textContent = `${depts.hospital.name} (Contact: ${depts.hospital.phone}, Emergency: ${depts.hospital.emergency})`;

    // Reset wizard to Step A
    currentDeptNotificationStep = "police";
    currentDeptNotificationAnswers = { police: false, fire: false, hospital: false };

    const stepPol = document.getElementById("deptStepPolice");
    const stepFire = document.getElementById("deptStepFire");
    const stepHosp = document.getElementById("deptStepHospital");
    const stepSum = document.getElementById("deptStepSummary");

    if (stepPol) stepPol.style.display = "block";
    if (stepFire) stepFire.style.display = "none";
    if (stepHosp) stepHosp.style.display = "none";
    if (stepSum) stepSum.style.display = "none";

    const modalEl = document.getElementById("departmentNotificationModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        let inst = bootstrap.Modal.getInstance(modalEl);
        if (!inst) inst = new bootstrap.Modal(modalEl);
        inst.show();
    }
}
window.openDepartmentNotificationModal = openDepartmentNotificationModal;

function handleDeptChoice(dept, isYes) {
    currentDeptNotificationAnswers[dept] = isYes;

    const stepPol = document.getElementById("deptStepPolice");
    const stepFire = document.getElementById("deptStepFire");
    const stepHosp = document.getElementById("deptStepHospital");
    const stepSum = document.getElementById("deptStepSummary");

    if (dept === "police") {
        if (stepPol) stepPol.style.display = "none";
        if (stepFire) stepFire.style.display = "block";
        currentDeptNotificationStep = "fire";
    } else if (dept === "fire") {
        if (stepFire) stepFire.style.display = "none";
        if (stepHosp) stepHosp.style.display = "block";
        currentDeptNotificationStep = "hospital";
    } else if (dept === "hospital") {
        if (stepHosp) stepHosp.style.display = "none";
        if (stepSum) stepSum.style.display = "block";
        currentDeptNotificationStep = "summary";
        finalizeDepartmentDispatches();
    }
}
window.handleDeptChoice = handleDeptChoice;

function finalizeDepartmentDispatches() {
    const reqId = document.getElementById("deptNotifyRequestId").value;
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req) return;

    const depts = getJurisdictionalDepartments(req.mandal || currentMandal.mandal, req.district || currentMandal.district);
    const nowTime = new Date().toLocaleString();

    req.departmentNotifications = {
        completed: true,
        dispatchedAt: nowTime,
        mandal: req.mandal || currentMandal.mandal,
        police: {
            notified: currentDeptNotificationAnswers.police,
            stationName: depts.police.name,
            phone: depts.police.phone,
            status: currentDeptNotificationAnswers.police ? "Dispatched (Awaiting Acknowledgment)" : "Not Notified",
            dispatchedAt: currentDeptNotificationAnswers.police ? nowTime : null
        },
        fire: {
            notified: currentDeptNotificationAnswers.fire,
            stationName: depts.fire.name,
            phone: depts.fire.phone,
            status: currentDeptNotificationAnswers.fire ? "Dispatched (Awaiting Acknowledgment)" : "Not Notified",
            dispatchedAt: currentDeptNotificationAnswers.fire ? nowTime : null
        },
        hospital: {
            notified: currentDeptNotificationAnswers.hospital,
            stationName: depts.hospital.name,
            phone: depts.hospital.phone,
            status: currentDeptNotificationAnswers.hospital ? "Dispatched (Awaiting Acknowledgment)" : "Not Notified",
            dispatchedAt: currentDeptNotificationAnswers.hospital ? nowTime : null
        }
    };

    writeRecords("disasterHelpRequests", requests);

    // Record into global department dispatches log for tracking
    const allDispatches = readRecords("disasterDepartmentDispatches");
    allDispatches.unshift({
        id: Date.now(),
        requestId: req.id,
        trackId: req.trackId || req.id,
        beneficiary: req.name,
        location: `${req.village || req.location || 'Mandal Area'}, ${req.mandal || currentMandal.mandal}`,
        mandal: req.mandal || currentMandal.mandal,
        district: req.district || currentMandal.district,
        police: req.departmentNotifications.police,
        fire: req.departmentNotifications.fire,
        hospital: req.departmentNotifications.hospital,
        createdAt: nowTime
    });
    writeRecords("disasterDepartmentDispatches", allDispatches);

    // Populate Summary List in modal
    const summaryList = document.getElementById("deptSummaryList");
    if (summaryList) {
        summaryList.innerHTML = `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong class="d-block text-primary"><i class="bi bi-shield-shaded me-1"></i>Police Station</strong>
                    <span class="small">${escapeHtml(depts.police.name)}</span>
                </div>
                ${currentDeptNotificationAnswers.police ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Dispatched</span>' : '<span class="badge bg-secondary">Not Dispatched</span>'}
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong class="d-block text-danger"><i class="bi bi-fire me-1"></i>Fire & Emergency Station</strong>
                    <span class="small">${escapeHtml(depts.fire.name)}</span>
                </div>
                ${currentDeptNotificationAnswers.fire ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Dispatched</span>' : '<span class="badge bg-secondary">Not Dispatched</span>'}
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong class="d-block text-success"><i class="bi bi-hospital me-1"></i>Hospital / PHC</strong>
                    <span class="small">${escapeHtml(depts.hospital.name)}</span>
                </div>
                ${currentDeptNotificationAnswers.hospital ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Dispatched</span>' : '<span class="badge bg-secondary">Not Dispatched</span>'}
            </div>
        `;
    }

    renderMandalDepartmentDispatchesTable();
    showToast("Department emergency alerts recorded and dispatched according to mandal jurisdiction!");
}

// REQUIREMENT 5: TRACK DEPARTMENT NOTIFICATIONS & RESPONSE STATUS
function renderMandalDepartmentDispatchesTable() {
    const tbody = document.getElementById("mandalDepartmentDispatchesTable");
    const badge = document.getElementById("deptDispatchesCountBadge");
    if (!tbody) return;

    const requests = getRoutedHelpRequests().filter(function (r) {
        return r.departmentNotifications && r.departmentNotifications.completed;
    });

    const entries = [];
    requests.forEach(function (req) {
        const dn = req.departmentNotifications;
        const trackId = req.trackId || ("#" + String(req.id).slice(-6));
        const loc = `${req.village || req.location || 'Mandal'}, ${req.mandal || currentMandal.mandal}`;

        // Police row
        entries.push({
            reqId: req.id,
            trackId: trackId,
            beneficiary: `${req.name} (${loc})`,
            deptType: "Police Station",
            stationName: dn.police.stationName,
            notified: dn.police.notified,
            time: dn.police.dispatchedAt || dn.dispatchedAt || "N/A",
            status: dn.police.status || "Dispatched",
            deptKey: "police"
        });

        // Fire row
        entries.push({
            reqId: req.id,
            trackId: trackId,
            beneficiary: `${req.name} (${loc})`,
            deptType: "Fire & Emergency",
            stationName: dn.fire.stationName,
            notified: dn.fire.notified,
            time: dn.fire.dispatchedAt || dn.dispatchedAt || "N/A",
            status: dn.fire.status || "Dispatched",
            deptKey: "fire"
        });

        // Hospital row
        entries.push({
            reqId: req.id,
            trackId: trackId,
            beneficiary: `${req.name} (${loc})`,
            deptType: "Hospital / PHC",
            stationName: dn.hospital.stationName,
            notified: dn.hospital.notified,
            time: dn.hospital.dispatchedAt || dn.dispatchedAt || "N/A",
            status: dn.hospital.status || "Dispatched",
            deptKey: "hospital"
        });
    });

    if (badge) badge.textContent = `${entries.length} Department Dispatches`;

    if (!entries.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No department dispatches recorded yet. Use "Department Notifications" when dispatching volunteers to inform jurisdictional stations.</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(function (e) {
        let statusBadge = "bg-secondary";
        if (e.status.includes("Dispatched")) statusBadge = "bg-primary text-white";
        else if (e.status.includes("Acknowledged")) statusBadge = "bg-warning text-dark";
        else if (e.status.includes("Deployed") || e.status.includes("En Route")) statusBadge = "bg-info text-dark";
        else if (e.status.includes("Scene") || e.status.includes("Assistance")) statusBadge = "bg-success text-white";

        return `<tr>
            <td><strong class="font-monospace text-primary">${escapeHtml(e.trackId)}</strong></td>
            <td><small class="fw-bold">${escapeHtml(e.beneficiary)}</small></td>
            <td><span class="badge ${e.deptKey === 'police' ? 'bg-primary-subtle text-primary' : (e.deptKey === 'fire' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success')} border">${escapeHtml(e.deptType)}</span></td>
            <td><small>${escapeHtml(e.stationName)}</small></td>
            <td>${e.notified ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Yes</span>' : '<span class="badge bg-light text-muted border">No</span>'}</td>
            <td><small class="text-muted">${escapeHtml(e.time)}</small></td>
            <td><span class="badge ${statusBadge} py-1 px-2 border">${escapeHtml(e.status)}</span></td>
            <td>
                <select class="form-select form-select-sm" style="font-size: 11px; max-width: 140px;" onchange="updateDepartmentResponseStatus('${e.reqId}', '${e.deptKey}', this.value)">
                    <option value="Dispatched (Awaiting Acknowledgment)" ${e.status.includes('Dispatched') ? 'selected' : ''}>Dispatched</option>
                    <option value="Station Acknowledged" ${e.status.includes('Acknowledged') ? 'selected' : ''}>Acknowledged</option>
                    <option value="Department Unit Deployed" ${e.status.includes('Deployed') ? 'selected' : ''}>Units Deployed</option>
                    <option value="On Scene Assistance" ${e.status.includes('Scene') ? 'selected' : ''}>On Scene Assistance</option>
                </select>
            </td>
        </tr>`;
    }).join("");
}
window.renderMandalDepartmentDispatchesTable = renderMandalDepartmentDispatchesTable;

function updateDepartmentResponseStatus(reqId, deptKey, newStatus) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req || !req.departmentNotifications || !req.departmentNotifications[deptKey]) return;

    req.departmentNotifications[deptKey].status = newStatus;
    req.departmentNotifications[deptKey].lastStatusUpdate = new Date().toLocaleString();

    writeRecords("disasterHelpRequests", requests);
    renderMandalDepartmentDispatchesTable();
    showToast(`Updated ${deptKey} response status to: ${newStatus}`);
}
window.updateDepartmentResponseStatus = updateDepartmentResponseStatus;

// Inline Vector QR Code Generator (Zero external dependencies)
function generateInlineQrSvg(text) {
    const size = 110;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    const grid = 21;
    const cellSize = size / grid;
    let rects = '';

    function addFinder(x0, y0) {
        rects += `<rect x="${x0 * cellSize}" y="${y0 * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#0f172a"/>`;
        rects += `<rect x="${(x0 + 1) * cellSize}" y="${(y0 + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff"/>`;
        rects += `<rect x="${(x0 + 2) * cellSize}" y="${(y0 + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#0f172a"/>`;
    }
    addFinder(0, 0);
    addFinder(14, 0);
    addFinder(0, 14);

    for (let i = 8; i < 13; i++) {
        if (i % 2 === 0) {
            rects += `<rect x="${i * cellSize}" y="${6 * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
            rects += `<rect x="${6 * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
        }
    }

    let seed = Math.abs(hash) + 1729;
    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
            if (r === 6 || c === 6) continue;
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            if ((seed % 10) < 5) {
                rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
            }
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">${rects}</svg>`;
}

// Dual-Sided Volunteer ID Card (Strictly Matching Verification Specifications)
function openVolunteerIdCard(volunteerId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (v) { return String(v.id) === String(volunteerId); });
    if (!vol) return;

    const modalEl = document.getElementById("volunteerIdCardModal");
    if (!modalEl) return;

    const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
    const photoImg = document.getElementById("idCardPhotoImg");
    const photoInitials = document.getElementById("idCardPhotoInitials");
    const photoSrc = getVolunteerPhotoSrc(vol);

    if (photoSrc) {
        if (photoImg) {
            photoImg.src = photoSrc;
            photoImg.style.display = "block";
        }
        if (photoInitials) photoInitials.style.display = "none";
    } else {
        if (photoImg) photoImg.style.display = "none";
        if (photoInitials) {
            photoInitials.textContent = initials;
            photoInitials.style.display = "flex";
        }
    }

    const frontId = vol.volunteerId || ("DRVOL-" + String(vol.id).slice(-4).padStart(4, "0"));
    const backId = "JS-VOL-" + String(vol.id).slice(-4).padStart(4, "0");

    // Front Details
    const nameEl = document.getElementById("idCardName");
    if (nameEl) nameEl.textContent = vol.name || "__________________";
    const frontVolIdEl = document.getElementById("idCardVolId");
    if (frontVolIdEl) frontVolIdEl.textContent = frontId;
    const distEl = document.getElementById("idCardDistrict");
    if (distEl) distEl.textContent = vol.district || currentMandal.district || "Krishna";
    const mandalEl = document.getElementById("idCardMandal");
    if (mandalEl) mandalEl.textContent = vol.mandal || currentMandal.mandal || "Vijayawada Rural";
    const roleEl = document.getElementById("idCardRole");
    if (roleEl) roleEl.textContent = "Disaster Relief Volunteer";
    const bloodEl = document.getElementById("idCardBloodGroup");
    if (bloodEl) bloodEl.textContent = vol.bloodGroup || (Number(vol.id) % 2 === 0 ? "B+" : "O+");
    const mobileEl = document.getElementById("idCardMobile");
    if (mobileEl) mobileEl.textContent = vol.phone || vol.mobileNumber || "__________________";

    const currentYear = new Date().getFullYear();
    const fromEl = document.getElementById("idCardValidFrom");
    if (fromEl) fromEl.textContent = `01/01/${currentYear}`;
    const untilEl = document.getElementById("idCardValidUntil");
    if (untilEl) untilEl.textContent = `31/12/${currentYear + 1}`;

    const sigSubEl = document.getElementById("idCardSignatureSub");
    if (sigSubEl) sigSubEl.textContent = "District Admin";

    // Back Details
    const backVolIdEl = document.getElementById("idCardBackVolId");
    if (backVolIdEl) backVolIdEl.textContent = backId;
    const backDistEl = document.getElementById("idCardBackDistrict");
    if (backDistEl) backDistEl.textContent = vol.district || currentMandal.district || "Krishna";
    const backMandalEl = document.getElementById("idCardBackMandal");
    if (backMandalEl) backMandalEl.textContent = vol.mandal || currentMandal.mandal || "Vijayawada Rural";

    const qrPayload = JSON.stringify({
        org: "DISASTER RELIEF MANAGEMENT",
        id: frontId,
        backId: backId,
        name: vol.name,
        district: vol.district || currentMandal.district,
        mandal: vol.mandal || currentMandal.mandal,
        emergency: "112",
        status: "Authorized Responder"
    });
    const qrContainer = document.getElementById("idCardQrCodeSvg");
    if (qrContainer) {
        qrContainer.innerHTML = generateInlineQrSvg(qrPayload);
    }

    if (!idCardModalInstance && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        idCardModalInstance = new bootstrap.Modal(modalEl);
    }
    if (idCardModalInstance) idCardModalInstance.show();
}
window.openVolunteerIdCard = openVolunteerIdCard;

// ========================================================
// REQUIREMENT 2: ADD VOLUNTEER (EXACT ADMIN LOGIN PARITY)
// Fields: Username, Password, Email, Full Name, Father Name,
// 10-Digit Mobile, State, District, Mandal, Skills, Photo, Availability
// ========================================================
function handleMandalAddVolunteer(event) {
    if (event) event.preventDefault();

    const usernameEl = document.getElementById("mandalVolUsername");
    const passwordEl = document.getElementById("mandalVolPassword");
    const emailEl = document.getElementById("mandalVolEmail");
    const nameEl = document.getElementById("mandalAddVolName");
    const fatherNameEl = document.getElementById("mandalAddVolFatherName");
    const phoneEl = document.getElementById("mandalAddVolPhone");
    const stateEl = document.getElementById("mandalAddVolState");
    const distEl = document.getElementById("mandalAddVolDistrict");
    const mandalEl = document.getElementById("mandalAddVolMandal");
    const skillsEl = document.getElementById("mandalAddVolSkills");
    const photoEl = document.getElementById("mandalAddVolPhoto");
    const statusEl = document.getElementById("mandalAddVolStatus");

    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const name = nameEl ? nameEl.value.trim() : "";
    const fatherName = fatherNameEl ? fatherNameEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim().replace(/\D/g, "") : "";
    const state = (stateEl && stateEl.value) ? stateEl.value : (currentMandal ? currentMandal.state : "Andhra Pradesh");
    const district = (distEl && distEl.value) ? distEl.value : (currentMandal ? currentMandal.district : "Krishna");
    const mandal = (mandalEl && mandalEl.value) ? mandalEl.value : (currentMandal ? currentMandal.mandal : "Vijayawada Rural");
    const skills = skillsEl ? skillsEl.value.trim() : "Emergency First Aid, Relief Distribution";
    const status = statusEl ? statusEl.value : "Available";

    if (!name || !phone || !username || !password) {
        alert("Please fill all mandatory fields: Full Name, Mobile Contact, Username, and Password.");
        return;
    }

    if (phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    const volunteers = readRecords("disasterVolunteers");
    const nextNum = volunteers.length + 1;
    const volId = "DRVOL-" + String(nextNum).padStart(4, "0");

    function saveVolunteerRecord(photoDataUrl) {
        const newVolunteer = {
            id: Date.now(),
            volunteerId: volId,
            username: username,
            name: name,
            fatherName: fatherName,
            phone: phone,
            mobileNumber: phone,
            email: email,
            skills: skills,
            bloodGroup: "O+",
            state: state,
            district: district,
            mandal: mandal,
            status: status,
            availability: status,
            approvalStatus: "Approved",
            role: "Disaster Relief Volunteer",
            profilePhoto: photoDataUrl || "",
            createdAt: new Date().toLocaleString()
        };

        // Add to disasterVolunteers
        volunteers.unshift(newVolunteer);
        writeRecords("disasterVolunteers", volunteers);

        // Also register in user accounts so volunteer can authenticate
        const userAccounts = readRecords("disasterUserAccounts");
        userAccounts.push({
            id: newVolunteer.id,
            volunteerId: volId,
            username: username,
            password: password,
            email: email,
            role: "Volunteer",
            name: name,
            phone: phone,
            state: state,
            district: district,
            mandal: mandal,
            status: "Approved",
            createdAt: new Date().toLocaleString()
        });
        writeRecords("disasterUserAccounts", userAccounts);

        // Reset and hide modal
        const modalEl = document.getElementById("mandalAddVolunteerModal");
        if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();
        }
        const formEl = document.getElementById("mandalAddVolunteerForm");
        if (formEl) formEl.reset();

        renderDashboardView();
        renderVolunteersTable();
        renderAssignVolunteersChecklist();
        showToast(`Volunteer ${name} (${volId}) registered successfully in ${mandal}!`);
    }

    if (photoEl && photoEl.files && photoEl.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            saveVolunteerRecord(e.target.result);
        };
        reader.readAsDataURL(photoEl.files[0]);
    } else {
        saveVolunteerRecord("");
    }
}
window.handleMandalAddVolunteer = handleMandalAddVolunteer;
window.handleCreateVolunteer = handleMandalAddVolunteer;

// ========================================================
// REQUIREMENT 6: SHELTER MANAGEMENT (STRICT MANDAL FILTER)
// Display ONLY the shelters and relief centres available within that mandal.
// Shelters belonging to other mandals must NEVER appear.
// ========================================================
function getMandalSheltersData() {
    let shelters = readRecords("disasterSheltersData");
    if (!shelters || !Array.isArray(shelters) || shelters.length === 0 || !shelters[0].mandal) {
        shelters = defaultSheltersData;
        writeRecords("disasterSheltersData", shelters);
    }

    const curMandal = (currentMandal && currentMandal.mandal ? currentMandal.mandal : "Vijayawada Rural").toLowerCase().trim();

    // STRICT MANDAL FILTER (Requirement 6)
    let mandalShelters = shelters.filter(function (s) {
        const sm = (s.mandal || "").toLowerCase().trim();
        const sloc = (s.location || "").toLowerCase().trim();
        // Belongs to this mandal explicitly or location explicitly mentions this mandal
        return sm === curMandal || (sm === "" && sloc.includes(curMandal));
    });

    // If no shelters exist for this mandal yet, seed default shelters strictly for this mandal
    if (!mandalShelters.length) {
        const curDist = (currentMandal && currentMandal.district ? currentMandal.district : "Krishna");
        const curMandalName = (currentMandal && currentMandal.mandal ? currentMandal.mandal : "Vijayawada Rural");
        const seeded = [
            {
                id: Date.now(),
                district: curDist,
                mandal: curMandalName,
                name: `${curMandalName} Primary Disaster Refuge & Relief Centre`,
                location: `Collectorate Main Road, ${curMandalName}`,
                capacity: 350,
                occupied: 130,
                contact: "112 / 1077",
                status: "Active"
            },
            {
                id: Date.now() + 1,
                district: curDist,
                mandal: curMandalName,
                name: `${curMandalName} Multi-Purpose Cyclone & Flood Shelter`,
                location: `Govt High School Campus, ${curMandalName}`,
                capacity: 250,
                occupied: 75,
                contact: "112 / 1077",
                status: "Active"
            }
        ];
        shelters = shelters.concat(seeded);
        writeRecords("disasterSheltersData", shelters);
        mandalShelters = seeded;
    }

    return mandalShelters;
}
window.getMandalSheltersData = getMandalSheltersData;

function renderSheltersView() {
    const container = document.getElementById("sheltersContainer");
    if (!container) return;

    // Retrieve strictly filtered shelters for this mandal only
    const mandalShelters = getMandalSheltersData();
    const curMandalName = currentMandal && currentMandal.mandal ? currentMandal.mandal : "Vijayawada Rural";

    const subtitleEl = document.getElementById("mandalShelterSubtitle");
    if (subtitleEl) {
        subtitleEl.textContent = `Real-time capacity tracking and resource allocation for safe relief camps in ${curMandalName} Mandal.`;
    }

    const q = (document.getElementById("shelterSearchInput") ? document.getElementById("shelterSearchInput").value : "").toLowerCase().trim();
    const statusFilter = document.getElementById("shelterStatusFilter") ? document.getElementById("shelterStatusFilter").value : "all";

    const filtered = mandalShelters.filter(function (s) {
        if (q) {
            const matchName = (s.name || "").toLowerCase().includes(q);
            const matchLoc = (s.location || "").toLowerCase().includes(q);
            if (!matchName && !matchLoc) return false;
        }
        const percent = Math.min(100, Math.round((s.occupied / s.capacity) * 100));
        if (statusFilter === "open" && percent >= 100) return false;
        if (statusFilter === "near" && (percent < 75 || percent >= 100)) return false;
        if (statusFilter === "full" && percent < 100) return false;
        return true;
    });

    const badge = document.getElementById("shelterFilterCountBadge");
    if (badge) badge.textContent = `Showing ${filtered.length} of ${mandalShelters.length} in ${curMandalName} Mandal`;

    if (!filtered.length) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-shield-x fs-1 d-block mb-2 opacity-50 text-warning"></i>
            No relief shelters found matching criteria in ${escapeHtml(curMandalName)} Mandal.
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(function (shelter) {
        const percent = Math.min(100, Math.round((shelter.occupied / shelter.capacity) * 100));
        const free = Math.max(0, shelter.capacity - shelter.occupied);
        const isHigh = percent >= 75;

        return `<div class="col-md-6 col-lg-4">
            <div class="shelter-card">
                <div class="shelter-card-top">
                    <div>
                        <strong class="d-block mb-1" style="font-size: 13px;">${escapeHtml(shelter.name)}</strong>
                        <small class="text-muted"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${escapeHtml(shelter.location)} (${escapeHtml(shelter.mandal || curMandalName)} Mandal)</small>
                    </div>
                    <span class="badge ${isHigh ? 'bg-danger' : 'bg-success'}">${percent}% full</span>
                </div>
                <div class="d-flex justify-content-between small text-muted my-2">
                    <span>Occupied: <strong>${shelter.occupied}</strong> beds</span>
                    <span>Free: <strong class="text-success">${free}</strong> beds</span>
                </div>
                <div class="progress-track" style="height: 8px;">
                    <span style="width: ${percent}%; background: ${isHigh ? '#e14c59' : '#20a177'};"></span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span class="small text-muted"><i class="bi bi-telephone-fill me-1 text-primary"></i>${escapeHtml(shelter.contact || '112')}</span>
                    <button class="btn btn-sm btn-outline-primary py-0 px-2 update-shelter-btn" data-id="${shelter.id}">
                        <i class="bi bi-pencil-square"></i> Update Beds
                    </button>
                </div>
            </div>
        </div>`;
    }).join("");
}

// Shelters Event Listeners
const sheltersContainerEl = document.getElementById("sheltersContainer");
if (sheltersContainerEl) {
    sheltersContainerEl.addEventListener("click", function (event) {
        const btn = event.target.closest(".update-shelter-btn");
        if (!btn) return;
        const id = Number(btn.dataset.id);
        const shelters = readRecords("disasterSheltersData");
        const shelter = shelters.find(function (s) { return s.id === id; });
        if (!shelter) return;

        const val = window.prompt(`Enter currently occupied beds for ${shelter.name} (Max: ${shelter.capacity}):`, shelter.occupied);
        if (val === null) return;
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0) {
            alert("Please enter a valid positive number.");
            return;
        }
        shelter.occupied = Math.min(shelter.capacity, num);
        writeRecords("disasterSheltersData", shelters);
        renderSheltersView();
        renderDashboardView();
        showToast(`${shelter.name} capacity updated.`);
    });
}

const addNewShelterBtn = document.getElementById("addNewShelterBtn");
if (addNewShelterBtn) {
    addNewShelterBtn.addEventListener("click", function () {
        const curMandalName = currentMandal ? currentMandal.mandal : "Vijayawada Rural";
        const curDistName = currentMandal ? currentMandal.district : "Krishna";
        const name = window.prompt(`New Relief Camp / Shelter Name in ${curMandalName}:`);
        if (!name) return;
        const location = window.prompt(`Location / Landmark in ${curMandalName}:`, `Main Center, ${curMandalName}`) || `${curMandalName} Center`;
        const capacity = parseInt(window.prompt("Total Bed Capacity (e.g. 250):") || "250", 10);

        let shelters = readRecords("disasterSheltersData");
        if (!shelters.length) shelters = defaultSheltersData;
        shelters.push({
            id: Date.now(),
            district: curDistName,
            mandal: curMandalName,
            name: name.trim(),
            location: location.trim(),
            capacity: capacity || 250,
            occupied: 0,
            contact: "112 / 1077",
            status: "Active"
        });
        writeRecords("disasterSheltersData", shelters);
        renderSheltersView();
        renderDashboardView();
        showToast(`Shelter ${name} registered in ${curMandalName} Mandal.`);
    });
}

// ========================================================
// 11. VIEW 5: RELIEF INVENTORY & SUPPLIES (MATCHING ADMIN)
// ========================================================
function renderInventoryView() {
    const container = document.getElementById("inventoryContainer");
    if (!container) return;

    let items = readRecords("disasterReliefInventory");
    if (!items || !items.length) {
        items = defaultInventoryData;
        writeRecords("disasterReliefInventory", items);
    }

    const q = (document.getElementById("inventorySearchInput") ? document.getElementById("inventorySearchInput").value : "").toLowerCase().trim();
    const catFilter = document.getElementById("inventoryCategoryFilter") ? document.getElementById("inventoryCategoryFilter").value : "all";

    const filtered = items.filter(function (item) {
        if (q) {
            const matchItem = (item.item || "").toLowerCase().includes(q);
            const matchCat = (item.category || "").toLowerCase().includes(q);
            if (!matchItem && !matchCat) return false;
        }
        if (catFilter !== "all") {
            const c = (item.category || "").toLowerCase();
            if (catFilter === "food" && !c.includes("nutri") && !c.includes("food") && !c.includes("water")) return false;
            if (catFilter === "medical" && !c.includes("medic") && !c.includes("aid")) return false;
            if (catFilter === "shelter" && !c.includes("shelt") && !c.includes("blanket") && !c.includes("tent")) return false;
            if (catFilter === "gear" && !c.includes("rescu") && !c.includes("safe") && !c.includes("light")) return false;
        }
        return true;
    });

    const badge = document.getElementById("inventoryFilterCountBadge");
    if (badge) badge.textContent = `Showing ${filtered.length} of ${items.length}`;

    if (!filtered.length) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-box-seam fs-1 d-block mb-2 opacity-50"></i>
            No relief inventory items match the selected filter.
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(function (item) {
        const isLow = item.stock <= item.min;
        return `<div class="col-md-6 col-lg-3">
            <div class="inventory-card">
                <div class="inventory-card-top">
                    <div>
                        <span class="badge bg-light text-muted border mb-1">${escapeHtml(item.category)}</span>
                        <strong class="d-block mb-1" style="font-size: 13px;">${escapeHtml(item.item)}</strong>
                    </div>
                </div>
                <div class="my-3">
                    <span class="small text-muted d-block">Current Stock</span>
                    <div class="d-flex align-items-baseline gap-2">
                        <strong style="font-size: 26px; color: ${isLow ? '#e14c59' : '#14243d'};">${item.stock}</strong>
                        <span class="text-muted small">${escapeHtml(item.unit)}</span>
                    </div>
                    ${isLow ? '<span class="badge bg-danger mt-1">⚠️ Low Stock Alert</span>' : '<span class="badge bg-success mt-1">✓ Stock Healthy</span>'}
                </div>
                <div class="inventory-stock-controls">
                    <span class="small text-muted me-auto">Adjust:</span>
                    <button class="stock-btn inv-adjust" data-id="${item.id}" data-delta="-25" title="Deduct 25">-25</button>
                    <button class="stock-btn inv-adjust" data-id="${item.id}" data-delta="-5" title="Deduct 5">-5</button>
                    <button class="stock-btn inv-adjust" data-id="${item.id}" data-delta="5" title="Add 5">+5</button>
                    <button class="stock-btn inv-adjust" data-id="${item.id}" data-delta="50" title="Add 50">+50</button>
                </div>
            </div>
        </div>`;
    }).join("");
}

// Inventory Event Listeners
const inventoryContainerEl = document.getElementById("inventoryContainer");
if (inventoryContainerEl) {
    inventoryContainerEl.addEventListener("click", function (event) {
        const btn = event.target.closest(".inv-adjust");
        if (!btn) return;
        const id = Number(btn.dataset.id);
        const delta = Number(btn.dataset.delta);
        const items = readRecords("disasterReliefInventory");
        const item = items.find(function (i) { return i.id === id; });
        if (!item) return;

        item.stock = Math.max(0, item.stock + delta);
        writeRecords("disasterReliefInventory", items);
        renderInventoryView();
        renderDashboardView();
        showToast(`${item.item} stock updated to ${item.stock}.`);
    });
}

const restockBtn = document.getElementById("restockInventoryBtn");
if (restockBtn) {
    restockBtn.addEventListener("click", function () {
        let items = readRecords("disasterReliefInventory");
        if (!items.length) items = defaultInventoryData;
        items.forEach(function (i) { i.stock += 100; });
        writeRecords("disasterReliefInventory", items);
        renderInventoryView();
        renderDashboardView();
        showToast("All relief supplies restocked (+100 to all inventory items).");
    });
}

// ========================================================
// 12. VIEW 6: DONATIONS & RELIEF CONTRIBUTIONS (MATCHING ADMIN)
// ========================================================
function renderDonationsView() {
    const donations = readRecords("disasterDonations");
    const registrations = readRecords("disasterRegistrations");
    const volunteers = getRoutedVolunteers();

    const q = (document.getElementById("donationSearchInput") ? document.getElementById("donationSearchInput").value : "").toLowerCase().trim();
    const typeFilter = document.getElementById("donationTypeFilter") ? document.getElementById("donationTypeFilter").value : "all";

    const filteredDonations = donations.filter(function (d) {
        if (q) {
            const matchDonor = (d.donor || d.name || "").toLowerCase().includes(q);
            const matchType = (d.type || "").toLowerCase().includes(q);
            const matchPhone = (d.phone || "").toLowerCase().includes(q);
            const matchMsg = (d.message || "").toLowerCase().includes(q);
            if (!matchDonor && !matchType && !matchPhone && !matchMsg) return false;
        }
        if (typeFilter !== "all") {
            const t = (d.type || "").toLowerCase();
            if (typeFilter === "money" && !t.includes("fund") && !t.includes("money") && !t.includes("cash") && !t.includes("finan")) return false;
            if (typeFilter === "food" && !t.includes("food") && !t.includes("ration") && !t.includes("meal")) return false;
            if (typeFilter === "water" && !t.includes("water") && !t.includes("drink")) return false;
            if (typeFilter === "medicine" && !t.includes("medic") && !t.includes("drug") && !t.includes("aid")) return false;
            if (typeFilter === "clothes" && !t.includes("cloth") && !t.includes("blanket") && !t.includes("wear")) return false;
        }
        return true;
    });

    const badge = document.getElementById("donationFilterCountBadge");
    if (badge) badge.textContent = `Showing ${filteredDonations.length} of ${donations.length}`;

    // Badges
    document.querySelectorAll("#donationsBadgeCount").forEach(function (el) {
        el.textContent = `${filteredDonations.length} donations`;
    });

    // Account registrations column
    const regContainer = document.getElementById("registrationSubmissions");
    if (regContainer) {
        regContainer.innerHTML = registrations.length ? registrations.map(function (item) {
            return `<article class="submission-item">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.role || "Citizen")} · ${escapeHtml(item.mandal || currentMandal.mandal)}, ${escapeHtml(item.district || currentMandal.district)}</span>
                <small>${escapeHtml(item.email || "N/A")} · ${escapeHtml(item.phone || "N/A")}</small>
            </article>`;
        }).join("") : '<p class="empty-submission">No account registrations registered yet.</p>';
    }

    // Volunteer applications column
    const volContainer = document.getElementById("volunteerSubmissions");
    if (volContainer) {
        volContainer.innerHTML = volunteers.length ? volunteers.map(function (item) {
            return `<article class="submission-item">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.mandal || currentMandal.mandal)}, ${escapeHtml(item.district || currentMandal.district)} · ${escapeHtml(item.phone || item.mobileNumber)}</span>
                <small>${escapeHtml(item.skills || "Disaster Response")}</small>
                <button type="button" class="mini-action assign-volunteer" data-id="${item.id}">${item.status === "Assigned" ? "Assigned" : "Assign"}</button>
            </article>`;
        }).join("") : '<p class="empty-submission">No volunteer applications in this mandal.</p>';
    }

    // Donation registrations column
    const donContainer = document.getElementById("donationSubmissions");
    if (donContainer) {
        donContainer.innerHTML = filteredDonations.length ? filteredDonations.map(function (item) {
            return `<article class="submission-item">
                <strong>${escapeHtml(item.donor || "Community Donor")}</strong>
                <span>${escapeHtml(item.type || "Relief Supplies")} · ${escapeHtml(item.quantity || "1 Batch")}</span>
                <small>${escapeHtml(item.mandal || currentMandal.mandal)}, ${escapeHtml(item.district || currentMandal.district)} · ${escapeHtml(item.phone || "")}</small>
                ${item.message ? `<small class="text-muted">${escapeHtml(item.message)}</small>` : ""}
                <button type="button" class="mini-action mark-donation" data-id="${item.id}">${escapeHtml(item.status || "Registered")}</button>
            </article>`;
        }).join("") : '<p class="empty-submission">No donations found matching criteria.</p>';
    }
}

// Donations Event Listeners
const volSubContainer = document.getElementById("volunteerSubmissions");
if (volSubContainer) {
    volSubContainer.addEventListener("click", function (event) {
        const button = event.target.closest(".assign-volunteer");
        if (!button) return;
        const volunteers = readRecords("disasterVolunteers");
        const record = volunteers.find(function (item) { return String(item.id) === button.dataset.id; });
        if (!record) return;
        record.status = record.status === "Assigned" ? "Available" : "Assigned";
        writeRecords("disasterVolunteers", volunteers);
        renderDonationsView();
        renderVolunteersTable();
        renderDashboardView();
        showToast(`Volunteer ${record.name} status updated to ${record.status}.`);
    });
}

const donSubContainer = document.getElementById("donationSubmissions");
if (donSubContainer) {
    donSubContainer.addEventListener("click", function (event) {
        const button = event.target.closest(".mark-donation");
        if (!button) return;
        const donations = readRecords("disasterDonations");
        const record = donations.find(function (item) { return String(item.id) === button.dataset.id; });
        if (!record) return;

        // Toggle Registered -> Received -> Distributed
        if (record.status === "Registered") record.status = "Received";
        else if (record.status === "Received") record.status = "Distributed";
        else record.status = "Registered";

        writeRecords("disasterDonations", donations);
        renderDonationsView();
        renderDashboardView();
        showToast(`Donation status updated to ${record.status}.`);
    });
}

const clearSubmissionsBtn = document.getElementById("clearSubmissions");
if (clearSubmissionsBtn) {
    clearSubmissionsBtn.addEventListener("click", function () {
        if (!confirm("Clear completed donation and registration records?")) return;
        ["disasterDonations", "disasterRegistrations"].forEach(function (key) {
            const remaining = readRecords(key).filter(function (record) {
                return (record.status || "").toLowerCase() === "registered";
            });
            writeRecords(key, remaining);
        });
        renderDonationsView();
        renderDashboardView();
        showToast("Completed records cleared from view.");
    });
}

// ========================================================
// 13. VIEW 7: OPERATIONS REPORTS & ANNUAL STATEMENTS (MATCHING ADMIN)
// ========================================================
function renderReportsView() {
    const container = document.getElementById("reportsContainer");
    if (!container) return;

    const allRequests = getRoutedHelpRequests();
    const allVolunteers = getRoutedVolunteers();

    const criticalCount = allRequests.filter(function (r) { return (r.priority || "").toLowerCase() === "critical"; }).length;
    const resolvedCount = allRequests.filter(function (r) { return r.status === "Resolved"; }).length;
    const assignedVolCount = allVolunteers.filter(function (v) { return v.status === "Assigned"; }).length;

    container.innerHTML = `
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-red"><i class="bi bi-telephone-inbound-fill"></i></div>
                <div>
                    <span>Total Help Inquiries</span>
                    <strong>${allRequests.length}</strong>
                    <small class="trend-up">Mandal submissions</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-orange"><i class="bi bi-shield-fill-exclamation"></i></div>
                <div>
                    <span>Critical Incidents</span>
                    <strong>${criticalCount}</strong>
                    <small class="trend-down">High priority rescues</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-green"><i class="bi bi-check2-all"></i></div>
                <div>
                    <span>Successfully Resolved</span>
                    <strong>${resolvedCount}</strong>
                    <small class="trend-up">Closed relief missions</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-blue"><i class="bi bi-person-walking"></i></div>
                <div>
                    <span>Volunteers Deployed</span>
                    <strong>${assignedVolCount}</strong>
                    <small class="trend-up">Active field response</small>
                </div>
            </div>
        </div>

        <div class="col-12 mt-3">
            <div class="panel">
                <div class="panel-heading">
                    <div>
                        <span class="eyebrow">AUDIT & PERFORMANCE SUMMARY</span>
                        <h3>${escapeHtml(currentMandal ? currentMandal.mandal : "Mandal")} Incident Response Ledger</h3>
                    </div>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Incident / Category</th>
                                <th>Reported Cases</th>
                                <th>Field Personnel Assigned</th>
                                <th>Resolution Rate</th>
                                <th>Readiness Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Flood & Water Inundation</strong></td>
                                <td>${allRequests.filter(function (r) { return (r.disasterType || '').toLowerCase().includes('flood'); }).length} cases</td>
                                <td>${assignedVolCount} responders</td>
                                <td><span class="status-pill progress">Active Monitoring</span></td>
                                <td><strong class="text-success">High Preparedness</strong></td>
                            </tr>
                            <tr>
                                <td><strong>Cyclone & Storm Alerts</strong></td>
                                <td>${allRequests.filter(function (r) { return (r.disasterType || '').toLowerCase().includes('cyclone') || (r.disasterType || '').toLowerCase().includes('storm'); }).length} cases</td>
                                <td>Medical & Food Teams</td>
                                <td><span class="status-pill verified">Shelters Active</span></td>
                                <td><strong class="text-success">Ready</strong></td>
                            </tr>
                            <tr>
                                <td><strong>Medical Emergencies & Trauma</strong></td>
                                <td>${allRequests.filter(function (r) { return (r.disasterType || '').toLowerCase().includes('medical') || (r.help || '').toLowerCase().includes('medical'); }).length} cases</td>
                                <td>First Aid Squads</td>
                                <td><span class="status-pill critical">Fast-Track Evac</span></td>
                                <td><strong class="text-primary">100% On Call</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Download Operations CSV
const downloadFullReportBtn = document.getElementById("downloadFullReportBtn");
if (downloadFullReportBtn) {
    downloadFullReportBtn.addEventListener("click", function () {
        const requests = getRoutedHelpRequests();
        const volunteers = getRoutedVolunteers();
        let csv = "RECORD_TYPE,ID,NAME,CONTACT,MANDAL,DISTRICT,LOCATION,DETAILS,STATUS\n";
        requests.forEach(function (r) {
            csv += `"HELP_REQUEST","${r.trackId || r.id}","${r.name || ''}","${r.mobileNumber || r.phone || ''}","${r.mandal || currentMandal.mandal}","${r.district || currentMandal.district}","${r.village || r.location || ''}","${r.disasterType || ''} - ${r.help || ''}","${r.status || ''}"\n`;
        });
        volunteers.forEach(function (v) {
            csv += `"VOLUNTEER","${v.volunteerId || v.id}","${v.name || ''}","${v.phone || v.mobileNumber || ''}","${v.mandal || currentMandal.mandal}","${v.district || currentMandal.district}","${v.address || ''}","${v.skills || ''}","${v.status || ''}"\n`;
        });
        downloadCsvFile(csv, `Mandal_Operations_Log_${currentMandal ? currentMandal.mandal.replace(/\s+/g, '_') : 'Mandal'}.csv`);
    });
}

// Annual Statements Table & Filtering
function renderAnnualStatements() {
    const all = getRoutedHelpRequests();
    const resolvedAll = all.filter(function (r) { return r.status === "Resolved"; });

    const yearSelect = document.getElementById("annualYearSelect");
    const selectedYear = yearSelect ? yearSelect.value : "2026";
    const searchVal = (document.getElementById("annualSearchInput") ? document.getElementById("annualSearchInput").value : "").toLowerCase().trim();

    const filtered = resolvedAll.filter(function (req) {
        const itemYear = String(req.resolvedYear || (req.resolvedAt ? new Date(req.resolvedAt).getFullYear() : (req.resolvedDate ? req.resolvedDate.slice(6, 10) : 2026)));
        if (selectedYear !== "All" && itemYear !== selectedYear) return false;

        if (searchVal) {
            const text = `${req.id} ${req.trackId || ''} ${req.name} ${req.help} ${req.village || req.location} ${req.resolvedBy}`.toLowerCase();
            if (!text.includes(searchVal)) return false;
        }
        return true;
    });

    const totalEl = document.getElementById("annualTotalResolvedCount");
    if (totalEl) totalEl.textContent = resolvedAll.length;

    const curYearEl = document.getElementById("annualCurrentYearLabel");
    if (curYearEl) curYearEl.textContent = selectedYear === "All" ? "All Years" : selectedYear;

    const countBadgeEl = document.getElementById("annualStatementsCountBadge");
    if (countBadgeEl) countBadgeEl.textContent = `${filtered.length} Statement Records Found`;

    const tbody = document.getElementById("annualStatementsTableBody");
    const emptyEl = document.getElementById("emptyAnnualStatements");
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No resolved requests found in the ${selectedYear} Annual Statement for ${currentMandal ? currentMandal.mandal : "this mandal"}.</td></tr>`;
        if (emptyEl) emptyEl.style.display = "block";
        return;
    }

    if (emptyEl) emptyEl.style.display = "none";

    tbody.innerHTML = filtered.map(function (req) {
        const displayId = req.trackId ? (req.trackId.startsWith("STM-") ? req.trackId : "STM-" + req.trackId.replace(/^DR-/, "")) : ("STM-" + String(req.id).slice(-8));
        const yr = req.resolvedYear || (req.resolvedAt ? new Date(req.resolvedAt).getFullYear() : 2026);
        const resDate = req.resolvedDate || (req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : "Archived");

        return `<tr>
            <td class="fw-bold font-monospace">${yr}</td>
            <td class="font-monospace text-primary fw-bold">${escapeHtml(displayId)}</td>
            <td><strong>${escapeHtml(req.name || "Citizen")}</strong></td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(req.disasterType || "Emergency")}</span></td>
            <td>${escapeHtml(req.village || req.location || "Local Area")}</td>
            <td>${escapeHtml(resDate)}</td>
            <td>${escapeHtml(req.mandal || currentMandal.mandal)}, ${escapeHtml(req.district || currentMandal.district)}</td>
            <td><span class="status-pill resolved"><i class="bi bi-check2-circle"></i> Resolved</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary py-0 px-2" type="button" onclick="openRequestOverview('${req.id}')">View</button>
            </td>
        </tr>`;
    }).join("");
}
window.renderAnnualStatements = renderAnnualStatements;

// Export Annual Statement CSV
const exportAnnualCsvBtn = document.getElementById("exportAnnualCsvBtn");
if (exportAnnualCsvBtn) {
    exportAnnualCsvBtn.addEventListener("click", function () {
        const all = getRoutedHelpRequests();
        const resolved = all.filter(function (r) { return r.status === "Resolved"; });
        const selectedYear = document.getElementById("annualYearSelect") ? document.getElementById("annualYearSelect").value : "2026";

        let csv = "Statement ID,Resolution Year,Citizen Name,Contact,Disaster Type,Assistance,Mandal,District,Location,Resolved Date,Resolved By\n";

        resolved.forEach(function (r) {
            const itemYear = String(r.resolvedYear || (r.resolvedAt ? new Date(r.resolvedAt).getFullYear() : 2026));
            if (selectedYear !== "All" && itemYear !== selectedYear) return;

            const statementId = r.trackId ? (r.trackId.startsWith("STM-") ? r.trackId : "STM-" + r.trackId.replace(/^DR-/, "")) : ("STM-" + String(r.id).slice(-8));
            csv += `"${statementId}","${itemYear}","${r.name || 'Citizen'}","${r.mobileNumber || r.phone || ''}","${r.disasterType || ''}","${r.help || ''}","${r.mandal || currentMandal.mandal}","${r.district || currentMandal.district}","${r.village || r.location || ''}","${r.resolvedDate || r.resolvedAt || ''}","${r.resolvedBy || currentMandal.officerName}"\n`;
        });

        downloadCsvFile(csv, `Annual_Statement_${currentMandal ? currentMandal.mandal.replace(/\s+/g, '_') : 'Mandal'}_${selectedYear}.csv`);
    });
}

const printAnnualReportBtn = document.getElementById("printAnnualReportBtn");
if (printAnnualReportBtn) {
    printAnnualReportBtn.addEventListener("click", function () {
        window.print();
    });
}

// ========================================================
// 14. VIEW 8: OFFICER PROFILE & DELAYED PHOTO SAVE
// ========================================================
function populateProfileForm() {
    if (!currentMandal) return;
    pendingOfficerPhotoDraft = null;

    const nameEl = document.getElementById("profileOfficerNameInput");
    if (nameEl) nameEl.value = currentMandal.officerName || "";
    const empEl = document.getElementById("profileEmpIdInput");
    if (empEl) empEl.value = currentMandal.employeeId || "EMP-001";
    const mandalEl = document.getElementById("profileMandalInput");
    if (mandalEl) mandalEl.value = currentMandal.mandal || "";
    const distEl = document.getElementById("profileDistrictInput");
    if (distEl) distEl.value = currentMandal.district || "";
    const phoneEl = document.getElementById("profilePhoneInput");
    if (phoneEl) phoneEl.value = currentMandal.phone || "";
    const emailEl = document.getElementById("profileEmailInput");
    if (emailEl) emailEl.value = currentMandal.email || "";
    const addrEl = document.getElementById("profileAddressInput");
    if (addrEl) addrEl.value = currentMandal.address || "";

    const initials = (currentMandal.officerName || "MO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "MO";
    const previewImg = document.getElementById("mandalProfileImgPreview");
    const previewInitials = document.getElementById("mandalProfileInitialsPreview");

    if (currentMandal.profilePhoto) {
        if (previewImg) {
            previewImg.src = currentMandal.profilePhoto;
            previewImg.style.display = "block";
        }
        if (previewInitials) previewInitials.style.display = "none";
    } else {
        if (previewImg) previewImg.style.display = "none";
        if (previewInitials) {
            previewInitials.textContent = initials;
            previewInitials.style.display = "block";
        }
    }

    const fileInput = document.getElementById("mandalProfilePhotoInput");
    if (fileInput) fileInput.value = "";
}

// Profile picture selection: PREVIEW ONLY, DO NOT SAVE YET!
const mandalPhotoInput = document.getElementById("mandalProfilePhotoInput");
if (mandalPhotoInput) {
    mandalPhotoInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            pendingOfficerPhotoDraft = evt.target.result;
            const previewImg = document.getElementById("mandalProfileImgPreview");
            const previewInitials = document.getElementById("mandalProfileInitialsPreview");

            if (previewImg) {
                previewImg.src = pendingOfficerPhotoDraft;
                previewImg.style.display = "block";
            }
            if (previewInitials) previewInitials.style.display = "none";

            showToast("Picture preview updated. Click 'Save Profile Changes' to commit.");
        };
        reader.readAsDataURL(file);
    });
}

// Profile Form Submit: COMMITS THE PROFILE PICTURE & DATA
const mandalProfileForm = document.getElementById("mandalProfileForm");
if (mandalProfileForm) {
    mandalProfileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentMandal) return;

        currentMandal.officerName = document.getElementById("profileOfficerNameInput").value.trim();
        currentMandal.phone = document.getElementById("profilePhoneInput").value.trim();
        currentMandal.email = document.getElementById("profileEmailInput").value.trim();
        currentMandal.address = document.getElementById("profileAddressInput").value.trim();

        // DELAYED SAVE RULE: only update profilePhoto if Save button is clicked
        if (pendingOfficerPhotoDraft !== null) {
            currentMandal.profilePhoto = pendingOfficerPhotoDraft;
            pendingOfficerPhotoDraft = null;
        }

        // Persist to session
        localStorage.setItem("disasterCurrentMandal", JSON.stringify(currentMandal));

        // Persist to global mandal accounts list
        const accounts = readRecords("disasterMandalAccounts");
        const idx = accounts.findIndex(function (acc) {
            return String(acc.id) === String(currentMandal.id) || (acc.mandal === currentMandal.mandal && acc.district === currentMandal.district);
        });
        if (idx >= 0) {
            accounts[idx] = Object.assign({}, accounts[idx], currentMandal);
        } else {
            accounts.push(currentMandal);
        }
        writeRecords("disasterMandalAccounts", accounts);

        initMandalHeaderAndMeta();
        showToast("Profile changes and profile picture saved successfully.");
    });
}

// ========================================================
// 15. LIFECYCLE & EVENT LISTENERS
// ========================================================
document.addEventListener("DOMContentLoaded", function () {
    const session = checkMandalSession();
    if (!session) return;

    initMandalHeaderAndMeta();

    // Check URL Hash to activate view
    const initialHash = window.location.hash ? window.location.hash.replace(/^#/, "") : "dashboard";
    switchMandalView(initialHash);
    loadMandalLiveWeather();

    // Navigation item clicks
    document.querySelectorAll(".mandal-nav-item[data-view]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            switchMandalView(btn.dataset.view);
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById("mandalMenuToggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            const sb = document.getElementById("mandalSidebar");
            if (sb) sb.classList.toggle("open");
        });
    }

    // Topbar Profile button
    const topProfileBtn = document.getElementById("topbarProfileBtn");
    if (topProfileBtn) {
        topProfileBtn.addEventListener("click", function () {
            switchMandalView("profile");
        });
    }

    // Refresh weather button
    const refreshWeatherBtn = document.getElementById("refreshMandalWeatherBtn");
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener("click", function () {
            loadMandalLiveWeather();
            showToast("Live weather refreshed.");
        });
    }

    // Help Requests view controls
    const refreshReqBtn = document.getElementById("refreshRequestsTableBtn");
    if (refreshReqBtn) {
        refreshReqBtn.addEventListener("click", function () {
            renderRequestsTable();
            showToast("Requests list updated.");
        });
    }

    const reqSearch = document.getElementById("requestSearchInput");
    if (reqSearch) reqSearch.addEventListener("input", renderRequestsTable);
    const reqStatus = document.getElementById("requestStatusFilter");
    if (reqStatus) reqStatus.addEventListener("change", renderRequestsTable);
    const reqPrio = document.getElementById("requestPriorityFilter");
    if (reqPrio) reqPrio.addEventListener("change", renderRequestsTable);

    // Dashboard snapshot search & filter
    const dashSearch = document.getElementById("dashRequestSearch");
    if (dashSearch) dashSearch.addEventListener("input", renderDashRequestTable);
    const dashStatus = document.getElementById("dashStatusFilter");
    if (dashStatus) dashStatus.addEventListener("change", renderDashRequestTable);

    // Save Request Action in modal
    const saveReqBtn = document.getElementById("saveRequestActionBtn");
    if (saveReqBtn) {
        saveReqBtn.addEventListener("click", saveRequestModalAction);
    }

    // Volunteers view controls
    const refreshVolBtn = document.getElementById("refreshVolunteersTableBtn");
    if (refreshVolBtn) {
        refreshVolBtn.addEventListener("click", function () {
            renderVolunteersTable();
            showToast("Volunteers list updated.");
        });
    }

    const volSearch = document.getElementById("volSearchInput");
    if (volSearch) volSearch.addEventListener("input", renderVolunteersTable);
    const volStatus = document.getElementById("volStatusFilter");
    if (volStatus) volStatus.addEventListener("change", renderVolunteersTable);

    const addVolModalBtn = document.getElementById("addNewVolunteerBtn");
    if (addVolModalBtn) {
        addVolModalBtn.addEventListener("click", function () {
            const modalEl = document.getElementById("mandalAddVolunteerModal");
            if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
                // Pre-populate State, District and Mandal locked to current mandal jurisdiction
                const stateEl = document.getElementById("mandalAddVolState");
                if (stateEl && currentMandal) {
                    stateEl.innerHTML = `<option value="${escapeHtml(currentMandal.state || 'Andhra Pradesh')}" selected>${escapeHtml(currentMandal.state || 'Andhra Pradesh')}</option>`;
                }
                const distEl = document.getElementById("mandalAddVolDistrict");
                if (distEl && currentMandal) {
                    distEl.innerHTML = `<option value="${escapeHtml(currentMandal.district || 'Krishna')}" selected>${escapeHtml(currentMandal.district || 'Krishna')}</option>`;
                }
                const mandalEl = document.getElementById("mandalAddVolMandal");
                if (mandalEl && currentMandal) {
                    mandalEl.innerHTML = `<option value="${escapeHtml(currentMandal.mandal || 'Vijayawada Rural')}" selected>${escapeHtml(currentMandal.mandal || 'Vijayawada Rural')}</option>`;
                }

                let inst = bootstrap.Modal.getInstance(modalEl);
                if (!inst) inst = new bootstrap.Modal(modalEl);
                inst.show();
            }
        });
    }

    // Shelters search & status filter
    const shelterSearch = document.getElementById("shelterSearchInput");
    if (shelterSearch) shelterSearch.addEventListener("input", renderSheltersView);
    const shelterStatus = document.getElementById("shelterStatusFilter");
    if (shelterStatus) shelterStatus.addEventListener("change", renderSheltersView);

    // Inventory search & category filter
    const invSearch = document.getElementById("inventorySearchInput");
    if (invSearch) invSearch.addEventListener("input", renderInventoryView);
    const invCat = document.getElementById("inventoryCategoryFilter");
    if (invCat) invCat.addEventListener("change", renderInventoryView);

    // Donations search & type filter
    const donSearch = document.getElementById("donationSearchInput");
    if (donSearch) donSearch.addEventListener("input", renderDonationsView);
    const donType = document.getElementById("donationTypeFilter");
    if (donType) donType.addEventListener("change", renderDonationsView);

    // Volunteer skill filter
    const volSkill = document.getElementById("volSkillFilter");
    if (volSkill) volSkill.addEventListener("change", renderVolunteersTable);

    // Initialize latest SMS banner
    initLatestSmsBanner();

    // ID card print button
    const idCardPrintBtn = document.getElementById("idCardPrintTriggerBtn");
    if (idCardPrintBtn) {
        idCardPrintBtn.addEventListener("click", function () {
            window.print();
        });
    }

    // Annual statements controls
    const annualYearSel = document.getElementById("annualYearSelect");
    if (annualYearSel) annualYearSel.addEventListener("change", renderAnnualStatements);
    const annualSearch = document.getElementById("annualSearchInput");
    if (annualSearch) annualSearch.addEventListener("input", renderAnnualStatements);

    // Logout
    const logoutBtn = document.getElementById("mandalLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("disasterCurrentMandal");
            window.location.href = "index.html";
        });
    }
});

// ========================================================
// 16. PRE-DISASTER MOBILE SMS BROADCAST SYSTEM
// ========================================================
function initLatestSmsBanner() {
    // Check mandal-specific SMS log dispatched by District Admin
    const mandalSmsLog = readRecords("disasterMandalSmsLog");
    const distSmsRaw = localStorage.getItem("disasterLatestDistrictSms");
    let distSms = null;
    try { if (distSmsRaw) distSms = JSON.parse(distSmsRaw); } catch (e) { }
    const alerts = readRecords("disasterAlerts");

    let sms = null;
    const curDist = (currentMandal && currentMandal.district) ? currentMandal.district.toLowerCase() : "";
    const curMandal = (currentMandal && currentMandal.mandal) ? currentMandal.mandal.toLowerCase() : "";

    if (mandalSmsLog && mandalSmsLog.length > 0) {
        sms = mandalSmsLog.find(function (s) {
            if (!s) return false;
            if (!curDist) return true;
            const sDist = (s.district || "").toLowerCase();
            const sMandal = (s.mandal || "").toLowerCase();
            return sDist === curDist || sMandal === curMandal || sDist === "all";
        }) || mandalSmsLog[0];
    }

    if (!sms && distSms) {
        const sDist = (distSms.district || "").toLowerCase();
        if (!curDist || sDist === curDist || sDist === "all") {
            sms = distSms;
        }
    }

    if (!sms && alerts && alerts.length > 0) {
        sms = alerts.find(function (a) { return a.isSms; }) || alerts[0];
    }

    const messageText = sms ? (sms.message || sms.title || "District Emergency Alert active.") : "District Emergency Alert active. Monitor relief shelters and volunteer deployment.";
    const titleText = sms ? `${sms.type || 'EMERGENCY'}: ${sms.title || 'Disaster Alert'} - ${messageText}` : messageText;

    const bannerText = document.getElementById("latestSmsText");
    if (bannerText) {
        bannerText.textContent = titleText;
    }
    const preDisasterMsg = document.getElementById("preDisasterSmsMessage");
    if (preDisasterMsg) {
        preDisasterMsg.textContent = sms ? `⚠️ [${sms.district ? sms.district + ' Admin' : 'District Alert'}] ${sms.message || sms.title}` : `⚠️ URGENT ADVISORY: District Emergency Alert active. Monitor relief shelters and volunteer deployment.`;
    }
    const preBar = document.getElementById("preDisasterSmsBar");
    if (preBar) {
        preBar.style.display = "flex";
    }
}

function handleSendPreDisasterSms(event) {
    if (event) event.preventDefault();
    const typeEl = document.getElementById("smsDisasterType");
    const levelEl = document.getElementById("smsWarningLevel");
    const msgEl = document.getElementById("smsMessageText");
    if (!typeEl || !levelEl || !msgEl) return;

    const title = typeEl.value;
    const level = levelEl.value;
    const message = msgEl.value.trim();

    const alerts = readRecords("disasterAlerts");
    const newAlert = {
        id: Date.now(),
        title: title,
        type: level,
        message: message,
        isSms: true,
        mandal: currentMandal ? currentMandal.mandal : "All",
        district: currentMandal ? currentMandal.district : "All",
        sender: currentMandal ? `${currentMandal.officerName} (${currentMandal.mandal} Control Room)` : "DISASTER CONTROL ROOM",
        createdAt: new Date().toLocaleString()
    };
    alerts.unshift(newAlert);
    writeRecords("disasterAlerts", alerts);

    // Update top bar text
    const bannerText = document.getElementById("latestSmsText");
    if (bannerText) bannerText.textContent = `${level}: ${title} - ${message}`;

    // Close broadcast modal
    const modalEl = document.getElementById("preDisasterSmsModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
    }

    showToast("Emergency Pre-Disaster SMS broadcast dispatched to all registered mobiles!");

    // Show smartphone SMS preview popup
    openSmsNotificationModal(newAlert);
}
window.handleSendPreDisasterSms = handleSendPreDisasterSms;

function openSmsNotificationModal(alertObj) {
    if (!alertObj) {
        const alerts = readRecords("disasterAlerts");
        alertObj = alerts.find(function (a) { return a.isSms; }) || alerts[0] || {
            sender: "MANDAL DISASTER CONTROL ROOM",
            message: "⚠️ URGENT PRE-DISASTER WARNING: Severe weather & cyclone alert. Relocate to designated shelters immediately. Helpline: 112.",
            createdAt: "Delivered to registered mobile numbers"
        };
    }
    const senderEl = document.getElementById("modalSmsSender");
    const bodyEl = document.getElementById("modalSmsBody");
    const timeEl = document.getElementById("modalSmsTime");
    if (senderEl) senderEl.textContent = alertObj.sender || "MANDAL DISASTER CONTROL ROOM";
    if (bodyEl) bodyEl.textContent = alertObj.message || alertObj.title;
    if (timeEl) timeEl.textContent = alertObj.createdAt || "Sent to Registered Mobiles";

    const modalEl = document.getElementById("smsNotificationModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        let inst = bootstrap.Modal.getInstance(modalEl);
        if (!inst) inst = new bootstrap.Modal(modalEl);
        inst.show();
    }
}
window.openSmsNotificationModal = openSmsNotificationModal;
window.viewLatestSmsAlert = function () { openSmsNotificationModal(); };
window.openSmsDetailsModal = function () { openSmsNotificationModal(); };

function openPreDisasterSmsBroadcastModal() {
    const modalEl = document.getElementById("preDisasterSmsModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        let inst = bootstrap.Modal.getInstance(modalEl);
        if (!inst) inst = new bootstrap.Modal(modalEl);
        inst.show();
    }
}
window.openPreDisasterSmsBroadcastModal = openPreDisasterSmsBroadcastModal;

// ==========================================
// SECTION: MANDAL LIVE WEATHER & WARNING SYSTEM
// ==========================================
const AP_DISTRICT_COORDS = {
    "alluri sitharama raju": { lat: 18.0667, lon: 82.5333, name: "Alluri Sitharama Raju" },
    "anakapalli": { lat: 17.6896, lon: 83.0032, name: "Anakapalli" },
    "ananthapuramu": { lat: 14.6819, lon: 77.6006, name: "Ananthapuramu" },
    "annamayya": { lat: 14.0167, lon: 78.7500, name: "Annamayya" },
    "bapatla": { lat: 15.9042, lon: 80.4674, name: "Bapatla" },
    "chittoor": { lat: 13.2172, lon: 79.1003, name: "Chittoor" },
    "east godavari": { lat: 17.0005, lon: 81.8040, name: "East Godavari (Rajahmundry)" },
    "eluru": { lat: 16.7107, lon: 81.0952, name: "Eluru" },
    "guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
    "kakinada": { lat: 16.9891, lon: 82.2475, name: "Kakinada" },
    "konaseema": { lat: 16.5700, lon: 82.0000, name: "Dr. B.R. Ambedkar Konaseema" },
    "krishna": { lat: 16.1800, lon: 81.1300, name: "Krishna (Vijayawada / Machilipatnam)" },
    "kurnool": { lat: 15.8281, lon: 78.0373, name: "Kurnool" },
    "nandyal": { lat: 15.4886, lon: 78.4836, name: "Nandyal" },
    "ntr": { lat: 16.5062, lon: 80.6480, name: "NTR District (Vijayawada)" },
    "palnadu": { lat: 16.2333, lon: 80.0500, name: "Palnadu (Narasaraopet)" },
    "parvathipuram manyam": { lat: 18.7800, lon: 83.4300, name: "Parvathipuram Manyam" },
    "prakasam": { lat: 15.5057, lon: 80.0499, name: "Prakasam (Ongole)" },
    "srikakulam": { lat: 18.2969, lon: 83.8968, name: "Srikakulam" },
    "sri potti sriramulu nellore": { lat: 14.4426, lon: 79.9865, name: "SPS Nellore" },
    "sri sathya sai": { lat: 14.1667, lon: 77.8167, name: "Sri Sathya Sai (Puttaparthi)" },
    "tirupati": { lat: 13.6288, lon: 79.4192, name: "Tirupati" },
    "visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" },
    "vizianagaram": { lat: 18.1133, lon: 83.4072, name: "Vizianagaram" },
    "west godavari": { lat: 16.5449, lon: 81.5212, name: "West Godavari (Bhimavaram)" },
    "ysr kadapa": { lat: 14.4673, lon: 78.8242, name: "YSR Kadapa" }
};

function getDistrictLocation(distName) {
    if (!distName) return AP_DISTRICT_COORDS["krishna"];
    const key = distName.toLowerCase().trim();
    for (const dKey in AP_DISTRICT_COORDS) {
        if (key.includes(dKey) || dKey.includes(key)) {
            return AP_DISTRICT_COORDS[dKey];
        }
    }
    return { lat: 16.5062, lon: 80.6480, name: distName };
}

async function loadMandalLiveWeather() {
    const tempEl = document.getElementById("mandalWeatherTemp");
    const condEl = document.getElementById("mandalWeatherCondition");
    const badgeEl = document.getElementById("mandalWeatherBadge");
    const iconEl = document.getElementById("mandalWeatherIcon");
    if (!tempEl || !condEl) return;

    const targetDist = (currentMandal && currentMandal.district) ? currentMandal.district : "Krishna";
    const targetMandal = (currentMandal && currentMandal.mandal) ? currentMandal.mandal : "Vijayawada Rural";
    const loc = getDistrictLocation(targetDist);

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const current = data.current_weather;
        if (!current) throw new Error("No payload");

        const temp = Math.round(current.temperature);
        const code = current.weathercode;
        const wind = current.windspeed;

        let condition = "Clear Skies";
        let iconClass = "bi-sun-fill text-warning";
        let badgeText = "Normal";
        let badgeClass = "bg-success";

        if (code >= 51 && code <= 67) {
            condition = "Scattered Rain";
            iconClass = "bi-cloud-rain-fill text-info";
            badgeText = "Rain Watch";
            badgeClass = "bg-danger";
        } else if (code >= 71 && code <= 77) {
            condition = "Precipitation";
            iconClass = "bi-cloud-snow text-primary";
            badgeText = "Advisory";
            badgeClass = "bg-warning text-dark";
        } else if (code >= 80 && code <= 82) {
            condition = "Heavy Downpour";
            iconClass = "bi-cloud-lightning-rain-fill text-danger";
            badgeText = "Heavy Rain Alert";
            badgeClass = "bg-danger";
        } else if (code >= 95) {
            condition = "Thunderstorm Warning";
            iconClass = "bi-lightning-charge-fill text-danger";
            badgeText = "Storm Alert";
            badgeClass = "bg-danger";
        } else if (code >= 1 && code <= 3) {
            condition = "Partly Cloudy";
            iconClass = "bi-cloud-sun-fill text-warning";
            badgeText = "Monitoring";
            badgeClass = "bg-info text-dark";
        }

        if (wind > 35) {
            badgeText = "High Winds";
            badgeClass = "bg-danger";
        }

        tempEl.textContent = `${temp}°C`;
        condEl.textContent = `${condition} · ${targetMandal}`;
        if (badgeEl) {
            badgeEl.className = `badge ${badgeClass} text-white py-0 px-1`;
            badgeEl.textContent = badgeText;
            badgeEl.style.fontSize = "8.5px";
        }
        if (iconEl) {
            iconEl.innerHTML = `<i class="bi ${iconClass}"></i>`;
        }
    } catch (e) {
        tempEl.textContent = "29°C";
        condEl.textContent = `Clear Skies · ${targetMandal}`;
        if (badgeEl) {
            badgeEl.className = "badge bg-success text-white py-0 px-1";
            badgeEl.textContent = "Normal";
        }
        if (iconEl) {
            iconEl.innerHTML = '<i class="bi bi-sun-fill text-warning"></i>';
        }
    }
}
window.loadMandalLiveWeather = loadMandalLiveWeather;

async function openWeatherDetailModal(districtName) {
    const targetDist = districtName || (currentMandal && currentMandal.district ? currentMandal.district : "Krishna");
    const loc = getDistrictLocation(targetDist);

    const distSelect = document.getElementById("weatherDistrictSelect");
    if (distSelect) {
        for (let i = 0; i < distSelect.options.length; i++) {
            if (distSelect.options[i].value.toLowerCase().includes(targetDist.toLowerCase()) || targetDist.toLowerCase().includes(distSelect.options[i].value.toLowerCase())) {
                distSelect.selectedIndex = i;
                break;
            }
        }
    }

    const modalEl = document.getElementById("weatherDetailModal");
    if (!modalEl) return;
    const modalInst = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInst.show();

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m`;
        const res = await fetch(url);
        const data = await res.json();
        const cur = data.current_weather || { temperature: 29, weathercode: 61, windspeed: 18 };

        const temp = Math.round(cur.temperature);
        const code = cur.weathercode;
        const wind = Math.round(cur.windspeed);

        let condition = "Scattered Showers";
        let iconHtml = '<i class="bi bi-cloud-rain-fill text-info"></i>';
        if (code === 0) { condition = "Clear Sunny"; iconHtml = '<i class="bi bi-sun-fill text-warning"></i>'; }
        else if (code >= 1 && code <= 3) { condition = "Partly Cloudy"; iconHtml = '<i class="bi bi-cloud-sun-fill text-warning"></i>'; }
        else if (code >= 51 && code <= 67) { condition = "Scattered Showers"; iconHtml = '<i class="bi bi-cloud-drizzle-fill text-info"></i>'; }
        else if (code >= 80 && code <= 82) { condition = "Heavy Torrential Rain"; iconHtml = '<i class="bi bi-cloud-lightning-rain-fill text-danger"></i>'; }
        else if (code >= 95) { condition = "Severe Thunderstorm"; iconHtml = '<i class="bi bi-lightning-charge-fill text-danger"></i>'; }

        const heroTemp = document.getElementById("weatherModalHeroTemp");
        if (heroTemp) heroTemp.textContent = `${temp}°C`;
        const heroCond = document.getElementById("weatherModalHeroCondition");
        if (heroCond) heroCond.textContent = condition;
        const heroIcon = document.getElementById("weatherModalHeroIcon");
        if (heroIcon) heroIcon.innerHTML = iconHtml;
        const heroLoc = document.getElementById("weatherModalHeroLocation");
        if (heroLoc) heroLoc.textContent = `${currentMandal ? currentMandal.mandal + ', ' : ''}${loc.name}, Andhra Pradesh`;

        let humidity = 78;
        let rainProb = 75;
        let rainVol = 14.2;
        if (data.hourly) {
            if (data.hourly.relative_humidity_2m && data.hourly.relative_humidity_2m[0]) humidity = data.hourly.relative_humidity_2m[0];
            if (data.hourly.precipitation_probability && data.hourly.precipitation_probability[0]) rainProb = data.hourly.precipitation_probability[0];
            if (data.hourly.precipitation && data.hourly.precipitation[0] !== undefined) rainVol = data.hourly.precipitation.slice(0, 24).reduce((a, b) => a + (b || 0), 0).toFixed(1);
        }

        const humEl = document.getElementById("weatherModalHumidity");
        if (humEl) humEl.textContent = `${humidity}%`;
        const windEl = document.getElementById("weatherModalWind");
        if (windEl) windEl.textContent = `${wind} km/h`;
        const rainVolEl = document.getElementById("weatherModalRainVolume");
        if (rainVolEl) rainVolEl.textContent = `${rainVol} mm`;
        const rainProbEl = document.getElementById("weatherModalRainProb");
        if (rainProbEl) rainProbEl.textContent = `${rainProb}%`;

        const rainRisk = document.getElementById("weatherModalRainRiskText");
        if (rainRisk) {
            if (Number(rainVol) > 50 || rainProb > 80) {
                rainRisk.className = "p-2 rounded border bg-danger-subtle border-danger-subtle small text-danger-emphasis";
                rainRisk.textContent = "High flood inundation risk. Low-lying habitations must be placed under evacuation watch.";
            } else if (Number(rainVol) > 15 || rainProb > 50) {
                rainRisk.className = "p-2 rounded border bg-warning-subtle border-warning-subtle small text-warning-emphasis";
                rainRisk.textContent = "Moderate precipitation forecast. Relief teams and drainage stations on standby.";
            } else {
                rainRisk.className = "p-2 rounded border bg-success-subtle border-success-subtle small text-success-emphasis";
                rainRisk.textContent = "Normal weather conditions. Regular relief and logistics operations permitted.";
            }
        }

        const windSpeedEl = document.getElementById("weatherModalWindSpeed");
        if (windSpeedEl) windSpeedEl.textContent = `${wind} km/h`;
        const windCatEl = document.getElementById("weatherModalWindCategory");
        const windBoxEl = document.getElementById("weatherModalWindWarningBox");
        if (wind > 55) {
            if (windCatEl) { windCatEl.textContent = "Gale / Storm Force"; windCatEl.className = "badge bg-danger"; }
            if (windBoxEl) {
                windBoxEl.style.background = "#fef2f2"; windBoxEl.style.borderColor = "#fecaca"; windBoxEl.style.color = "#991b1b";
                windBoxEl.textContent = "⚠️ DANGER: Strong gale winds. Tree falls and tin roof hazards expected. Restrict volunteer boat travel.";
            }
        } else if (wind > 35) {
            if (windCatEl) { windCatEl.textContent = "Strong Breeze"; windCatEl.className = "badge bg-warning text-dark"; }
            if (windBoxEl) {
                windBoxEl.style.background = "#fffbeb"; windBoxEl.style.borderColor = "#fde68a"; windBoxEl.style.color = "#92400e";
                windBoxEl.textContent = "Elevated wind speeds. Caution advised near water bodies and unstable temporary structures.";
            }
        } else {
            if (windCatEl) { windCatEl.textContent = "Moderate Breeze"; windCatEl.className = "badge bg-success"; }
            if (windBoxEl) {
                windBoxEl.style.background = "#f0fdf4"; windBoxEl.style.borderColor = "#bbf7d0"; windBoxEl.style.color = "#166534";
                windBoxEl.textContent = "Wind conditions within safe operational limits for field volunteers and boats.";
            }
        }
    } catch (e) {
        console.warn("Open-Meteo weather load error:", e);
    }
}
window.openWeatherDetailModal = openWeatherDetailModal;

// Event Listeners for Mandal Weather Widget & Modal
const mandalWeatherWidgetEl = document.getElementById("mandalWeatherWidget");
if (mandalWeatherWidgetEl) {
    mandalWeatherWidgetEl.addEventListener("click", function (e) {
        if (e.target.closest("#refreshMandalWeatherBtn")) return;
        openWeatherDetailModal();
    });
}
const refreshMandalWeatherBtnEl = document.getElementById("refreshMandalWeatherBtn");
if (refreshMandalWeatherBtnEl) {
    refreshMandalWeatherBtnEl.addEventListener("click", function (e) {
        e.stopPropagation();
        loadMandalLiveWeather();
        if (typeof showToast === "function") showToast("Live weather refreshed for this Mandal.");
    });
}
const weatherDistSelectEl = document.getElementById("weatherDistrictSelect");
if (weatherDistSelectEl) {
    weatherDistSelectEl.addEventListener("change", function () {
        openWeatherDetailModal(weatherDistSelectEl.value);
    });
}
const btnRefreshWeatherModalEl = document.getElementById("btnRefreshWeatherModal");
if (btnRefreshWeatherModalEl) {
    btnRefreshWeatherModalEl.addEventListener("click", function () {
        const dist = weatherDistSelectEl ? weatherDistSelectEl.value : null;
        openWeatherDetailModal(dist);
    });
}

// Initialize Mandal Weather
loadMandalLiveWeather();





// ========================================================
// OFFICIAL IMD LIVE WEATHER & TOP SCROLLING ALERT BAR
// ========================================================
const IMD_OFFICIAL_URL = "https://mausam.imd.gov.in/index_en.php";
const DEFAULT_IMD_UPDATES = [
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
        title: "IMD District Nowcast: Thunderstorms accompanied by lightning, intense rain and gusty winds over Alluri Sitharama Raju, Visakhapatnam and coastal districts.",
        url: "https://mausam.imd.gov.in/responsive/districtWiseNowcastGIS.php"
    },
    {
        badge: "PRESS RELEASE",
        badgeClass: "bg-info text-dark",
        title: "Press Release Date: 26th October 2026 — Current Weather Status and All-India Severe Weather Warnings.",
        url: "https://mausam.imd.gov.in/Forecast/marquee_data/Press%20Release%2026-10-2026.pdf"
    }
];

let liveImdDataCache = null;

async function loadImdLiveWeatherFeed() {
    try {
        const res = await fetch("/api/imd-weather", { cache: "no-cache" });
        if (res.ok) {
            const data = await res.json();
            if (data && data.marqueeUpdates && data.marqueeUpdates.length > 0) {
                liveImdDataCache = data;
                renderImdTopAlertBar(data);
                return;
            }
        }
    } catch (e) {
        // Fallback
    }

    const fallbackData = {
        sourceUrl: IMD_OFFICIAL_URL,
        sourceName: "India Meteorological Department (IMD) - Mausam",
        marqueeUpdates: DEFAULT_IMD_UPDATES
    };
    liveImdDataCache = fallbackData;
    renderImdTopAlertBar(fallbackData);
}

function renderImdTopAlertBar(data) {
    const track = document.getElementById("imdTickerTrack");
    if (!track) return;
    const items = data.marqueeUpdates || DEFAULT_IMD_UPDATES;
    let html = "";
    items.forEach((item, index) => {
        html += `
            <span class="imd-ticker-item">
                <span class="badge ${item.badgeClass || 'bg-danger'} me-1">${item.badge}</span>
                <a href="${item.url || IMD_OFFICIAL_URL}" target="_blank" rel="noopener noreferrer" class="text-white text-decoration-none">
                    ${item.title}
                </a>
            </span>
        `;
        if (index < items.length - 1) {
            html += '<span class="imd-ticker-divider">•</span>';
        }
    });
    track.innerHTML = html;
}

function pauseImdTicker() {
    const track = document.getElementById("imdTickerTrack");
    if (track) track.style.animationPlayState = "paused";
}

function resumeImdTicker() {
    const track = document.getElementById("imdTickerTrack");
    if (track) track.style.animationPlayState = "running";
}

window.pauseImdTicker = pauseImdTicker;
window.resumeImdTicker = resumeImdTicker;
window.loadImdLiveWeatherFeed = loadImdLiveWeatherFeed;
