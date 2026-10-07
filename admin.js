const sidebar = document.getElementById("adminSidebar");
const menuButton = document.getElementById("menuButton");
const toast = document.getElementById("dashboardToast");
const toastMessage = toast.querySelector("span");
let toastTimer;

const indiaStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

const savedJurisdiction = JSON.parse(localStorage.getItem("disasterAdminJurisdiction") || "{}");
let adminDistrict = savedJurisdiction.district || localStorage.getItem("disasterAdminDistrict") || "Krishna";
let adminState = savedJurisdiction.state || (adminDistrict.toLowerCase() === "krishna" ? "Andhra Pradesh" : (adminDistrict.toLowerCase() === "chennai" ? "Tamil Nadu" : (adminDistrict.toLowerCase() === "wayanad" ? "Kerala" : "all")));

document.querySelectorAll(".india-state-select").forEach(function (select) {
    indiaStates.forEach(function (state) {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        select.appendChild(option);
    });
});

document.getElementById("adminState").value = adminState;
document.getElementById("adminDistrict").value = adminDistrict;

function recordsForAdmin(key) {
    return readRecords(key).filter(function (record) {
        const stateMatches = adminState === "all" || !record.state || record.state === adminState;
        const districtMatches = !adminDistrict || adminDistrict === "all" || (record.district || "").toLowerCase() === adminDistrict.toLowerCase();
        return stateMatches && districtMatches;
    });
}

function readRecords(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function writeRecords(key, records) {
    localStorage.setItem(key, JSON.stringify(records));
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
}

let highlightRowId = null;
let lastKnownRequestCount = 0;
let lastKnownLatestId = 0;
let bsModalInstance = null;

function playNotificationChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        // audio policy or blocked
    }
}

function showDashboardMessage(message) {
    toastMessage.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3200);
}

function showOverviewModal() {
    const modalEl = document.getElementById("requestOverviewModal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        if (!bsModalInstance) {
            bsModalInstance = new bootstrap.Modal(modalEl);
        }
        bsModalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
        document.body.classList.add("modal-open");
        let backdrop = document.getElementById("customModalBackdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "customModalBackdrop";
            backdrop.className = "modal-backdrop fade show";
            document.body.appendChild(backdrop);
        }
    }
}

function hideOverviewModal() {
    const modalEl = document.getElementById("requestOverviewModal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    document.body.classList.remove("modal-open");
    const backdrop = document.getElementById("customModalBackdrop");
    if (backdrop) backdrop.remove();
}

function renderRequests() {
    const requests = recordsForAdmin("disasterHelpRequests");
    const table = document.getElementById("requestTable");
    table.innerHTML = requests.map(function (request) {
        const priority = (request.priority || "Medium").toLowerCase();
        const status = (request.status || "Pending").toLowerCase();
        const statusClass = status === "in progress" ? "progress" : status;
        const displayId = request.trackId ? request.trackId : ("#" + String(request.id).slice(-6));
        const isHighlighted = highlightRowId && String(request.id) === String(highlightRowId);

        let proofMarkup = '<span class="text-muted">None</span>';
        if (request.proof && request.proof.data) {
            proofMarkup = `<a class="text-link proof-link" href="${request.proof.data}" target="_blank" rel="noopener" title="Open proof document"><i class="bi bi-paperclip"></i> View</a>`;
        }

        return `<tr data-id="${request.id}" data-priority="${escapeHtml(priority)}" data-status="${escapeHtml(status)}" class="${isHighlighted ? "row-new-highlight" : ""}" title="Click to view full application overview">
            <td><strong>${escapeHtml(displayId)}</strong><small>${escapeHtml(request.createdAt || "Recent")}</small></td>
            <td><strong>${escapeHtml(request.name || "N/A")}</strong></td>
            <td>${escapeHtml(request.fatherName || "N/A")}</td>
            <td>${escapeHtml(request.mobileNumber || "N/A")}</td>
            <td><strong>${escapeHtml(request.village || request.location || "N/A")}</strong><small>${escapeHtml(request.mandal || "")}, ${escapeHtml(request.district || "")}, ${escapeHtml(request.state || "")}${request.gps ? ` · GPS: ${escapeHtml(request.gps)}` : ""}</small></td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(request.disasterType || "Emergency")}</span></td>
            <td>${escapeHtml(request.help || "N/A")}</td>
            <td>${proofMarkup}</td>
            <td><span class="status-pill ${priority}">${escapeHtml(request.priority || "Medium")}</span></td>
            <td><span class="status-pill ${statusClass}">${escapeHtml(request.status || "Pending")}</span></td>
            <td>
                <div class="d-flex align-items-center justify-content-end gap-1">
                    <button class="view-overview-btn" type="button" data-id="${request.id}" title="Open Application Overview">
                        <i class="bi bi-eye-fill"></i> View
                    </button>
                    <button class="row-action request-status-button" type="button" data-id="${request.id}" aria-label="Update request status" title="Advance status to next stage">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");

    const activeCount = requests.filter(function (item) { return item.status !== "Resolved"; }).length;
    document.getElementById("activeRequestsCount").textContent = activeCount;
    const navBadge = document.getElementById("navRequestsCount");
    if (navBadge) navBadge.textContent = activeCount;
    document.getElementById("criticalRequestsCount").textContent = requests.filter(function (item) { return item.priority === "Critical"; }).length;
    document.getElementById("resolvedRequestsCount").textContent = requests.filter(function (item) { return item.status === "Resolved"; }).length;

    // Also populate dashboard snapshot table
    const dashTable = document.getElementById("dashRequestTable");
    if (dashTable) {
        dashTable.innerHTML = requests.slice(0, 6).map(function (request) {
            const priority = (request.priority || "Medium").toLowerCase();
            const status = (request.status || "Pending").toLowerCase();
            const statusClass = status === "in progress" ? "progress" : status;
            const displayId = request.trackId ? request.trackId : ("#" + String(request.id).slice(-6));
            return `<tr data-id="${request.id}" style="cursor: pointer;" title="Click to view full application details">
                <td><strong>${escapeHtml(displayId)}</strong></td>
                <td><strong>${escapeHtml(request.name || "N/A")}</strong></td>
                <td><span class="font-monospace">${escapeHtml(request.mobileNumber || "N/A")}</span></td>
                <td>${escapeHtml(request.village || request.location || "N/A")}</td>
                <td><span class="badge bg-light text-dark border">${escapeHtml(request.disasterType || "Emergency")}</span></td>
                <td><span class="status-pill ${priority}">${escapeHtml(request.priority || "Medium")}</span></td>
                <td><span class="status-pill ${statusClass}">${escapeHtml(request.status || "Pending")}</span></td>
                <td><button class="view-overview-btn" type="button" data-id="${request.id}"><i class="bi bi-eye-fill"></i> View</button></td>
            </tr>`;
        }).join("");
    }
    const queueBadge = document.getElementById("requestsQueueCount");
    if (queueBadge) queueBadge.textContent = `${requests.length} requests`;

    filterRequests();
}

function openRequestOverview(requestId) {
    const requests = readRecords("disasterHelpRequests");
    const request = requests.find(function (item) { return String(item.id) === String(requestId); });
    if (!request) return;

    const modalEl = document.getElementById("requestOverviewModal");
    modalEl.dataset.currentRequestId = String(request.id);

    const displayId = request.trackId || ("#" + String(request.id).slice(-6));
    const priority = request.priority || "Medium";
    const status = request.status || "Pending";
    const priorityClass = priority.toLowerCase();
    const statusClass = status.toLowerCase() === "in progress" ? "progress" : status.toLowerCase();

    // Badges & Header
    document.getElementById("modalTrackId").textContent = displayId;
    document.getElementById("modalTrackIdText").textContent = displayId;

    const priorityBadge = document.getElementById("modalPriorityBadge");
    priorityBadge.className = `status-pill ${priorityClass}`;
    priorityBadge.textContent = priority;
    document.getElementById("modalPriorityText").textContent = priority;

    const statusBadge = document.getElementById("modalStatusBadge");
    statusBadge.className = `status-pill ${statusClass}`;
    statusBadge.textContent = status;

    document.getElementById("modalCreatedAt").innerHTML = `<i class="bi bi-clock"></i> Submitted: ${escapeHtml(request.createdAt || "Recent")}`;

    // Applicant Information
    document.getElementById("modalName").textContent = request.name || "N/A";
    document.getElementById("modalFatherName").textContent = request.fatherName || "N/A";

    const phoneVal = request.mobileNumber || "N/A";
    document.getElementById("modalPhone").textContent = phoneVal;

    const callBtn = document.getElementById("modalCallBtn");
    const waBtn = document.getElementById("modalWhatsAppBtn");
    if (request.mobileNumber) {
        const cleanPhone = String(request.mobileNumber).replace(/\D/g, "");
        callBtn.href = `tel:${cleanPhone}`;
        callBtn.style.display = "inline-flex";
        waBtn.href = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${request.name}, regarding your emergency help request ${displayId} on Disaster Relief network:`)}`;
        waBtn.style.display = "inline-flex";
    } else {
        callBtn.style.display = "none";
        waBtn.style.display = "none";
    }

    // Location & Geo-Coordinates
    document.getElementById("modalVillage").textContent = request.village || request.location || "N/A";
    document.getElementById("modalMandal").textContent = request.mandal || "N/A";
    document.getElementById("modalDistrictState").textContent = `${request.district || "N/A"}, ${request.state || "N/A"}`;

    const gpsVal = request.gps || "";
    const gpsEl = document.getElementById("modalGps");
    const gpsLink = document.getElementById("modalGpsLink");
    if (gpsVal && gpsVal.trim()) {
        gpsEl.textContent = gpsVal;
        gpsLink.href = `https://www.google.com/maps?q=${encodeURIComponent(gpsVal.trim())}`;
        gpsLink.style.display = "inline-flex";
    } else {
        gpsEl.textContent = "Not Captured";
        gpsLink.style.display = "none";
    }

    // Emergency Details
    document.getElementById("modalDisasterType").textContent = request.disasterType || "Emergency Incident";

    // Help Categories
    const helpContainer = document.getElementById("modalHelpCategories");
    const categories = (request.help || "").split(",").map(function (c) { return c.trim(); }).filter(Boolean);
    if (categories.length) {
        helpContainer.innerHTML = categories.map(function (cat) {
            let icon = "bi-life-preserver";
            const lower = cat.toLowerCase();
            if (lower.includes("food") || lower.includes("water")) icon = "bi-cup-straw";
            else if (lower.includes("medical") || lower.includes("medicine")) icon = "bi-bandaid-fill";
            else if (lower.includes("rescue")) icon = "bi-shield-shaded";
            else if (lower.includes("shelter")) icon = "bi-house-heart-fill";
            return `<span class="category-badge"><i class="bi ${icon}"></i> ${escapeHtml(cat)}</span>`;
        }).join("");
    } else {
        helpContainer.innerHTML = '<span class="text-muted small">General Emergency Assistance</span>';
    }

    // Description / Details
    document.getElementById("modalDetails").textContent = request.details || "No additional situation notes provided by applicant.";

    // Proof Document
    const proofContainer = document.getElementById("modalProofContainer");
    if (request.proof && request.proof.data) {
        const isPdf = (request.proof.type && request.proof.type.includes("pdf")) || (request.proof.name && request.proof.name.toLowerCase().endsWith(".pdf")) || request.proof.data.startsWith("data:application/pdf");
        if (isPdf) {
            proofContainer.innerHTML = `
                <div class="proof-card-preview">
                    <div class="stat-icon stat-red"><i class="bi bi-file-earmark-pdf-fill"></i></div>
                    <div class="flex-grow-1">
                        <strong class="d-block mb-1">${escapeHtml(request.proof.name || "Incident_Proof_Document.pdf")}</strong>
                        <small class="text-muted d-block mb-2">Attached verification document (PDF format)</small>
                        <a href="${request.proof.data}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-danger py-1 px-3"><i class="bi bi-box-arrow-up-right me-1"></i> Open & Download PDF</a>
                    </div>
                </div>`;
        } else {
            proofContainer.innerHTML = `
                <div class="proof-card-preview">
                    <img src="${request.proof.data}" alt="Proof attachment" class="proof-thumbnail" onclick="window.open('${request.proof.data}', '_blank')" title="Click to view full image">
                    <div class="flex-grow-1">
                        <strong class="d-block mb-1">${escapeHtml(request.proof.name || "Incident_Site_Photo.jpg")}</strong>
                        <small class="text-muted d-block mb-2">Attached incident photo proof</small>
                        <a href="${request.proof.data}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary py-1 px-3"><i class="bi bi-eye-fill me-1"></i> View Full Resolution</a>
                    </div>
                </div>`;
        }
    } else {
        proofContainer.innerHTML = '<div class="text-muted small py-2 px-3 bg-light rounded"><i class="bi bi-info-circle me-1"></i> No verification document or image was attached to this application.</div>';
    }

    // Status Selector
    document.getElementById("modalStatusSelect").value = request.status || "Pending";

    // Volunteer Selector
    const volunteers = readRecords("disasterVolunteers");
    const volunteerSelect = document.getElementById("modalVolunteerSelect");
    volunteerSelect.innerHTML = '<option value="">-- No Volunteer Assigned --</option>' + volunteers.map(function (vol) {
        const isCurrent = String(request.assignedVolunteerId) === String(vol.id);
        const matchState = !request.state || vol.state === request.state ? "📍 " : "";
        return `<option value="${vol.id}" ${isCurrent ? "selected" : ""}>${matchState}${escapeHtml(vol.name)} (${escapeHtml(vol.phone)}) - ${escapeHtml(vol.district || vol.state)} [${escapeHtml(vol.status || "Available")}]</option>`;
    }).join("");

    // Current Assignment Banner
    renderModalAssignmentBanner(request);

    // Admin Notes
    document.getElementById("modalAdminNotes").value = request.adminNotes || "";

    showOverviewModal();
}

function renderModalAssignmentBanner(request) {
    const assignmentBanner = document.getElementById("modalCurrentAssignment");
    if (request.assignedVolunteer) {
        assignmentBanner.innerHTML = `
            <div class="assigned-volunteer-banner mt-2">
                <div>
                    <i class="bi bi-person-check-fill me-1"></i> Currently assigned responder: <strong>${escapeHtml(request.assignedVolunteer.name)}</strong> (${escapeHtml(request.assignedVolunteer.phone)})
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" id="modalUnassignBtn"><i class="bi bi-x-circle"></i> Unassign</button>
            </div>`;
        const unassignBtn = document.getElementById("modalUnassignBtn");
        if (unassignBtn) {
            unassignBtn.addEventListener("click", unassignVolunteerFromCurrentRequest);
        }
    } else {
        assignmentBanner.innerHTML = "";
    }
}

function saveModalUpdates() {
    const modalEl = document.getElementById("requestOverviewModal");
    const requestId = modalEl.dataset.currentRequestId;
    if (!requestId) return;

    const requests = readRecords("disasterHelpRequests");
    const request = requests.find(function (item) { return String(item.id) === String(requestId); });
    if (!request) return;

    const newStatus = document.getElementById("modalStatusSelect").value;
    const volunteerId = document.getElementById("modalVolunteerSelect").value;
    const adminNotes = document.getElementById("modalAdminNotes").value.trim();

    request.status = newStatus;
    request.adminNotes = adminNotes;

    const volunteers = readRecords("disasterVolunteers");
    if (volunteerId) {
        const selectedVol = volunteers.find(function (v) { return String(v.id) === String(volunteerId); });
        if (selectedVol) {
            request.assignedVolunteerId = selectedVol.id;
            request.assignedVolunteer = {
                id: selectedVol.id,
                name: selectedVol.name,
                phone: selectedVol.phone || selectedVol.mobileNumber,
                district: selectedVol.district,
                state: selectedVol.state
            };
            selectedVol.status = "Assigned";
            writeRecords("disasterVolunteers", volunteers);
            renderVolunteers();
        }
    }

    writeRecords("disasterHelpRequests", requests);
    renderRequests();

    const statusClass = newStatus.toLowerCase() === "in progress" ? "progress" : newStatus.toLowerCase();
    const statusBadge = document.getElementById("modalStatusBadge");
    statusBadge.className = `status-pill ${statusClass}`;
    statusBadge.textContent = newStatus;

    renderModalAssignmentBanner(request);
    showDashboardMessage(`Application ${request.trackId || "#" + requestId} updated (${newStatus}).`);
}

function quickResolveModal() {
    const modalEl = document.getElementById("requestOverviewModal");
    const requestId = modalEl.dataset.currentRequestId;
    if (!requestId) return;

    const requests = readRecords("disasterHelpRequests");
    const request = requests.find(function (item) { return String(item.id) === String(requestId); });
    if (!request) return;

    request.status = "Resolved";
    writeRecords("disasterHelpRequests", requests);
    renderRequests();

    const statusBadge = document.getElementById("modalStatusBadge");
    statusBadge.className = "status-pill resolved";
    statusBadge.textContent = "Resolved";
    document.getElementById("modalStatusSelect").value = "Resolved";

    showDashboardMessage(`Application ${request.trackId || "#" + requestId} marked as Resolved.`);
}

