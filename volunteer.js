const volunteerSidebar = document.getElementById("volunteerSidebar");
const volunteerToast = document.getElementById("volunteerToast");
let toastTimer;
let pendingPhotoDraft = null; // Profile picture delayed save buffer

function records(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
        return [];
    }
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeValue(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
}

function showMessage(message) {
    if (!volunteerToast) return;
    const span = volunteerToast.querySelector("span");
    if (span) span.textContent = message;
    volunteerToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { volunteerToast.classList.remove("show"); }, 2800);
}

function currentVolunteer() {
    let sessionVol = null;
    try {
        sessionVol = JSON.parse(localStorage.getItem("disasterCurrentVolunteer") || "null");
    } catch (e) { }

    const volunteers = records("disasterVolunteers");
    if (sessionVol && sessionVol.id) {
        const found = volunteers.find(function (v) { return String(v.id) === String(sessionVol.id); });
        if (found) return found;
    }
    return volunteers[0] || {
        id: "demo-volunteer",
        name: "Jashuva K.",
        phone: "+91 98765 43210",
        state: "Andhra Pradesh",
        district: "Krishna",
        mandal: "Vijayawada Rural",
        bloodGroup: "O+",
        skills: "First Aid, Search & Rescue, Logistics",
        status: "Available",
        volunteerId: "DRVOL-0001",
        profilePhoto: ""
    };
}

function updateVolunteerRecord(updatedData) {
    const volunteers = records("disasterVolunteers");
    const current = currentVolunteer();
    let index = volunteers.findIndex(function (v) { return String(v.id) === String(current.id); });

    if (index >= 0) {
        volunteers[index] = Object.assign({}, volunteers[index], updatedData);
    } else {
        volunteers.unshift(updatedData);
    }
    save("disasterVolunteers", volunteers);
    localStorage.setItem("disasterCurrentVolunteer", JSON.stringify(updatedData));
}

function getVolunteerPhotoSrc(vol) {
    if (!vol) return "";
    if (vol.profilePhoto && vol.profilePhoto.data) return vol.profilePhoto.data;
    if (typeof vol.profilePhoto === "string" && vol.profilePhoto.length > 5) return vol.profilePhoto;
    if (vol.photoData && vol.photoData.data) return vol.photoData.data;
    if (typeof vol.photoData === "string" && vol.photoData.length > 5) return vol.photoData;
    if (vol.photo) return vol.photo;
    return "";
}

