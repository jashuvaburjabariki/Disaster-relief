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
    } catch (e) {}

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
    if (areaEl) areaEl.textContent = `${volunteer.mandal ? volunteer.mandal + ", " : ""}${volunteer.district || "Krishna"}, ${volunteer.state || "India"}`;

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

function renderTasks() {
    const vol = currentVolunteer();
    const requests = records("disasterHelpRequests").filter(function (request) { return request.status !== "Resolved"; });

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

    const assignedCountEl = document.getElementById("assignedCount");
    if (assignedCountEl) {
        assignedCountEl.textContent = routedRequests.filter(function (request) { return request.status === "Assigned" || request.status === "In Progress"; }).length;
    }
    const emergencyCountEl = document.getElementById("emergencyCount");
    if (emergencyCountEl) {
        emergencyCountEl.textContent = routedRequests.filter(function (request) { return request.priority === "Critical" || request.priority === "High"; }).length;
    }

    const taskListEl = document.getElementById("taskList");
    if (taskListEl) {
        taskListEl.innerHTML = routedRequests.length ? routedRequests.slice(0, 8).map(function (request) {
            const accepted = request.volunteerId === vol.id;
            const priority = (request.priority || "Medium").toLowerCase();
            const locationStr = request.location || request.village || request.mandal || "Local area";
            return `<article class="task-card" data-request-id="${request.id}">
                <div class="task-card-head">
                    <h4>${escapeValue(request.help || "Emergency Help")}</h4>
                    <span class="priority ${priority}">${escapeValue(request.priority || "Medium")}</span>
                </div>
                <p>${escapeValue(request.details || "Emergency support requested.")}</p>
                <div class="task-meta">
                    <span><i class="bi bi-geo-alt"></i> ${escapeValue(locationStr)}, ${escapeValue(request.district || "District")}</span>
                    <span><i class="bi bi-building"></i> Mandal: ${escapeValue(request.mandal || "Local")}</span>
                </div>
                <div class="task-actions">
                    <button class="accept-task" data-task-action="accept" data-request-id="${request.id}" type="button">${accepted ? "Accepted" : "Accept task"}</button>
                    <button type="button" data-task-action="checkin" data-request-id="${request.id}">Check in</button>
                    <button type="button" data-task-action="report" data-request-id="${request.id}">Report</button>
                </div>
            </article>`;
        }).join("") : '<p class="empty-panel">No active emergency tasks routed to your area yet.</p>';
    }
}

function renderAlerts() {
    const alerts = records("disasterAlerts");
    const countEl = document.getElementById("alertCount");
    if (countEl) countEl.textContent = alerts.length;
    const alertsEl = document.getElementById("volunteerAlerts");
    if (alertsEl) {
        alertsEl.innerHTML = alerts.length ? alerts.slice(0, 4).map(function (alert) {
            return `<article class="alert-item"><span class="alert-badge"><i class="bi bi-exclamation-lg"></i></span><div><strong>${escapeValue(alert.title)}</strong><p>${escapeValue(alert.details)}</p><small>${escapeValue(alert.district || "Area-wide")} · ${escapeValue(alert.createdAt || "Just now")}</small></div></article>`;
        }).join("") : '<p class="empty-panel">No new emergency alerts.</p>';
    }
}

function renderHistory() {
    const history = records("disasterVolunteerHistory");
    const completedEl = document.getElementById("completedCount");
    if (completedEl) completedEl.textContent = history.length;
    const hoursEl = document.getElementById("hoursCount");
    if (hoursEl) hoursEl.textContent = history.reduce(function (total, item) { return total + Number(item.hours || 0); }, 0);
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
// SECTION: LIVE WEATHER REPORT WIDGET
// ==========================================
async function loadVolunteerLiveWeather() {
    const tempEl = document.getElementById("volWeatherTemp");
    const condEl = document.getElementById("volWeatherCondition");
    const badgeEl = document.getElementById("volWeatherBadge");
    const iconEl = document.getElementById("volWeatherIcon");
    if (!tempEl || !condEl) return;

    const vol = currentVolunteer();
    const districtCoords = {
        "krishna": { lat: 16.5062, lon: 80.6480, name: "Krishna" },
        "chennai": { lat: 13.0827, lon: 80.2707, name: "Chennai" },
        "wayanad": { lat: 11.6854, lon: 76.1320, name: "Wayanad" },
        "guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
        "visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" }
    };

    const key = (vol.district || "krishna").toLowerCase().trim();
    const loc = districtCoords[key] || { lat: 16.5062, lon: 80.6480, name: vol.district || "District" };

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

const refreshVolWeatherBtn = document.getElementById("refreshVolWeatherBtn");
if (refreshVolWeatherBtn) {
    refreshVolWeatherBtn.addEventListener("click", function () {
        loadVolunteerLiveWeather();
        showMessage("Weather report refreshed.");
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

document.querySelectorAll(".volunteer-link[href^='#']").forEach(function (link) {
    link.addEventListener("click", function () {
        if (link.id === "navMyIdCardLink") return;
        document.querySelectorAll(".volunteer-link").forEach(function (item) { item.classList.remove("active"); });
        link.classList.add("active");
        if (volunteerSidebar) volunteerSidebar.classList.remove("open");
    });
});

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

const taskList = document.getElementById("taskList");
if (taskList) {
    taskList.addEventListener("click", function (event) {
        const button = event.target.closest("button");
        if (!button) return;
        const requestId = button.dataset.requestId || (button.closest("article") && button.closest("article").dataset.requestId);
        const requests = records("disasterHelpRequests");
        const request = requests.find(function (item) { return String(item.id) === String(requestId); });
        if (!request) return;

        if (button.dataset.taskAction === "report") {
            openModal("reportModal");
            const reportForm = document.getElementById("reportForm");
            if (reportForm) reportForm.dataset.requestId = request.id;
            return;
        }

        const vol = currentVolunteer();
        if (button.dataset.taskAction === "checkin") {
            request.status = "In Progress";
            request.volunteerId = vol.id;
            save("disasterHelpRequests", requests);
            renderTasks();
            showMessage("Checked in for task. Mandal Office has been notified.");
            return;
        }

        request.status = "Assigned";
        request.volunteerId = vol.id;
        save("disasterHelpRequests", requests);
        renderTasks();
        showMessage("Task accepted! Coordinate with your Mandal Officer.");
    });
}

const reportForm = document.getElementById("reportForm");
if (reportForm) {
    reportForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const vol = currentVolunteer();
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
        closeModal("reportModal");
        event.target.reset();
        renderHistory();
        showMessage("Activity report sent to Mandal Office.");
    });
}

// ==========================================
// PROFILE EDIT & DELAYED PHOTO SAVE
// ==========================================
// Handle photo file selection: preview ONLY, do not save yet
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
        pendingPhotoDraft = null; // reset draft buffer

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

        // Preview existing photo or initials
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

        // CRITICAL RULE: Profile photo is saved ONLY upon clicking the Save button
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

if (document.getElementById("profileShortcut")) {
    document.getElementById("profileShortcut").addEventListener("click", function () {
        const prof = document.getElementById("profile");
        if (prof) prof.scrollIntoView({ behavior: "smooth" });
    });
}

if (document.getElementById("volunteerLogout")) {
    document.getElementById("volunteerLogout").addEventListener("click", function () {
        localStorage.removeItem("disasterCurrentVolunteer");
        window.location.href = "index.html";
    });
}

// Initial render
renderProfile();
renderTasks();
renderAlerts();
renderHistory();
loadVolunteerLiveWeather();