function unassignVolunteerFromCurrentRequest() {
    const modalEl = document.getElementById("requestOverviewModal");
    const requestId = modalEl.dataset.currentRequestId;
    if (!requestId) return;

    const requests = readRecords("disasterHelpRequests");
    const request = requests.find(function (item) { return String(item.id) === String(requestId); });
    if (!request) return;

    if (request.assignedVolunteerId) {
        const volunteers = readRecords("disasterVolunteers");
        const assignedVol = volunteers.find(function (v) { return String(v.id) === String(request.assignedVolunteerId); });
        if (assignedVol) {
            assignedVol.status = "Available";
            writeRecords("disasterVolunteers", volunteers);
            renderVolunteers();
        }
    }

    request.assignedVolunteerId = null;
    request.assignedVolunteer = null;
    if (request.status === "Assigned") {
        request.status = "Verified";
        document.getElementById("modalStatusSelect").value = "Verified";
        const statusBadge = document.getElementById("modalStatusBadge");
        statusBadge.className = "status-pill verified";
        statusBadge.textContent = "Verified";
    }

    writeRecords("disasterHelpRequests", requests);
    renderRequests();
    renderModalAssignmentBanner(request);
    document.getElementById("modalVolunteerSelect").value = "";
    showDashboardMessage("Volunteer unassigned from application.");
}

function advanceRequestStatus(requestId) {
    const statuses = ["Pending", "Verified", "Assigned", "In Progress", "Resolved"];
    const requests = readRecords("disasterHelpRequests");
    const record = requests.find(function (item) { return String(item.id) === String(requestId); });
    if (!record) return;
    record.status = statuses[(statuses.indexOf(record.status) + 1) % statuses.length];
    writeRecords("disasterHelpRequests", requests);
    renderRequests();
    showDashboardMessage(`Request ${record.trackId || record.name} status advanced to ${record.status}.`);
}

function checkForNewRequests(shouldAlert) {
    const allRequests = readRecords("disasterHelpRequests");
    const currentCount = allRequests.length;
    const latestRecord = allRequests[0];
    const latestId = latestRecord ? Number(latestRecord.id) : 0;

    if (lastKnownRequestCount === 0 && lastKnownLatestId === 0) {
        lastKnownRequestCount = currentCount;
        lastKnownLatestId = latestId;
        return;
    }

    if (currentCount > lastKnownRequestCount || latestId > lastKnownLatestId) {
        lastKnownRequestCount = currentCount;
        lastKnownLatestId = latestId;

        if (latestRecord) {
            highlightRowId = String(latestRecord.id);
        }

        renderRequests();
        renderVolunteers();

        if (shouldAlert && latestRecord) {
            playNotificationChime();
            const locationStr = latestRecord.village || latestRecord.district || latestRecord.state || "Emergency Field";
            showDashboardMessage(`🚨 New Help Request: ${latestRecord.trackId || latestRecord.name} (${latestRecord.disasterType || "Emergency"}) from ${locationStr}!`);
        }

        setTimeout(function () {
            highlightRowId = null;
            const highlightedRow = document.querySelector("#requestTable tr.row-new-highlight");
            if (highlightedRow) {
                highlightedRow.classList.remove("row-new-highlight");
            }
        }, 4000);
    } else if (currentCount < lastKnownRequestCount) {
        lastKnownRequestCount = currentCount;
        lastKnownLatestId = latestId;
        renderRequests();
    }
}

function renderVolunteers() {
    const volunteers = recordsForAdmin("disasterVolunteers");
    const registered = volunteers.length;
    const assigned = volunteers.filter(function (item) { return item.status === "Assigned"; }).length;
    const available = volunteers.filter(function (item) { return item.status !== "Assigned"; }).length;
    document.getElementById("volunteersCount").textContent = registered;
    document.getElementById("volunteerTotal").textContent = registered;
    document.getElementById("volunteerAvailable").textContent = available;
    document.getElementById("volunteerAssigned").textContent = assigned;
    document.getElementById("volunteerOffline").textContent = 0;
    document.getElementById("capacityPercent").textContent = registered ? "100%" : "0%";
    document.getElementById("capacityProgress").style.width = registered ? "100%" : "0%";
    document.getElementById("volunteerSubmissions").innerHTML = volunteers.length ? volunteers.map(function (item) {
        return `<article class="submission-item"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.mandal || "")}, ${escapeHtml(item.district)}, ${escapeHtml(item.state)} · ${escapeHtml(item.phone)}</span><small>${escapeHtml(item.skills)}</small><button type="button" class="mini-action assign-volunteer" data-id="${item.id}">${item.status === "Assigned" ? "Assigned" : "Assign"}</button></article>`;
    }).join("") : '<p class="empty-submission">No volunteer applications yet.</p>';
}

function renderDonations() {
    const donations = recordsForAdmin("disasterDonations");
    document.getElementById("donationSubmissions").innerHTML = donations.length ? donations.map(function (item) {
        return `<article class="submission-item"><strong>${escapeHtml(item.donor)}</strong><span>${escapeHtml(item.type)} · ${escapeHtml(item.quantity)}</span><small>${escapeHtml(item.district)}, ${escapeHtml(item.state)} · ${escapeHtml(item.phone)}</small>${item.message ? `<small>${escapeHtml(item.message)}</small>` : ""}<button type="button" class="mini-action mark-donation" data-id="${item.id}">${escapeHtml(item.status)}</button></article>`;
    }).join("") : '<p class="empty-submission">No donations registered yet.</p>';
}

function renderRegistrations() {
    const registrations = recordsForAdmin("disasterRegistrations");
    document.getElementById("registrationSubmissions").innerHTML = registrations.length ? registrations.map(function (item) {
        return `<article class="submission-item"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.role)} · ${escapeHtml(item.district)}, ${escapeHtml(item.state)}</span><small>${escapeHtml(item.email)} · ${escapeHtml(item.phone)}</small></article>`;
    }).join("") : '<p class="empty-submission">No account registrations yet.</p>';
}

function filterRequests() {
    const searchTerm = document.getElementById("requestSearch").value.toLowerCase().trim();
    const priority = document.getElementById("priorityFilter").value;
    const status = document.getElementById("statusFilter").value;
    const rows = Array.from(document.querySelectorAll("#requestTable tr"));
    let visibleRows = 0;
    rows.forEach(function (row) {
        const visible = row.textContent.toLowerCase().includes(searchTerm) && (priority === "all" || row.dataset.priority === priority) && (status === "all" || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleRows += 1;
    });
    document.getElementById("emptyState").classList.toggle("visible", visibleRows === 0);
}

function createAlert() {
    const title = window.prompt("Alert title:");
    if (!title) return;
    const details = window.prompt("Alert details:") || "Published by the Admin response team.";
    const alerts = readRecords("disasterAlerts");
    alerts.unshift({ id: Date.now(), title: title, details: details, state: adminState, district: adminDistrict, createdAt: new Date().toLocaleString() });
    writeRecords("disasterAlerts", alerts);
    renderAlerts();
    showDashboardMessage("Alert published to the response network.");
}

function renderAlerts() {
    const alerts = recordsForAdmin("disasterAlerts");
    const markup = alerts.length ? alerts.map(function (alert, index) {
        return `<article class="alert-item ${index % 2 ? "alert-info" : "alert-critical"}"><span class="alert-mark"><i class="bi ${index % 2 ? "bi-info-lg" : "bi-exclamation-lg"}"></i></span><div><strong>${escapeHtml(alert.title)}</strong><p>${escapeHtml(alert.details)}</p><small>Published ${escapeHtml(alert.createdAt)}</small></div><button class="row-action remove-alert" type="button" data-id="${alert.id || ""}" aria-label="Remove alert"><i class="bi bi-x-lg"></i></button></article>`;
    }).join("") : '<p class="empty-submission">No active alerts. Create one when needed.</p>';

    const alertListEl = document.getElementById("alertList");
    if (alertListEl) alertListEl.innerHTML = markup;
    const dashAlertListEl = document.getElementById("dashAlertList");
    if (dashAlertListEl) dashAlertListEl.innerHTML = markup;
}

menuButton.addEventListener("click", function () { sidebar.classList.toggle("open"); });

// Topbar view label update
function updateTopbarForView(viewId) {
    const titles = {
        dashboard: { breadcrumb: "CONTROL CENTER / OVERVIEW", title: "District Admin Dashboard" },
        mandals: { breadcrumb: "CONTROL CENTER / MANDALS & LOGINS", title: "District Mandals & Employee Logins" },
        requests: { breadcrumb: "CONTROL CENTER / HELP REQUESTS", title: "Help Requests Queue" },
        alerts: { breadcrumb: "CONTROL CENTER / DISASTER ALERTS", title: "Emergency Broadcast Alerts" },
        volunteers: { breadcrumb: "CONTROL CENTER / VOLUNTEERS", title: "Volunteers Management & Applications" },
        assign: { breadcrumb: "CONTROL CENTER / DISPATCH", title: "Assign Volunteers to Requests" },
        shelters: { breadcrumb: "CONTROL CENTER / SHELTERS", title: "Emergency Shelters & Camps" },
        inventory: { breadcrumb: "CONTROL CENTER / RELIEF INVENTORY", title: "Relief Inventory & Supplies" },
        donations: { breadcrumb: "CONTROL CENTER / DONATIONS", title: "Donations & Relief Materials" },
        reports: { breadcrumb: "CONTROL CENTER / REPORTS", title: "Operations & Relief Reports" }
    };
    const info = titles[viewId] || titles.dashboard;
    const breadcrumbEl = document.querySelector(".breadcrumb-label");
    const h1El = document.querySelector(".admin-topbar h1");
    if (breadcrumbEl) breadcrumbEl.textContent = info.breadcrumb;
    if (h1El) h1El.textContent = info.title;
}

// SWITCH ADMIN VIEW: Opens the clicked section's details ONLY
function switchAdminView(viewId) {
    if (!viewId) viewId = "dashboard";
    viewId = String(viewId).replace(/^#/, "");

    const validViews = [
        "dashboard", "mandals", "requests", "alerts", "volunteers",
        "assign", "shelters", "inventory", "donations", "reports"
    ];
    if (!validViews.includes(viewId)) {
        viewId = "dashboard";
    }

    // 1. Update active sidebar link styling
    document.querySelectorAll(".sidebar-link").forEach(function (link) {
        const href = link.getAttribute("href");
        if (href === "#" + viewId) {
            link.classList.add("active");
        } else if (href && href.startsWith("#")) {
            link.classList.remove("active");
        }
    });

    // 2. Hide all other views, show ONLY target view
    document.querySelectorAll(".admin-view").forEach(function (view) {
        view.classList.remove("active");
    });
    const targetViewEl = document.getElementById("view-" + viewId);
    if (targetViewEl) {
        targetViewEl.classList.add("active");
    }

    // 3. Update topbar labels
    updateTopbarForView(viewId);

    // 4. Update URL hash
    if (window.location.hash !== "#" + viewId) {
        try {
            history.replaceState(null, "", "#" + viewId);
        } catch (e) {
            window.location.hash = viewId;
        }
    }

    // 5. Trigger view-specific data renderer
    if (viewId === "mandals") {
        renderMandalsView();
    } else if (viewId === "volunteers") {
        renderVolunteersFullTable();
    } else if (viewId === "assign") {
        renderVolunteerAssignmentMatrix();
    } else if (viewId === "shelters") {
        renderSheltersView();
    } else if (viewId === "inventory") {
        renderInventoryView();
    } else if (viewId === "donations") {
        renderDonations();
    } else if (viewId === "requests") {
        renderRequests();
    } else if (viewId === "alerts") {
        renderAlerts();
    } else if (viewId === "reports") {
        renderReportsView();
        renderAnnualStatements();
    } else if (viewId === "dashboard") {
        renderRequests();
        renderVolunteers();
        renderAlerts();
        renderDashMandalVolunteers();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    sidebar.classList.remove("open");
}

// Sidebar link click delegation
document.querySelectorAll(".sidebar-link[href^='#']").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const targetView = link.getAttribute("href").replace(/^#/, "");
        switchAdminView(targetView);
    });
});

// ==========================================
// VOLUNTEERS DIRECTORY & OVERVIEW FUNCTIONS
// ==========================================
const defaultAdminPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="%230f1c30"/><circle cx="60" cy="45" r="23" fill="%23e2b18a"/><path d="M60 18c-14 0-25 10-25 24 0 5 1 9 4 12 3-8 10-13 21-13s18 5 21 13c3-3 4-7 4-12 0-14-11-24-25-24z" fill="%231e293b"/><path d="M22 110c4-24 22-38 38-38s34 14 38 38z" fill="%231e293b"/><path d="M42 82l18 20 18-20z" fill="%23e14c59"/><polygon points="60,86 54,102 66,102" fill="%23fbbf24"/><circle cx="60" cy="94" r="3" fill="%23b45309"/></svg>`;

const defaultRameshPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="%231e3a8a"/><circle cx="60" cy="46" r="23" fill="%23d49b6a"/><path d="M60 19c-13 0-24 9-24 23 0 4 1 8 3 11 3-7 9-11 21-11s18 4 21 11c2-3 3-7 3-11 0-14-11-23-24-23z" fill="%2318181b"/><path d="M20 110c4-25 21-39 40-39s36 14 40 39z" fill="%23ea580c"/><rect x="48" y="71" width="24" height="39" fill="%23fed7aa"/><line x1="36" y1="85" x2="84" y2="85" stroke="%23ffffff" stroke-width="4"/><line x1="32" y1="97" x2="88" y2="97" stroke="%23ffffff" stroke-width="4"/></svg>`;

const defaultPriyaPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="%23047857"/><circle cx="60" cy="47" r="23" fill="%23f5c59e"/><path d="M35 48c0-15 11-28 25-28s25 13 25 28c0 10-3 20-5 24-4-9-10-14-20-14s-16 5-20 14c-2-4-5-14-5-24z" fill="%23171717"/><path d="M22 110c3-23 20-37 38-37s35 14 38 37z" fill="%230f766e"/><path d="M47 80c0 12 6 22 13 22s13-10 13-22z" fill="%23ffffff"/><rect x="57" y="85" width="6" height="14" fill="%23ef4444"/><rect x="53" y="89" width="14" height="6" fill="%23ef4444"/></svg>`;

function getVolunteerPhotoSrc(vol) {
    if (!vol) return "";
    if (vol.profilePhoto && vol.profilePhoto.data) return vol.profilePhoto.data;
    if (typeof vol.profilePhoto === "string" && vol.profilePhoto.length > 5) return vol.profilePhoto;
    if (vol.photoData && vol.photoData.data) return vol.photoData.data;
    if (typeof vol.photoData === "string" && vol.photoData.length > 5) return vol.photoData;
    if (vol.photo) return vol.photo;

    const volIdNum = Number(vol.id);
    const volNameLower = (vol.name || "").toLowerCase();
    if (volIdNum === 3001 || volNameLower.includes("ramesh")) {
        return defaultRameshPhotoSvg;
    }
    if (volIdNum === 3002 || volNameLower.includes("priya")) {
        return defaultPriyaPhotoSvg;
    }
    return "";
}

let volModalInstance = null;

function showVolunteerOverviewModal() {
    const modalEl = document.getElementById("volunteerOverviewModal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        if (!volModalInstance) {
            volModalInstance = new bootstrap.Modal(modalEl);
        }
        volModalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
        document.body.classList.add("modal-open");
        let backdrop = document.getElementById("customModalBackdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "customModalBackdrop";
            backdrop.className = "modal-backdrop fade show";
            document.body.appendChild(backdrop);
        }
    }
}

function hideVolunteerOverviewModal() {
    const modalEl = document.getElementById("volunteerOverviewModal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    document.body.classList.remove("modal-open");
    const backdrop = document.getElementById("customModalBackdrop");
    if (backdrop) backdrop.remove();
}

function deleteVolunteer(volunteerId) {
    if (!window.confirm("Are you sure you want to remove this volunteer from the roster?")) return;
    const volunteers = readRecords("disasterVolunteers");
    const index = volunteers.findIndex(function (v) { return String(v.id) === String(volunteerId); });
    if (index === -1) return;
    const name = volunteers[index].name;
    volunteers.splice(index, 1);
    writeRecords("disasterVolunteers", volunteers);

    // Also clear from any assigned request
    const allRequests = readRecords("disasterHelpRequests");
    let reqChanged = false;
    allRequests.forEach(function (r) {
        if (String(r.assignedVolunteerId) === String(volunteerId)) {
            r.assignedVolunteerId = null;
            r.assignedVolunteer = null;
            if (r.status === "Assigned") r.status = "Verified";
            reqChanged = true;
        }
    });
    if (reqChanged) writeRecords("disasterHelpRequests", allRequests);

    hideVolunteerOverviewModal();
    renderVolunteersFullTable();
    renderVolunteers();
    if (typeof renderVolunteerAssignmentMatrix === "function") renderVolunteerAssignmentMatrix();
    showDashboardMessage(`Volunteer ${name} removed from roster.`);
}

function renderVolunteersFullTable() {
    const volunteers = recordsForAdmin("disasterVolunteers");
    const table = document.getElementById("volunteerFullTable");
    if (!table) return;

    const registered = volunteers.length;
    const assigned = volunteers.filter(function (item) { return item.status === "Assigned"; }).length;
    const unavailable = volunteers.filter(function (item) { return item.status === "Unavailable" || item.availability === "Unavailable"; }).length;
    const available = volunteers.filter(function (item) { return item.status !== "Assigned" && item.status !== "Unavailable" && item.availability !== "Unavailable"; }).length;

    // Update stat numbers
    const totalEl = document.getElementById("volFullTotal");
    const availEl = document.getElementById("volFullAvailable");
    const assignEl = document.getElementById("volFullAssigned");
    const offEl = document.getElementById("volFullOffline");
    const readyEl = document.getElementById("volFullReadiness");
    const badgeEl = document.getElementById("volunteersFoundBadge");

    if (totalEl) totalEl.textContent = registered;
    if (availEl) availEl.textContent = available;
    if (assignEl) assignEl.textContent = assigned;
    if (offEl) offEl.textContent = unavailable;
    if (readyEl) readyEl.textContent = registered ? Math.round((available / registered) * 100) + "%" : "0%";
    if (badgeEl) badgeEl.textContent = `${registered} volunteers`;

    table.innerHTML = volunteers.map(function (vol) {
        const status = vol.status || vol.availability || "Available";
        const statusClass = status.toLowerCase();
        const photoSrc = getVolunteerPhotoSrc(vol);
        const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
        const cleanPhone = String(vol.phone || vol.mobileNumber || "").replace(/\D/g, "");

        // Photo thumbnail HTML
        const photoHtml = photoSrc 
            ? `<div class="vol-row-thumb-wrap"><img class="vol-row-thumb" src="${photoSrc}" alt="${escapeHtml(vol.name)}"></div>`
            : `<div class="vol-row-thumb-wrap"><span class="vol-row-thumb-initials">${initials}</span></div>`;

        // Parse skills into badges
        const skillsList = (vol.skills || "Disaster Relief, First Aid").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        const skillsHtml = skillsList.slice(0, 2).map(function (s) {
            return `<span class="category-badge" style="font-size: 9px; padding: 2px 7px;">${escapeHtml(s)}</span>`;
        }).join(" ") + (skillsList.length > 2 ? ` <small class="text-muted">+${skillsList.length - 2}</small>` : "");

        const waLink = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${vol.name}, from Disaster Relief Administration regarding emergency volunteer deployment:`)}` : "#";

        return `<tr data-id="${vol.id}" style="cursor: pointer;" title="Click anywhere to open full Volunteer Profile">
            <td style="text-align: center;">${photoHtml}</td>
            <td><span class="badge bg-secondary font-monospace">VOL-${vol.id}</span></td>
            <td><strong>${escapeHtml(vol.name)}</strong></td>
            <td>${escapeHtml(vol.fatherName || "N/A")}</td>
            <td>
                ${cleanPhone 
                    ? `<a href="tel:${cleanPhone}" class="font-monospace text-decoration-none" onclick="event.stopPropagation();">${escapeHtml(vol.phone || vol.mobileNumber)}</a>` 
                    : '<span class="text-muted">N/A</span>'}
            </td>
            <td><strong>${escapeHtml(vol.district || vol.location || "N/A")}</strong><small>${escapeHtml(vol.mandal || "")}, ${escapeHtml(vol.state || "")}</small></td>
            <td>${skillsHtml}</td>
            <td><span class="status-pill ${statusClass}">${escapeHtml(status)}</span></td>
            <td style="text-align: right;">
                <div class="vol-action-btn-group" onclick="event.stopPropagation();">
                    <button class="btn btn-sm btn-primary view-vol-btn" type="button" data-id="${vol.id}" title="Open Full Volunteer Profile">
                        <i class="bi bi-person-badge"></i> Profile
                    </button>
                    <button class="btn btn-sm btn-outline-dark view-idcard-btn" type="button" data-id="${vol.id}" title="Official Dual-Sided Volunteer ID Card (Front & Back)">
                        <i class="bi bi-person-vcard"></i> ID Card
                    </button>
                    ${cleanPhone ? `<a href="tel:${cleanPhone}" class="btn btn-sm btn-outline-success" title="Call ${escapeHtml(vol.name)}"><i class="bi bi-telephone-fill"></i></a>` : ''}
                    ${cleanPhone ? `<a href="${waLink}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success" title="WhatsApp Message"><i class="bi bi-whatsapp"></i></a>` : ''}
                    <button class="btn btn-sm btn-outline-secondary vol-status-toggle" type="button" data-id="${vol.id}" title="Toggle Availability Status">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning vol-dispatch-btn" type="button" data-id="${vol.id}" title="Dispatch / Assign to Emergency Request">
                        <i class="bi bi-send-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger vol-delete-btn" type="button" data-id="${vol.id}" title="Delete Volunteer from Roster">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");

    filterVolunteersFullTable();
}

function filterVolunteersFullTable() {
    const searchInput = document.getElementById("volunteerSearchInput");
    const statusSelect = document.getElementById("volunteerStatusFilter");
    const skillSelect = document.getElementById("volunteerSkillFilter");
    if (!searchInput || !statusSelect) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const statusVal = statusSelect.value;
    const skillVal = skillSelect ? skillSelect.value.toLowerCase() : "all";

    const rows = Array.from(document.querySelectorAll("#volunteerFullTable tr"));
    let visibleCount = 0;

    rows.forEach(function (row) {
        const text = row.textContent.toLowerCase();
        const matchesSearch = !searchTerm || text.includes(searchTerm);
        const matchesStatus = statusVal === "all" || text.includes(statusVal.toLowerCase());
        const matchesSkill = skillVal === "all" || text.includes(skillVal);

        const visible = matchesSearch && matchesStatus && matchesSkill;
        row.hidden = !visible;
        if (visible) visibleCount += 1;
    });

    const emptyEl = document.getElementById("emptyVolunteersState");
    if (emptyEl) emptyEl.classList.toggle("visible", visibleCount === 0);
    const badgeEl = document.getElementById("volunteersFoundBadge");
    if (badgeEl) badgeEl.textContent = `${visibleCount} volunteers found`;
}

function openVolunteerOverview(volunteerId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (item) { return String(item.id) === String(volunteerId); });
    if (!vol) return;

    pendingVolunteerPhotoDraft = null;
    const modalEl = document.getElementById("volunteerOverviewModal");
    modalEl.dataset.currentVolunteerId = String(vol.id);

    const status = vol.status || vol.availability || "Available";
    const statusClass = status.toLowerCase();

    // Badges & Meta
    document.getElementById("volModalId").textContent = `VOL-${vol.id}`;
    document.getElementById("volModalCodeText").textContent = `VOL-${vol.id}`;
    
    const badgeEl = document.getElementById("volModalStatusBadge");
    badgeEl.className = `status-pill ${statusClass}`;
    badgeEl.textContent = status;

    document.getElementById("volModalCreatedAt").innerHTML = `<i class="bi bi-clock"></i> Applied: ${escapeHtml(vol.createdAt || "Recent")}`;

    // Profile Photo & Hero Display
    const photoSrc = getVolunteerPhotoSrc(vol);
    const photoImg = document.getElementById("volModalPhotoImg");
    const photoInitials = document.getElementById("volModalPhotoInitials");
    const heroName = document.getElementById("volModalHeroName");
    const heroFatherName = document.getElementById("volModalHeroFatherName");
    const heroLocation = document.getElementById("volModalHeroLocation");
    const heroDistrict = document.getElementById("volModalHeroDistrict");

    const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";
    if (photoInitials) photoInitials.textContent = initials;

    if (photoSrc) {
        if (photoImg) {
            photoImg.src = photoSrc;
            photoImg.style.display = "block";
        }
        if (photoInitials) photoInitials.style.display = "none";
    } else {
        if (photoImg) photoImg.style.display = "none";
        if (photoInitials) photoInitials.style.display = "flex";
    }

    if (heroName) heroName.textContent = vol.name || "Volunteer";
    if (heroFatherName) heroFatherName.textContent = vol.fatherName || "Not specified";
    if (heroLocation) heroLocation.textContent = vol.location || vol.mandal || "Base Station";
    if (heroDistrict) heroDistrict.textContent = `${vol.district || "District"}, ${vol.state || "India"}`;

    // Personal Details
    document.getElementById("volModalName").textContent = vol.name || "N/A";
    document.getElementById("volModalFatherName").textContent = vol.fatherName || "N/A";
    document.getElementById("volModalPhone").textContent = vol.phone || vol.mobileNumber || "N/A";

    const emailEl = document.getElementById("volModalEmail");
    if (emailEl) emailEl.textContent = vol.email || (vol.username ? `${vol.username}@disaster-relief.gov.in` : "volunteer.ops@disaster-relief.org");

    const bloodEl = document.getElementById("volModalBloodGroup");
    if (bloodEl) bloodEl.textContent = vol.bloodGroup || (Number(vol.id) % 2 === 0 ? "B+ Positive" : "O+ Positive");

    const emergencyEl = document.getElementById("volModalEmergencyContact");
    if (emergencyEl) emergencyEl.textContent = vol.emergencyContact || (vol.fatherName ? `${vol.fatherName} (${vol.phone || "On File"})` : "Family Guardian");

    const cleanPhone = String(vol.phone || vol.mobileNumber || "").replace(/\D/g, "");
    const callBtn = document.getElementById("volModalCallBtn");
    const waBtn = document.getElementById("volModalWhatsAppBtn");
    const emailBtn = document.getElementById("volModalEmailBtn");

    if (callBtn) {
        if (cleanPhone) {
            callBtn.href = `tel:${cleanPhone}`;
            callBtn.style.display = "inline-flex";
        } else {
            callBtn.style.display = "none";
        }
    }

    if (waBtn) {
        if (cleanPhone) {
            waBtn.href = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${vol.name}, from Disaster Relief Administration regarding emergency volunteer deployment:`)}`;
            waBtn.style.display = "inline-flex";
        } else {
            waBtn.style.display = "none";
        }
    }

    if (emailBtn) {
        const emailAddr = vol.email || (vol.username ? `${vol.username}@disaster-relief.gov.in` : "volunteer.ops@disaster-relief.org");
        emailBtn.href = `mailto:${emailAddr}?subject=${encodeURIComponent("Disaster Relief Operations - Field Volunteer Deployment")}`;
    }

    // Location
    document.getElementById("volModalLocation").textContent = vol.location || vol.district || "Field Base";
    document.getElementById("volModalMandal").textContent = vol.mandal || "N/A";
    document.getElementById("volModalDistrictState").textContent = `${vol.district || "N/A"}, ${vol.state || "N/A"}`;

    // Skills
    const skillsContainer = document.getElementById("volModalSkillsContainer");
    const skillsList = (vol.skills || "Disaster Relief Operations").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    skillsContainer.innerHTML = skillsList.map(function (s) {
        let icon = "bi-check2-circle";
        const lower = s.toLowerCase();
        if (lower.includes("rescue") || lower.includes("water")) icon = "bi-life-preserver";
        else if (lower.includes("first aid") || lower.includes("medic") || lower.includes("nurse")) icon = "bi-bandaid-fill";
        else if (lower.includes("drive") || lower.includes("transport") || lower.includes("vehicle")) icon = "bi-truck";
        else if (lower.includes("food") || lower.includes("ration") || lower.includes("shelter")) icon = "bi-box2-heart";
        return `<span class="category-badge"><i class="bi ${icon}"></i> ${escapeHtml(s)}</span>`;
    }).join("");

    // Status Selector
    document.getElementById("volModalStatusSelect").value = status === "Unavailable" ? "Unavailable" : (status === "Assigned" ? "Assigned" : "Available");

    // Populate active help requests dropdown for assignment
    const allRequests = readRecords("disasterHelpRequests");
    const activeRequests = allRequests.filter(function (r) { return r.status !== "Resolved"; });
    const assignSelect = document.getElementById("volModalAssignRequestSelect");
    assignSelect.innerHTML = '<option value="">-- No Help Request Assigned --</option>' + activeRequests.map(function (r) {
        const isCurrent = String(r.assignedVolunteerId) === String(vol.id) || (vol.assignedRequestId && String(vol.assignedRequestId) === String(r.id));
        return `<option value="${r.id}" ${isCurrent ? "selected" : ""}>${escapeHtml(r.trackId || "#" + r.id)} - ${escapeHtml(r.disasterType || "Emergency")} (${escapeHtml(r.village || r.district)}) [Priority: ${escapeHtml(r.priority || "Med")}]</option>`;
    }).join("");

    // Current Assignment Banner
    renderVolAssignmentBanner(vol, allRequests);

    showVolunteerOverviewModal();
}

function renderVolAssignmentBanner(vol, allRequests) {
    const banner = document.getElementById("volModalCurrentAssignmentBanner");
    if (!banner) return;
    const req = allRequests.find(function (r) {
        return String(r.assignedVolunteerId) === String(vol.id) || (vol.assignedRequestId && String(vol.assignedRequestId) === String(r.id));
    });

    if (req) {
        banner.innerHTML = `
            <div class="assigned-volunteer-banner mt-2">
                <div>
                    <i class="bi bi-shield-fill-exclamation me-1"></i> Currently deployed to: <strong>${escapeHtml(req.trackId || "#" + req.id)} (${escapeHtml(req.disasterType)})</strong> in ${escapeHtml(req.village || req.district)}
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" id="volModalUnassignMissionBtn"><i class="bi bi-x-circle"></i> Unassign</button>
            </div>`;
        const unassignBtn = document.getElementById("volModalUnassignMissionBtn");
        if (unassignBtn) {
            unassignBtn.addEventListener("click", function () {
                unassignVolunteerMission(vol.id);
            });
        }
    } else {
        banner.innerHTML = "";
    }
}

function saveVolunteerModalUpdates() {
    const modalEl = document.getElementById("volunteerOverviewModal");
    const volunteerId = modalEl.dataset.currentVolunteerId;
    if (!volunteerId) return;

    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (item) { return String(item.id) === String(volunteerId); });
    if (!vol) return;

    const newStatus = document.getElementById("volModalStatusSelect").value;
    const assignedRequestId = document.getElementById("volModalAssignRequestSelect").value;

    vol.status = newStatus;
    vol.availability = newStatus;

    if (pendingVolunteerPhotoDraft !== null) {
        vol.profilePhoto = pendingVolunteerPhotoDraft;
        pendingVolunteerPhotoDraft = null;
    }

    const allRequests = readRecords("disasterHelpRequests");

    if (assignedRequestId) {
        vol.assignedRequestId = assignedRequestId;
        vol.status = "Assigned";
        vol.availability = "Assigned";

        const req = allRequests.find(function (r) { return String(r.id) === String(assignedRequestId); });
        if (req) {
            req.assignedVolunteerId = vol.id;
            req.assignedVolunteer = {
                id: vol.id,
                name: vol.name,
                phone: vol.phone || vol.mobileNumber,
                district: vol.district,
                state: vol.state
            };
            req.status = "Assigned";
            vol.assignedRequestTrackId = req.trackId;
        }
    } else {
        // Clear assignment from requests
        allRequests.forEach(function (r) {
            if (String(r.assignedVolunteerId) === String(vol.id)) {
                r.assignedVolunteerId = null;
                r.assignedVolunteer = null;
                if (r.status === "Assigned") r.status = "Verified";
            }
        });
        vol.assignedRequestId = null;
        vol.assignedRequestTrackId = null;
    }

    writeRecords("disasterVolunteers", volunteers);
    writeRecords("disasterHelpRequests", allRequests);

    renderVolunteersFullTable();
    renderRequests();
    renderVolunteers();
    if (typeof renderVolunteerAssignmentMatrix === "function") renderVolunteerAssignmentMatrix();

    // Update modal status pill
    const badgeEl = document.getElementById("volModalStatusBadge");
    badgeEl.className = `status-pill ${vol.status.toLowerCase()}`;
    badgeEl.textContent = vol.status;
    document.getElementById("volModalStatusSelect").value = vol.status;

    renderVolAssignmentBanner(vol, allRequests);
    showDashboardMessage(`Volunteer ${vol.name} application profile updated (${vol.status}).`);
}

function unassignVolunteerMission(volunteerId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (item) { return String(item.id) === String(volunteerId); });
    if (!vol) return;

    const allRequests = readRecords("disasterHelpRequests");
    allRequests.forEach(function (r) {
        if (String(r.assignedVolunteerId) === String(vol.id)) {
            r.assignedVolunteerId = null;
            r.assignedVolunteer = null;
            if (r.status === "Assigned") r.status = "Verified";
        }
    });

    vol.assignedRequestId = null;
    vol.assignedRequestTrackId = null;
    vol.status = "Available";
    vol.availability = "Available";

    writeRecords("disasterVolunteers", volunteers);
    writeRecords("disasterHelpRequests", allRequests);

    renderVolunteersFullTable();
    renderRequests();
    renderVolunteers();
    if (typeof renderVolunteerAssignmentMatrix === "function") renderVolunteerAssignmentMatrix();

    openVolunteerOverview(vol.id);
    showDashboardMessage(`Volunteer ${vol.name} marked Available and unassigned.`);
}

function quickToggleVolunteerAvailability(volunteerId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (item) { return String(item.id) === String(volunteerId); });
    if (!vol) return;

    const sequence = ["Available", "Assigned", "Unavailable"];
    const current = vol.status || "Available";
    const next = sequence[(sequence.indexOf(current) + 1) % sequence.length];
    vol.status = next;
    vol.availability = next;

    writeRecords("disasterVolunteers", volunteers);
    renderVolunteersFullTable();
    renderVolunteers();
    if (typeof renderVolunteerAssignmentMatrix === "function") renderVolunteerAssignmentMatrix();
    showDashboardMessage(`Volunteer ${vol.name} status updated to ${next}.`);
}

