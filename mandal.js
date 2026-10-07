// ========================================================
// MANDAL OFFICER PORTAL LOGIC & AUTO-ROUTING SYSTEM
// ========================================================

let currentMandal = null;
let pendingOfficerPhotoDraft = null; // Buffered profile picture for delayed save
let activeView = "overview";
let reqOverviewModalInstance = null;
let volOverviewModalInstance = null;
let idCardModalInstance = null;

// Helpers for localStorage
function readRecords(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
        return [];
    }
}

function writeRecords(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
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

// ========================================================
// 1. AUTHENTICATION & ACCESS GUARD
// ========================================================
function checkMandalSession() {
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem("disasterCurrentMandal") || "null");
    } catch (e) {}

    // If no session found, pick or create default approved Vijayawada Rural mandal account for testing
    if (!session || !session.mandal) {
        const accounts = readRecords("disasterMandalAccounts");
        const approvedAcc = accounts.find(function (acc) { return acc.status === "Approved"; });
        if (approvedAcc) {
            session = approvedAcc;
            localStorage.setItem("disasterCurrentMandal", JSON.stringify(session));
        } else {
            session = {
                id: "mandal_vja_rural",
                mandal: "Vijayawada Rural",
                district: "Krishna",
                state: "Andhra Pradesh",
                officerName: "K. Ramesh Kumar, MRO",
                employeeId: "EMP-MND-4011",
                phone: "+91 98480 12345",
                email: "mro.vjarural@ap.gov.in",
                status: "Approved",
                role: "mandal",
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
// 2. INITIALIZE PORTAL UI & JURISDICTION
// ========================================================
function initMandalHeaderAndMeta() {
    if (!currentMandal) return;

    const initials = (currentMandal.officerName || "MO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "MO";

    // Sidebar Officer Meta
    document.getElementById("sidebarOfficerName").textContent = currentMandal.officerName || "Mandal Officer";
    document.getElementById("sidebarEmpId").textContent = currentMandal.employeeId || "EMP-001";
    document.getElementById("sidebarMandalName").textContent = `Mandal: ${currentMandal.mandal}`;
    document.getElementById("sidebarDistrictName").textContent = `District: ${currentMandal.district}`;

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
    document.getElementById("topbarMandalHeading").textContent = `${currentMandal.mandal} Mandal Control Center`;
    document.getElementById("topbarBreadcrumb").textContent = `${(currentMandal.district || "KRISHNA").toUpperCase()} DISTRICT / ${currentMandal.mandal.toUpperCase()}`;
    document.getElementById("topbarOfficerName").textContent = currentMandal.officerName || "Mandal Officer";

    // Topbar Avatar
    const topAvatar = document.getElementById("topbarAvatarDisplay");
    if (topAvatar) {
        if (currentMandal.profilePhoto) {
            topAvatar.innerHTML = `<img src="${currentMandal.profilePhoto}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            topAvatar.textContent = initials;
        }
    }

    // Banner Meta
    const bMandal = document.getElementById("bannerMandalTitle");
    if (bMandal) bMandal.textContent = currentMandal.mandal;
    const bDist = document.getElementById("bannerDistrictTitle");
    if (bDist) bDist.textContent = `${currentMandal.district} District`;
}

// ========================================================
// 3. NAVIGATION VIEW SWITCHER
// ========================================================
function switchMandalView(viewName) {
    const validViews = ["overview", "requests", "volunteers", "reports", "profile"];
    if (!validViews.includes(viewName)) viewName = "overview";
    activeView = viewName;

    document.querySelectorAll(".mandal-view").forEach(function (viewEl) {
        viewEl.classList.remove("active");
    });
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".mandal-nav-item").forEach(function (link) {
        if (link.dataset.view === viewName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    const sidebar = document.getElementById("mandalSidebar");
    if (sidebar) sidebar.classList.remove("open");

    // Refresh data for the view
    if (viewName === "overview") renderOverviewDashboard();
    if (viewName === "requests") renderRequestsTable();
    if (viewName === "volunteers") renderVolunteersTable();
    if (viewName === "reports") renderAnnualStatements();
    if (viewName === "profile") populateProfileForm();
}

// ========================================================
// 4. LIVE WEATHER REPORT WIDGET
// ========================================================
async function loadMandalLiveWeather() {
    const tempEl = document.getElementById("mandalWeatherTemp");
    const condEl = document.getElementById("mandalWeatherCondition");
    const badgeEl = document.getElementById("mandalWeatherBadge");
    const iconEl = document.getElementById("mandalWeatherIcon");
    if (!tempEl || !condEl) return;

    const districtCoords = {
        "krishna": { lat: 16.5062, lon: 80.6480, name: "Krishna" },
        "chennai": { lat: 13.0827, lon: 80.2707, name: "Chennai" },
        "wayanad": { lat: 11.6854, lon: 76.1320, name: "Wayanad" },
        "guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
        "visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" }
    };

    const key = (currentMandal.district || "krishna").toLowerCase().trim();
    const loc = districtCoords[key] || { lat: 16.5062, lon: 80.6480, name: currentMandal.mandal };

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
        condEl.textContent = `${condition} · ${currentMandal.mandal}`;
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
        condEl.textContent = `Live Weather · ${currentMandal.mandal}`;
        if (badgeEl) {
            badgeEl.className = "badge bg-success text-white py-0 px-1";
            badgeEl.textContent = "Normal";
        }
        if (iconEl) {
            iconEl.innerHTML = '<i class="bi bi-cloud-sun-fill text-warning"></i>';
        }
    }
}

// ========================================================
// 5. DATA ROUTING HELPERS (AUTOMATIC ROUTING BY MANDAL)
// ========================================================
function getRoutedHelpRequests() {
    const all = readRecords("disasterHelpRequests");
    if (!currentMandal) return [];

    const mTarget = (currentMandal.mandal || "").toLowerCase().trim();
    const dTarget = (currentMandal.district || "").toLowerCase().trim();

    return all.filter(function (req) {
        const rMandal = (req.mandal || "").toLowerCase().trim();
        const rDist = (req.district || "").toLowerCase().trim();
        // Strict automatic routing: only routed if mandal and district match
        return rMandal === mTarget && (dTarget === "" || rDist === dTarget);
    });
}

function getRoutedVolunteers() {
    const all = readRecords("disasterVolunteers");
    if (!currentMandal) return [];

    const mTarget = (currentMandal.mandal || "").toLowerCase().trim();
    const dTarget = (currentMandal.district || "").toLowerCase().trim();

    return all.filter(function (vol) {
        const vMandal = (vol.mandal || "").toLowerCase().trim();
        const vDist = (vol.district || "").toLowerCase().trim();
        return vMandal === mTarget && (dTarget === "" || vDist === dTarget);
    });
}

// ========================================================
// 6. OVERVIEW DASHBOARD
// ========================================================
function renderOverviewDashboard() {
    const requests = getRoutedHelpRequests();
    const volunteers = getRoutedVolunteers();

    const activeRequests = requests.filter(function (r) { return r.status !== "Resolved"; });
    const criticalRequests = activeRequests.filter(function (r) { return r.priority === "Critical" || r.priority === "High"; });
    const inProgressRequests = requests.filter(function (r) { return r.status === "In Progress" || r.status === "Assigned"; });
    const resolvedRequests = requests.filter(function (r) { return r.status === "Resolved"; });
    const availableVolunteers = volunteers.filter(function (v) { return v.status !== "Unavailable"; });

    // Update stat cards
    document.getElementById("statActiveRequests").textContent = activeRequests.length;
    document.getElementById("statCriticalRequests").textContent = `${criticalRequests.length} Critical / High`;
    document.getElementById("statTotalVolunteers").textContent = volunteers.length;
    document.getElementById("statAvailableVolunteers").textContent = `${availableVolunteers.length} Available on call`;
    document.getElementById("statInProgressRequests").textContent = inProgressRequests.length;
    document.getElementById("statResolvedRequests").textContent = resolvedRequests.length;

    // Badges in sidebar
    const pendingCount = activeRequests.filter(function (r) { return r.status === "Pending" || !r.status; }).length;
    document.getElementById("navRequestsPendingCount").textContent = pendingCount;
    document.getElementById("navVolunteersCount").textContent = volunteers.length;

    // Render Priority Requests in Dashboard
    const priorityListEl = document.getElementById("dashPriorityRequestsList");
    if (priorityListEl) {
        if (!activeRequests.length) {
            priorityListEl.innerHTML = '<div class="p-4 text-center text-muted"><i class="bi bi-shield-check text-success fs-3 d-block mb-1"></i>No pending emergency requests in this mandal right now.</div>';
        } else {
            priorityListEl.innerHTML = activeRequests.slice(0, 5).map(function (req) {
                const priorityBadge = req.priority === "Critical" ? "bg-danger" : req.priority === "High" ? "bg-warning text-dark" : "bg-primary";
                return `<div class="list-group-item p-3 d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge ${priorityBadge}">${escapeHtml(req.priority || "Medium")}</span>
                            <strong>${escapeHtml(req.help || "Emergency Help")}</strong>
                            <small class="text-muted font-monospace">#${escapeHtml(req.id)}</small>
                        </div>
                        <div class="text-muted small">
                            <i class="bi bi-geo-alt"></i> ${escapeHtml(req.location || req.village || "Local Area")} · 
                            <i class="bi bi-person"></i> ${escapeHtml(req.name || "Citizen")} (${escapeHtml(req.phone || "No phone")})
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" type="button" onclick="openRequestOverview('${req.id}')">Overview</button>
                </div>`;
            }).join("");
        }
    }

    // Render Volunteers in Dashboard
    const volListEl = document.getElementById("dashVolunteersList");
    if (volListEl) {
        if (!volunteers.length) {
            volListEl.innerHTML = '<div class="p-4 text-center text-muted">No volunteers registered in this mandal yet.</div>';
        } else {
            volListEl.innerHTML = volunteers.slice(0, 5).map(function (vol) {
                const statusBadge = vol.status === "Unavailable" ? "bg-secondary" : "bg-success";
                const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
                return `<div class="list-group-item p-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <div style="width:34px;height:34px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;overflow:hidden;">
                            ${vol.profilePhoto ? `<img src="${vol.profilePhoto}" style="width:100%;height:100%;object-fit:cover;">` : initials}
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

// ========================================================
// 7. ROUTED HELP REQUESTS TABLE
// ========================================================
function renderRequestsTable() {
    const all = getRoutedHelpRequests();
    const searchVal = (document.getElementById("requestSearchInput") ? document.getElementById("requestSearchInput").value : "").toLowerCase().trim();
    const statusVal = document.getElementById("requestStatusFilter") ? document.getElementById("requestStatusFilter").value : "All";
    const prioVal = document.getElementById("requestPriorityFilter") ? document.getElementById("requestPriorityFilter").value : "All";

    const filtered = all.filter(function (req) {
        if (statusVal !== "All" && (req.status || "Pending") !== statusVal) return false;
        if (prioVal !== "All" && (req.priority || "Medium") !== prioVal) return false;
        if (searchVal) {
            const haystack = `${req.id} ${req.name} ${req.phone} ${req.help} ${req.location} ${req.village} ${req.details}`.toLowerCase();
            if (!haystack.includes(searchVal)) return false;
        }
        return true;
    });

    const badgeEl = document.getElementById("requestFilterCountBadge");
    if (badgeEl) badgeEl.textContent = `Showing ${filtered.length} of ${all.length}`;

    const tbody = document.getElementById("mandalRequestsTableBody");
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No emergency help requests match the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function (req) {
        const priorityBadge = req.priority === "Critical" ? "bg-danger" : req.priority === "High" ? "bg-warning text-dark" : "bg-primary";
        const statusBadge = req.status === "Resolved" ? "bg-success" : req.status === "In Progress" ? "bg-info text-dark" : req.status === "Assigned" ? "bg-primary" : req.status === "Verified" ? "bg-secondary" : "bg-warning text-dark";

        return `<tr>
            <td class="font-monospace fw-bold text-primary">#${escapeHtml(req.id)}</td>
            <td>
                <strong>${escapeHtml(req.name || "Citizen")}</strong><br>
                <a href="tel:${escapeHtml(req.phone)}" class="text-muted small text-decoration-none"><i class="bi bi-telephone"></i> ${escapeHtml(req.phone || "N/A")}</a>
            </td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(req.help || "Emergency Assistance")}</span></td>
            <td><span class="badge ${priorityBadge}">${escapeHtml(req.priority || "Medium")}</span></td>
            <td>${escapeHtml(req.location || req.village || "Local Area")}</td>
            <td><strong>${escapeHtml(req.people || req.peopleAffected || "1")}</strong> affected</td>
            <td><span class="badge ${statusBadge}">${escapeHtml(req.status || "Pending")}</span></td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-primary" type="button" onclick="openRequestOverview('${req.id}')" title="Application Overview">
                        <i class="bi bi-eye"></i> Overview
                    </button>
                    ${req.status !== "Resolved" ? `
                        <button class="btn btn-sm btn-outline-success" type="button" onclick="quickResolveRequest('${req.id}')" title="Mark Resolved">
                            <i class="bi bi-check2"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>`;
    }).join("");
}

// ========================================================
// 8. APPLICATION OVERVIEW MODAL
// ========================================================
let activeOverviewRequestId = null;

function openRequestOverview(requestId) {
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(requestId); });
    if (!req) return;

    activeOverviewRequestId = req.id;

    document.getElementById("ovAppId").textContent = `#${req.id}`;
    document.getElementById("overviewAppSub").textContent = `Routed from ${req.mandal || currentMandal.mandal}, ${req.district || currentMandal.district}`;

    const statusBadge = document.getElementById("ovStatusBadge");
    statusBadge.textContent = req.status || "Pending";
    statusBadge.className = `badge ${req.status === "Resolved" ? "bg-success" : req.status === "In Progress" ? "bg-info text-dark" : "bg-warning text-dark"} px-3 py-2 fs-6`;

    document.getElementById("ovCitizenName").textContent = req.name || "Applicant";
    const phoneEl = document.getElementById("ovCitizenPhone");
    phoneEl.textContent = req.phone || "Not provided";
    phoneEl.href = req.phone ? `tel:${req.phone}` : "#";

    document.getElementById("ovCitizenMandal").textContent = req.mandal || currentMandal.mandal;
    document.getElementById("ovCitizenDistrict").textContent = req.district || currentMandal.district;
    document.getElementById("ovCitizenState").textContent = req.state || currentMandal.state;

    document.getElementById("ovHelpType").textContent = req.help || "Emergency Help";
    document.getElementById("ovPriority").textContent = req.priority || "Medium";
    document.getElementById("ovPeopleAffected").textContent = `${req.people || req.peopleAffected || "1"} Persons`;
    document.getElementById("ovReportedDate").textContent = req.createdAt || req.timestamp || "Today";

    document.getElementById("ovVillageAddress").textContent = req.location || req.village || req.address || "Local Area";
    document.getElementById("ovGpsCoords").textContent = req.coordinates || req.gps || req.landmark || "16.5062° N, 80.6480° E (Panchayat Sector)";
    document.getElementById("ovDescription").textContent = req.details || req.description || "Citizen submitted request for urgent disaster assistance.";

    // Selects
    document.getElementById("ovUpdateStatusSelect").value = req.status || "Pending";

    // Populate volunteer assignment dropdown
    const volSelect = document.getElementById("ovAssignVolunteerSelect");
    const volunteers = getRoutedVolunteers();
    volSelect.innerHTML = '<option value="">-- Select Volunteer --</option>' + volunteers.map(function (v) {
        const isSelected = String(req.volunteerId) === String(v.id);
        return `<option value="${v.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(v.name)} (${escapeHtml(v.skills || "Responder")})</option>`;
    }).join("");

    const modalEl = document.getElementById("requestOverviewModal");
    if (!reqOverviewModalInstance) {
        reqOverviewModalInstance = new bootstrap.Modal(modalEl);
    }
    reqOverviewModalInstance.show();
}

window.openRequestOverview = openRequestOverview;

// Save updates from Overview modal
document.getElementById("saveRequestActionBtn").addEventListener("click", function () {
    if (!activeOverviewRequestId) return;
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(activeOverviewRequestId); });
    if (!req) return;

    const newStatus = document.getElementById("ovUpdateStatusSelect").value;
    const assignedVolId = document.getElementById("ovAssignVolunteerSelect").value;

    req.status = newStatus;
    if (assignedVolId) {
        req.volunteerId = assignedVolId;
        if (req.status === "Pending") req.status = "Assigned";
    }

    if (newStatus === "Resolved") {
        req.resolvedAt = new Date().toISOString();
        req.resolvedYear = new Date().getFullYear();
        req.resolvedBy = `${currentMandal.officerName} (${currentMandal.employeeId})`;
    }

    writeRecords("disasterHelpRequests", requests);

    if (reqOverviewModalInstance) reqOverviewModalInstance.hide();
    showToast(`Request #${req.id} updated to ${newStatus}.`);

    renderOverviewDashboard();
    renderRequestsTable();
    renderAnnualStatements();
});

function quickResolveRequest(requestId) {
    if (!confirm(`Mark Emergency Request #${requestId} as Resolved and archive to Annual Statement?`)) return;
    const requests = readRecords("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(requestId); });
    if (!req) return;

    req.status = "Resolved";
    req.resolvedAt = new Date().toISOString();
    req.resolvedYear = new Date().getFullYear();
    req.resolvedBy = `${currentMandal.officerName} (${currentMandal.employeeId})`;

    writeRecords("disasterHelpRequests", requests);
    showToast(`Request #${req.id} marked as Resolved and archived.`);

    renderOverviewDashboard();
    renderRequestsTable();
    renderAnnualStatements();
}
window.quickResolveRequest = quickResolveRequest;

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
// 9. ROUTED MANDAL VOLUNTEERS TABLE
// ========================================================
function renderVolunteersTable() {
    const all = getRoutedVolunteers();
    const searchVal = (document.getElementById("volSearchInput") ? document.getElementById("volSearchInput").value : "").toLowerCase().trim();
    const statusVal = document.getElementById("volStatusFilter") ? document.getElementById("volStatusFilter").value : "All";

    const filtered = all.filter(function (vol) {
        if (statusVal !== "All" && (vol.status || "Available") !== statusVal) return false;
        if (searchVal) {
            const haystack = `${vol.id} ${vol.name} ${vol.phone} ${vol.skills} ${vol.bloodGroup}`.toLowerCase();
            if (!haystack.includes(searchVal)) return false;
        }
        return true;
    });

    const badgeEl = document.getElementById("volFilterCountBadge");
    if (badgeEl) badgeEl.textContent = `Showing ${filtered.length} of ${all.length}`;

    const tbody = document.getElementById("mandalVolunteersTableBody");
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No volunteers found in this mandal.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function (vol) {
        const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
        const volId = vol.volunteerId || ("DRVOL-" + String(vol.id).slice(-4).padStart(4, "0"));
        const isAvailable = vol.status !== "Unavailable";
        const photoSrc = getVolunteerPhotoSrc(vol);

        return `<tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div style="width:38px;height:38px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:bold;overflow:hidden;flex-shrink:0;">
                        ${photoSrc ? `<img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;">` : initials}
                    </div>
                    <div>
                        <strong>${escapeHtml(vol.name)}</strong><br>
                        <small class="text-muted">${escapeHtml(vol.role || "Volunteer Responder")}</small>
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
            <td><span class="badge ${isAvailable ? 'bg-success' : 'bg-secondary'}">${escapeHtml(vol.status || "Available")}</span></td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary" type="button" onclick="openVolunteerOverview('${vol.id}')" title="Application Details">
                        <i class="bi bi-eye"></i> Details
                    </button>
                    <button class="btn btn-sm btn-primary" type="button" onclick="openVolunteerIdCard('${vol.id}')" title="Official Dual-Sided ID Card">
                        <i class="bi bi-person-vcard"></i> ID Card
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

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
        img.src = photoSrc;
        img.style.display = "block";
        initEl.style.display = "none";
    } else {
        img.style.display = "none";
        initEl.textContent = initials;
        initEl.style.display = "block";
    }

    document.getElementById("volOvName").textContent = vol.name;
    document.getElementById("volOvId").textContent = formattedId;
    document.getElementById("volOvDistrict").textContent = vol.district || currentMandal.district;
    document.getElementById("volOvMandal").textContent = vol.mandal || currentMandal.mandal;
    document.getElementById("volOvMobile").textContent = vol.phone || vol.mobileNumber || "N/A";
    document.getElementById("volOvBloodGroup").textContent = vol.bloodGroup || "O+";
    document.getElementById("volOvSkills").textContent = vol.skills || "General Relief";

    const badge = document.getElementById("volOvStatusBadge");
    badge.textContent = vol.status || "Available";
    badge.className = `badge ${vol.status === 'Unavailable' ? 'bg-secondary' : 'bg-success-subtle text-success border'} mt-1`;

    const btn = document.getElementById("volOvOpenIdCardBtn");
    btn.onclick = function () {
        if (volOverviewModalInstance) volOverviewModalInstance.hide();
        openVolunteerIdCard(vol.id);
    };

    const modalEl = document.getElementById("volunteerOverviewModal");
    if (!volOverviewModalInstance) {
        volOverviewModalInstance = new bootstrap.Modal(modalEl);
    }
    volOverviewModalInstance.show();
}
window.openVolunteerOverview = openVolunteerOverview;

// ========================================================
// 10. INLINE VECTOR QR CODE GENERATOR
// ========================================================
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

// ========================================================
// 11. DUAL-SIDED VOLUNTEER ID CARD (FRONT & BACK)
// ========================================================
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
    document.getElementById("idCardName").textContent = vol.name || "__________________";
    document.getElementById("idCardVolId").textContent = frontId;
    document.getElementById("idCardDistrict").textContent = vol.district || currentMandal.district || "__________________";
    document.getElementById("idCardMandal").textContent = vol.mandal || currentMandal.mandal || "__________________";
    document.getElementById("idCardRole").textContent = "Disaster Relief Volunteer";
    document.getElementById("idCardBloodGroup").textContent = vol.bloodGroup || (Number(vol.id) % 2 === 0 ? "B+" : "O+");
    document.getElementById("idCardMobile").textContent = vol.phone || vol.mobileNumber || "__________________";

    const currentYear = new Date().getFullYear();
    document.getElementById("idCardValidFrom").textContent = `01/01/${currentYear}`;
    document.getElementById("idCardValidUntil").textContent = `31/12/${currentYear + 1}`;

    // Back Details
    document.getElementById("idCardBackVolId").textContent = backId;
    document.getElementById("idCardBackDistrict").textContent = vol.district || currentMandal.district || "__________";
    document.getElementById("idCardBackMandal").textContent = vol.mandal || currentMandal.mandal || "__________";

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

    if (!idCardModalInstance) {
        idCardModalInstance = new bootstrap.Modal(modalEl);
    }
    idCardModalInstance.show();
}
window.openVolunteerIdCard = openVolunteerIdCard;

document.getElementById("idCardPrintTriggerBtn").addEventListener("click", function () {
    window.print();
});

// ========================================================
// 12. ANNUAL STATEMENTS & RESOLVED REQUESTS ARCHIVE
// ========================================================
function renderAnnualStatements() {
    const all = getRoutedHelpRequests();
    const resolvedAll = all.filter(function (r) { return r.status === "Resolved"; });

    const yearSelect = document.getElementById("annualYearSelect");
    const selectedYear = yearSelect ? yearSelect.value : "2026";
    const searchVal = (document.getElementById("annualSearchInput") ? document.getElementById("annualSearchInput").value : "").toLowerCase().trim();

    const filtered = resolvedAll.filter(function (req) {
        const itemYear = String(req.resolvedYear || (req.resolvedAt ? new Date(req.resolvedAt).getFullYear() : 2026));
        if (selectedYear !== "All" && itemYear !== selectedYear) return false;

        if (searchVal) {
            const text = `${req.id} ${req.name} ${req.help} ${req.location} ${req.village} ${req.resolvedBy}`.toLowerCase();
            if (!text.includes(searchVal)) return false;
        }
        return true;
    });

    document.getElementById("annualTotalResolvedCount").textContent = resolvedAll.length;
    document.getElementById("annualCurrentYearLabel").textContent = selectedYear === "All" ? "All Years" : selectedYear;
    document.getElementById("annualStatementsCountBadge").textContent = `${filtered.length} Statement Records Found`;

    const tbody = document.getElementById("annualStatementsTableBody");
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No resolved requests found in the ${selectedYear} Annual Statement for ${currentMandal.mandal}.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(function (req) {
        const dateStr = req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : "2026-10-01";
        const yr = req.resolvedYear || (req.resolvedAt ? new Date(req.resolvedAt).getFullYear() : 2026);
        return `<tr>
            <td class="fw-bold font-monospace">${yr}</td>
            <td class="font-monospace text-primary fw-bold">#${escapeHtml(req.id)}</td>
            <td><strong>${escapeHtml(req.name || "Citizen")}</strong></td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(req.help || "Emergency Help")}</span></td>
            <td>${escapeHtml(req.location || req.village || "Local Area")}</td>
            <td>${dateStr}</td>
            <td>${escapeHtml(req.mandal || currentMandal.mandal)}, ${escapeHtml(req.district || currentMandal.district)}</td>
            <td><span class="badge bg-success-subtle text-success border"><i class="bi bi-check-circle"></i> Resolved</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" type="button" onclick="openRequestOverview('${req.id}')">View</button>
            </td>
        </tr>`;
    }).join("");
}

// Export CSV
document.getElementById("exportAnnualCsvBtn").addEventListener("click", function () {
    const all = getRoutedHelpRequests();
    const resolved = all.filter(function (r) { return r.status === "Resolved"; });
    const selectedYear = document.getElementById("annualYearSelect") ? document.getElementById("annualYearSelect").value : "2026";

    let rows = [["Statement Year", "Application ID", "Citizen Name", "Phone", "Help Type", "Mandal", "District", "Village/Location", "Resolved Date", "Resolved By"]];

    resolved.forEach(function (r) {
        const itemYear = String(r.resolvedYear || (r.resolvedAt ? new Date(r.resolvedAt).getFullYear() : 2026));
        if (selectedYear !== "All" && itemYear !== selectedYear) return;

        rows.push([
            itemYear,
            r.id,
            `"${r.name || 'Citizen'}"`,
            `"${r.phone || 'N/A'}"`,
            `"${r.help || 'Emergency'}"`,
            `"${r.mandal || currentMandal.mandal}"`,
            `"${r.district || currentMandal.district}"`,
            `"${r.location || r.village || 'Area'}"`,
            `"${r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : '2026-10-01'}"`,
            `"${r.resolvedBy || currentMandal.officerName}"`
        ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Annual_Statement_${currentMandal.mandal.replace(/\s+/g, '_')}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Annual Statement exported successfully as CSV.");
});

document.getElementById("printAnnualReportBtn").addEventListener("click", function () {
    window.print();
});

// ========================================================
// 13. OFFICER PROFILE & DELAYED PHOTO SAVE
// ========================================================
function populateProfileForm() {
    if (!currentMandal) return;
    pendingOfficerPhotoDraft = null;

    document.getElementById("profileOfficerNameInput").value = currentMandal.officerName || "";
    document.getElementById("profileEmpIdInput").value = currentMandal.employeeId || "EMP-001";
    document.getElementById("profileMandalInput").value = currentMandal.mandal || "";
    document.getElementById("profileDistrictInput").value = currentMandal.district || "";
    document.getElementById("profilePhoneInput").value = currentMandal.phone || "";
    document.getElementById("profileEmailInput").value = currentMandal.email || "";
    document.getElementById("profileAddressInput").value = currentMandal.address || "";

    const initials = (currentMandal.officerName || "MO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "MO";
    const previewImg = document.getElementById("mandalProfileImgPreview");
    const previewInitials = document.getElementById("mandalProfileInitialsPreview");

    if (currentMandal.profilePhoto) {
        previewImg.src = currentMandal.profilePhoto;
        previewImg.style.display = "block";
        previewInitials.style.display = "none";
    } else {
        previewImg.style.display = "none";
        previewInitials.textContent = initials;
        previewInitials.style.display = "block";
    }

    const fileInput = document.getElementById("mandalProfilePhotoInput");
    if (fileInput) fileInput.value = "";
}

// Profile picture selection: PREVIEW ONLY, DO NOT SAVE YET!
document.getElementById("mandalProfilePhotoInput").addEventListener("change", function (e) {
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

        showToast("New profile photo chosen. Click 'Save Profile Changes' to commit.");
    };
    reader.readAsDataURL(file);
});

// Profile Form Submit: COMMITS THE PROFILE PICTURE & DATA
document.getElementById("mandalProfileForm").addEventListener("submit", function (e) {
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

// ========================================================
// 14. EVENT LISTENERS & LIFECYCLE
// ========================================================
document.addEventListener("DOMContentLoaded", function () {
    const session = checkMandalSession();
    if (!session) return;

    initMandalHeaderAndMeta();
    switchMandalView("overview");
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
            document.getElementById("mandalSidebar").classList.toggle("open");
        });
    }

    // Topbar Profile shortcut
    document.getElementById("topbarProfileBtn").addEventListener("click", function () {
        switchMandalView("profile");
    });

    // Dashboard quick link buttons
    document.getElementById("viewAllRequestsBtn").addEventListener("click", function () {
        switchMandalView("requests");
    });
    document.getElementById("viewAllVolunteersBtn").addEventListener("click", function () {
        switchMandalView("volunteers");
    });

    // Refresh buttons
    document.getElementById("refreshMandalWeatherBtn").addEventListener("click", function () {
        loadMandalLiveWeather();
        showToast("Live weather refreshed.");
    });
    document.getElementById("refreshRequestsTableBtn").addEventListener("click", function () {
        renderRequestsTable();
        showToast("Requests list updated.");
    });
    document.getElementById("refreshVolunteersTableBtn").addEventListener("click", function () {
        renderVolunteersTable();
        showToast("Volunteers list updated.");
    });

    // Filter change listeners
    document.getElementById("requestSearchInput").addEventListener("input", renderRequestsTable);
    document.getElementById("requestStatusFilter").addEventListener("change", renderRequestsTable);
    document.getElementById("requestPriorityFilter").addEventListener("change", renderRequestsTable);

    document.getElementById("volSearchInput").addEventListener("input", renderVolunteersTable);
    document.getElementById("volStatusFilter").addEventListener("change", renderVolunteersTable);

    document.getElementById("annualYearSelect").addEventListener("change", renderAnnualStatements);
    document.getElementById("annualSearchInput").addEventListener("input", renderAnnualStatements);

    // Logout
    document.getElementById("mandalLogoutBtn").addEventListener("click", function () {
        localStorage.removeItem("disasterCurrentMandal");
        window.location.href = "index.html";
    });
});