function renderProfile() {
    const volunteer = currentVolunteer();
    const initials = (volunteer.name || "VO").split(" ").map(function (part) { return part[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
    const photoSrc = getVolunteerPhotoSrc(volunteer);

    const nameEl = document.getElementById("volunteerName");
    if (nameEl) nameEl.textContent = volunteer.name;

    const areaEl = document.getElementById("volunteerArea");
    if (areaEl) areaEl.textContent = `${volunteer.mandal ? volunteer.mandal + ", " : ""}${volunteer.district || "Alluri Sitharama Raju"}, ${volunteer.state || "Andhra Pradesh"}`;

    const jurEl = document.getElementById("volJurisdictionDisplay");
    if (jurEl) jurEl.textContent = `${volunteer.state || "Andhra Pradesh"} / ${volunteer.district || "Alluri Sitharama Raju"}`;

    const profNameEl = document.getElementById("profileName");
    if (profNameEl) profNameEl.textContent = volunteer.name;

    const profContactEl = document.getElementById("profileContact");
    if (profContactEl) profContactEl.textContent = `${volunteer.phone || "Phone not added"} · ${volunteer.mandal ? volunteer.mandal + ", " : ""}${volunteer.district || "Krishna"}, ${volunteer.state || "India"}`;

    // Topbar avatar
    const volAvatarEl = document.getElementById("volunteerAvatar");
    if (volAvatarEl) {
        if (photoSrc) {
            volAvatarEl.innerHTML = `<img src="${photoSrc}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            volAvatarEl.textContent = initials;
        }
    }

    // Large profile avatar display
    const imgDisplay = document.getElementById("volProfileImgDisplay");
    const initialsDisplay = document.getElementById("volProfileInitialsDisplay");
    if (photoSrc) {
        if (imgDisplay) {
            imgDisplay.src = photoSrc;
            imgDisplay.style.display = "block";
        }
        if (initialsDisplay) initialsDisplay.style.display = "none";
    } else {
        if (imgDisplay) imgDisplay.style.display = "none";
        if (initialsDisplay) {
            initialsDisplay.textContent = initials;
            initialsDisplay.style.display = "inline";
        }
    }

    const tagsEl = document.getElementById("profileTags");
    if (tagsEl) {
        tagsEl.innerHTML = `<span>${escapeValue(volunteer.status || "Available")}</span><span>${escapeValue(volunteer.district || "Krishna")}</span><span>${escapeValue(volunteer.mandal || "Vijayawada Rural")}</span><span class="badge bg-success-subtle text-success border">Verified Volunteer</span>`;
    }

    const skills = (volunteer.skills || "Emergency First Aid, Field Logistics").split(/,|\n/).map(function (skill) { return skill.trim(); }).filter(Boolean);
    const skillListEl = document.getElementById("skillList");
    if (skillListEl) {
        skillListEl.innerHTML = skills.map(function (skill) { return `<span>${escapeValue(skill)}</span>`; }).join("");
    }

    const availabilityButton = document.getElementById("availabilityButton");
    if (availabilityButton) {
        const available = volunteer.status !== "Unavailable";
        availabilityButton.classList.toggle("available", available);
        availabilityButton.classList.toggle("unavailable", !available);
        availabilityButton.innerHTML = `<span></span> ${available ? "Available" : "Unavailable"}`;
    }

    const areaMsg = document.getElementById("areaMessage");
    if (areaMsg) {
        areaMsg.textContent = `Your ${volunteer.mandal ? volunteer.mandal + " / " : ""}${volunteer.district || "district"} response tasks will appear here.`;
    }
}

function renderLossBadges(lossesStr) {
    if (!lossesStr) return '<span class="text-muted small">None declared</span>';
    const items = String(lossesStr).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (!items.length) return '<span class="text-muted small">None declared</span>';
    return `<div class="d-flex flex-wrap gap-1">` + items.map(function (item) {
        const lower = item.toLowerCase();
        let cls = "loss-house";
        let icon = "bi-house-door-fill";
        if (lower.includes("animal") || lower.includes("livestock") || lower.includes("cattle")) {
            cls = "loss-animals";
            icon = "bi-heart-pulse-fill";
        } else if (lower.includes("agri") || lower.includes("crop")) {
            cls = "loss-agriculture";
            icon = "bi-flower1";
        } else if (lower.includes("injur") || lower.includes("person") || lower.includes("human")) {
            cls = "loss-injury";
            icon = "bi-bandaid-fill";
        }
        return `<span class="loss-badge ${cls}"><i class="bi ${icon}"></i> ${escapeValue(item)}</span>`;
    }).join("") + `</div>`;
}

function computeElapsedTime(timestamp) {
    if (!timestamp) return "Tracking active";
    const diffMs = Date.now() - Number(timestamp);
    if (diffMs < 60000) return "Just accepted (<1 min ago)";
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours} hr${hours > 1 ? "s" : ""} ${remMins} min ago`;
}

function renderAcceptedTasks() {
    const vol = currentVolunteer();
    const allRequests = records("disasterHelpRequests");
    const container = document.getElementById("acceptedTaskList");
    if (!container) return;

    // A task is accepted by or assigned to this volunteer if:
    const myAccepted = allRequests.filter(function (req) {
        const matchesId = String(req.assignedVolunteerId) === String(vol.id) || String(req.volunteerId) === String(vol.id);
        const matchesName = req.assignedVolunteer && (String(req.assignedVolunteer.id) === String(vol.id) || req.assignedVolunteer.name === vol.name);
        return matchesId || matchesName;
    });

    // Update Badges
    const activeMissions = myAccepted.filter(function (m) { return m.status !== "Resolved"; });
    const badgeEl = document.getElementById("acceptedTasksSummaryBadge");
    if (badgeEl) badgeEl.textContent = `${activeMissions.length} Active Mission${activeMissions.length === 1 ? '' : 's'}`;
    const navTrackEl = document.getElementById("acceptedTrackCount");
    if (navTrackEl) navTrackEl.textContent = activeMissions.length;

    // Filters
    const q = (document.getElementById("acceptedTaskSearchInput") ? document.getElementById("acceptedTaskSearchInput").value : "").toLowerCase().trim();
    const statusFilter = document.getElementById("acceptedTaskStatusFilter") ? document.getElementById("acceptedTaskStatusFilter").value : "all";

    const filtered = myAccepted.filter(function (req) {
        if (q) {
            const matchName = (req.name || "").toLowerCase().includes(q);
            const matchTrack = (req.trackId || "").toLowerCase().includes(q);
            const matchLoc = (req.village || req.location || "").toLowerCase().includes(q);
            const matchHelp = (req.help || "").toLowerCase().includes(q);
            if (!matchName && !matchTrack && !matchLoc && !matchHelp) return false;
        }
        if (statusFilter !== "all" && req.status !== statusFilter) return false;
        return true;
    });

    const countBadge = document.getElementById("acceptedTaskFilterBadge");
    if (countBadge) countBadge.textContent = `Showing ${filtered.length} of ${myAccepted.length}`;

    if (!filtered.length) {
        container.innerHTML = `<div class="col-12 text-center py-4 text-muted">
            <i class="bi bi-pin-map fs-2 d-block mb-2 opacity-50"></i>
            ${myAccepted.length === 0 ? "No tasks accepted yet. Click 'Accept task' on any emergency task below to start tracking your mission." : "No accepted tasks match the selected filter."}
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(function (req) {
        const displayId = req.trackId || ("#" + String(req.id).slice(-6));
        const status = req.status || "Assigned";
        const isResolved = status === "Resolved" || status === "Verified / Completed";
        const priority = (req.priority || "Medium").toLowerCase();
        const acceptedTime = req.acceptedAt || req.createdAt || "Recently Accepted";
        const elapsedText = computeElapsedTime(req.acceptedTimestamp);
        const cleanPhone = String(req.mobileNumber || "").replace(/\D/g, "");

        let statusBadgeClass = "bg-primary";
        if (status === "Verified / Completed" || isResolved) statusBadgeClass = "bg-success";
        else if (status === "Assistance Required") statusBadgeClass = "bg-danger";
        else if (status === "Rejected / Rework Required") statusBadgeClass = "bg-danger";
        else if (status === "Work in Progress" || status === "In Progress") statusBadgeClass = "bg-warning text-dark";
        else if (status === "Submitted for Verification") statusBadgeClass = "bg-info text-dark";
        else if (status === "Accepted" || status === "On the Way" || status === "Reached Location") statusBadgeClass = "bg-primary";

        return `<div class="col-md-6 col-lg-6">
            <div class="card h-100 border shadow-sm p-3 rounded-3" style="border-left: 4px solid ${isResolved ? '#20a177' : (status === 'Assistance Required' ? '#ea580c' : (status === 'Work in Progress' ? '#f59e0b' : '#2563eb'))} !important;">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <strong class="font-monospace text-primary fs-6">${escapeValue(displayId)}</strong>
                            <span class="badge ${statusBadgeClass}">${escapeValue(status)}</span>
                            <span class="badge ${priority === 'critical' ? 'bg-danger' : 'bg-secondary'}">${escapeValue(req.priority || 'Medium')}</span>
                        </div>
                        <h5 class="mb-0 mt-1 fs-6 fw-bold">${escapeValue(req.help || "Emergency Rescue & Relief")}</h5>
                    </div>
                </div>

                <!-- CITIZEN & LOCATION -->
                <div class="p-2 my-2 bg-light rounded border small">
                    <div><i class="bi bi-person-fill text-primary"></i> <strong>${escapeValue(req.name || "Affected Citizen")}</strong> · <span class="font-monospace">${escapeValue(req.mobileNumber || "N/A")}</span></div>
                    <div><i class="bi bi-geo-alt-fill text-danger"></i> ${escapeValue(req.village || req.location || "N/A")}, ${escapeValue(req.mandal || "Local Mandal")}, ${escapeValue(req.district || "District")}</div>
                    ${req.details ? `<div class="text-muted mt-1 fst-italic">"${escapeValue(req.details)}"</div>` : ""}
                </div>

                <!-- REPORTED LOSSES (CITIZEN DECLARATION) -->
                <div class="mb-2">
                    <small class="text-muted fw-bold d-block mb-1"><i class="bi bi-shield-exclamation text-danger"></i> Reported Losses / Damages:</small>
                    ${renderLossBadges(req.losses)}
                </div>

                <!-- EXACT ACCEPTANCE TIMESTAMP TRACKER -->
                <div class="p-2 mb-3 rounded border bg-success-subtle border-success-subtle small">
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="text-success-emphasis fw-bold"><i class="bi bi-clock-history"></i> Accepted At:</span>
                        <strong class="text-success-emphasis font-monospace">${escapeValue(acceptedTime)}</strong>
                    </div>
                    <div class="d-flex align-items-center justify-content-between mt-1 text-muted" style="font-size: 11px;">
                        <span><i class="bi bi-stopwatch"></i> Elapsed Mission Time:</span>
                        <span class="fw-semibold text-dark">${escapeValue(elapsedText)}</span>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top mt-auto">
                    <div class="d-flex gap-1">
                        ${cleanPhone ? `<a href="tel:${cleanPhone}" class="btn btn-sm btn-outline-success py-1 px-2" title="Call Citizen"><i class="bi bi-telephone-fill"></i> Call</a>` : ''}
                        ${cleanPhone ? `<a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${req.name}, I am volunteer ${vol.name} dispatched for your request ${displayId}:`)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-1 px-2" title="WhatsApp Citizen"><i class="bi bi-whatsapp"></i> Chat</a>` : ''}
                    </div>
                    <div class="d-flex gap-1 flex-wrap">
                        <button class="btn btn-sm btn-danger py-1 px-2 fw-bold open-task-dossier-btn" data-req-id="${req.id}" title="View Help Request Application, Guidance Letter & Task Form">
                            <i class="bi bi-file-earmark-medical-fill me-1"></i> Task Dossier
                        </button>
                        ${status === "Assigned" ? `
                            <button class="btn btn-sm btn-warning py-1 px-2 fw-semibold accepted-progress-btn" data-req-id="${req.id}" data-stage="In Progress">
                                <i class="bi bi-truck me-1"></i> En Route
                            </button>
                        ` : ''}
                        ${(status === "In Progress" || status === "Work in Progress") ? `
                            <button class="btn btn-sm btn-success py-1 px-2 fw-semibold accepted-progress-btn" data-req-id="${req.id}" data-stage="Resolved">
                                <i class="bi bi-check-circle-fill me-1"></i> Mark Done
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-secondary py-1 px-2 accepted-report-btn" data-req-id="${req.id}">
                            <i class="bi bi-file-earmark-text"></i> Report
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join("");
}

function renderTasks() {
    const vol = currentVolunteer();
    const requests = records("disasterHelpRequests").filter(function (request) { return request.status !== "Resolved" && request.status !== "Verified / Completed"; });

    // Filter to mandal / district if available
    const mandalFilter = (vol.mandal || "").toLowerCase().trim();
    const districtFilter = (vol.district || "").toLowerCase().trim();

    let routedRequests = requests.filter(function (req) {
        if (!mandalFilter) return true;
        const reqMandal = (req.mandal || "").toLowerCase().trim();
        const reqDist = (req.district || "").toLowerCase().trim();
        return reqMandal === mandalFilter || (districtFilter && reqDist === districtFilter);
    });
    if (!routedRequests.length) {
        routedRequests = requests; // fallback to active queue if no local match
    }

    // Apply Filter Controls
    const q = (document.getElementById("taskSearchInput") ? document.getElementById("taskSearchInput").value : "").toLowerCase().trim();
    const prioFilter = document.getElementById("taskPriorityFilter") ? document.getElementById("taskPriorityFilter").value : "all";

    const filtered = routedRequests.filter(function (req) {
        if (q) {
            const matchLoc = (req.location || req.village || req.mandal || "").toLowerCase().includes(q);
            const matchHelp = (req.help || "").toLowerCase().includes(q);
            const matchName = (req.name || "").toLowerCase().includes(q);
            if (!matchLoc && !matchHelp && !matchName) return false;
        }
        if (prioFilter !== "all" && (req.priority || "").toLowerCase() !== prioFilter) return false;
        return true;
    });

    const assignedCountEl = document.getElementById("assignedCount");
    if (assignedCountEl) {
        assignedCountEl.textContent = routedRequests.filter(function (request) { return request.status === "Assigned" || request.status === "In Progress" || request.status === "Work in Progress"; }).length;
    }
    const emergencyCountEl = document.getElementById("emergencyCount");
    if (emergencyCountEl) {
        emergencyCountEl.textContent = routedRequests.filter(function (request) { return request.priority === "Critical" || request.priority === "High"; }).length;
    }

    const taskListEl = document.getElementById("taskList");
    if (taskListEl) {
        taskListEl.innerHTML = filtered.length ? filtered.slice(0, 8).map(function (request) {
            const accepted = request.volunteerId === vol.id || request.assignedVolunteerId === vol.id;
            const priority = (request.priority || "Medium").toLowerCase();
            const locationStr = request.location || request.village || request.mandal || "Local area";
            return `<article class="task-card" data-request-id="${request.id}">
                <div class="task-card-head">
                    <h4>${escapeValue(request.help || "Emergency Help")}</h4>
                    <span class="priority ${priority}">${escapeValue(request.priority || "Medium")}</span>
                </div>
                <p class="mb-2">${escapeValue(request.details || "Emergency support requested.")}</p>
                
                <!-- REPORTED LOSSES BADGES -->
                <div class="mb-2">
                    <small class="text-muted fw-bold d-block mb-1" style="font-size: 11px;">Declared Losses:</small>
                    ${renderLossBadges(request.losses)}
                </div>

                <div class="task-meta">
                    <span><i class="bi bi-geo-alt"></i> ${escapeValue(locationStr)}, ${escapeValue(request.district || "District")}</span>
                    <span><i class="bi bi-building"></i> Mandal: ${escapeValue(request.mandal || "Local")}</span>
                </div>
                <div class="task-actions mt-2">
                    <button class="accept-task ${accepted ? 'btn-success text-white' : ''}" data-task-action="accept" data-request-id="${request.id}" type="button">
                        <i class="bi ${accepted ? 'bi-check-circle-fill' : 'bi-plus-circle'}"></i> ${accepted ? "Accepted (Tracking)" : "Accept task"}
                    </button>
                    <button type="button" data-task-action="view-dossier" data-request-id="${request.id}" class="btn-outline-danger">
                        <i class="bi bi-file-earmark-medical"></i> View Dossier
                    </button>
                    <button type="button" data-task-action="checkin" data-request-id="${request.id}">Check in</button>
                    <button type="button" data-task-action="report" data-request-id="${request.id}">Report</button>
                </div>
            </article>`;
        }).join("") : '<p class="empty-panel">No emergency tasks match your search or area queue.</p>';
    }
}

function renderAlerts() {
    const allAlerts = records("disasterAlerts");
    const countEl = document.getElementById("alertCount");
    if (countEl) countEl.textContent = allAlerts.length;

    const q = (document.getElementById("alertSearchInput") ? document.getElementById("alertSearchInput").value : "").toLowerCase().trim();
    const typeFilter = document.getElementById("alertTypeFilter") ? document.getElementById("alertTypeFilter").value : "all";

    const alerts = allAlerts.filter(function (alert) {
        if (q) {
            const matchTitle = (alert.title || "").toLowerCase().includes(q);
            const matchDetails = (alert.details || alert.message || "").toLowerCase().includes(q);
            if (!matchTitle && !matchDetails) return false;
        }
        if (typeFilter === "sms" && !alert.isSms) return false;
        if (typeFilter === "critical" && !String(alert.type || alert.title || "").toLowerCase().includes("warn") && !String(alert.type || alert.title || "").toLowerCase().includes("red")) return false;
        return true;
    });

    const alertsEl = document.getElementById("volunteerAlerts");
    if (alertsEl) {
        alertsEl.innerHTML = alerts.length ? alerts.slice(0, 6).map(function (alert) {
            const isSms = alert.isSms;
            return `<article class="alert-item ${isSms ? 'border-danger' : ''}">
                <span class="alert-badge"><i class="bi ${isSms ? 'bi-broadcast text-danger' : 'bi-exclamation-lg'}"></i></span>
                <div>
                    <div class="d-flex align-items-center gap-1">
                        <strong>${escapeValue(alert.title || alert.type || "Disaster Alert")}</strong>
                        ${isSms ? '<span class="badge bg-danger text-white py-0 px-1" style="font-size: 9px;">Mobile SMS</span>' : ''}
                    </div>
                    <p class="mb-1">${escapeValue(alert.details || alert.message || "Emergency warning issued.")}</p>
                    <small>${escapeValue(alert.district || "Area-wide")} · ${escapeValue(alert.createdAt || "Just now")}</small>
                </div>
            </article>`;
        }).join("") : '<p class="empty-panel">No emergency alerts match filter.</p>';
    }
}

function renderHistory() {
    const allHistory = records("disasterVolunteerHistory");
    const completedEl = document.getElementById("completedCount");
    if (completedEl) completedEl.textContent = allHistory.length;
    const hoursEl = document.getElementById("hoursCount");
    if (hoursEl) hoursEl.textContent = allHistory.reduce(function (total, item) { return total + Number(item.hours || 0); }, 0);

    const q = (document.getElementById("historySearchInput") ? document.getElementById("historySearchInput").value : "").toLowerCase().trim();
    const history = allHistory.filter(function (item) {
        if (!q) return true;
        return (item.task || "").toLowerCase().includes(q) || (item.location || "").toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
    });

    const listEl = document.getElementById("historyList");
    if (listEl) {
        listEl.innerHTML = history.length ? history.map(function (item) {
            return `<div class="history-row"><div><strong>${escapeValue(item.task)}</strong><small>${escapeValue(item.date)}</small></div><span>${escapeValue(item.location)}</span><span class="history-status"><i class="bi bi-check2-circle"></i> Completed</span></div>`;
        }).join("") : '<p class="empty-panel">Completed activities will appear here after you submit a report.</p>';
    }
}

// ==========================================
// SECTION: INLINE VECTOR QR CODE GENERATOR
// ==========================================
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

// ==========================================
// SECTION: DUAL-SIDED VOLUNTEER ID CARD MODAL
// ==========================================
let volunteerIdCardModalInstance = null;

function openVolunteerIdCard() {
    const vol = currentVolunteer();
    const modalEl = document.getElementById("volunteerIdCardModal");
    if (!modalEl) return;

    // Photo or initials
    const photoImg = document.getElementById("idCardPhotoImg");
    const photoInitials = document.getElementById("idCardPhotoInitials");
    const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
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

    const frontId = vol.volunteerId || ("DRVOL-" + String(vol.id || "0001").slice(-4).padStart(4, "0"));
    const backId = "JS-VOL-" + String(vol.id || "0001").slice(-4).padStart(4, "0");

    // Populate Front
    const nameEl = document.getElementById("idCardName");
    if (nameEl) nameEl.textContent = vol.name || "Volunteer Responder";

    const volIdEl = document.getElementById("idCardVolId");
    if (volIdEl) volIdEl.textContent = frontId;

    const distEl = document.getElementById("idCardDistrict");
    if (distEl) distEl.textContent = vol.district || "Krishna";

    const mandalEl = document.getElementById("idCardMandal");
    if (mandalEl) mandalEl.textContent = vol.mandal || "Vijayawada Rural";

    const roleEl = document.getElementById("idCardRole");
    if (roleEl) roleEl.textContent = "Disaster Relief Volunteer";

    const bloodEl = document.getElementById("idCardBloodGroup");
    if (bloodEl) bloodEl.textContent = vol.bloodGroup || "O+";

    const mobEl = document.getElementById("idCardMobile");
    if (mobEl) mobEl.textContent = vol.phone || vol.mobileNumber || "+91 98765 43210";

    const currentYear = new Date().getFullYear();
    const validFromEl = document.getElementById("idCardValidFrom");
    if (validFromEl) validFromEl.textContent = `01/01/${currentYear}`;
    const validUntilEl = document.getElementById("idCardValidUntil");
    if (validUntilEl) validUntilEl.textContent = `31/12/${currentYear + 1}`;

    // Populate Back
    const backVolIdEl = document.getElementById("idCardBackVolId");
    if (backVolIdEl) backVolIdEl.textContent = backId;

    const backDistEl = document.getElementById("idCardBackDistrict");
    if (backDistEl) backDistEl.textContent = vol.district || "Krishna";

    const backMandalEl = document.getElementById("idCardBackMandal");
    if (backMandalEl) backMandalEl.textContent = vol.mandal || "Vijayawada Rural";

    // QR Code
    const qrPayload = JSON.stringify({
        org: "DISASTER RELIEF MANAGEMENT",
        id: frontId,
        backId: backId,
        name: vol.name,
        district: vol.district || "Krishna",
        mandal: vol.mandal || "Vijayawada Rural",
        emergency: "112",
        status: "Authorized Responder"
    });
    const qrContainer = document.getElementById("idCardQrCodeSvg");
    if (qrContainer) {
        qrContainer.innerHTML = generateInlineQrSvg(qrPayload);
    }

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        if (!volunteerIdCardModalInstance) {
            volunteerIdCardModalInstance = new bootstrap.Modal(modalEl);
        }
        volunteerIdCardModalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
        document.body.classList.add("modal-open");
    }
}

// Print ID Card
const printIdCardBtn = document.getElementById("idCardPrintTriggerBtn");
if (printIdCardBtn) {
    printIdCardBtn.addEventListener("click", function () {
        window.print();
    });
}

// Navigation / Button triggers for ID Card
const openMyIdCardBtn = document.getElementById("openMyIdCardBtn");
if (openMyIdCardBtn) {
    openMyIdCardBtn.addEventListener("click", openVolunteerIdCard);
}
const navMyIdCardLink = document.getElementById("navMyIdCardLink");
if (navMyIdCardLink) {
    navMyIdCardLink.addEventListener("click", function (e) {
        e.preventDefault();
        openVolunteerIdCard();
    });
}

// ==========================================
// SECTION: AP DISTRICT COORDINATES & LIVE WEATHER INTELLIGENCE
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

async function loadVolunteerLiveWeather() {
    const tempEl = document.getElementById("volWeatherTemp");
    const condEl = document.getElementById("volWeatherCondition");
    const badgeEl = document.getElementById("volWeatherBadge");
    const iconEl = document.getElementById("volWeatherIcon");
    if (!tempEl || !condEl) return;

    const vol = currentVolunteer();
    const loc = getDistrictLocation(vol.district || "Krishna");

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
        condEl.textContent = `${condition} · ${vol.mandal ? vol.mandal : (vol.district || "Area")}`;
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
        condEl.textContent = `Clear Skies · ${vol.district || "Area"}`;
        if (badgeEl) {
            badgeEl.className = "badge bg-success text-white py-0 px-1";
            badgeEl.textContent = "Normal";
        }
        if (iconEl) {
            iconEl.innerHTML = '<i class="bi bi-sun-fill text-warning"></i>';
        }
    }
}

async function openWeatherDetailModal(districtName) {
    const vol = currentVolunteer();
    const targetDist = districtName || (vol.district || "Krishna");
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

    // Fetch comprehensive meteorological data from Open-Meteo
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

        // Rainfall estimation
        let rain24h = 8.5;
        let rainProb = 65;
        if (data.hourly && data.hourly.precipitation && data.hourly.precipitation.length) {
            const next24 = data.hourly.precipitation.slice(0, 24);
            rain24h = (next24.reduce((a, b) => a + Number(b || 0), 0)).toFixed(1);
        }
        if (data.hourly && data.hourly.precipitation_probability && data.hourly.precipitation_probability.length) {
            rainProb = Math.round(data.hourly.precipitation_probability.slice(0, 12).reduce((a, b) => a + Number(b || 0), 0) / 12) || 70;
        }

        // Humidity
        let humidity = 76;
        if (data.hourly && data.hourly.relative_humidity_2m && data.hourly.relative_humidity_2m.length) {
            humidity = Math.round(data.hourly.relative_humidity_2m[0]);
        }

        // Update modal UI elements
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

        // Strong wind warning logic
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
                windWarningBox.innerHTML = `⚠️ <strong>SEVERE WIND WARNING:</strong> Wind speeds exceeding 50 km/h. High risk of uprooted trees and fallen power lines. Suspend boat rescues and secure loose shelters.`;
            }
        } else if (wind > 35) {
            if (windCatEl) { windCatEl.className = "badge bg-warning text-dark"; windCatEl.textContent = "Strong Breeze (35-50 km/h)"; }
            if (windWarningBox) {
                windWarningBox.style.background = "#fffbeb";
                windWarningBox.style.borderColor = "#fde68a";
                windWarningBox.style.color = "#92400e";
                windWarningBox.innerHTML = `⚠️ <strong>STRONG WIND ADVISORY:</strong> Gusty winds active. Exercise caution during debris clearance and water crossing.`;
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

        // Official alert text
        const alertBadge = document.getElementById("weatherModalAlertLevelBadge");
        const alertText = document.getElementById("weatherModalOfficialAlertText");
        if (code >= 80 || wind > 40 || Number(rain24h) > 30) {
            if (alertBadge) { alertBadge.className = "badge bg-danger"; alertBadge.textContent = "ORANGE ALERT - HEAVY RAIN"; }
            if (alertText) alertText.innerHTML = `⚠️ <strong>AP Disaster Management State Directive:</strong> Heavy rainfall and squally winds expected in coastal mandals within next 12 hours. Volunteers must stay in contact with Mandal Incident Commander.`;
        } else {
            if (alertBadge) { alertBadge.className = "badge bg-success"; alertBadge.textContent = "GREEN - NORMAL WATCH"; }
            if (alertText) alertText.innerHTML = `✅ <strong>AP State Weather Operations:</strong> Normal monsoon conditions. Routine field operations may proceed. Keep 112 emergency channel on standby.`;
        }

    } catch (err) {
        console.warn("Weather modal fetch fallback:", err);
    }
}

// Weather widget triggers
const volWeatherWidget = document.getElementById("volWeatherWidget");
if (volWeatherWidget) {
    volWeatherWidget.addEventListener("click", function () {
        openWeatherDetailModal();
    });
}
const refreshVolWeatherBtn = document.getElementById("refreshVolWeatherBtn");
if (refreshVolWeatherBtn) {
    refreshVolWeatherBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        loadVolunteerLiveWeather();
        showMessage("Weather report refreshed.");
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

// ==========================================
// SECTION: ISOLATED SIDEBAR VIEW SWITCHING SYSTEM
// ==========================================
const VIEW_METADATA = {
    "dashboard": { breadcrumb: "VOLUNTEER NETWORK / FIELD OVERVIEW", title: "Volunteer Dashboard" },
    "accepted-tasks": { breadcrumb: "VOLUNTEER NETWORK / MISSION TRACKING", title: "Accepted Missions & Tasks" },
    "tasks": { breadcrumb: "VOLUNTEER NETWORK / DISPATCH QUEUE", title: "Available Emergency Tasks" },
    "alerts": { breadcrumb: "VOLUNTEER NETWORK / PUBLIC WARNINGS", title: "Disaster Alerts & Advisories" },
    "profile": { breadcrumb: "VOLUNTEER NETWORK / PERSONNEL DOSSIER", title: "Volunteer Official Profile" },
    "skills": { breadcrumb: "VOLUNTEER NETWORK / CAPABILITIES & TEAMS", title: "Specialized Skills & Training" },
    "history": { breadcrumb: "VOLUNTEER NETWORK / PAST MISSIONS", title: "Activity & Mission History" },
    "safety": { breadcrumb: "VOLUNTEER NETWORK / PROTOCOLS & SOP", title: "Safety Guidelines & SOP" },
    "certificate": { breadcrumb: "VOLUNTEER NETWORK / HONORS & SERVICE", title: "Volunteer Service Certificate" }
};

function switchVolunteerView(viewId) {
    if (!viewId) viewId = "dashboard";
    viewId = viewId.replace(/^#/, "");
    if (!VIEW_METADATA[viewId]) viewId = "dashboard";

    // 1. Hide all views and show only target view
    document.querySelectorAll(".volunteer-view").forEach(function (viewEl) {
        viewEl.classList.remove("active-view");
    });
    const targetViewEl = document.getElementById("view-" + viewId);
    if (targetViewEl) {
        targetViewEl.classList.add("active-view");
    }

    // 2. Update active status on sidebar links
    document.querySelectorAll(".volunteer-link").forEach(function (link) {
        link.classList.remove("active");
        const linkView = link.getAttribute("data-view") || (link.getAttribute("href") || "").replace(/^#/, "");
        if (linkView === viewId) {
            link.classList.add("active");
        }
    });

    // 3. Update topbar breadcrumb and header title
    const meta = VIEW_METADATA[viewId];
    const breadcrumbEl = document.getElementById("volBreadcrumb");
    if (breadcrumbEl && meta) breadcrumbEl.textContent = meta.breadcrumb;
    const headerTitleEl = document.querySelector(".volunteer-topbar h1");
    if (headerTitleEl && meta) headerTitleEl.textContent = meta.title;

    // 4. Close mobile sidebar if open
    if (volunteerSidebar) volunteerSidebar.classList.remove("open");

    // 5. Render specific view data
    if (viewId === "dashboard") {
        renderDashboardSnapshots();
        renderTasks();
        renderAcceptedTasks();
    } else if (viewId === "accepted-tasks") {
        renderAcceptedTasks();
    } else if (viewId === "tasks") {
        renderTasks();
    } else if (viewId === "alerts") {
        renderAlerts();
    } else if (viewId === "profile") {
        renderProfile();
    } else if (viewId === "history") {
        renderHistory();
    }

    // Scroll main window to top
    window.scrollTo({ top: 0, behavior: "smooth" });
}
window.switchVolunteerView = switchVolunteerView;

// Listen to hash changes in URL
window.addEventListener("hashchange", function () {
    const rawHash = window.location.hash.replace(/^#/, "");
    if (rawHash && VIEW_METADATA[rawHash]) {
        switchVolunteerView(rawHash);
    }
});

// Sidebar link delegation
document.querySelectorAll(".volunteer-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
        if (link.id === "navMyIdCardLink" || link.id === "volunteerLogout") return;
        const targetView = link.getAttribute("data-view") || (link.getAttribute("href") || "").replace(/^#/, "");
        if (targetView && VIEW_METADATA[targetView]) {
            e.preventDefault();
            window.location.hash = targetView;
            switchVolunteerView(targetView);
        }
    });
});

// Profile topbar shortcut
const profileShortcut = document.getElementById("profileShortcut");
if (profileShortcut) {
    profileShortcut.addEventListener("click", function () {
        switchVolunteerView("profile");
    });
}

// ==========================================
// SECTION: DASHBOARD MISSION SNAPSHOT RENDERER
// ==========================================
function renderDashboardSnapshots() {
    const vol = currentVolunteer();
    const allRequests = records("disasterHelpRequests");

    // Accepted snapshot
    const myAccepted = allRequests.filter(function (req) {
        const matchesId = String(req.assignedVolunteerId) === String(vol.id) || String(req.volunteerId) === String(vol.id);
        const matchesName = req.assignedVolunteer && (String(req.assignedVolunteer.id) === String(vol.id) || req.assignedVolunteer.name === vol.name);
        return (matchesId || matchesName) && req.status !== "Resolved" && req.status !== "Verified / Completed";
    });

    const accContainer = document.getElementById("dashboardAcceptedSnapshot");
    if (accContainer) {
        if (!myAccepted.length) {
            accContainer.innerHTML = `<div class="text-center py-3 text-muted">
                <i class="bi bi-pin-map fs-3 d-block mb-1 opacity-50"></i>
                <small>No active missions right now. Accept an urgent task from the queue to start response operations.</small>
            </div>`;
        } else {
            accContainer.innerHTML = myAccepted.slice(0, 3).map(function (req) {
                const track = req.trackId || ("#" + String(req.id).slice(-6));
                const status = req.status || "Assigned";
                return `<div class="p-2 mb-2 rounded bg-light border d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <strong class="font-monospace text-primary small">${escapeValue(track)}</strong>
                            <span class="badge bg-danger py-0 px-1" style="font-size: 9px;">${escapeValue(status)}</span>
                        </div>
                        <div class="fw-semibold text-dark small">${escapeValue(req.help || "Emergency Help")}</div>
                        <small class="text-muted"><i class="bi bi-geo-alt"></i> ${escapeValue(req.village || req.location || req.mandal || "Area")}</small>
                    </div>
                    <button class="btn btn-sm btn-danger py-1 px-2 fw-bold" onclick="openVolunteerTaskModal('${req.id}')">
                        <i class="bi bi-file-earmark-medical"></i> Dossier
                    </button>
                </div>`;
            }).join("");
        }
    }

    // Available tasks snapshot
    const unassignedTasks = allRequests.filter(function (req) {
        return req.status !== "Resolved" && req.status !== "Verified / Completed";
    });
    const taskContainer = document.getElementById("dashboardTasksSnapshot");
    if (taskContainer) {
        if (!unassignedTasks.length) {
            taskContainer.innerHTML = `<div class="text-center py-3 text-muted">
                <i class="bi bi-check-circle fs-3 d-block mb-1 opacity-50"></i>
                <small>No pending emergency tasks in queue.</small>
            </div>`;
        } else {
            taskContainer.innerHTML = unassignedTasks.slice(0, 3).map(function (req) {
                const prio = (req.priority || "Medium").toLowerCase();
                return `<div class="p-2 mb-2 rounded bg-light border d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${prio === 'critical' ? 'bg-danger' : 'bg-primary'} py-0 px-1" style="font-size: 9px;">${escapeValue(req.priority || "Medium")}</span>
                            <strong class="text-dark small">${escapeValue(req.help || "Relief Request")}</strong>
                        </div>
                        <small class="text-muted"><i class="bi bi-building"></i> ${escapeValue(req.mandal || "Local Mandal")}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary py-1 px-2 fw-semibold" onclick="openVolunteerTaskModal('${req.id}')">
                        View
                    </button>
                </div>`;
            }).join("");
        }
    }
}

// ==========================================
// SECTION: 9-STAGE WORKFLOW ENGINE & TASK DOSSIER MODAL
// ==========================================
let activeModalRequestId = null;
let currentTaskEvidencePhotos = [];

const WORKFLOW_STAGES = [
    "Assigned",
    "Accepted",
    "On the Way",
    "Reached Location",
    "Work in Progress",
    "Assistance Required",
    "Submitted for Verification",
    "Verified / Completed",
    "Rejected / Rework Required"
];

function getVolunteerTaskRecord(req, volId) {
    if (!req.assignedVolunteers || !Array.isArray(req.assignedVolunteers)) {
        req.assignedVolunteers = [];
    }
    let entry = req.assignedVolunteers.find(function (v) { return String(v.volunteerId) === String(volId); });
    if (!entry) {
        const vol = currentVolunteer();
        entry = {
            volunteerId: volId,
            volunteerName: vol.name,
            phone: vol.phone || vol.mobileNumber,
            status: req.status || "Assigned",
            assignedAt: req.acceptedAt || req.createdAt || new Date().toLocaleString(),
            evidencePhotos: [],
            actionReport: "",
            peopleAssisted: 1,
            suppliesDistributed: "",
            assistanceNeeded: null,
            statusHistory: [
                {
                    status: req.status || "Assigned",
                    updatedBy: "Mandal Officer",
                    volunteerId: volId,
                    timestamp: Date.now(),
                    date: new Date().toLocaleString(),
                    remarks: "Task assigned to volunteer by Mandal Operations Center"
                }
            ]
        };
        req.assignedVolunteers.push(entry);
    }
    return entry;
}

function updateVolunteerTaskStatus(reqId, newStatus, remarks, extraData) {
    const requests = records("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(reqId); });
    if (!req) return;
    const vol = currentVolunteer();
    const entry = getVolunteerTaskRecord(req, vol.id);

    entry.status = newStatus;
    if (extraData) {
        Object.assign(entry, extraData);
    }

    if (!entry.statusHistory) entry.statusHistory = [];
    entry.statusHistory.unshift({
        status: newStatus,
        updatedBy: vol.name,
        volunteerId: vol.volunteerId || vol.id,
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        remarks: remarks || `Status updated to ${newStatus}`
    });

    // Sync top-level request fields for backwards compatibility
    req.status = newStatus;
    req.volunteerId = vol.id;
    req.assignedVolunteerId = vol.id;
    req.assignedVolunteer = {
        id: vol.id,
        name: vol.name,
        phone: vol.phone || vol.mobileNumber,
        district: vol.district,
        mandal: vol.mandal
    };
    req.lastUpdatedBy = vol.name;
    req.lastUpdatedAt = new Date().toLocaleString();

    save("disasterHelpRequests", requests);
    return { req: req, entry: entry };
}

function updateWorkflowStepper(currentStatus) {
    const stepper = document.getElementById("modalWorkflowStepper");
    if (!stepper) return;

    const stepElements = stepper.querySelectorAll(".workflow-step");
    const stageOrder = [
        "Assigned",
        "Accepted",
        "On the Way",
        "Reached Location",
        "Work in Progress",
        "Submitted for Verification",
        "Verified / Completed"
    ];

    let currentIndex = stageOrder.indexOf(currentStatus);

    stepElements.forEach(function (stepEl) {
        const stepId = stepEl.getAttribute("data-step-id");
        stepEl.classList.remove("active", "completed", "assistance", "rework");

        if (stepId === currentStatus) {
            stepEl.classList.add("active");
            if (currentStatus === "Assistance Required") stepEl.classList.add("assistance");
            if (currentStatus === "Rejected / Rework Required") stepEl.classList.add("rework");
        } else if (currentIndex >= 0 && stageOrder.indexOf(stepId) >= 0 && stageOrder.indexOf(stepId) < currentIndex) {
            stepEl.classList.add("completed");
        }
    });
}

function renderStatusAuditTable(historyList) {
    const tbody = document.getElementById("modalStatusAuditTbody");
    if (!tbody) return;
    if (!historyList || !historyList.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No status transitions logged yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = historyList.map(function (item) {
        return `<tr>
            <td><span class="badge bg-dark">${escapeValue(item.status)}</span></td>
            <td><strong>${escapeValue(item.updatedBy || "System")}</strong></td>
            <td><code class="text-primary">${escapeValue(item.volunteerId || "DRVOL")}</code></td>
            <td class="font-monospace" style="font-size: 11px;">${escapeValue(item.date)}</td>
            <td>${escapeValue(item.remarks || "No remarks")}</td>
        </tr>`;
    }).join("");
}

function renderEvidenceGallery(photos) {
    const gallery = document.getElementById("modalEvidenceGalleryPreview");
    if (!gallery) return;
    if (!photos || !photos.length) {
        gallery.innerHTML = `<div class="text-muted small py-2">No evidence photos attached yet. Select photos to preview before submission.</div>`;
        return;
    }
    gallery.innerHTML = photos.map(function (src, index) {
        return `<div class="evidence-thumb-card">
            <img src="${src}" alt="Evidence ${index + 1}">
            <button type="button" class="remove-thumb-btn" data-photo-idx="${index}" title="Remove photo">&times;</button>
        </div>`;
    }).join("");

    // Bind remove button listeners
    gallery.querySelectorAll(".remove-thumb-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const idx = Number(btn.getAttribute("data-photo-idx"));
            currentTaskEvidencePhotos.splice(idx, 1);
            renderEvidenceGallery(currentTaskEvidencePhotos);
        });
    });
}

function openVolunteerTaskModal(requestId) {
    activeModalRequestId = requestId;
    const requests = records("disasterHelpRequests");
    const req = requests.find(function (r) { return String(r.id) === String(requestId); });
    if (!req) return;

    const vol = currentVolunteer();
    const entry = getVolunteerTaskRecord(req, vol.id);
    const status = entry.status || req.status || "Assigned";
    const displayId = req.trackId || ("#" + String(req.id).slice(-6));

    // Update Header Badges
    const trackBadge = document.getElementById("modalTrackIdBadge");
    if (trackBadge) trackBadge.textContent = displayId;
    const statusBadge = document.getElementById("modalWorkflowStatusBadge");
    if (statusBadge) {
        statusBadge.textContent = status;
        statusBadge.className = `badge ${status === 'Assistance Required' ? 'bg-danger' : (status === 'Verified / Completed' ? 'bg-success' : 'bg-primary')} px-3 py-1 fs-6`;
    }

    // Update Stepper
    updateWorkflowStepper(status);

    // 1. POPULATE TAB 1: HELP REQUEST APPLICATION
    const prioBadge = document.getElementById("modalReqPriorityBadge");
    if (prioBadge) {
        prioBadge.textContent = `${req.priority || 'High'} Priority`;
        prioBadge.className = `badge ${(req.priority || '').toLowerCase() === 'critical' ? 'bg-danger' : 'bg-primary'}`;
    }
    const citizenName = document.getElementById("modalCitizenName");
    if (citizenName) citizenName.textContent = req.name || "Affected Citizen";
    const citizenPhone = document.getElementById("modalCitizenPhone");
    if (citizenPhone) citizenPhone.textContent = req.mobileNumber || "N/A";
    const callBtn = document.getElementById("modalCallCitizenBtn");
    if (callBtn) callBtn.href = req.mobileNumber ? `tel:${req.mobileNumber.replace(/\D/g, "")}` : "#";

    const citDist = document.getElementById("modalCitizenDistrict");
    if (citDist) citDist.textContent = req.district || vol.district || "Krishna";
    const citMandal = document.getElementById("modalCitizenMandal");
    if (citMandal) citMandal.textContent = req.mandal || vol.mandal || "Vijayawada Rural";
    const citVillage = document.getElementById("modalCitizenVillage");
    if (citVillage) citVillage.textContent = req.village || req.location || "Local Habitation";

    const disType = document.getElementById("modalDisasterType");
    if (disType) disType.textContent = req.disasterType || "Flood / Cyclone Inundation";
    const helpType = document.getElementById("modalHelpType");
    if (helpType) helpType.textContent = req.help || "Emergency Humanitarian Relief";

    const citDetails = document.getElementById("modalCitizenDetails");
    if (citDetails) citDetails.textContent = req.details ? `"${req.details}"` : `"Urgent disaster relief requested at designated premises."`;

    const repLosses = document.getElementById("modalReportedLosses");
    if (repLosses) repLosses.innerHTML = renderLossBadges(req.losses);

    // 2. POPULATE TAB 2: MANDAL GUIDANCE LETTER
    const letterRef = document.getElementById("letterRefNo");
    if (letterRef) letterRef.textContent = `AP-DM/MND/${new Date().getFullYear()}/${String(req.id).slice(-4).padStart(4, "0")}`;
    const letterDate = document.getElementById("letterDate");
    if (letterDate) letterDate.textContent = new Date().toLocaleDateString('en-GB');
    const letterMandal = document.getElementById("letterMandal");
    if (letterMandal) letterMandal.textContent = `${req.mandal || vol.mandal || 'Local'} Mandal Emergency Operations`;
    const letterVolName = document.getElementById("letterVolunteerName");
    if (letterVolName) letterVolName.textContent = vol.name;
    const letterVolId = document.getElementById("letterVolunteerId");
    if (letterVolId) letterVolId.textContent = vol.volunteerId || "DRVOL-0001";
    const letterTrack = document.getElementById("letterTrackId");
    if (letterTrack) letterTrack.textContent = displayId;
    const letterOfficer = document.getElementById("letterOfficerName");
    if (letterOfficer) letterOfficer.textContent = `Mandal Revenue Officer & Incident Commander (${req.mandal || vol.mandal || 'Jurisdiction'})`;

    // 3. POPULATE TAB 3: TASK EXECUTION & EVIDENCE FORM
    renderStatusAuditTable(entry.statusHistory);

    // Evidence photos
    currentTaskEvidencePhotos = Array.isArray(entry.evidencePhotos) ? entry.evidencePhotos.slice() : [];
    renderEvidenceGallery(currentTaskEvidencePhotos);

    const reportNotes = document.getElementById("modalActionReportInput");
    if (reportNotes) reportNotes.value = entry.actionReport || "";
    const peopleInput = document.getElementById("modalPeopleAssistedInput");
    if (peopleInput) peopleInput.value = entry.peopleAssisted || 1;
    const suppliesInput = document.getElementById("modalSuppliesDistributedInput");
    if (suppliesInput) suppliesInput.value = entry.suppliesDistributed || "";

    // Render Dynamic Progression Action Buttons
    renderTaskWorkflowActionButtons(status);

    // Activate Tab 1 by default
    const tabBtn = document.getElementById("taskTabAppBtn");
    if (tabBtn) {
        const bsTab = bootstrap.Tab.getOrCreateInstance(tabBtn);
        bsTab.show();
    }

    const modalEl = document.getElementById("volunteerTaskModal");
    if (modalEl) {
        const modalInst = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInst.show();
    }
}
window.openVolunteerTaskModal = openVolunteerTaskModal;

function renderTaskWorkflowActionButtons(status) {
    const btnContainer = document.getElementById("taskWorkflowActionButtons");
    if (!btnContainer) return;

    let buttonsHtml = '';

    if (status === "Assigned") {
        buttonsHtml += `<button type="button" class="btn btn-primary fw-bold" onclick="advanceWorkflow('Accepted', 'Volunteer accepted the mission assignment.')">
            <i class="bi bi-check-circle-fill me-1"></i> Accept Task (Accepted)
        </button>`;
    } else if (status === "Accepted") {
        buttonsHtml += `<button type="button" class="btn btn-warning fw-bold text-dark" onclick="advanceWorkflow('On the Way', 'Volunteer dispatched and traveling to incident site.')">
            <i class="bi bi-truck me-1"></i> Start Travel (On the Way)
        </button>`;
    } else if (status === "On the Way") {
        buttonsHtml += `<button type="button" class="btn btn-secondary fw-bold text-white" onclick="advanceWorkflow('Reached Location', 'Volunteer reached the incident location and commenced assessment.')">
            <i class="bi bi-geo-alt-fill me-1"></i> Arrived at Site (Reached Location)
        </button>`;
    } else if (status === "Reached Location" || status === "Rejected / Rework Required") {
        buttonsHtml += `<button type="button" class="btn btn-warning fw-bold text-dark" onclick="advanceWorkflow('Work in Progress', 'Rescue and relief operations commenced on site.')">
            <i class="bi bi-tools me-1"></i> Begin Relief Operations (Work in Progress)
        </button>`;
    } else if (status === "Assistance Required") {
        buttonsHtml += `<button type="button" class="btn btn-success fw-bold" onclick="advanceWorkflow('Work in Progress', 'Emergency assistance coordinated with Mandal Officer; operations continuing.')">
            <i class="bi bi-play-circle-fill me-1"></i> Resume Work (Work in Progress)
        </button>`;
    } else if (status === "Submitted for Verification") {
        buttonsHtml += `<div class="alert alert-info py-1 px-3 mb-0 small border"><i class="bi bi-hourglass-split me-1"></i> Submitted for verification. Awaiting Mandal Officer sign-off.</div>`;
    } else if (status === "Verified / Completed") {
        buttonsHtml += `<div class="alert alert-success py-1 px-3 mb-0 small border"><i class="bi bi-patch-check-fill me-1"></i> Mission verified and officially completed by Mandal Officer.</div>`;
    }

    btnContainer.innerHTML = buttonsHtml;
}

function advanceWorkflow(nextStatus, defaultRemarks) {
    if (!activeModalRequestId) return;
    const res = updateVolunteerTaskStatus(activeModalRequestId, nextStatus, defaultRemarks);
    if (!res) return;

    showMessage(`Status transitioned to '${nextStatus}'.`);
    openVolunteerTaskModal(activeModalRequestId);
    renderAcceptedTasks();
    renderTasks();
    renderDashboardSnapshots();
}
window.advanceWorkflow = advanceWorkflow;

// Handle File Selection for Task Evidence Photos
const modalEvidencePhotoInput = document.getElementById("modalEvidencePhotoInput");
if (modalEvidencePhotoInput) {
    modalEvidencePhotoInput.addEventListener("change", function (e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        let loaded = 0;
        files.forEach(function (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                currentTaskEvidencePhotos.push(evt.target.result);
                loaded++;
                if (loaded === files.length) {
                    renderEvidenceGallery(currentTaskEvidencePhotos);
                    showMessage(`${loaded} photo(s) added to evidence gallery.`);
                }
            };
            reader.readAsDataURL(file);
        });
        modalEvidencePhotoInput.value = "";
    });
}

// SECTION: ASSISTANCE FOR DISASTER-AFFECTED PEOPLE (COORDINATE WITH MANDAL OFFICER)
const btnRequestAssistanceThroughMandal = document.getElementById("btnRequestAssistanceThroughMandal");
if (btnRequestAssistanceThroughMandal) {
    btnRequestAssistanceThroughMandal.addEventListener("click", function () {
        if (!activeModalRequestId) return;
        const vol = currentVolunteer();

        const selectedSupplies = [];
        document.querySelectorAll('input[name="assistanceSupplies"]:checked').forEach(function (cb) {
            selectedSupplies.push(cb.value);
        });

        const peopleCount = document.getElementById("assistancePeopleCount") ? document.getElementById("assistancePeopleCount").value : 1;
        const notes = document.getElementById("assistanceNotesInput") ? document.getElementById("assistanceNotesInput").value.trim() : "";

        if (!selectedSupplies.length && !notes) {
            showMessage("Please select at least one relief item or add specific requirements.");
            return;
        }

        const assistancePayload = {
            required: true,
            supplies: selectedSupplies,
            peopleCount: Number(peopleCount || 1),
            notes: notes,
            requestedAt: new Date().toLocaleString(),
            volunteerName: vol.name,
            volunteerId: vol.id
        };

        const remarksText = `URGENT ASSISTANCE COORDINATED: Requires ${selectedSupplies.join(", ") || "Emergency Supplies"} for ${peopleCount} affected persons. Remarks: ${notes || "Immediate dispatch requested."}`;

        // Update task status to "Assistance Required"
        updateVolunteerTaskStatus(activeModalRequestId, "Assistance Required", remarksText, { assistanceNeeded: assistancePayload });

        // Generate Urgent Alert for Mandal Officer and Control Room
        const alerts = records("disasterAlerts");
        alerts.unshift({
            title: `URGENT RELIEF ASSISTANCE REQUIRED: ${vol.mandal || 'Mandal'}`,
            type: "CRITICAL ASSISTANCE",
            details: `Volunteer ${vol.name} requests urgent ${selectedSupplies.join(", ")} for ${peopleCount} affected citizens. Task #${activeModalRequestId}. Note: ${notes}`,
            district: vol.district || "Krishna",
            mandal: vol.mandal || "Vijayawada Rural",
            createdAt: new Date().toLocaleTimeString(),
            isSms: true
        });
        save("disasterAlerts", alerts);

        showMessage("Urgent assistance coordinated with Mandal Officer & Control Room!");
        openVolunteerTaskModal(activeModalRequestId);
        renderAcceptedTasks();
        renderDashboardSnapshots();
    });
}

// SECTION: SUBMIT APPLICATION AND PHOTOS FOR MANDAL OFFICER VERIFICATION
const btnSubmitForOfficerVerification = document.getElementById("btnSubmitForOfficerVerification");
if (btnSubmitForOfficerVerification) {
    btnSubmitForOfficerVerification.addEventListener("click", function () {
        if (!activeModalRequestId) return;
        const vol = currentVolunteer();

        if (!currentTaskEvidencePhotos.length) {
            showMessage("Please upload at least one photo as supporting evidence before submitting for verification.");
            return;
        }

        const reportNotes = document.getElementById("modalActionReportInput") ? document.getElementById("modalActionReportInput").value.trim() : "";
        const peopleAssisted = document.getElementById("modalPeopleAssistedInput") ? document.getElementById("modalPeopleAssistedInput").value : 1;
        const suppliesDistributed = document.getElementById("modalSuppliesDistributedInput") ? document.getElementById("modalSuppliesDistributedInput").value : "";

        const submissionData = {
            evidencePhotos: currentTaskEvidencePhotos,
            actionReport: reportNotes,
            peopleAssisted: Number(peopleAssisted || 1),
            suppliesDistributed: suppliesDistributed,
            submittedAt: new Date().toLocaleString()
        };

        const remarksText = `Completed application and ${currentTaskEvidencePhotos.length} photo(s) submitted to Mandal Officer for official verification. Report: ${reportNotes || "Field operations executed."}`;

        updateVolunteerTaskStatus(activeModalRequestId, "Submitted for Verification", remarksText, submissionData);

        // Record entry in volunteer history log
        const history = records("disasterVolunteerHistory");
        history.unshift({
            task: "Field Rescue & Relief Mission",
            location: `${vol.mandal ? vol.mandal + ", " : ""}${vol.district || "Area"}`,
            hours: 4,
            date: new Date().toLocaleDateString(),
            people: peopleAssisted,
            supplies: suppliesDistributed,
            description: reportNotes || "Submitted for officer verification"
        });
        save("disasterVolunteerHistory", history);

        showMessage("Completed dossier & photos submitted to Mandal Officer for review.");
        openVolunteerTaskModal(activeModalRequestId);
        renderAcceptedTasks();
        renderHistory();
        renderDashboardSnapshots();
    });
}

// ==========================================
// MODALS & EVENT HANDLERS
// ==========================================
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
}

if (document.getElementById("volunteerMenu")) {
    document.getElementById("volunteerMenu").addEventListener("click", function () {
        volunteerSidebar.classList.toggle("open");
    });
}

document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () { closeModal(button.dataset.closeModal); });
});