// Volunteer Table click delegation
const volFullTableEl = document.getElementById("volunteerFullTable");
if (volFullTableEl) {
    volFullTableEl.addEventListener("click", function (event) {
        const toggleBtn = event.target.closest(".vol-status-toggle");
        if (toggleBtn) {
            event.stopPropagation();
            quickToggleVolunteerAvailability(toggleBtn.dataset.id);
            return;
        }

        const deleteBtn = event.target.closest(".vol-delete-btn");
        if (deleteBtn) {
            event.stopPropagation();
            deleteVolunteer(deleteBtn.dataset.id);
            return;
        }

        const dispatchBtn = event.target.closest(".vol-dispatch-btn");
        if (dispatchBtn) {
            event.stopPropagation();
            const volId = dispatchBtn.dataset.id;
            switchAdminView("assign");
            const selectEl = document.getElementById("assignSelectVolunteer");
            if (selectEl) {
                selectEl.value = volId;
                selectEl.dispatchEvent(new Event("change"));
            }
            showDashboardMessage("Volunteer selected for emergency assignment.");
            return;
        }

        const idCardBtn = event.target.closest(".view-idcard-btn");
        if (idCardBtn) {
            event.stopPropagation();
            openVolunteerIdCard(idCardBtn.dataset.id);
            return;
        }

        const viewBtn = event.target.closest(".view-vol-btn");
        if (viewBtn) {
            event.stopPropagation();
            openVolunteerOverview(viewBtn.dataset.id);
            return;
        }

        const link = event.target.closest("a");
        if (link) return;

        const row = event.target.closest("tr");
        if (row && row.dataset.id) {
            openVolunteerOverview(row.dataset.id);
        }
    });
}

// Volunteer Filters & Inputs
const volSearchInput = document.getElementById("volunteerSearchInput");
if (volSearchInput) volSearchInput.addEventListener("input", filterVolunteersFullTable);
const volStatusFilter = document.getElementById("volunteerStatusFilter");
if (volStatusFilter) volStatusFilter.addEventListener("change", filterVolunteersFullTable);
const volSkillFilter = document.getElementById("volunteerSkillFilter");
if (volSkillFilter) volSkillFilter.addEventListener("change", filterVolunteersFullTable);

// Volunteer Modal Buttons
const volModalSaveBtn = document.getElementById("volModalSaveBtn");
if (volModalSaveBtn) volModalSaveBtn.addEventListener("click", saveVolunteerModalUpdates);

const volModalQuickAvailBtn = document.getElementById("volModalQuickAvailableBtn");
if (volModalQuickAvailBtn) volModalQuickAvailBtn.addEventListener("click", function () {
    document.getElementById("volModalStatusSelect").value = "Available";
    saveVolunteerModalUpdates();
});

const volModalPrintBtn = document.getElementById("volModalPrintBtn");
if (volModalPrintBtn) volModalPrintBtn.addEventListener("click", function () {
    const modalEl = document.getElementById("volunteerOverviewModal");
    const volunteerId = modalEl.dataset.currentVolunteerId;
    if (volunteerId) {
        openVolunteerIdCard(volunteerId);
    } else {
        window.print();
    }
});

const volModalHeroPrintBtn = document.getElementById("volModalHeroPrintBtn");
if (volModalHeroPrintBtn) volModalHeroPrintBtn.addEventListener("click", function () {
    const modalEl = document.getElementById("volunteerOverviewModal");
    const volunteerId = modalEl.dataset.currentVolunteerId;
    if (volunteerId) {
        openVolunteerIdCard(volunteerId);
    } else {
        window.print();
    }
});

const volModalDeleteBtn = document.getElementById("volModalDeleteBtn");
if (volModalDeleteBtn) volModalDeleteBtn.addEventListener("click", function () {
    const modalEl = document.getElementById("volunteerOverviewModal");
    const volunteerId = modalEl.dataset.currentVolunteerId;
    if (volunteerId) deleteVolunteer(volunteerId);
});

// Volunteer Photo Upload inside Modal: Buffered in draft, committed ONLY on Save click!
let pendingVolunteerPhotoDraft = null;
const volModalPhotoInput = document.getElementById("volModalPhotoInput");
if (volModalPhotoInput) {
    volModalPhotoInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            const dataUrl = evt.target.result;
            pendingVolunteerPhotoDraft = {
                name: file.name,
                type: file.type,
                data: dataUrl
            };
            const photoImg = document.getElementById("volModalPhotoImg");
            const photoInitials = document.getElementById("volModalPhotoInitials");
            if (photoImg) {
                photoImg.src = dataUrl;
                photoImg.style.display = "block";
            }
            if (photoInitials) photoInitials.style.display = "none";
            showDashboardMessage("Photo preview updated. Click 'Save Updates' to apply changes.");
        };
        reader.readAsDataURL(file);
    });
}

// Add Volunteer Modal with Cascading State, District, and Mandal Select
const adminDistricts = (typeof window !== "undefined" && window.indiaDistrictsData) || (typeof indiaDistrictsData !== "undefined" ? indiaDistrictsData : {});
const adminMandals = (typeof window !== "undefined" && window.mandalsByDistrictData) || (typeof mandalsByDistrictData !== "undefined" ? mandalsByDistrictData : {});

function getAdminMandalsList(district) {
    if (typeof window !== "undefined" && typeof window.getMandalsForDistrict === "function") {
        return window.getMandalsForDistrict(district);
    }
    if (!district) return [];
    district = String(district).trim();
    if (adminMandals[district]) return adminMandals[district];
    const lower = district.toLowerCase();
    const key = Object.keys(adminMandals).find(function (k) { return k.toLowerCase() === lower; });
    if (key) return adminMandals[key];
    return [
        district + " Sadar",
        district + " Central",
        district + " North",
        district + " South",
        district + " East",
        district + " West",
        district + " Rural",
        district + " Urban"
    ];
}

function setupAdminVolunteerModalCascade() {
    const stateEl = document.getElementById("adminAddVolState");
    const districtEl = document.getElementById("adminAddVolDistrict");
    const mandalEl = document.getElementById("adminAddVolMandal");

    if (!districtEl || !mandalEl) return;

    districtEl.innerHTML = '<option value="">Select a state first</option>';
    districtEl.disabled = true;
    mandalEl.innerHTML = '<option value="">Select a district first</option>';
    mandalEl.disabled = true;

    if (stateEl) {
        stateEl.addEventListener("change", function () {
            const state = stateEl.value;
            if (!state) {
                districtEl.innerHTML = '<option value="">Select a state first</option>';
                districtEl.disabled = true;
                mandalEl.innerHTML = '<option value="">Select a district first</option>';
                mandalEl.disabled = true;
                return;
            }

            const districts = (adminDistricts[state] || []);
            let distOptions = '<option value="">Select district</option>';
            districts.forEach(function (d) {
                distOptions += `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`;
            });
            districtEl.innerHTML = distOptions;
            districtEl.disabled = false;

            mandalEl.innerHTML = '<option value="">Select a district first</option>';
            mandalEl.disabled = true;
        });
    }

    districtEl.addEventListener("change", function () {
        const district = districtEl.value;
        if (!district) {
            mandalEl.innerHTML = '<option value="">Select a district first</option>';
            mandalEl.disabled = true;
            return;
        }

        const mandals = getAdminMandalsList(district);
        let mandalOptions = '<option value="">Select mandal / taluk</option>';
        mandals.forEach(function (m) {
            mandalOptions += `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`;
        });
        mandalEl.innerHTML = mandalOptions;
        mandalEl.disabled = false;
    });
}
setupAdminVolunteerModalCascade();

const quickAddVolunteerBtn = document.getElementById("quickAddVolunteerBtn");
const addVolModalEl = document.getElementById("adminAddVolunteerModal");
let addVolBsModal = null;
if (quickAddVolunteerBtn && addVolModalEl) {
    quickAddVolunteerBtn.addEventListener("click", function () {
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            if (!addVolBsModal) {
                addVolBsModal = new bootstrap.Modal(addVolModalEl);
            }
            addVolBsModal.show();
        } else {
            addVolModalEl.classList.add("show");
            addVolModalEl.style.display = "block";
            document.body.classList.add("modal-open");
        }
    });
}

const adminAddVolForm = document.getElementById("adminAddVolunteerForm");
if (adminAddVolForm) {
    adminAddVolForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("adminAddVolName").value.trim();
        const fatherName = document.getElementById("adminAddVolFatherName").value.trim() || "Applicant Guardian";
        const phone = document.getElementById("adminAddVolPhone").value.replace(/\D/g, "");
        const state = document.getElementById("adminAddVolState").value;
        const district = document.getElementById("adminAddVolDistrict").value;
        const mandal = document.getElementById("adminAddVolMandal").value;
        const skills = document.getElementById("adminAddVolSkills").value.trim();
        const status = document.getElementById("adminAddVolStatus").value || "Available";

        if (phone.length !== 10) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        const photoFileInput = document.getElementById("adminAddVolPhoto");
        const photoFile = photoFileInput && photoFileInput.files && photoFileInput.files[0];
        let photoData = null;
        if (photoFile) {
            photoData = await new Promise(function (resolve) {
                const reader = new FileReader();
                reader.onload = function () {
                    resolve({ name: photoFile.name, type: photoFile.type, data: reader.result });
                };
                reader.readAsDataURL(photoFile);
            });
        }

        const volunteers = readRecords("disasterVolunteers");
        const newVol = {
            id: Date.now(),
            name: name,
            fatherName: fatherName,
            phone: phone,
            mobileNumber: phone,
            state: state,
            district: district,
            mandal: mandal,
            skills: skills,
            profilePhoto: photoData,
            availability: status,
            status: status,
            createdAt: new Date().toLocaleString()
        };
        volunteers.unshift(newVol);
        writeRecords("disasterVolunteers", volunteers);
        renderVolunteersFullTable();
        renderVolunteers();
        renderVolunteerAssignmentMatrix();

        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            const instance = bootstrap.Modal.getInstance(addVolModalEl);
            if (instance) instance.hide();
        } else {
            addVolModalEl.classList.remove("show");
            addVolModalEl.style.display = "none";
            document.body.classList.remove("modal-open");
        }

        adminAddVolForm.reset();
        setupAdminVolunteerModalCascade();
        showDashboardMessage(`Volunteer ${name} (${mandal}, ${district}) added to roster.`);
    });
}

// Export Volunteers CSV
const exportVolCsvBtn = document.getElementById("exportVolunteersCsv");
if (exportVolCsvBtn) {
    exportVolCsvBtn.addEventListener("click", function () {
        const volunteers = recordsForAdmin("disasterVolunteers");
        if (!volunteers.length) {
            showDashboardMessage("No volunteers to export.");
            return;
        }
        let csv = "Volunteer ID,Name,Father Name,Phone,District,State,Skills,Status\n";
        volunteers.forEach(function (v) {
            csv += `"VOL-${v.id}","${v.name}","${v.fatherName || ''}","${v.phone || ''}","${v.district || ''}","${v.state || ''}","${v.skills || ''}","${v.status || ''}"\n`;
        });
        downloadCsvFile(csv, "Disaster_Relief_Volunteers_Roster.csv");
    });
}

// ==========================================
// VIEW 5: VOLUNTEER ASSIGNMENT DISPATCH MATRIX
// ==========================================
function renderVolunteerAssignmentMatrix() {
    const allRequests = readRecords("disasterHelpRequests");
    const activeRequests = allRequests.filter(function (r) { return r.status !== "Resolved"; });
    const allVolunteers = readRecords("disasterVolunteers");
    const availableVolunteers = allVolunteers.filter(function (v) { return v.status !== "Assigned" && v.status !== "Unavailable"; });

    const reqSelect = document.getElementById("assignSelectRequest");
    const volSelect = document.getElementById("assignSelectVolunteer");
    if (!reqSelect || !volSelect) return;

    reqSelect.innerHTML = '<option value="">-- Choose Emergency Request --</option>' + activeRequests.map(function (r) {
        return `<option value="${r.id}">${escapeHtml(r.trackId || "#" + r.id)} - ${escapeHtml(r.disasterType)} in ${escapeHtml(r.village || r.district)} [${escapeHtml(r.priority)}]</option>`;
    }).join("");

    volSelect.innerHTML = '<option value="">-- Choose Available Volunteer --</option>' + availableVolunteers.map(function (v) {
        return `<option value="${v.id}">${escapeHtml(v.name)} (${escapeHtml(v.phone)}) - ${escapeHtml(v.district || v.state)} [Skills: ${escapeHtml(v.skills)}]</option>`;
    }).join("");

    // Active Deployments Table
    const table = document.getElementById("activeAssignmentsTable");
    if (table) {
        const assignedPairs = [];
        allRequests.forEach(function (r) {
            if (r.assignedVolunteer) {
                assignedPairs.push({ request: r, volunteer: r.assignedVolunteer });
            }
        });

        table.innerHTML = assignedPairs.length ? assignedPairs.map(function (pair) {
            return `<tr>
                <td><strong>${escapeHtml(pair.request.trackId || "#" + pair.request.id)}</strong></td>
                <td>${escapeHtml(pair.request.village || pair.request.location || "N/A")}, ${escapeHtml(pair.request.district || "")}</td>
                <td><span class="badge bg-light text-dark border">${escapeHtml(pair.request.disasterType)}</span></td>
                <td><strong>${escapeHtml(pair.volunteer.name)}</strong></td>
                <td><span class="font-monospace">${escapeHtml(pair.volunteer.phone || "N/A")}</span></td>
                <td><span class="status-pill assigned">Dispatched</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2 unassign-pair-btn" data-req-id="${pair.request.id}" data-vol-id="${pair.volunteer.id}">
                        <i class="bi bi-x-circle"></i> Unassign
                    </button>
                </td>
            </tr>`;
        }).join("") : '<tr><td colspan="7" class="text-center text-muted py-3">No active field assignments. Match an emergency request with a volunteer above.</td></tr>';
    }
}

// Assignment matrix interactions
const reqSelectEl = document.getElementById("assignSelectRequest");
if (reqSelectEl) {
    reqSelectEl.addEventListener("change", function () {
        const reqCard = document.getElementById("assignSelectedRequestCard");
        const execBtn = document.getElementById("executeAssignmentBtn");
        const allRequests = readRecords("disasterHelpRequests");
        const req = allRequests.find(function (r) { return String(r.id) === reqSelectEl.value; });

        if (req && reqCard) {
            reqCard.style.display = "block";
            reqCard.innerHTML = `<strong>${escapeHtml(req.trackId || "#" + req.id)}</strong> - <span class="text-danger fw-bold">${escapeHtml(req.disasterType)}</span><br>
            <small>Location: ${escapeHtml(req.village || req.location)}, ${escapeHtml(req.district)}, ${escapeHtml(req.state)}</small><br>
            <small>Applicant: ${escapeHtml(req.name)} (${escapeHtml(req.mobileNumber)})</small><br>
            <small class="text-muted">Need: ${escapeHtml(req.help || "General emergency aid")}</small>`;
        } else if (reqCard) {
            reqCard.style.display = "none";
        }
        if (execBtn) execBtn.disabled = !(reqSelectEl.value && document.getElementById("assignSelectVolunteer").value);
    });
}

const volSelectEl = document.getElementById("assignSelectVolunteer");
if (volSelectEl) {
    volSelectEl.addEventListener("change", function () {
        const volCard = document.getElementById("assignSelectedVolunteerCard");
        const execBtn = document.getElementById("executeAssignmentBtn");
        const allVolunteers = readRecords("disasterVolunteers");
        const vol = allVolunteers.find(function (v) { return String(v.id) === volSelectEl.value; });

        if (vol && volCard) {
            volCard.style.display = "block";
            volCard.innerHTML = `<strong>${escapeHtml(vol.name)}</strong> - <span class="font-monospace">${escapeHtml(vol.phone)}</span><br>
            <small>Base: ${escapeHtml(vol.district)}, ${escapeHtml(vol.state)}</small><br>
            <small class="text-success"><i class="bi bi-shield-check"></i> Verified Responder</small><br>
            <small class="text-muted">Skills: ${escapeHtml(vol.skills)}</small>`;
        } else if (volCard) {
            volCard.style.display = "none";
        }
        if (execBtn) execBtn.disabled = !(document.getElementById("assignSelectRequest").value && volSelectEl.value);
    });
}

const execAssignBtn = document.getElementById("executeAssignmentBtn");
if (execAssignBtn) {
    execAssignBtn.addEventListener("click", function () {
        const reqId = document.getElementById("assignSelectRequest").value;
        const volId = document.getElementById("assignSelectVolunteer").value;
        if (!reqId || !volId) return;

        const allRequests = readRecords("disasterHelpRequests");
        const allVolunteers = readRecords("disasterVolunteers");
        const req = allRequests.find(function (r) { return String(r.id) === String(reqId); });
        const vol = allVolunteers.find(function (v) { return String(v.id) === String(volId); });

        if (!req || !vol) return;

        req.assignedVolunteerId = vol.id;
        req.assignedVolunteer = {
            id: vol.id,
            name: vol.name,
            phone: vol.phone || vol.mobileNumber,
            district: vol.district,
            state: vol.state
        };
        req.status = "Assigned";

        vol.assignedRequestId = req.id;
        vol.assignedRequestTrackId = req.trackId;
        vol.status = "Assigned";
        vol.availability = "Assigned";

        writeRecords("disasterHelpRequests", allRequests);
        writeRecords("disasterVolunteers", allVolunteers);

        renderVolunteerAssignmentMatrix();
        renderRequests();
        renderVolunteersFullTable();
        renderVolunteers();

        showDashboardMessage(`Dispatched: ${vol.name} assigned to ${req.trackId || "#" + req.id}!`);
    });
}