if (document.getElementById("refreshTasks")) {
    document.getElementById("refreshTasks").addEventListener("click", function () {
        renderTasks();
        showMessage("Tasks refreshed from your Mandal queue.");
    });
}

if (document.getElementById("availabilityButton")) {
    document.getElementById("availabilityButton").addEventListener("click", function () {
        const vol = currentVolunteer();
        const nextStatus = vol.status === "Unavailable" ? "Available" : "Unavailable";
        updateVolunteerRecord({ status: nextStatus });
        renderProfile();
        showMessage(`You are now ${nextStatus.toLowerCase()}.`);
    });
}

// Task list interaction
const taskList = document.getElementById("taskList");
if (taskList) {
    taskList.addEventListener("click", function (event) {
        const button = event.target.closest("button");
        if (!button) return;
        const requestId = button.dataset.requestId || (button.closest("article") && button.closest("article").dataset.requestId);
        const requests = records("disasterHelpRequests");
        const request = requests.find(function (item) { return String(item.id) === String(requestId); });
        if (!request) return;

        if (button.dataset.taskAction === "view-dossier") {
            openVolunteerTaskModal(request.id);
            return;
        }

        if (button.dataset.taskAction === "report") {
            openModal("reportModal");
            const reportForm = document.getElementById("reportForm");
            if (reportForm) reportForm.dataset.requestId = request.id;
            return;
        }

        const vol = currentVolunteer();
        if (button.dataset.taskAction === "checkin") {
            updateVolunteerTaskStatus(request.id, "Work in Progress", "Volunteer checked in at incident site.");
            renderTasks();
            renderAcceptedTasks();
            showMessage("Checked in for task. Mandal Office has been notified.");
            return;
        }

        // Accept task action with exact timestamp and mission tracking
        request.status = "Assigned";
        request.volunteerId = vol.id;
        request.assignedVolunteerId = vol.id;
        request.assignedVolunteer = {
            id: vol.id,
            name: vol.name,
            phone: vol.phone || vol.mobileNumber,
            district: vol.district,
            mandal: vol.mandal
        };
        request.acceptedAt = new Date().toLocaleString();
        request.acceptedTimestamp = Date.now();
        request.acceptedBy = vol.name;

        // Initialize assignedVolunteers record
        getVolunteerTaskRecord(request, vol.id);
        save("disasterHelpRequests", requests);

        renderTasks();
        renderAcceptedTasks();
        renderDashboardSnapshots();
        showMessage(`Task accepted at ${request.acceptedAt}! Mission tracking started.`);

        // Prompt user to open Task Dossier
        openVolunteerTaskModal(request.id);
    });
}

// Accepted tasks list delegation
const acceptedTaskListEl = document.getElementById("acceptedTaskList");
if (acceptedTaskListEl) {
    acceptedTaskListEl.addEventListener("click", function (e) {
        const dossierBtn = e.target.closest(".open-task-dossier-btn");
        if (dossierBtn) {
            openVolunteerTaskModal(dossierBtn.dataset.reqId);
            return;
        }

        const progBtn = e.target.closest(".accepted-progress-btn");
        if (progBtn) {
            const reqId = progBtn.dataset.reqId;
            const nextStage = progBtn.dataset.stage;
            updateVolunteerTaskStatus(reqId, nextStage, `Stage updated to ${nextStage}`);
            renderAcceptedTasks();
            renderTasks();
            renderDashboardSnapshots();
            showMessage(`Mission status updated to '${nextStage}'.`);
            return;
        }

        const reportBtn = e.target.closest(".accepted-report-btn");
        if (reportBtn) {
            openModal("reportModal");
            const reportForm = document.getElementById("reportForm");
            if (reportForm) reportForm.dataset.requestId = reportBtn.dataset.reqId;
            return;
        }
    });
}

const reportForm = document.getElementById("reportForm");
if (reportForm) {
    reportForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const vol = currentVolunteer();
        const reqId = event.target.dataset.requestId;
        const history = records("disasterVolunteerHistory");
        history.unshift({
            task: "Emergency response task",
            location: `${vol.mandal ? vol.mandal + ", " : ""}${vol.district || "Area"}`,
            hours: 4,
            date: new Date().toLocaleDateString(),
            people: document.getElementById("peopleAssisted").value,
            supplies: document.getElementById("suppliesDistributed").value,
            description: document.getElementById("reportDescription").value
        });
        save("disasterVolunteerHistory", history);

        if (reqId) {
            const requests = records("disasterHelpRequests");
            const req = requests.find(function (r) { return String(r.id) === String(reqId); });
            if (req) {
                req.status = "Resolved";
                req.resolvedDate = new Date().toLocaleString();
                save("disasterHelpRequests", requests);
            }
        }

        closeModal("reportModal");
        event.target.reset();
        renderHistory();
        renderAcceptedTasks();
        renderTasks();
        renderDashboardSnapshots();
        showMessage("Activity report sent to Mandal Office & marked completed.");
    });
}