const activeAssignTableEl = document.getElementById("activeAssignmentsTable");
if (activeAssignTableEl) {
    activeAssignTableEl.addEventListener("click", function (event) {
        const btn = event.target.closest(".unassign-pair-btn");
        if (!btn) return;
        const reqId = btn.dataset.reqId;
        const volId = btn.dataset.volId;

        const allRequests = readRecords("disasterHelpRequests");
        const allVolunteers = readRecords("disasterVolunteers");
        const req = allRequests.find(function (r) { return String(r.id) === String(reqId); });
        const vol = allVolunteers.find(function (v) { return String(v.id) === String(volId); });

        if (req) {
            req.assignedVolunteerId = null;
            req.assignedVolunteer = null;
            if (req.status === "Assigned") req.status = "Verified";
        }
        if (vol) {
            vol.assignedRequestId = null;
            vol.assignedRequestTrackId = null;
            vol.status = "Available";
            vol.availability = "Available";
        }

        writeRecords("disasterHelpRequests", allRequests);
        writeRecords("disasterVolunteers", allVolunteers);

        renderVolunteerAssignmentMatrix();
        renderRequests();
        renderVolunteersFullTable();
        renderVolunteers();
        showDashboardMessage("Assignment cleared.");
    });
}

// ==========================================
// VIEW 6: SHELTERS MANAGEMENT
// ==========================================
const defaultSheltersData = [
    { id: 1, name: "Krishna District Primary Relief Shelter", location: "Vijayawada, Andhra Pradesh", capacity: 250, occupied: 195, status: "Active" },
    { id: 2, name: "Chennai Coastal Cyclone Refuge Centre", location: "Marina Coast, Chennai, Tamil Nadu", capacity: 400, occupied: 310, status: "Active" },
    { id: 3, name: "Wayanad High Ground Emergency Camp", location: "Meppadi, Wayanad, Kerala", capacity: 180, occupied: 145, status: "Active" },
    { id: 4, name: "Cuttack Flood Relief School Campus", location: "Cuttack, Odisha", capacity: 200, occupied: 80, status: "Active" },
    { id: 5, name: "Surat Central Community Disaster Depot", location: "Surat, Gujarat", capacity: 300, occupied: 45, status: "Active" },
    { id: 6, name: "Patna Ganga Basin Relief Shelter", location: "Patna, Bihar", capacity: 220, occupied: 67, status: "Active" }
];

function renderSheltersView() {
    const container = document.getElementById("sheltersContainer");
    if (!container) return;

    let shelters = JSON.parse(localStorage.getItem("disasterSheltersData") || "null");
    if (!shelters) {
        shelters = defaultSheltersData;
        localStorage.setItem("disasterSheltersData", JSON.stringify(shelters));
    }

    container.innerHTML = shelters.map(function (shelter) {
        const percent = Math.min(100, Math.round((shelter.occupied / shelter.capacity) * 100));
        const free = Math.max(0, shelter.capacity - shelter.occupied);
        const isHigh = percent >= 75;

        return `<div class="col-md-6 col-lg-4">
            <div class="shelter-card">
                <div class="shelter-card-top">
                    <div>
                        <strong class="d-block mb-1" style="font-size: 13px;">${escapeHtml(shelter.name)}</strong>
                        <small class="text-muted"><i class="bi bi-geo-alt"></i> ${escapeHtml(shelter.location)}</small>
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
                    <span class="small text-muted">Total: ${shelter.capacity} beds</span>
                    <button class="btn btn-sm btn-outline-primary py-0 px-2 update-shelter-btn" data-id="${shelter.id}">
                        <i class="bi bi-pencil-square"></i> Update Beds
                    </button>
                </div>
            </div>
        </div>`;
    }).join("");
}

const sheltersContainerEl = document.getElementById("sheltersContainer");
if (sheltersContainerEl) {
    sheltersContainerEl.addEventListener("click", function (event) {
        const btn = event.target.closest(".update-shelter-btn");
        if (!btn) return;
        const id = Number(btn.dataset.id);
        const shelters = JSON.parse(localStorage.getItem("disasterSheltersData") || "[]");
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
        localStorage.setItem("disasterSheltersData", JSON.stringify(shelters));
        renderSheltersView();
        showDashboardMessage(`${shelter.name} capacity updated.`);
    });
}

const addNewShelterBtn = document.getElementById("addNewShelterBtn");
if (addNewShelterBtn) {
    addNewShelterBtn.addEventListener("click", function () {
        const name = window.prompt("New Shelter / Relief Camp Name:");
        if (!name) return;
        const location = window.prompt("Location & District:") || "India";
        const capacity = parseInt(window.prompt("Total Bed Capacity (e.g. 200):") || "200", 10);

        const shelters = JSON.parse(localStorage.getItem("disasterSheltersData") || JSON.stringify(defaultSheltersData));
        shelters.push({
            id: Date.now(),
            name: name.trim(),
            location: location.trim(),
            capacity: capacity || 200,
            occupied: 0,
            status: "Active"
        });
        localStorage.setItem("disasterSheltersData", JSON.stringify(shelters));
        renderSheltersView();
        showDashboardMessage(`Shelter ${name} registered.`);
    });
}

// ==========================================
// VIEW 7: RELIEF INVENTORY & SUPPLIES
// ==========================================
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

function renderInventoryView() {
    const container = document.getElementById("inventoryContainer");
    if (!container) return;

    let items = JSON.parse(localStorage.getItem("disasterReliefInventory") || "null");
    if (!items) {
        items = defaultInventoryData;
        localStorage.setItem("disasterReliefInventory", JSON.stringify(items));
    }

    container.innerHTML = items.map(function (item) {
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

const inventoryContainerEl = document.getElementById("inventoryContainer");
if (inventoryContainerEl) {
    inventoryContainerEl.addEventListener("click", function (event) {
        const btn = event.target.closest(".inv-adjust");
        if (!btn) return;
        const id = Number(btn.dataset.id);
        const delta = Number(btn.dataset.delta);
        const items = JSON.parse(localStorage.getItem("disasterReliefInventory") || "[]");
        const item = items.find(function (i) { return i.id === id; });
        if (!item) return;

        item.stock = Math.max(0, item.stock + delta);
        localStorage.setItem("disasterReliefInventory", JSON.stringify(items));
        renderInventoryView();
        showDashboardMessage(`${item.item} stock updated to ${item.stock}.`);
    });
}

const restockBtn = document.getElementById("restockInventoryBtn");
if (restockBtn) {
    restockBtn.addEventListener("click", function () {
        const items = JSON.parse(localStorage.getItem("disasterReliefInventory") || JSON.stringify(defaultInventoryData));
        items.forEach(function (i) { i.stock += 100; });
        localStorage.setItem("disasterReliefInventory", JSON.stringify(items));
        renderInventoryView();
        showDashboardMessage("All relief inventory restocked (+100 to all items).");
    });
}

// ==========================================
// VIEW 9: OPERATIONS REPORTS & ANALYTICS
// ==========================================
function renderReportsView() {
    const container = document.getElementById("reportsContainer");
    if (!container) return;

    const allRequests = readRecords("disasterHelpRequests");
    const allVolunteers = readRecords("disasterVolunteers");
    const allDonations = readRecords("disasterDonations");

    const criticalCount = allRequests.filter(function (r) { return r.priority === "Critical"; }).length;
    const resolvedCount = allRequests.filter(function (r) { return r.status === "Resolved"; }).length;
    const assignedVolCount = allVolunteers.filter(function (v) { return v.status === "Assigned"; }).length;

    container.innerHTML = `
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-red"><i class="bi bi-telephone-inbound-fill"></i></div>
                <div>
                    <span>Total Help Inquiries</span>
                    <strong>${allRequests.length}</strong>
                    <small class="trend-up">Verified submissions</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-orange"><i class="bi bi-shield-fill-exclamation"></i></div>
                <div>
                    <span>Critical Incidents</span>
                    <strong>${criticalCount}</strong>
                    <small class="trend-down">Priority rescue cases</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-green"><i class="bi bi-check2-all"></i></div>
                <div>
                    <span>Successfully Resolved</span>
                    <strong>${resolvedCount}</strong>
                    <small class="trend-up">Closed relief cases</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon stat-blue"><i class="bi bi-person-walking"></i></div>
                <div>
                    <span>Volunteers on Mission</span>
                    <strong>${assignedVolCount}</strong>
                    <small class="trend-up">Active in the field</small>
                </div>
            </div>
        </div>

        <div class="col-12 mt-3">
            <div class="panel">
                <div class="panel-heading"><div><span class="eyebrow">AUDIT SUMMARY</span><h3>National Response Ledger</h3></div></div>
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
                                <td>${allRequests.filter(function(r) { return (r.disasterType || '').toLowerCase().includes('flood'); }).length} cases</td>
                                <td>${assignedVolCount} responders</td>
                                <td><span class="status-pill progress">Active Monitoring</span></td>
                                <td><strong class="text-success">High Preparedness</strong></td>
                            </tr>
                            <tr>
                                <td><strong>Cyclone & Coastal Storms</strong></td>
                                <td>${allRequests.filter(function(r) { return (r.disasterType || '').toLowerCase().includes('cyclone'); }).length} cases</td>
                                <td>Medical & Food Teams</td>
                                <td><span class="status-pill verified">Advisories Active</span></td>
                                <td><strong class="text-success">Shelters Active</strong></td>
                            </tr>
                            <tr>
                                <td><strong>Landslides & Debris Flow</strong></td>
                                <td>${allRequests.filter(function(r) { return (r.disasterType || '').toLowerCase().includes('landslide'); }).length} cases</td>
                                <td>Quick Response Units</td>
                                <td><span class="status-pill critical">Evacuation in Progress</span></td>
                                <td><strong class="text-warning">Standby</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Download Operations CSV
function downloadCsvFile(csvContent, filename) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showDashboardMessage(`Downloaded ${filename}.`);
}

const exportRequestsCsvBtn = document.getElementById("exportRequestsCsv");
if (exportRequestsCsvBtn) {
    exportRequestsCsvBtn.addEventListener("click", function () {
        const requests = recordsForAdmin("disasterHelpRequests");
        let csv = "Track ID,Name,Father Name,Mobile,Location,Disaster,Help,Priority,Status,Created At\n";
        requests.forEach(function (r) {
            csv += `"${r.trackId || r.id}","${r.name || ''}","${r.fatherName || ''}","${r.mobileNumber || ''}","${r.village || r.location || ''}","${r.disasterType || ''}","${r.help || ''}","${r.priority || ''}","${r.status || ''}","${r.createdAt || ''}"\n`;
        });
        downloadCsvFile(csv, "Disaster_Help_Requests.csv");
    });
}

const downloadFullReportBtn = document.getElementById("downloadFullReportBtn");
if (downloadFullReportBtn) {
    downloadFullReportBtn.addEventListener("click", function () {
        const requests = recordsForAdmin("disasterHelpRequests");
        const volunteers = recordsForAdmin("disasterVolunteers");
        let csv = "RECORD_TYPE,ID,NAME,CONTACT,LOCATION,DETAILS,STATUS\n";
        requests.forEach(function (r) {
            csv += `"HELP_REQUEST","${r.trackId || r.id}","${r.name || ''}","${r.mobileNumber || ''}","${r.village || r.district || ''}","${r.disasterType || ''} - ${r.help || ''}","${r.status || ''}"\n`;
        });
        volunteers.forEach(function (v) {
            csv += `"VOLUNTEER","VOL-${v.id}","${v.name || ''}","${v.phone || ''}","${v.district || ''}, ${v.state || ''}","${v.skills || ''}","${v.status || ''}"\n`;
        });
        downloadCsvFile(csv, "Comprehensive_Operations_Log.csv");
    });
}

// Global modal close handler for both modals
document.querySelectorAll("[data-bs-dismiss='modal']").forEach(function (button) {
    button.addEventListener("click", function () {
        hideOverviewModal();
        hideVolunteerOverviewModal();
    });
});

document.getElementById("applyJurisdiction").addEventListener("click", function () {
    adminState = document.getElementById("adminState").value;
    adminDistrict = document.getElementById("adminDistrict").value.trim();
    localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: adminState, district: adminDistrict }));
    const p = document.querySelector(".welcome-row p");
    if (p) {
        p.textContent = adminState === "all" ? "Here is the latest overview of emergency operations across India." : `Showing operations for ${adminDistrict || "all districts"}, ${adminState}.`;
    }
    renderRequests();
    renderVolunteers();
    renderVolunteersFullTable();
    renderVolunteerAssignmentMatrix();
    renderDonations();
    renderRegistrations();
    showDashboardMessage("Admin jurisdiction updated.");
});

document.getElementById("requestSearch").addEventListener("input", filterRequests);
document.getElementById("priorityFilter").addEventListener("change", filterRequests);
document.getElementById("statusFilter").addEventListener("change", filterRequests);
// Handle alert removal across alert containers
document.addEventListener("click", function (event) {
    const newAlertBtn = event.target.closest("[data-action='new-alert']");
    if (newAlertBtn) {
        event.preventDefault();
        createAlert();
        return;
    }

    const removeBtn = event.target.closest(".remove-alert");
    if (removeBtn) {
        event.preventDefault();
        const alerts = readRecords("disasterAlerts");
        const alertIndex = alerts.findIndex(function (item) { return String(item.id) === removeBtn.dataset.id; });
        if (alertIndex >= 0) {
            alerts.splice(alertIndex, 1);
            writeRecords("disasterAlerts", alerts);
            renderAlerts();
            showDashboardMessage("Alert removed.");
        }
    }
});

// Interactive Table Row & Actions Delegation for Help Requests
document.getElementById("requestTable").addEventListener("click", function (event) {
    const statusBtn = event.target.closest(".request-status-button");
    if (statusBtn) {
        event.stopPropagation();
        const requestId = statusBtn.dataset.id || statusBtn.closest("tr").dataset.id;
        advanceRequestStatus(requestId);
        return;
    }
    const proofLink = event.target.closest(".proof-link");
    if (proofLink) return;

    const row = event.target.closest("tr");
    if (row && row.dataset.id) {
        openRequestOverview(row.dataset.id);
    }
});

// Dashboard snapshot table click delegation
const dashReqTable = document.getElementById("dashRequestTable");
if (dashReqTable) {
    dashReqTable.addEventListener("click", function (event) {
        const row = event.target.closest("tr");
        if (row && row.dataset.id) {
            openRequestOverview(row.dataset.id);
        }
    });
}

// Modal Event Listeners
document.getElementById("modalSaveUpdatesBtn").addEventListener("click", saveModalUpdates);
document.getElementById("modalQuickResolveBtn").addEventListener("click", quickResolveModal);
document.getElementById("modalPrintBtn").addEventListener("click", function () {
    window.print();
});

document.getElementById("volunteerSubmissions").addEventListener("click", function (event) {
    const button = event.target.closest(".assign-volunteer");
    if (!button) return;
    const volunteers = readRecords("disasterVolunteers");
    const record = volunteers.find(function (item) { return String(item.id) === button.dataset.id; });
    if (!record) return;
    record.status = "Assigned";
    writeRecords("disasterVolunteers", volunteers);
    renderVolunteers();
    renderVolunteersFullTable();
    showDashboardMessage("Volunteer marked as assigned.");
});

document.getElementById("donationSubmissions").addEventListener("click", function (event) {
    const button = event.target.closest(".mark-donation");
    if (!button) return;
    const donations = readRecords("disasterDonations");
    const record = donations.find(function (item) { return String(item.id) === button.dataset.id; });
    if (!record) return;
    record.status = record.status === "Registered" ? "Received" : "Registered";
    writeRecords("disasterDonations", donations);
    renderDonations();
    showDashboardMessage("Donation status updated.");
});

document.getElementById("clearSubmissions").addEventListener("click", function () {
    ["disasterDonations", "disasterRegistrations"].forEach(function (key) {
        const remaining = readRecords(key).filter(function (record) {
            const stateMatches = adminState === "all" || record.state === adminState;
            const districtMatches = !adminDistrict || (record.district || "").toLowerCase() === adminDistrict.toLowerCase();
            return !(stateMatches && districtMatches);
        });
        writeRecords(key, remaining);
    });
    renderDonations();
    renderRegistrations();
    showDashboardMessage("Completed donation and registration records cleared.");
});

// ==========================================
// ADMIN PROFILE MANAGEMENT (PHOTO & ALL DETAILS)
// ==========================================
let adminProfileModalInstance = null;
let currentAdminPhotoDraft = null;

function getAdminProfile() {
    let profile = JSON.parse(localStorage.getItem("disasterAdminProfile") || "null");
    if (!profile) {
        const legacyName = localStorage.getItem("disasterAdminName");
        profile = {
            name: legacyName || "Rajeshwar Rao, IAS",
            role: "Senior Disaster Operations Controller",
            officerId: "ADM-NDRF-8842",
            department: "National Disaster Management Authority (NDMA)",
            email: "admin.ops@disaster-relief.gov.in",
            phone: "+91 98765 00100",
            state: adminState || "all",
            district: adminDistrict || "",
            clearance: "Level 5 - Command & Dispatch Authority",
            dutyStatus: "Active Duty / Operational",
            photo: defaultAdminPhotoSvg
        };
        localStorage.setItem("disasterAdminProfile", JSON.stringify(profile));
    }
    return profile;
}

function renderAdminTopBarProfile() {
    const profile = getAdminProfile();
    const nameEl = document.getElementById("adminName");
    const roleEl = document.getElementById("adminRoleSubtitle");
    const photoEl = document.getElementById("adminTopPhoto");
    const initialsEl = document.getElementById("adminTopInitials");

    if (nameEl) nameEl.textContent = profile.name || "Administrator";
    if (roleEl) roleEl.textContent = profile.role ? (profile.role.length > 26 ? profile.role.slice(0, 26) + "..." : profile.role) : "System Controller";

    const initials = (profile.name || "AD").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "AD";
    if (initialsEl) initialsEl.textContent = initials;

    if (profile.photo) {
        if (photoEl) {
            photoEl.src = profile.photo;
            photoEl.style.display = "block";
        }
        if (initialsEl) initialsEl.style.display = "none";
    } else {
        if (photoEl) photoEl.style.display = "none";
        if (initialsEl) initialsEl.style.display = "inline-flex";
    }
}

function openAdminProfileModal() {
    const profile = getAdminProfile();
    currentAdminPhotoDraft = profile.photo || "";

    // Set Hero fields
    const heroName = document.getElementById("adminModalHeroName");
    const heroRole = document.getElementById("adminModalHeroRole");
    const heroJurisdiction = document.getElementById("adminModalHeroJurisdiction");
    const badgeId = document.getElementById("adminModalBadgeId");
    const photoImg = document.getElementById("adminModalPhotoImg");
    const photoInitials = document.getElementById("adminModalPhotoInitials");

    if (heroName) heroName.textContent = profile.name || "Administrator";
    if (heroRole) heroRole.textContent = `${profile.role || "Controller"} · ${profile.department || "NDMA"}`;
    if (heroJurisdiction) heroJurisdiction.textContent = (profile.state && profile.state !== "all") ? `${profile.district || "All Districts"}, ${profile.state}` : "All India Operations";
    if (badgeId) badgeId.textContent = profile.officerId || "ADM-NDRF-8842";

    const initials = (profile.name || "AD").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "AD";
    if (photoInitials) photoInitials.textContent = initials;

    if (profile.photo) {
        if (photoImg) {
            photoImg.src = profile.photo;
            photoImg.style.display = "block";
        }
        if (photoInitials) photoInitials.style.display = "none";
    } else {
        if (photoImg) photoImg.style.display = "none";
        if (photoInitials) photoInitials.style.display = "flex";
    }

    // Set Form inputs
    const setVal = function (id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    };

    setVal("adminInputFullName", profile.name);
    setVal("adminInputRole", profile.role);
    setVal("adminInputDept", profile.department);
    setVal("adminInputOfficerId", profile.officerId);
    setVal("adminInputEmail", profile.email);
    setVal("adminInputPhone", profile.phone);
    setVal("adminInputState", profile.state || "all");
    setVal("adminInputDistrict", profile.district);
    setVal("adminInputClearance", profile.clearance);
    setVal("adminInputDutyStatus", profile.dutyStatus);

    const sessionEl = document.getElementById("adminSessionTime");
    if (sessionEl) sessionEl.textContent = new Date().toLocaleString();

    // Show modal
    const modalEl = document.getElementById("adminProfileModal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        if (!adminProfileModalInstance) {
            adminProfileModalInstance = new bootstrap.Modal(modalEl);
        }
        adminProfileModalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
        document.body.classList.add("modal-open");
    }
}

function saveAdminProfile() {
    const profile = getAdminProfile();

    const fullName = document.getElementById("adminInputFullName").value.trim() || "Administrator";
    const role = document.getElementById("adminInputRole").value.trim() || "Senior Disaster Operations Controller";
    const dept = document.getElementById("adminInputDept").value.trim() || "National Disaster Management Authority (NDMA)";
    const officerId = document.getElementById("adminInputOfficerId").value.trim() || "ADM-NDRF-8842";
    const email = document.getElementById("adminInputEmail").value.trim() || "admin.ops@disaster-relief.gov.in";
    const phone = document.getElementById("adminInputPhone").value.trim() || "+91 98765 00100";
    const state = document.getElementById("adminInputState").value || "all";
    const district = document.getElementById("adminInputDistrict").value.trim();
    const clearance = document.getElementById("adminInputClearance").value;
    const dutyStatus = document.getElementById("adminInputDutyStatus").value;

    profile.name = fullName;
    profile.role = role;
    profile.department = dept;
    profile.officerId = officerId;
    profile.email = email;
    profile.phone = phone;
    profile.state = state;
    profile.district = district;
    profile.clearance = clearance;
    profile.dutyStatus = dutyStatus;
    if (currentAdminPhotoDraft !== null) {
        profile.photo = currentAdminPhotoDraft;
    }

    localStorage.setItem("disasterAdminProfile", JSON.stringify(profile));
    localStorage.setItem("disasterAdminName", fullName);

    // Sync topbar jurisdiction if changed
    if (state !== adminState || district !== adminDistrict) {
        adminState = state;
        adminDistrict = district;
        localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: adminState, district: adminDistrict }));
        const stateSelect = document.getElementById("adminState");
        const districtInput = document.getElementById("adminDistrict");
        if (stateSelect) stateSelect.value = adminState;
        if (districtInput) districtInput.value = adminDistrict;
        renderRequests();
        renderVolunteersFullTable();
        renderVolunteers();
        renderDonations();
        renderRegistrations();
    }

    renderAdminTopBarProfile();

    const modalEl = document.getElementById("adminProfileModal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    } else {
        modalEl.classList.remove("show");
        modalEl.style.display = "none";
        document.body.classList.remove("modal-open");
    }

    showDashboardMessage(`Admin profile saved: ${fullName} (${officerId}).`);
}

// Profile Button click opens full Admin Profile Overview Modal
const adminProfileBtn = document.getElementById("profileButton");
if (adminProfileBtn) {
    adminProfileBtn.addEventListener("click", function () {
        openAdminProfileModal();
    });
}

// Admin Photo Upload Handler
const adminPhotoFileInput = document.getElementById("adminPhotoFileInput");
if (adminPhotoFileInput) {
    adminPhotoFileInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            currentAdminPhotoDraft = evt.target.result;
            const photoImg = document.getElementById("adminModalPhotoImg");
            const photoInitials = document.getElementById("adminModalPhotoInitials");
            if (photoImg) {
                photoImg.src = currentAdminPhotoDraft;
                photoImg.style.display = "block";
            }
            if (photoInitials) photoInitials.style.display = "none";
            showDashboardMessage("Photo preview updated. Click 'Save Administrator Profile' to apply.");
        };
        reader.readAsDataURL(file);
    });
}

const adminUploadTriggerBtn = document.getElementById("adminUploadTriggerBtn");
if (adminUploadTriggerBtn && adminPhotoFileInput) {
    adminUploadTriggerBtn.addEventListener("click", function () {
        adminPhotoFileInput.click();
    });
}

const adminRemovePhotoBtn = document.getElementById("adminRemovePhotoBtn");
if (adminRemovePhotoBtn) {
    adminRemovePhotoBtn.addEventListener("click", function () {
        currentAdminPhotoDraft = "";
        const photoImg = document.getElementById("adminModalPhotoImg");
        const photoInitials = document.getElementById("adminModalPhotoInitials");
        if (photoImg) photoImg.style.display = "none";
        if (photoInitials) photoInitials.style.display = "flex";
        showDashboardMessage("Photo removed. Initials will be used.");
    });
}

const adminResetProfileBtn = document.getElementById("adminResetProfileBtn");
if (adminResetProfileBtn) {
    adminResetProfileBtn.addEventListener("click", function () {
        if (!window.confirm("Reset administrator profile to system defaults?")) return;
        currentAdminPhotoDraft = defaultAdminPhotoSvg;
        localStorage.removeItem("disasterAdminProfile");
        localStorage.removeItem("disasterAdminName");
        openAdminProfileModal();
        renderAdminTopBarProfile();
        showDashboardMessage("Administrator profile reset to system default.");
    });
}

const saveAdminProfileBtn = document.getElementById("saveAdminProfileBtn");
if (saveAdminProfileBtn) {
    saveAdminProfileBtn.addEventListener("click", saveAdminProfile);
}

document.getElementById("logoutButton").addEventListener("click", async function () {
    window.location.href = "index.html";
});

// Cross-tab and same-context real-time listeners
window.addEventListener("storage", function (event) {
    if (!event.key || event.key === "disasterHelpRequests") {
        checkForNewRequests(true);
        renderAnnualStatements();
    }
    if (!event.key || event.key === "disasterVolunteers") {
        renderVolunteers();
        renderVolunteersFullTable();
        renderDashMandalVolunteers();
        renderMandalsView();
    }
    if (!event.key || event.key === "disasterMandalAccounts") {
        renderDashMandalVolunteers();
        renderMandalsView();
    }
    if (!event.key || event.key === "disasterDonations") {
        renderDonations();
    }
    if (!event.key || event.key === "disasterRegistrations") {
        renderRegistrations();
    }
    if (!event.key || event.key === "disasterAlerts") {
        renderAlerts();
    }
    if (!event.key || event.key === "disasterAdminProfile" || event.key === "disasterAdminName") {
        renderAdminTopBarProfile();
    }
});

// Periodic real-time check for same-origin submissions
setInterval(function () {
    checkForNewRequests(true);
}, 2500);

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
// SECTION: OFFICIAL DUAL-SIDED VOLUNTEER ID CARD
// ==========================================
let idCardModalInstance = null;

function openVolunteerIdCard(volunteerId) {
    const volunteers = readRecords("disasterVolunteers");
    const vol = volunteers.find(function (v) { return String(v.id) === String(volunteerId); });
    if (!vol) return;

    const modalEl = document.getElementById("volunteerIdCardModal");
    if (!modalEl) return;

    const photoSrc = getVolunteerPhotoSrc(vol);
    const photoImg = document.getElementById("idCardPhotoImg");
    const photoInitials = document.getElementById("idCardPhotoInitials");
    const initials = (vol.name || "VO").split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase() || "VO";

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

    // Front details
    document.getElementById("idCardName").textContent = vol.name || "__________________";
    document.getElementById("idCardVolId").textContent = frontId;
    document.getElementById("idCardDistrict").textContent = vol.district || adminDistrict || "__________________";
    document.getElementById("idCardMandal").textContent = vol.mandal || "Vijayawada Rural";
    document.getElementById("idCardRole").textContent = "Disaster Relief Volunteer";
    document.getElementById("idCardBloodGroup").textContent = vol.bloodGroup || (Number(vol.id) % 2 === 0 ? "B+" : "O+");
    document.getElementById("idCardMobile").textContent = vol.phone || vol.mobileNumber || "__________________";

    const currentYear = new Date().getFullYear();
    document.getElementById("idCardValidFrom").textContent = `01/01/${currentYear}`;
    document.getElementById("idCardValidUntil").textContent = `31/12/${currentYear + 1}`;

    // Back details
    document.getElementById("idCardBackVolId").textContent = backId;
    document.getElementById("idCardBackDistrict").textContent = vol.district || adminDistrict || "__________";
    document.getElementById("idCardBackMandal").textContent = vol.mandal || "Vijayawada Rural";

    const qrPayload = JSON.stringify({
        org: "DISASTER RELIEF MANAGEMENT",
        id: frontId,
        backId: backId,
        name: vol.name,
        district: vol.district || adminDistrict,
        mandal: vol.mandal,
        emergency: "112",
        status: "Authorized Responder"
    });
    const qrContainer = document.getElementById("idCardQrCodeSvg");
    if (qrContainer) {
        qrContainer.innerHTML = generateInlineQrSvg(qrPayload);
    }

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        if (!idCardModalInstance) {
            idCardModalInstance = new bootstrap.Modal(modalEl);
        }
        idCardModalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
        document.body.classList.add("modal-open");
    }
}
window.openVolunteerIdCard = openVolunteerIdCard;

const idCardPrintTriggerBtn = document.getElementById("idCardPrintTriggerBtn");
if (idCardPrintTriggerBtn) {
    idCardPrintTriggerBtn.addEventListener("click", function () {
        window.print();
    });
}

// ==========================================
// SECTION: LIVE WEATHER REPORT WIDGET
// ==========================================
async function loadAdminLiveWeather() {
    const tempEl = document.getElementById("adminWeatherTemp");
    const condEl = document.getElementById("adminWeatherCondition");
    const badgeEl = document.getElementById("adminWeatherBadge");
    const iconEl = document.getElementById("adminWeatherIcon");
    if (!tempEl || !condEl) return;

    const districtCoords = {
        "krishna": { lat: 16.5062, lon: 80.6480, name: "Krishna" },
        "chennai": { lat: 13.0827, lon: 80.2707, name: "Chennai" },
        "wayanad": { lat: 11.6854, lon: 76.1320, name: "Wayanad" },
        "guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
        "visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" }
    };

    const key = (adminDistrict || "krishna").toLowerCase().trim();
    const loc = districtCoords[key] || { lat: 16.5062, lon: 80.6480, name: adminDistrict || "District" };

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        if (!res.ok) throw new Error("Weather HTTP " + res.status);
        const data = await res.json();
        const current = data.current_weather;
        if (!current) throw new Error("No current_weather payload");

        const temp = Math.round(current.temperature);
        const wind = current.windspeed;
        const code = current.weathercode;

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
        condEl.textContent = `${condition} · ${adminDistrict || "District"}`;
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
        condEl.textContent = `Scattered Rain · ${adminDistrict || "Krishna"}`;
        if (badgeEl) {
            badgeEl.className = "badge bg-danger text-white py-0 px-1";
            badgeEl.textContent = "Rain Watch";
            badgeEl.style.fontSize = "8.5px";
        }
        if (iconEl) {
            iconEl.innerHTML = '<i class="bi bi-cloud-rain-fill text-info"></i>';
        }
    }
}

const refreshWeatherBtn = document.getElementById("refreshWeatherBtn");
if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener("click", function () {
        loadAdminLiveWeather();
        showDashboardMessage("Live weather report updated.");
    });
}

// ==========================================
// SECTION: DISTRICT VOLUNTEER BREAKDOWN IN DASHBOARD
// ==========================================
function renderDashMandalVolunteers() {
    const listEl = document.getElementById("dashMandalVolunteersList");
    if (!listEl) return;

    const allVolunteers = readRecords("disasterVolunteers");
    const allRequests = readRecords("disasterHelpRequests");
    const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");

    const currentDist = (adminDistrict || "Krishna").trim();
    const mandalsList = getAdminMandalsList(currentDist);

    const districtVolunteers = allVolunteers.filter(function (v) {
        return (v.district || "").toLowerCase() === currentDist.toLowerCase();
    });

    const totalDistVolunteers = districtVolunteers.length;
    const totalDistVolEl = document.getElementById("dashTotalDistrictVolunteers");
    if (totalDistVolEl) totalDistVolEl.textContent = totalDistVolunteers;

    const titleEl = document.getElementById("dashDistrictVolTitle");
    if (titleEl) titleEl.textContent = `Volunteers in ${currentDist} Mandals`;

    const distText = document.getElementById("dashCurrentDistrictText");
    if (distText) distText.textContent = currentDist;
    const stateText = document.getElementById("dashCurrentStateText");
    if (stateText) stateText.textContent = adminState || "Andhra Pradesh";

    let activeMandalsCount = 0;
    let pendingApprovalsCount = 0;

    const cardsHtml = mandalsList.map(function (mandalName) {
        const volInMandal = districtVolunteers.filter(function (v) {
            return (v.mandal || "").toLowerCase() === mandalName.toLowerCase();
        }).length;

        const reqInMandal = allRequests.filter(function (r) {
            return (r.district || "").toLowerCase() === currentDist.toLowerCase() &&
                   (r.mandal || "").toLowerCase() === mandalName.toLowerCase() &&
                   r.status !== "Resolved";
        }).length;

        const account = mandalAccounts.find(function (acc) {
            return (acc.district || "").toLowerCase() === currentDist.toLowerCase() &&
                   (acc.mandal || "").toLowerCase() === mandalName.toLowerCase();
        });

        let statusClass = "unprovisioned";
        let statusText = "No Login";
        if (account) {
            if (account.status === "Approved") {
                statusClass = "approved";
                statusText = "Login Active";
                activeMandalsCount++;
            } else if (account.status === "Pending") {
                statusClass = "pending";
                statusText = "Pending Approval";
                pendingApprovalsCount++;
            }
        }

        return `
            <div class="col-sm-6 col-md-4">
                <div class="p-2 border rounded bg-white h-100 d-flex flex-column justify-content-between" style="font-size: 12px; cursor: pointer;" onclick="openMandalActivitiesModal('${escapeHtml(mandalName)}')">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <strong class="text-dark">${escapeHtml(mandalName)}</strong>
                        <span class="mandal-status-badge mandal-status-${statusClass}" style="font-size: 9px; padding: 1px 6px;">${statusText}</span>
                    </div>
                    <div class="d-flex justify-content-between text-muted mt-1">
                        <span><i class="bi bi-people-fill text-primary me-1"></i><strong>${volInMandal}</strong> vols</span>
                        <span><i class="bi bi-clipboard2-pulse-fill text-danger me-1"></i><strong>${reqInMandal}</strong> reqs</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    listEl.innerHTML = cardsHtml;
    const activeMandalsEl = document.getElementById("dashActiveMandalsCount");
    if (activeMandalsEl) activeMandalsEl.textContent = activeMandalsCount;

    const pendingBadge = document.getElementById("dashPendingMandalBadge");
    if (pendingBadge) {
        if (pendingApprovalsCount > 0) {
            pendingBadge.style.display = "inline-block";
            pendingBadge.innerHTML = `<i class="bi bi-bell-fill"></i> ${pendingApprovalsCount} Pending Approval${pendingApprovalsCount > 1 ? 's' : ''}`;
        } else {
            pendingBadge.style.display = "none";
        }
    }

    const loginStatusEl = document.getElementById("dashMandalsLoginStatus");
    if (loginStatusEl) {
        loginStatusEl.textContent = `${activeMandalsCount} Desks Active · ${pendingApprovalsCount} Pending`;
    }
}

// ==========================================
// SECTION: MANDALS DIRECTORY & LOGIN MANAGEMENT
// ==========================================
function renderMandalsView() {
    const currentDist = (adminDistrict || "Krishna").trim();
    const mandalsList = getAdminMandalsList(currentDist);
    const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
    const allVolunteers = readRecords("disasterVolunteers");
    const allRequests = readRecords("disasterHelpRequests");

    const districtVolunteers = allVolunteers.filter(function (v) {
        return (v.district || "").toLowerCase() === currentDist.toLowerCase();
    });
    const districtRequests = allRequests.filter(function (r) {
        return (r.district || "").toLowerCase() === currentDist.toLowerCase() && r.status !== "Resolved";
    });

    let approvedCount = 0;
    let pendingCount = 0;

    mandalAccounts.forEach(function (acc) {
        if ((acc.district || "").toLowerCase() === currentDist.toLowerCase()) {
            if (acc.status === "Approved") approvedCount++;
            else if (acc.status === "Pending") pendingCount++;
        }
    });

    // Update Statistics Cards
    const statTotalEl = document.getElementById("statTotalMandals");
    if (statTotalEl) statTotalEl.textContent = mandalsList.length;
    const statAppEl = document.getElementById("statApprovedMandals");
    if (statAppEl) statAppEl.textContent = approvedCount;
    const statPendEl = document.getElementById("statPendingMandals");
    if (statPendEl) statPendEl.textContent = pendingCount;
    const statDistVolEl = document.getElementById("statDistrictVolunteers");
    if (statDistVolEl) statDistVolEl.textContent = districtVolunteers.length;
    const statMandalReqEl = document.getElementById("statMandalRequests");
    if (statMandalReqEl) statMandalReqEl.textContent = districtRequests.length;

    // Sidebar pending badge
    const navPendingEl = document.getElementById("navMandalsPendingCount");
    if (navPendingEl) {
        navPendingEl.textContent = pendingCount;
        if (pendingCount > 0) {
            navPendingEl.classList.add("bg-warning", "text-dark");
        } else {
            navPendingEl.classList.remove("bg-warning", "text-dark");
        }
    }

    const titleEl = document.getElementById("mandalsViewTitle");
    if (titleEl) titleEl.textContent = `${currentDist} District Mandals & Employee Logins`;
    const badgeEl = document.getElementById("mandalsBadgeCount");
    if (badgeEl) badgeEl.textContent = `${mandalsList.length} mandals`;

    // Filter controls
    const searchVal = (document.getElementById("mandalSearchInput") ? document.getElementById("mandalSearchInput").value : "").toLowerCase().trim();
    const approvalVal = document.getElementById("mandalApprovalFilter") ? document.getElementById("mandalApprovalFilter").value : "all";

    const tableBody = document.getElementById("mandalsTableBody");
    if (!tableBody) return;

    let visibleCount = 0;

    tableBody.innerHTML = mandalsList.map(function (mandalName) {
        const account = mandalAccounts.find(function (acc) {
            return (acc.district || "").toLowerCase() === currentDist.toLowerCase() &&
                   (acc.mandal || "").toLowerCase() === mandalName.toLowerCase();
        });

        const status = account ? (account.status || "Pending") : "Unprovisioned";
        const officerName = account ? (account.officerName || "Assigned Officer") : "—";
        const employeeId = account ? (account.employeeId || "—") : "—";
        const username = account ? (account.username || "—") : "—";
        const phone = account ? (account.phone || "—") : "—";

        const volCount = districtVolunteers.filter(function (v) {
            return (v.mandal || "").toLowerCase() === mandalName.toLowerCase();
        }).length;

        const reqCount = districtRequests.filter(function (r) {
            return (r.mandal || "").toLowerCase() === mandalName.toLowerCase();
        }).length;

        // Apply filters
        const matchesSearch = !searchVal || 
            mandalName.toLowerCase().includes(searchVal) ||
            officerName.toLowerCase().includes(searchVal) ||
            username.toLowerCase().includes(searchVal) ||
            employeeId.toLowerCase().includes(searchVal);

        const matchesStatus = approvalVal === "all" || status === approvalVal;

        if (!matchesSearch || !matchesStatus) return "";

        visibleCount++;

        let statusBadge = "";
        let actionButtons = "";

        if (status === "Approved") {
            statusBadge = '<span class="mandal-status-badge mandal-status-approved"><i class="bi bi-check-circle-fill me-1"></i> Approved</span>';
            actionButtons = `
                <button class="btn btn-sm btn-outline-primary py-1 px-2 view-mandal-act-btn" data-mandal="${escapeHtml(mandalName)}" title="View routed requests and volunteers">
                    <i class="bi bi-eye"></i> Activities
                </button>
                <button class="btn btn-sm btn-outline-secondary py-1 px-2 edit-mandal-cred-btn" data-id="${account.id}" title="Edit login credentials">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-warning py-1 px-2 revoke-mandal-cred-btn" data-id="${account.id}" title="Revoke approval (block login)">
                    <i class="bi bi-shield-x"></i> Revoke
                </button>
            `;
        } else if (status === "Pending") {
            statusBadge = '<span class="mandal-status-badge mandal-status-pending"><i class="bi bi-clock-history me-1"></i> Pending Approval</span>';
            actionButtons = `
                <button class="btn btn-sm btn-success py-1 px-2 approve-mandal-cred-btn" data-id="${account.id}" title="Approve Mandal / Employee Login">
                    <i class="bi bi-check2-circle"></i> Approve Login
                </button>
                <button class="btn btn-sm btn-outline-danger py-1 px-2 reject-mandal-cred-btn" data-id="${account.id}" title="Reject login request">
                    <i class="bi bi-x-circle"></i> Reject
                </button>
                <button class="btn btn-sm btn-outline-primary py-1 px-2 view-mandal-act-btn" data-mandal="${escapeHtml(mandalName)}" title="View details">
                    <i class="bi bi-eye"></i>
                </button>
            `;
        } else {
            statusBadge = '<span class="mandal-status-badge mandal-status-unprovisioned"><i class="bi bi-dash-circle me-1"></i> Not Provisioned</span>';
            actionButtons = `
                <button class="btn btn-sm btn-primary py-1 px-2 provision-mandal-login-btn" data-mandal="${escapeHtml(mandalName)}" title="Provision Login for this Mandal">
                    <i class="bi bi-person-plus-fill"></i> Provision Login
                </button>
            `;
        }

        return `
            <tr>
                <td><strong>${escapeHtml(mandalName)}</strong><br><small class="text-muted">${escapeHtml(currentDist)} District</small></td>
                <td><strong>${escapeHtml(officerName)}</strong></td>
                <td><span class="font-monospace">${escapeHtml(employeeId)}</span></td>
                <td><code class="text-primary font-monospace">${escapeHtml(username)}</code></td>
                <td><span class="font-monospace">${escapeHtml(phone)}</span></td>
                <td><span class="badge bg-light text-dark border">${volCount} volunteers</span></td>
                <td><span class="badge ${reqCount > 0 ? 'bg-danger text-white' : 'bg-light text-muted border'}">${reqCount} active</span></td>
                <td>${statusBadge}</td>
                <td style="text-align: right;">
                    <div class="d-flex align-items-center justify-content-end gap-1 flex-wrap">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    const emptyEl = document.getElementById("emptyMandalsState");
    if (emptyEl) emptyEl.style.display = visibleCount === 0 ? "block" : "none";
}

// Open Provision Modal
function openProvisionMandalModal(mandalName, existingAccountId) {
    const modalEl = document.getElementById("adminProvisionMandalModal");
    if (!modalEl) return;

    const currentDist = (adminDistrict || "Krishna").trim();
    const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
    const account = existingAccountId 
        ? mandalAccounts.find(function (a) { return String(a.id) === String(existingAccountId); })
        : null;

    document.getElementById("provMandalId").value = account ? account.id : "";
    document.getElementById("provMandalName").value = account ? account.mandal : (mandalName || "");
    document.getElementById("provDistrict").value = `${currentDist}, ${adminState || "Andhra Pradesh"}`;
    document.getElementById("provOfficerName").value = account ? account.officerName : "";
    document.getElementById("provEmployeeId").value = account ? account.employeeId : ("MND-" + Math.floor(1000 + Math.random() * 9000));
    document.getElementById("provPhone").value = account ? account.phone : "";
    
    const suggestedUsername = account ? account.username : ("mandal_" + (mandalName || "mandal").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 16));
    document.getElementById("provUsername").value = suggestedUsername;
    document.getElementById("provPassword").value = account ? account.password : "mandal123";
    document.getElementById("provStatusSelect").value = account ? account.status : "Approved";

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
    }
}
window.openProvisionMandalModal = openProvisionMandalModal;

// Open Mandal Activities & Routing Modal
let mandalActModalInstance = null;
function openMandalActivitiesModal(mandalName) {
    const modalEl = document.getElementById("mandalActivitiesModal");
    if (!modalEl) return;

    const currentDist = (adminDistrict || "Krishna").trim();
    const allRequests = readRecords("disasterHelpRequests");
    const allVolunteers = readRecords("disasterVolunteers");
    const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");

    const account = mandalAccounts.find(function (a) {
        return (a.district || "").toLowerCase() === currentDist.toLowerCase() &&
               (a.mandal || "").toLowerCase() === mandalName.toLowerCase();
    });

    const status = account ? account.status : "Unprovisioned";

    // Set Header
    document.getElementById("mandalActivitiesTitle").textContent = `${mandalName} Mandal Emergency Operations`;
    document.getElementById("mandalActivitiesDistrictBadge").textContent = `${currentDist} District`;
    const statusBadge = document.getElementById("mandalActivitiesStatusBadge");
    if (statusBadge) {
        statusBadge.className = `mandal-status-badge mandal-status-${status.toLowerCase()}`;
        statusBadge.textContent = status;
    }
    document.getElementById("mandalOfficerDisplay").textContent = account ? account.officerName : "Not Assigned";
    document.getElementById("mandalPhoneDisplay").textContent = account ? account.phone : "—";

    // Routed Requests for this mandal
    const routedRequests = allRequests.filter(function (r) {
        return (r.district || "").toLowerCase() === currentDist.toLowerCase() &&
               (r.mandal || "").toLowerCase() === mandalName.toLowerCase();
    });
    const routedVolunteers = allVolunteers.filter(function (v) {
        return (v.district || "").toLowerCase() === currentDist.toLowerCase() &&
               (v.mandal || "").toLowerCase() === mandalName.toLowerCase();
    });
    const resolvedInMandal = routedRequests.filter(function (r) { return r.status === "Resolved"; }).length;

    document.getElementById("mandalModalVolCount").textContent = routedVolunteers.length;
    document.getElementById("mandalModalReqCount").textContent = routedRequests.length;
    document.getElementById("mandalModalResolvedCount").textContent = resolvedInMandal;
    document.getElementById("mandalModalEmpId").textContent = account ? account.employeeId : "UNSET";

    // Populate Requests table
    const reqTable = document.getElementById("mandalModalRequestsTable");
    if (reqTable) {
        reqTable.innerHTML = routedRequests.length ? routedRequests.map(function (r) {
            const displayId = r.trackId || ("#" + String(r.id).slice(-6));
            return `
                <tr>
                    <td><strong>${escapeHtml(displayId)}</strong></td>
                    <td><strong>${escapeHtml(r.name || "N/A")}</strong></td>
                    <td><span class="font-monospace">${escapeHtml(r.mobileNumber || "N/A")}</span></td>
                    <td>${escapeHtml(r.village || r.location || "N/A")}</td>
                    <td><span class="badge bg-light text-dark border">${escapeHtml(r.disasterType || "Emergency")}</span></td>
                    <td>${escapeHtml(r.help || "General Aid")}</td>
                    <td><span class="status-pill ${String(r.priority || 'Medium').toLowerCase()}">${escapeHtml(r.priority || 'Medium')}</span></td>
                    <td><span class="status-pill ${String(r.status || 'Pending').toLowerCase()}">${escapeHtml(r.status || 'Pending')}</span></td>
                </tr>
            `;
        }).join("") : '<tr><td colspan="8" class="text-center text-muted py-3">No emergency requests originating from this mandal.</td></tr>';
    }

    // Populate Volunteers table
    const volTable = document.getElementById("mandalModalVolunteersTable");
    if (volTable) {
        volTable.innerHTML = routedVolunteers.length ? routedVolunteers.map(function (v) {
            return `
                <tr>
                    <td><span class="badge bg-secondary font-monospace">VOL-${v.id}</span></td>
                    <td><strong>${escapeHtml(v.name)}</strong></td>
                    <td><span class="font-monospace">${escapeHtml(v.phone || v.mobileNumber || "N/A")}</span></td>
                    <td>${escapeHtml(v.location || mandalName)}</td>
                    <td><small>${escapeHtml(v.skills || "Disaster Relief")}</small></td>
                    <td><span class="status-pill ${String(v.status || 'Available').toLowerCase()}">${escapeHtml(v.status || 'Available')}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-dark py-0 px-2" onclick="openVolunteerIdCard('${v.id}')">
                            <i class="bi bi-person-vcard"></i> ID Card
                        </button>
                    </td>
                </tr>
            `;
        }).join("") : '<tr><td colspan="7" class="text-center text-muted py-3">No registered volunteers stationed in this mandal.</td></tr>';
    }

    // Direct Credential Button
    const directCredBtn = document.getElementById("mandalManageLoginDirectBtn");
    if (directCredBtn) {
        directCredBtn.onclick = function () {
            if (mandalActModalInstance) mandalActModalInstance.hide();
            openProvisionMandalModal(mandalName, account ? account.id : null);
        };
    }

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        if (!mandalActModalInstance) mandalActModalInstance = new bootstrap.Modal(modalEl);
        mandalActModalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
    }
}
window.openMandalActivitiesModal = openMandalActivitiesModal;

// Mandals table event delegation
const mandalsTableBodyEl = document.getElementById("mandalsTableBody");
if (mandalsTableBodyEl) {
    mandalsTableBodyEl.addEventListener("click", function (e) {
        const approveBtn = e.target.closest(".approve-mandal-cred-btn");
        if (approveBtn) {
            e.stopPropagation();
            const id = approveBtn.dataset.id;
            const accounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
            const acc = accounts.find(function (a) { return String(a.id) === String(id); });
            if (acc) {
                acc.status = "Approved";
                acc.approvedBy = (document.getElementById("adminName") ? document.getElementById("adminName").textContent : "District Admin");
                acc.approvedAt = new Date().toLocaleString();
                localStorage.setItem("disasterMandalAccounts", JSON.stringify(accounts));
                renderMandalsView();
                renderDashMandalVolunteers();
                showDashboardMessage(`Login APPROVED for ${acc.mandal}! Employee (${acc.username}) can now sign in.`);
            }
            return;
        }

        const rejectBtn = e.target.closest(".reject-mandal-cred-btn") || e.target.closest(".revoke-mandal-cred-btn");
        if (rejectBtn) {
            e.stopPropagation();
            const id = rejectBtn.dataset.id;
            const accounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
            const acc = accounts.find(function (a) { return String(a.id) === String(id); });
            if (acc) {
                acc.status = "Pending";
                localStorage.setItem("disasterMandalAccounts", JSON.stringify(accounts));
                renderMandalsView();
                renderDashMandalVolunteers();
                showDashboardMessage(`Approval revoked for ${acc.mandal}. Login is now blocked.`);
            }
            return;
        }

        const editBtn = e.target.closest(".edit-mandal-cred-btn");
        if (editBtn) {
            e.stopPropagation();
            openProvisionMandalModal("", editBtn.dataset.id);
            return;
        }

        const provBtn = e.target.closest(".provision-mandal-login-btn");
        if (provBtn) {
            e.stopPropagation();
            openProvisionMandalModal(provBtn.dataset.mandal, null);
            return;
        }

        const actBtn = e.target.closest(".view-mandal-act-btn");
        if (actBtn) {
            e.stopPropagation();
            openMandalActivitiesModal(actBtn.dataset.mandal);
            return;
        }
    });
}

// Mandal Search and Filter listeners
const mandalSearchEl = document.getElementById("mandalSearchInput");
if (mandalSearchEl) mandalSearchEl.addEventListener("input", renderMandalsView);
const mandalFilterEl = document.getElementById("mandalApprovalFilter");
if (mandalFilterEl) mandalFilterEl.addEventListener("change", renderMandalsView);

// Provision Form Submission
const provForm = document.getElementById("adminProvisionMandalForm");
if (provForm) {
    provForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = document.getElementById("provMandalId").value;
        const mandalName = document.getElementById("provMandalName").value.trim();
        const officerName = document.getElementById("provOfficerName").value.trim();
        const employeeId = document.getElementById("provEmployeeId").value.trim();
        const phone = document.getElementById("provPhone").value.trim();
        const username = document.getElementById("provUsername").value.trim().toLowerCase();
        const password = document.getElementById("provPassword").value;
        const status = document.getElementById("provStatusSelect").value;

        const currentDist = (adminDistrict || "Krishna").trim();
        const accounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");

        if (id) {
            const acc = accounts.find(function (a) { return String(a.id) === String(id); });
            if (acc) {
                acc.officerName = officerName;
                acc.employeeId = employeeId;
                acc.phone = phone;
                acc.username = username;
                acc.password = password;
                acc.status = status;
                acc.updatedAt = new Date().toLocaleString();
            }
        } else {
            accounts.unshift({
                id: "mandal_" + Date.now(),
                mandal: mandalName,
                district: currentDist,
                state: adminState || "Andhra Pradesh",
                officerName: officerName,
                employeeId: employeeId,
                email: username + "@disaster-relief.gov.in",
                phone: phone,
                username: username,
                password: password,
                role: "Mandal Employee",
                status: status,
                approvedBy: status === "Approved" ? "District Admin" : null,
                approvedAt: status === "Approved" ? new Date().toLocaleString() : null,
                createdAt: new Date().toLocaleString()
            });
        }

        localStorage.setItem("disasterMandalAccounts", JSON.stringify(accounts));
        
        const modalEl = document.getElementById("adminProvisionMandalModal");
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();
        } else if (modalEl) {
            modalEl.classList.remove("show");
            modalEl.style.display = "none";
        }

        renderMandalsView();
        renderDashMandalVolunteers();
        showDashboardMessage(`Login credentials saved for ${mandalName} (${status}).`);
    });
}

const adminProvBtn = document.getElementById("adminProvisionNewMandalBtn");
if (adminProvBtn) {
    adminProvBtn.addEventListener("click", function () {
        const currentDist = (adminDistrict || "Krishna").trim();
        const mandalsList = getAdminMandalsList(currentDist);
        openProvisionMandalModal(mandalsList[0] || "Vijayawada Rural", null);
    });
}

const exportMandalsCsvBtn = document.getElementById("exportMandalsCsv");
if (exportMandalsCsvBtn) {
    exportMandalsCsvBtn.addEventListener("click", function () {
        const currentDist = (adminDistrict || "Krishna").trim();
        const mandalsList = getAdminMandalsList(currentDist);
        const accounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
        const allVolunteers = readRecords("disasterVolunteers");

        let csv = "Mandal,District,State,Officer In-Charge,Employee ID,Username,Phone,Approval Status,Volunteers Count\n";
        mandalsList.forEach(function (m) {
            const acc = accounts.find(function (a) {
                return (a.district || "").toLowerCase() === currentDist.toLowerCase() &&
                       (a.mandal || "").toLowerCase() === m.toLowerCase();
            });
            const volCount = allVolunteers.filter(function (v) {
                return (v.district || "").toLowerCase() === currentDist.toLowerCase() &&
                       (v.mandal || "").toLowerCase() === m.toLowerCase();
            }).length;

            csv += `"${m}","${currentDist}","${adminState || 'Andhra Pradesh'}","${acc ? acc.officerName : 'Unassigned'}","${acc ? acc.employeeId : '—'}","${acc ? acc.username : '—'}","${acc ? acc.phone : '—'}","${acc ? acc.status : 'Unprovisioned'}","${volCount}"\n`;
        });
        downloadCsvFile(csv, `District_${currentDist}_Mandals_Directory.csv`);
    });
}

// ==========================================
// SECTION: ANNUAL STATEMENTS OF RESOLVED REQUESTS
// ==========================================
function seedDefaultAnnualStatementsIfEmpty() {
    const requests = readRecords("disasterHelpRequests");
    const hasResolved = requests.some(function (r) { return r.status === "Resolved"; });
    if (hasResolved && requests.length >= 8) return;

    const historicalResolved = [
        {
            id: 1727000001000,
            trackId: "STM-2026-0412",
            name: "V. Raghava Rao",
            fatherName: "V. Subba Rao",
            mobileNumber: "9848123456",
            location: "Gollapudi Village",
            village: "Gollapudi Village",
            mandal: "Vijayawada Rural",
            district: "Krishna",
            state: "Andhra Pradesh",
            disasterType: "Flood Inundation",
            help: "Food and water, Evacuation Shelter",
            priority: "High",
            status: "Resolved",
            assignedVolunteer: { name: "Ramesh Kumar", phone: "9876543210" },
            resolvedDate: "12/03/2026, 04:15 PM",
            turnaroundHours: 3.2,
            livesSecured: 6,
            kitsDistributed: 12,
            resolutionYear: 2026,
            details: "Krishna river canal overflowed into residential wards. Evacuated 6 persons to relief center; food & rations distributed.",
            createdAt: "12/03/2026, 01:00 PM"
        },
        {
            id: 1727000002000,
            trackId: "STM-2026-0388",
            name: "Anand M.",
            fatherName: "Murugan M.",
            mobileNumber: "9444112233",
            location: "Kotturpuram",
            village: "Kotturpuram",
            mandal: "Mylapore",
            district: "Chennai",
            state: "Tamil Nadu",
            disasterType: "Cyclone Storm Surge",
            help: "Medical and first aid, Food and water",
            priority: "Critical",
            status: "Resolved",
            assignedVolunteer: { name: "Priya Sundaram", phone: "9876501234" },
            resolvedDate: "18/02/2026, 07:30 PM",
            turnaroundHours: 2.5,
            livesSecured: 14,
            kitsDistributed: 25,
            resolutionYear: 2026,
            details: "Medical supplies and clean water distributed to low-lying colony cut off by coastal storm surge.",
            createdAt: "18/02/2026, 05:00 PM"
        },
        {
            id: 1704067200000,
            trackId: "STM-2025-0914",
            name: "Devi Prasanna",
            fatherName: "M. Nageswara Rao",
            mobileNumber: "9988223344",
            location: "Gudivada Town",
            village: "Gudivada Town",
            mandal: "Gudivada",
            district: "Krishna",
            state: "Andhra Pradesh",
            disasterType: "Heavy Monsoonal Inundation",
            help: "Rescue boat, Essential Provisions",
            priority: "High",
            status: "Resolved",
            assignedVolunteer: { name: "Ramesh Kumar", phone: "9876543210" },
            resolvedDate: "14/09/2025, 06:00 PM",
            turnaroundHours: 4.1,
            livesSecured: 18,
            kitsDistributed: 35,
            resolutionYear: 2025,
            details: "Canal breach water mitigated via sandbagging. Emergency rations delivered.",
            createdAt: "14/09/2025, 01:50 PM"
        },
        {
            id: 1704067201000,
            trackId: "STM-2025-0802",
            name: "Babu Mathew",
            fatherName: "Mathew P.",
            mobileNumber: "9495112233",
            location: "Chooralmala",
            village: "Chooralmala",
            mandal: "Meppadi",
            district: "Wayanad",
            state: "Kerala",
            disasterType: "Hill Slump & Landslide",
            help: "Rescue and medical evacuation",
            priority: "Critical",
            status: "Resolved",
            assignedVolunteer: { name: "Arun Nair", phone: "9847012345" },
            resolvedDate: "02/08/2025, 11:20 PM",
            turnaroundHours: 5.5,
            livesSecured: 30,
            kitsDistributed: 60,
            resolutionYear: 2025,
            details: "Debris clearance coordinated with NDRF; 30 families transferred to community relief shelter.",
            createdAt: "02/08/2025, 05:50 PM"
        },
        {
            id: 1672531199000,
            trackId: "STM-2024-1102",
            name: "K. Srinivasa Rao",
            fatherName: "K. Venkataiah",
            mobileNumber: "9848998877",
            location: "Manginapudi Beach Colony",
            village: "Manginapudi",
            mandal: "Machilipatnam",
            district: "Krishna",
            state: "Andhra Pradesh",
            disasterType: "Coastal Cyclone Warning",
            help: "Food and water, Temporary Camp",
            priority: "Medium",
            status: "Resolved",
            assignedVolunteer: { name: "K. Satyam", phone: "9876540011" },
            resolvedDate: "15/11/2024, 03:00 PM",
            turnaroundHours: 3.8,
            livesSecured: 42,
            kitsDistributed: 80,
            resolutionYear: 2024,
            details: "Pre-emptive evacuation of coastal fishermen families to cyclone shelter before storm landfall.",
            createdAt: "15/11/2024, 11:10 AM"
        }
    ];

    historicalResolved.forEach(function (hr) {
        if (!requests.some(function (r) { return r.trackId === hr.trackId; })) {
            requests.push(hr);
        }
    });
    writeRecords("disasterHelpRequests", requests);
}

function renderAnnualStatements() {
    seedDefaultAnnualStatementsIfEmpty();

    const allRequests = readRecords("disasterHelpRequests");
    const currentDist = (adminDistrict || "Krishna").trim();
    const mandalsList = getAdminMandalsList(currentDist);

    // Populate Mandal filter options
    const mandalFilter = document.getElementById("annualMandalFilter");
    if (mandalFilter && mandalFilter.options.length <= 1) {
        let options = '<option value="all">All Mandals</option>';
        mandalsList.forEach(function (m) {
            options += `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`;
        });
        mandalFilter.innerHTML = options;
    }

    const yearFilterVal = document.getElementById("annualYearFilter") ? document.getElementById("annualYearFilter").value : "2026";
    const mandalFilterVal = mandalFilter ? mandalFilter.value : "all";

    const resolvedRequests = allRequests.filter(function (r) {
        if (r.status !== "Resolved") return false;
        
        // District match
        const distMatch = !adminDistrict || adminDistrict === "all" || (r.district || "").toLowerCase() === currentDist.toLowerCase();
        if (!distMatch) return false;

        // Year match
        const rYear = r.resolutionYear ? String(r.resolutionYear) : (r.resolvedDate ? String(r.resolvedDate).slice(6, 10) : (r.createdAt ? String(r.createdAt).slice(6, 10) : "2026"));
        const yearMatch = yearFilterVal === "all" || rYear === yearFilterVal;
        if (!yearMatch) return false;

        // Mandal match
        const mandalMatch = mandalFilterVal === "all" || (r.mandal || "").toLowerCase() === mandalFilterVal.toLowerCase();
        return mandalMatch;
    });

    // Compute annual stats
    let totalLives = 0;
    let totalKits = 0;
    let totalHours = 0;

    resolvedRequests.forEach(function (r) {
        totalLives += (r.livesSecured || 8);
        totalKits += (r.kitsDistributed || 15);
        totalHours += (r.turnaroundHours || 3.5);
    });

    const avgHours = resolvedRequests.length ? (totalHours / resolvedRequests.length).toFixed(1) : "0.0";

    const countEl = document.getElementById("annualResolvedCount");
    if (countEl) countEl.textContent = resolvedRequests.length;
    const livesEl = document.getElementById("annualLivesSecured");
    if (livesEl) livesEl.textContent = totalLives;
    const kitsEl = document.getElementById("annualKitsDispatched");
    if (kitsEl) kitsEl.textContent = totalKits;
    const avgHoursEl = document.getElementById("annualAvgHours");
    if (avgHoursEl) avgHoursEl.textContent = `${avgHours} hrs`;

    const tableBody = document.getElementById("annualStatementsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = resolvedRequests.length ? resolvedRequests.map(function (r) {
        const statementId = r.trackId ? (r.trackId.startsWith("STM-") ? r.trackId : "STM-" + r.trackId.replace(/^DR-/, "")) : ("STM-" + String(r.id).slice(-8));
        const rYear = r.resolutionYear || (r.resolvedDate ? String(r.resolvedDate).slice(6, 10) : "2026");
        const responder = r.assignedVolunteer ? (r.assignedVolunteer.name || "District Quick Response Team") : "District Quick Response Team";
        const resDate = r.resolvedDate || r.createdAt || "Archived";

        return `
            <tr>
                <td><strong class="font-monospace text-primary">${escapeHtml(statementId)}</strong></td>
                <td><span class="badge bg-secondary font-monospace">${escapeHtml(String(rYear))}</span></td>
                <td><strong>${escapeHtml(r.mandal || "Vijayawada Rural")}</strong><br><small class="text-muted">${escapeHtml(r.village || r.location || "")}</small></td>
                <td><span class="badge bg-light text-dark border">${escapeHtml(r.disasterType || "Emergency")}</span></td>
                <td>${escapeHtml(r.help || "Relief & Evacuation")}</td>
                <td><strong>${escapeHtml(r.name || "Beneficiary")}</strong><br><small class="font-monospace">${escapeHtml(r.mobileNumber || "")}</small></td>
                <td><span class="text-success"><i class="bi bi-shield-check me-1"></i>${escapeHtml(responder)}</span></td>
                <td><small>${escapeHtml(resDate)}</small></td>
                <td><span class="status-pill resolved"><i class="bi bi-check2-circle"></i> Resolved & Archived</span></td>
            </tr>
        `;
    }).join("") : '';

    const emptyEl = document.getElementById("emptyAnnualStatements");
    if (emptyEl) emptyEl.style.display = resolvedRequests.length === 0 ? "block" : "none";
}

const annualYearFilterEl = document.getElementById("annualYearFilter");
if (annualYearFilterEl) annualYearFilterEl.addEventListener("change", renderAnnualStatements);
const annualMandalFilterEl = document.getElementById("annualMandalFilter");
if (annualMandalFilterEl) annualMandalFilterEl.addEventListener("change", renderAnnualStatements);

const printAnnualReportBtn = document.getElementById("printAnnualReportBtn");
if (printAnnualReportBtn) {
    printAnnualReportBtn.addEventListener("click", function () {
        window.print();
    });
}

const downloadAnnualCsvBtn = document.getElementById("downloadAnnualCsvBtn");
if (downloadAnnualCsvBtn) {
    downloadAnnualCsvBtn.addEventListener("click", function () {
        const year = document.getElementById("annualYearFilter") ? document.getElementById("annualYearFilter").value : "2026";
        const mandal = document.getElementById("annualMandalFilter") ? document.getElementById("annualMandalFilter").value : "all";
        const allRequests = readRecords("disasterHelpRequests");
        const currentDist = (adminDistrict || "Krishna").trim();

        const filtered = allRequests.filter(function (r) {
            if (r.status !== "Resolved") return false;
            const distMatch = !adminDistrict || adminDistrict === "all" || (r.district || "").toLowerCase() === currentDist.toLowerCase();
            if (!distMatch) return false;
            const rYear = r.resolutionYear ? String(r.resolutionYear) : (r.resolvedDate ? String(r.resolvedDate).slice(6, 10) : "2026");
            if (year !== "all" && rYear !== year) return false;
            if (mandal !== "all" && (r.mandal || "").toLowerCase() !== mandal.toLowerCase()) return false;
            return true;
        });

        let csv = "Statement ID,Resolution Year,Mandal,District,State,Disaster Type,Assistance Rendered,Beneficiary,Mobile,Assigned Responder,Resolved Date,Turnaround Hours,Lives Secured,Kits Distributed\n";
        filtered.forEach(function (r) {
            const statementId = r.trackId ? (r.trackId.startsWith("STM-") ? r.trackId : "STM-" + r.trackId.replace(/^DR-/, "")) : ("STM-" + String(r.id).slice(-8));
            const rYear = r.resolutionYear || "2026";
            const responder = r.assignedVolunteer ? r.assignedVolunteer.name : "District Quick Response Team";
            csv += `"${statementId}","${rYear}","${r.mandal || ''}","${r.district || ''}","${r.state || ''}","${r.disasterType || ''}","${r.help || ''}","${r.name || ''}","${r.mobileNumber || ''}","${responder}","${r.resolvedDate || r.createdAt || ''}","${r.turnaroundHours || 3.5}","${r.livesSecured || 8}","${r.kitsDistributed || 15}"\n`;
        });

        downloadCsvFile(csv, `Annual_Resolved_Operations_Statement_${year}_${currentDist}.csv`);
    });
}

// Initial Render and baseline tracking
renderAdminTopBarProfile();
loadAdminLiveWeather();
if (adminState !== "all") {
    const p = document.querySelector(".welcome-row p");
    if (p) p.textContent = `Showing operations for ${adminDistrict || "all districts"}, ${adminState}.`;
}

const initialRequests = readRecords("disasterHelpRequests");
lastKnownRequestCount = initialRequests.length;
lastKnownLatestId = initialRequests[0] ? Number(initialRequests[0].id) : 0;

renderRequests();
renderVolunteers();
renderVolunteersFullTable();
renderDonations();
renderRegistrations();
renderAlerts();
renderDashMandalVolunteers();
renderMandalsView();

// Check URL Hash on initial page load to automatically activate requested view (e.g. #volunteers)
const initialHash = window.location.hash ? window.location.hash.replace(/^#/, "") : "dashboard";
switchAdminView(initialHash);