// ==========================================
// PROFILE EDIT & DELAYED PHOTO SAVE
// ==========================================
const editPhotoInput = document.getElementById("editPhotoInput");
if (editPhotoInput) {
    editPhotoInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            pendingPhotoDraft = evt.target.result;
            const previewImg = document.getElementById("editPhotoPreviewImg");
            const previewInitials = document.getElementById("editPhotoPreviewInitials");
            if (previewImg) {
                previewImg.src = pendingPhotoDraft;
                previewImg.style.display = "block";
            }
            if (previewInitials) previewInitials.style.display = "none";
            showMessage("New photo selected. Click 'Save profile' to apply changes.");
        };
        reader.readAsDataURL(file);
    });
}

const editProfileBtn = document.getElementById("editProfile");
if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function () {
        const volunteer = currentVolunteer();
        pendingPhotoDraft = null;

        const editName = document.getElementById("editName");
        if (editName) editName.value = volunteer.name || "";

        const editPhone = document.getElementById("editPhone");
        if (editPhone) editPhone.value = volunteer.phone || "";

        const editBloodGroup = document.getElementById("editBloodGroup");
        if (editBloodGroup) editBloodGroup.value = volunteer.bloodGroup || "O+";

        const editAvailability = document.getElementById("editAvailability");
        if (editAvailability) editAvailability.value = volunteer.status === "Unavailable" ? "Unavailable" : "Available";

        const editSkills = document.getElementById("editSkills");
        if (editSkills) editSkills.value = volunteer.skills || "";

        const previewImg = document.getElementById("editPhotoPreviewImg");
        const previewInitials = document.getElementById("editPhotoPreviewInitials");
        const initials = (volunteer.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";

        if (volunteer.profilePhoto) {
            if (previewImg) {
                previewImg.src = volunteer.profilePhoto;
                previewImg.style.display = "block";
            }
            if (previewInitials) previewInitials.style.display = "none";
        } else {
            if (previewImg) previewImg.style.display = "none";
            if (previewInitials) {
                previewInitials.textContent = initials;
                previewInitials.style.display = "inline";
            }
        }

        if (editPhotoInput) editPhotoInput.value = "";
        openModal("profileModal");
    });
}

const profileForm = document.getElementById("profileForm");
if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const current = currentVolunteer();

        const updatedData = {
            id: current.id,
            name: document.getElementById("editName").value.trim(),
            phone: document.getElementById("editPhone").value.trim(),
            bloodGroup: (document.getElementById("editBloodGroup") ? document.getElementById("editBloodGroup").value.trim() : current.bloodGroup) || "O+",
            status: document.getElementById("editAvailability").value,
            skills: document.getElementById("editSkills").value.trim(),
            district: current.district || "Krishna",
            mandal: current.mandal || "Vijayawada Rural",
            state: current.state || "Andhra Pradesh",
            volunteerId: current.volunteerId || "DRVOL-0001"
        };

        if (pendingPhotoDraft !== null) {
            updatedData.profilePhoto = pendingPhotoDraft;
            pendingPhotoDraft = null;
        } else {
            updatedData.profilePhoto = current.profilePhoto || "";
        }

        updateVolunteerRecord(updatedData);
        closeModal("profileModal");
        renderProfile();
        showMessage("Volunteer profile and photo saved successfully.");
    });
}

if (document.getElementById("safetyButton")) {
    document.getElementById("safetyButton").addEventListener("click", function () {
        showMessage("Emergency contact: 112 · Mandal response desk available 24/7.");
    });
}

if (document.getElementById("certificateButton")) {
    document.getElementById("certificateButton").addEventListener("click", function () {
        showMessage(records("disasterVolunteerHistory").length ? "Certificate eligibility confirmed. Mandal/Admin officer can issue your certificate." : "Complete a response task to become eligible for a certificate.");
    });
}

if (document.getElementById("volunteerLogout")) {
    document.getElementById("volunteerLogout").addEventListener("click", function () {
        localStorage.removeItem("disasterCurrentVolunteer");
        window.location.href = "index.html";
    });
}

// Filter Listeners
const taskSearchEl = document.getElementById("taskSearchInput");
if (taskSearchEl) taskSearchEl.addEventListener("input", renderTasks);
const taskPrioEl = document.getElementById("taskPriorityFilter");
if (taskPrioEl) taskPrioEl.addEventListener("change", renderTasks);

const alertSearchEl = document.getElementById("alertSearchInput");
if (alertSearchEl) alertSearchEl.addEventListener("input", renderAlerts);
const alertTypeEl = document.getElementById("alertTypeFilter");
if (alertTypeEl) alertTypeEl.addEventListener("change", renderAlerts);

const historySearchEl = document.getElementById("historySearchInput");
if (historySearchEl) historySearchEl.addEventListener("input", renderHistory);

const accSearchEl = document.getElementById("acceptedTaskSearchInput");
if (accSearchEl) accSearchEl.addEventListener("input", renderAcceptedTasks);
const accStatusEl = document.getElementById("acceptedTaskStatusFilter");
if (accStatusEl) accStatusEl.addEventListener("change", renderAcceptedTasks);

// ==========================================
// PRE-DISASTER MOBILE TEXT ALERT FUNCTIONS
// ==========================================
function initVolunteerLatestSmsBanner() {
    const vol = currentVolunteer();
    const vDist = vol ? (vol.district || "").toLowerCase() : "";

    const volSmsLog = records("disasterVolunteerSmsLog");
    const distSmsRaw = localStorage.getItem("disasterLatestDistrictSms");
    let distSms = null;
    try { if (distSmsRaw) distSms = JSON.parse(distSmsRaw); } catch (e) { }
    const alerts = records("disasterAlerts");

    let sms = null;
    if (volSmsLog && volSmsLog.length > 0) {
        sms = volSmsLog.find(function (s) {
            if (!s) return false;
            if (!vDist) return true;
            const aDist = (s.district || "").toLowerCase();
            return aDist === vDist || aDist === "all" || aDist === "district-wide" || (vDist.includes("alluri") && aDist.includes("alluri")) || s.mandal === "All Mandals";
        }) || volSmsLog[0];
    }

    if (!sms && distSms) {
        const aDist = (distSms.district || "").toLowerCase();
        if (!vDist || aDist === vDist || aDist === "all" || (vDist.includes("alluri") && aDist.includes("alluri"))) {
            sms = distSms;
        }
    }

    if (!sms && alerts && alerts.length > 0) {
        sms = alerts.find(function (a) {
            if (!a.isSms) return false;
            const aDist = (a.district || "").toLowerCase();
            return !vDist || aDist === vDist || aDist === "all" || aDist === "district-wide" || (vDist.includes("alluri") && aDist.includes("alluri")) || a.mandal === "All Mandals";
        }) || alerts.find(function (a) { return a.isSms; });
    }

    const bannerText = document.getElementById("latestSmsText");
    if (bannerText && sms) {
        bannerText.textContent = `${sms.type || 'EMERGENCY'}: ${sms.title || 'Disaster Alert'} - ${sms.message || sms.details}`;
    }
}

function openSmsNotificationModal(alertObj) {
    if (!alertObj) {
        const alerts = records("disasterAlerts");
        alertObj = alerts.find(function (a) { return a.isSms; }) || alerts[0] || {
            sender: "DISASTER CONTROL ROOM",
            message: "⚠️ URGENT PRE-DISASTER WARNING: Severe weather & flood warning dispatched to your mobile. Relocate to designated shelters immediately.",
            createdAt: "Delivered to registered mobile numbers"
        };
    }
    const senderEl = document.getElementById("modalSmsSender");
    const bodyEl = document.getElementById("modalSmsBody");
    const timeEl = document.getElementById("modalSmsTime");
    if (senderEl) senderEl.textContent = alertObj.sender || "DISASTER CONTROL ROOM";
    if (bodyEl) bodyEl.textContent = alertObj.message || alertObj.details || alertObj.title;
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

// Initial render
renderProfile();
renderTasks();
renderAcceptedTasks();
renderAlerts();
renderHistory();
initVolunteerLatestSmsBanner();
loadVolunteerLiveWeather();
renderDashboardSnapshots();

// Set initial view from URL hash or default to dashboard
const initialHash = (window.location.hash || "").replace(/^#/, "");
switchVolunteerView(initialHash || "dashboard");

// =====================================================
// OFFICIAL IMD LIVE WEATHER & TOP SCROLLING ALERT BAR
// Source: https://mausam.imd.gov.in/index_en.php
// =====================================================

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
        title: "IMD District Nowcast: Thunderstorms accompanied by lightning, intense rain and gusty surface winds over Krishna, NTR, Guntur, Bapatla, Alluri Sitharama Raju and Visakhapatnam.",
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
                syncPreDisasterSmsWithImd(data);
                return;
            }
        }
    } catch (e) {
        // Fallback for static hosting
    }

    const fallbackData = {
        sourceUrl: IMD_OFFICIAL_URL,
        sourceName: "India Meteorological Department (IMD) - Mausam",
        marqueeUpdates: DEFAULT_IMD_UPDATES,
        observation: {
            station: "Safdarjung / Andhra Pradesh Stations",
            temp: 19,
            condition: "Mist / Scattered Rain",
            humidity: 92,
            wind: "Calm 1.9 Km/h",
            time: "2026-10-27 08:30 IST"
        }
    };
    liveImdDataCache = fallbackData;
    renderImdTopAlertBar(fallbackData);
    syncPreDisasterSmsWithImd(fallbackData);
}

function renderImdTopAlertBar(data) {
    const track = document.getElementById("imdTickerTrack");
    if (!track) return;

    const items = (data && data.marqueeUpdates && data.marqueeUpdates.length > 0) ? data.marqueeUpdates : DEFAULT_IMD_UPDATES;
    let itemsHtml = "";

    items.forEach(item => {
        const badgeClass = item.badgeClass || (item.badge.includes("WARNING") || item.badge.includes("FLOOD") ? "bg-danger" : "bg-warning text-dark");
        const url = item.url || IMD_OFFICIAL_URL;
        itemsHtml += `
            <span class="imd-ticker-item">
                <span class="badge ${badgeClass} me-1">${item.badge}</span>
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-white text-decoration-none" title="View Official IMD Document / Advisory">
                    <strong>${item.title}</strong>
                </a>
            </span>
            <span class="imd-ticker-divider">•</span>
        `;
    });

    track.innerHTML = itemsHtml + itemsHtml;
}

function pauseImdTicker() {
    const track = document.getElementById("imdTickerTrack");
    if (track) track.classList.add("paused");
}

function resumeImdTicker() {
    const track = document.getElementById("imdTickerTrack");
    if (track) track.classList.remove("paused");
}

function syncPreDisasterSmsWithImd(data) {
    const smsEl = document.getElementById("latestSmsText");
    if (!smsEl) return;
    const firstWarning = (data && data.marqueeUpdates && data.marqueeUpdates[0]) ? data.marqueeUpdates[0].title : null;
    if (firstWarning) {
        smsEl.innerHTML = `⚠️ <strong>OFFICIAL IMD EARLY WARNING:</strong> ${firstWarning} <a href="${IMD_OFFICIAL_URL}" target="_blank" class="text-warning text-decoration-underline ms-1 fw-bold">(Source: mausam.imd.gov.in)</a>`;
    }
}

window.loadImdLiveWeatherFeed = loadImdLiveWeatherFeed;
window.pauseImdTicker = pauseImdTicker;
window.resumeImdTicker = resumeImdTicker;

loadImdLiveWeatherFeed();
setInterval(loadImdLiveWeatherFeed, 180000);


