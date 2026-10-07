/* =====================================================
   DISASTER RELIEF
   PHASE 1 JAVASCRIPT
===================================================== */


// =====================================================
// NAVBAR SCROLL EFFECT
// =====================================================

const navbar = document.getElementById("mainNavbar");

const indiaStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

let browserOtp = null;

function initializeDefaultData() {
    if (!localStorage.getItem("disasterInitialized")) {
        const defaultAccounts = [
            {
                id: 1001,
                username: "volunteer",
                password: "volunteer123",
                role: "Volunteer",
                profileName: "Ramesh Kumar",
                createdAt: new Date().toLocaleString()
            },
            {
                id: 1002,
                username: "citizen",
                password: "citizen123",
                role: "Citizen",
                profileName: "Ananya Rao",
                createdAt: new Date().toLocaleString()
            }
        ];

        const defaultRequests = [
            {
                id: 1727700001000,
                trackId: "DR-20260928-847291",
                name: "K. Venkatesh",
                fatherName: "K. Prasad",
                mobileNumber: "9876543210",
                location: "Bhavanipuram",
                village: "Bhavanipuram",
                mandal: "Vijayawada Rural",
                district: "Krishna",
                state: "Andhra Pradesh",
                disasterType: "Flood",
                gps: "16.516515, 80.618645",
                help: "Rescue support, Food and water",
                priority: "Critical",
                status: "In Progress",
                details: "Krishna river water overflow entered residential area. 4 elderly family members need evacuation and clean drinking water.",
                proof: null,
                createdAt: "28/09/2026, 10:30:00 AM"
            },
            {
                id: 1727700002000,
                trackId: "DR-20260929-391048",
                name: "Sasmita Behera",
                fatherName: "Dillip Behera",
                mobileNumber: "9845112233",
                location: "Badambadi",
                village: "Badambadi",
                mandal: "Cuttack Main Mandal",
                district: "Cuttack",
                state: "Odisha",
                disasterType: "Cyclone",
                gps: "20.462521, 85.882820",
                help: "Medical support",
                priority: "High",
                status: "Verified",
                details: "Severe storm damage, urgent first aid and bandages required for relief center.",
                proof: null,
                createdAt: "29/09/2026, 02:15:00 PM"
            },
            {
                id: 1727700003000,
                trackId: "DR-20260929-582910",
                name: "Jithin Thomas",
                fatherName: "Thomas Mathew",
                mobileNumber: "9711223344",
                location: "Meppadi",
                village: "Meppadi",
                mandal: "Wayanad Main Mandal",
                district: "Wayanad",
                state: "Kerala",
                disasterType: "Landslide",
                gps: "11.551120, 76.126430",
                help: "Food and water, Shelter",
                priority: "High",
                status: "Assigned",
                details: "Monsoon landslide displaced 25 families. Temporary shelter setup and drinking water needed.",
                proof: null,
                createdAt: "29/09/2026, 05:40:00 PM"
            },
            {
                id: 1727700004000,
                trackId: "DR-20260930-104928",
                name: "Sundaram R.",
                fatherName: "Ramasamy M.",
                mobileNumber: "9988776655",
                location: "Velachery",
                village: "Velachery",
                mandal: "Mylapore",
                district: "Chennai",
                state: "Tamil Nadu",
                disasterType: "Flood",
                gps: "12.981540, 80.218000",
                help: "Food and water",
                priority: "Medium",
                status: "Pending",
                details: "Water logging in low lying residential street. Essential provisions required.",
                proof: null,
                createdAt: "30/09/2026, 08:20:00 AM"
            }
        ];

        const defaultAlerts = [
            {
                id: 2001,
                title: "Orange Alert: Heavy Rainfall & River Swell",
                details: "IMD forecast predicts intense showers across Coastal AP & Odisha. Low-lying zones advised to remain vigilant. Emergency teams deployed.",
                state: "Andhra Pradesh",
                district: "Krishna",
                createdAt: "30/09/2026, 09:00:00 AM"
            },
            {
                id: 2002,
                title: "Cyclone Watch: High-Speed Coastal Winds",
                details: "Wind gusts up to 85 km/h expected along Chennai coastal belt. Emergency shelters active.",
                state: "Tamil Nadu",
                district: "Chennai",
                createdAt: "30/09/2026, 07:30:00 AM"
            },
            {
                id: 2003,
                title: "Landslide Advisory for Ghat Sections",
                details: "Continuous precipitation in hilly terrains. Travel restricted on ghat routes. Quick response units active.",
                state: "Kerala",
                district: "Wayanad",
                createdAt: "29/09/2026, 06:00:00 PM"
            }
        ];

        const defaultVolunteers = [
            {
                id: 3001,
                name: "Ramesh Kumar",
                fatherName: "K. Prasad",
                phone: "9876543210",
                username: "volunteer",
                state: "Andhra Pradesh",
                district: "Krishna",
                mandal: "Vijayawada Rural",
                location: "Vijayawada",
                skills: "Water Rescue, First Aid, Driving, Logistics",
                availability: "Available",
                status: "Available",
                createdAt: "28/09/2026, 09:00:00 AM"
            },
            {
                id: 3002,
                name: "Priya Sharma",
                fatherName: "M. Sharma",
                phone: "9845123456",
                username: "priya_s",
                state: "Tamil Nadu",
                district: "Chennai",
                mandal: "Mylapore",
                location: "Chennai",
                skills: "Emergency Nursing, First Aid, Medical Supplies",
                availability: "Available",
                status: "Assigned",
                createdAt: "29/09/2026, 11:30:00 AM"
            }
        ];

        const defaultDonations = [
            {
                id: 4001,
                donor: "Apex Care Foundation",
                state: "Andhra Pradesh",
                district: "Krishna",
                type: "Food, Water",
                quantity: "300 meal kits & 150 water boxes",
                phone: "9812345678",
                message: "Ready for immediate dispatch to flood relief camps.",
                status: "Received",
                createdAt: "29/09/2026, 01:00:00 PM"
            },
            {
                id: 4002,
                donor: "Community Relief Network",
                state: "Tamil Nadu",
                district: "Chennai",
                type: "Medicine, Blankets",
                quantity: "100 first-aid kits & 250 blankets",
                phone: "9823456789",
                message: "Blankets and first-aid kits delivered to regional shelter depot.",
                status: "Registered",
                createdAt: "30/09/2026, 09:45:00 AM"
            }
        ];

        localStorage.setItem("disasterUserAccounts", JSON.stringify(defaultAccounts));
        localStorage.setItem("disasterHelpRequests", JSON.stringify(defaultRequests));
        localStorage.setItem("disasterAlerts", JSON.stringify(defaultAlerts));
        localStorage.setItem("disasterVolunteers", JSON.stringify(defaultVolunteers));
        localStorage.setItem("disasterDonations", JSON.stringify(defaultDonations));
        localStorage.setItem("disasterInitialized", "true");
    }
}

function initializeMandalAccounts() {
    if (!localStorage.getItem("disasterMandalAccounts")) {
        const defaultMandalAccounts = [
            {
                id: "mandal_krishna_vja_rural",
                mandal: "Vijayawada Rural",
                district: "Krishna",
                state: "Andhra Pradesh",
                officerName: "K. Satyanarayana",
                employeeId: "MND-AP-2041",
                email: "mandal.vja.rural@disaster-ap.gov.in",
                phone: "9876501122",
                username: "mandal_vja_rural",
                password: "mandal123",
                role: "Mandal Employee",
                status: "Approved", // Approved by Krishna District Admin
                approvedBy: "Krishna District Admin",
                approvedAt: "28/09/2026, 10:00:00 AM",
                createdAt: "28/09/2026, 09:30:00 AM"
            },
            {
                id: "mandal_krishna_gudivada",
                mandal: "Gudivada",
                district: "Krishna",
                state: "Andhra Pradesh",
                officerName: "M. Ramanathan",
                employeeId: "MND-AP-2055",
                email: "gudivada.relief@ap.gov.in",
                phone: "9845112299",
                username: "mandal_gudivada",
                password: "mandal123",
                role: "Mandal Employee",
                status: "Pending", // Needs Admin approval to test workflow
                approvedBy: null,
                approvedAt: null,
                createdAt: "29/09/2026, 11:20:00 AM"
            },
            {
                id: "mandal_chennai_mylapore",
                mandal: "Mylapore",
                district: "Chennai",
                state: "Tamil Nadu",
                officerName: "S. Annamalai",
                employeeId: "MND-TN-1082",
                email: "mylapore.relief@chennai.gov.in",
                phone: "9822334455",
                username: "mandal_mylapore",
                password: "mandal123",
                role: "Mandal Employee",
                status: "Approved",
                approvedBy: "Chennai District Admin",
                approvedAt: "29/09/2026, 01:15:00 PM",
                createdAt: "29/09/2026, 12:00:00 PM"
            },
            {
                id: "mandal_wayanad_meppadi",
                mandal: "Meppadi",
                district: "Wayanad",
                state: "Kerala",
                officerName: "Binoy Varghese",
                employeeId: "MND-KL-4091",
                email: "meppadi.station@wayanad.kerala.gov.in",
                phone: "9744112233",
                username: "mandal_meppadi",
                password: "mandal123",
                role: "Mandal Employee",
                status: "Approved",
                approvedBy: "Wayanad District Admin",
                approvedAt: "29/09/2026, 06:30:00 PM",
                createdAt: "29/09/2026, 05:00:00 PM"
            }
        ];
        localStorage.setItem("disasterMandalAccounts", JSON.stringify(defaultMandalAccounts));
    }
}

function initializeDistrictAdmins() {
    let admins = [];
    try {
        admins = JSON.parse(localStorage.getItem("disasterDistrictAdmins") || "[]");
    } catch (e) {
        admins = [];
    }

    const defaultAdmins = [
        {
            username: "admin",
            password: "admin123",
            email: "admin@disaster.gov.in",
            role: "Admin",
            district: "Krishna",
            state: "Andhra Pradesh",
            name: "Rajeshwar Rao, IAS",
            title: "District Collector & DM / District Admin"
        },
        {
            username: "admin_krishna",
            password: "admin123",
            email: "admin.krishna@disaster.gov.in",
            role: "Admin",
            district: "Krishna",
            state: "Andhra Pradesh",
            name: "Dr. K. Srinivas, IAS",
            title: "District Collector & DM / Krishna Admin"
        },
        {
            username: "admin_chennai",
            password: "admin123",
            email: "admin.chennai@disaster.gov.in",
            role: "Admin",
            district: "Chennai",
            state: "Tamil Nadu",
            name: "Rashmi Siddharth, IAS",
            title: "District Collector / Chennai Admin"
        },
        {
            username: "admin_wayanad",
            password: "admin123",
            email: "admin.wayanad@disaster.gov.in",
            role: "Admin",
            district: "Wayanad",
            state: "Kerala",
            name: "Arun K. Nair, IAS",
            title: "District Collector / Wayanad Admin"
        }
    ];

    if (!admins || admins.length === 0) {
        localStorage.setItem("disasterDistrictAdmins", JSON.stringify(defaultAdmins));
    } else {
        let updated = false;
        defaultAdmins.forEach(function (def) {
            const match = admins.find(function (a) {
                return (a.username || "").toLowerCase() === def.username.toLowerCase();
            });
            if (match && !match.email) {
                match.email = def.email;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem("disasterDistrictAdmins", JSON.stringify(admins));
        }
    }
}

initializeDefaultData();
initializeMandalAccounts();
initializeDistrictAdmins();

async function requestMobileOtp(mobileNumber) {
    const normalizedMobile = String(mobileNumber || "").replace(/\D/g, "");

    if (normalizedMobile.length !== 10) {
        throw new Error("Please enter a valid 10-digit mobile number.");
    }

    browserOtp = String(Math.floor(100000 + Math.random() * 900000));
    return {
        success: true,
        txnId: String(Date.now()),
        message: "Demo OTP is: " + browserOtp + ". Enter this code to verify.",
        demoOtp: browserOtp
    };
}

async function verifyMobileOtp(mobileNumber, otp, _txnId) {
    if (!browserOtp) {
        throw new Error("Please request a new OTP first.");
    }

    if (String(otp || "").trim() !== browserOtp) {
        throw new Error("Invalid OTP. Please try again.");
    }

    browserOtp = null;
    return {
        success: true,
        verified: true,
        message: "Mobile number verified successfully."
    };
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
}

const indiaDistricts = (typeof window !== "undefined" && window.indiaDistrictsData) || (typeof indiaDistrictsData !== "undefined" ? indiaDistrictsData : {});
const mandalsByDistrict = (typeof window !== "undefined" && window.mandalsByDistrictData) || (typeof mandalsByDistrictData !== "undefined" ? mandalsByDistrictData : {});

function getMandalsList(district) {
    if (typeof window !== "undefined" && typeof window.getMandalsForDistrict === "function") {
        return window.getMandalsForDistrict(district);
    }
    if (!district) return [];
    district = String(district).trim();
    if (mandalsByDistrict[district]) return mandalsByDistrict[district];
    const lower = district.toLowerCase();
    const key = Object.keys(mandalsByDistrict).find(function (k) { return k.toLowerCase() === lower; });
    if (key) return mandalsByDistrict[key];
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

document.querySelectorAll(".india-state-select").forEach(function (select) {
    if (select.children.length <= 1) {
        indiaStates.forEach(function (state) {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            select.appendChild(option);
        });
    }
});

function setupStateDistrictMandalCascade(stateId, districtId, mandalId) {
    const stateEl = document.getElementById(stateId);
    const districtEl = document.getElementById(districtId);
    const mandalEl = document.getElementById(mandalId);

    if (!districtEl) return;

    districtEl.innerHTML = '<option value="">Select a state first</option>';
    districtEl.disabled = true;

    if (mandalEl) {
        mandalEl.innerHTML = '<option value="">Select a district first</option>';
        mandalEl.disabled = true;
    }

    if (stateEl) {
        stateEl.addEventListener("change", function () {
            const state = stateEl.value;
            if (!state) {
                districtEl.innerHTML = '<option value="">Select a state first</option>';
                districtEl.disabled = true;
                if (mandalEl) {
                    mandalEl.innerHTML = '<option value="">Select a district first</option>';
                    mandalEl.disabled = true;
                }
                return;
            }

            const districts = (indiaDistricts[state] || []);
            let distOptions = '<option value="">Select district</option>';
            districts.forEach(function (d) {
                distOptions += `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`;
            });
            districtEl.innerHTML = distOptions;
            districtEl.disabled = false;

            if (mandalEl) {
                mandalEl.innerHTML = '<option value="">Select a district first</option>';
                mandalEl.disabled = true;
            }
        });
    }

    districtEl.addEventListener("change", function () {
        if (!mandalEl) return;
        const district = districtEl.value;
        if (!district) {
            mandalEl.innerHTML = '<option value="">Select a district first</option>';
            mandalEl.disabled = true;
            return;
        }

        const mandals = getMandalsList(district);
        let mandalOptions = '<option value="">Select mandal / taluk</option>';
        mandals.forEach(function (m) {
            mandalOptions += `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`;
        });
        mandalEl.innerHTML = mandalOptions;
        mandalEl.disabled = false;
    });
}

// Initialize cascading selects for every filling form that contains district and mandal
setupStateDistrictMandalCascade("helpState", "helpDistrict", "helpMandal");
setupStateDistrictMandalCascade("volunteerState", "volunteerDistrict", "volunteerMandal");
setupStateDistrictMandalCascade("registerState", "registerDistrict", "registerMandal");
setupStateDistrictMandalCascade("donationState", "donationDistrict", "donationMandal");

const useHelpLocation = document.getElementById("useHelpLocation");
if (useHelpLocation) {
    useHelpLocation.addEventListener("click", function () {
        const status = document.getElementById("helpGpsStatus");
        if (!navigator.geolocation) { status.textContent = "GPS is not available in this browser."; return; }
        status.textContent = "Finding your exact location...";
        navigator.geolocation.getCurrentPosition(function (position) {
            document.getElementById("helpGps").value = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
            status.textContent = `GPS captured: ${document.getElementById("helpGps").value}`;
        }, function () { status.textContent = "GPS permission was not granted. You can still enter the village manually."; });
    });
}

const loginRoleFromUrl =
    new URLSearchParams(window.location.search).get("role");

if (loginRoleFromUrl && document.getElementById("loginModal")) {

    openLogin(loginRoleFromUrl);

}


window.addEventListener("scroll", function () {

    if (window.scrollY > 40) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});


// =====================================================
// ACTIVE NAVIGATION
// =====================================================

const navLinks =
    document.querySelectorAll(".nav-link");


const sections =
    document.querySelectorAll(
        "header[id], section[id]"
    );


window.addEventListener("scroll", function () {

    let currentSection = "";

    sections.forEach(function (section) {

        const sectionTop =
            section.offsetTop - 150;

        const sectionHeight =
            section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY <
            sectionTop + sectionHeight
        ) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navLinks.forEach(function (link) {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + currentSection
        ) {

            link.classList.add("active");

        }

    });

});


// =====================================================
// MOBILE NAVBAR CLOSE
// =====================================================

navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        const menu =
            document.getElementById("navbarMenu");

        if (menu.classList.contains("show")) {

            bootstrap.Collapse
                .getOrCreateInstance(menu)
                .hide();

        }

    });

});


// =====================================================
// LOGIN MODAL
// =====================================================

function onRegisterRoleChange(role) {
    // Kept as safe no-op for backward compatibility
}

function openLogin(role) {
    if (!role || role === "Citizen") role = "Mandal Employee";

    const roleEl = document.getElementById("loginRole");
    if (roleEl) roleEl.textContent = role;

    const noticeEl = document.getElementById("loginRoleNotice");
    const demoCredentialsEl = document.getElementById("loginDemoCredentials");
    const subtitleEl = document.getElementById("loginModalSubtitle");

    // Highlight active role tab button if available
    document.querySelectorAll(".role-tab-btn").forEach(function (btn) {
        if (btn.textContent.trim().toLowerCase().includes(role.toLowerCase().slice(0, 5))) {
            btn.classList.add("btn-primary");
            btn.classList.remove("btn-outline-secondary");
        } else {
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-outline-secondary");
        }
    });

    if (role === "Mandal Employee") {
        if (subtitleEl) subtitleEl.textContent = "Sign in to access your Mandal Emergency Operations Desk.";
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.className = "alert alert-warning py-2 px-3 small mb-3";
            noticeEl.innerHTML = '<i class="bi bi-shield-exclamation me-1"></i> <strong>Admin Approval Required:</strong> Mandal/Employee logins must be approved by their District Admin before access is granted.';
        }
        if (demoCredentialsEl) {
            demoCredentialsEl.innerHTML = `
                <span>• Approved Mandal: <code>mandal_vja_rural</code> / <code>mandal123</code> (Krishna)</span><br>
                <span>• Pending Approval: <code>mandal_gudivada</code> / <code>mandal123</code> (Requires Admin approval)</span><br>
                <span>• Chennai Mandal: <code>mandal_mylapore</code> / <code>mandal123</code></span>
            `;
        }
    } else if (role === "Admin") {
        if (subtitleEl) subtitleEl.textContent = "Sign in to access District Disaster Emergency Operations Center.";
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.className = "alert alert-info py-2 px-3 small mb-3";
            noticeEl.innerHTML = '<i class="bi bi-shield-lock-fill me-1"></i> <strong>District Admin Portal:</strong> Manage all mandals, review pending employee logins, and coordinate district relief.';
        }
        if (demoCredentialsEl) {
            demoCredentialsEl.innerHTML = `
                <span>• Krishna District Admin: <code>admin_krishna</code> / <code>admin123</code></span><br>
                <span>• General Admin: <code>admin</code> / <code>admin123</code></span><br>
                <span>• Chennai District Admin: <code>admin_chennai</code> / <code>admin123</code></span>
            `;
        }
    } else if (role === "Volunteer") {
        if (subtitleEl) subtitleEl.textContent = "Sign in to access the field response volunteer directory.";
        if (noticeEl) {
            noticeEl.style.display = "none";
        }
        if (demoCredentialsEl) {
            demoCredentialsEl.innerHTML = `
                <span>• Demo Volunteer: <code>volunteer</code> / <code>volunteer123</code></span>
            `;
        }
    } else {
        if (subtitleEl) subtitleEl.textContent = "Sign in to access your DISASTER RELIEF dashboard.";
        if (noticeEl) noticeEl.style.display = "none";
        if (demoCredentialsEl) {
            demoCredentialsEl.innerHTML = `
                <span>• Demo Volunteer: <code>volunteer</code> / <code>volunteer123</code></span>
            `;
        }
    }

    const rememberedEmail = localStorage.getItem("disasterRememberedEmail");
    const rememberedPassword = localStorage.getItem("disasterRememberedPassword");

    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const rememberCheckbox = document.getElementById("rememberPassword");

    if (usernameInput) usernameInput.value = rememberedEmail || "";
    if (passwordInput) passwordInput.value = rememberedPassword || "";
    if (rememberCheckbox) rememberCheckbox.checked = Boolean(rememberedEmail || rememberedPassword);

    const modalElement = document.getElementById("loginModal");
    if (modalElement) {
        bootstrap.Modal.getOrCreateInstance(modalElement).show();
    }
}

let currentRegisterRole = "Mandal Employee";

function setRegisterRole(role) {
    if (!role) role = "Mandal Employee";
    if (role === "Mandal / Employee") role = "Mandal Employee";
    currentRegisterRole = role;

    const titleEl = document.getElementById("registerModalTitle");
    const tagEl = document.getElementById("registerSectionTag");
    const subtitleEl = document.getElementById("registerModalSubtitle");
    const noticeEl = document.getElementById("registerRoleNotice");
    const nameLabelEl = document.getElementById("registerNameLabel");
    const mandalGroup = document.getElementById("registerMandalGroup");
    const mandalSelect = document.getElementById("registerMandal");
    const submitBtnText = document.getElementById("registerSubmitBtnText");
    const mandalTabBtn = document.getElementById("regRoleMandalBtn");
    const adminTabBtn = document.getElementById("regRoleAdminBtn");
    const addressLabelEl = document.getElementById("registerAddressLabel");

    if (role === "Mandal Employee") {
        if (titleEl) titleEl.textContent = "Mandal / Employee Registration";
        if (tagEl) tagEl.textContent = "MANDAL OPERATIONS";
        if (subtitleEl) subtitleEl.textContent = "Register as a Mandal Officer / Employee to oversee local relief operations.";
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.className = "alert alert-warning py-2 px-3 small mb-3";
            noticeEl.innerHTML = '<i class="bi bi-shield-exclamation me-1"></i> <strong>Admin Approval Required:</strong> Mandal Employee logins are created as <em>Pending</em> and must be approved by the District Admin before access is granted.';
        }
        if (nameLabelEl) nameLabelEl.textContent = "Officer / Employee Full Name";
        if (addressLabelEl) addressLabelEl.textContent = "Office / Station Address";
        if (mandalGroup) mandalGroup.style.display = "block";
        if (mandalSelect) mandalSelect.required = true;
        if (submitBtnText) submitBtnText.textContent = "Register Mandal Account";

        if (mandalTabBtn) { mandalTabBtn.classList.add("btn-primary"); mandalTabBtn.classList.remove("btn-outline-secondary"); }
        if (adminTabBtn) { adminTabBtn.classList.remove("btn-primary"); adminTabBtn.classList.add("btn-outline-secondary"); }
    } else {
        if (titleEl) titleEl.textContent = "Admin Registration";
        if (tagEl) tagEl.textContent = "ADMINISTRATION";
        if (subtitleEl) subtitleEl.textContent = "Register as a District Administrator to oversee district relief teams and mandal operations.";
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.className = "alert alert-info py-2 px-3 small mb-3";
            noticeEl.innerHTML = '<i class="bi bi-shield-lock-fill me-1"></i> <strong>District Administrator Portal:</strong> District-level jurisdiction over all constituent mandals.';
        }
        if (nameLabelEl) nameLabelEl.textContent = "Administrator Full Name";
        if (addressLabelEl) addressLabelEl.textContent = "Office / Headquarters Address";
        if (mandalGroup) mandalGroup.style.display = "none";
        if (mandalSelect) mandalSelect.required = false;
        if (submitBtnText) submitBtnText.textContent = "Register Admin Account";

        if (mandalTabBtn) { mandalTabBtn.classList.remove("btn-primary"); mandalTabBtn.classList.add("btn-outline-secondary"); }
        if (adminTabBtn) { adminTabBtn.classList.add("btn-primary"); adminTabBtn.classList.remove("btn-outline-secondary"); }
    }
}

function openRegister() {
    const rawRole = (document.getElementById("loginRole") ? document.getElementById("loginRole").textContent.trim() : "Mandal Employee");

    if (rawRole === "Volunteer") {
        const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        if (loginModal) loginModal.hide();
        openVolunteerApplication();
        return;
    }

    const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    if (loginModal) loginModal.hide();

    const targetRole = (rawRole.toLowerCase().includes("admin") ? "Admin" : "Mandal Employee");
    setRegisterRole(targetRole);

    const regModalEl = document.getElementById("registerModal");
    if (regModalEl) {
        bootstrap.Modal.getOrCreateInstance(regModalEl).show();
        setupStateDistrictMandalCascade("registerState", "registerDistrict", "registerMandal");
    }
}

function switchToLogin() {
    const registerModal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
    if (registerModal) registerModal.hide();
    openLogin(currentRegisterRole || "Mandal Employee");
}

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail") ? document.getElementById("registerEmail").value.trim().toLowerCase() : "";
    const username = document.getElementById("registerUsername").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const state = document.getElementById("registerState").value.trim();
    const district = document.getElementById("registerDistrict").value.trim();
    const mandal = document.getElementById("registerMandal") ? document.getElementById("registerMandal").value.trim() : "";
    const address = document.getElementById("registerAddress") ? document.getElementById("registerAddress").value.trim() : "";

    if (!name || !email || !username || !password) {
        showMessage("Please complete all required fields.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid official email address.");
        return;
    }

    if (!state || !district) {
        showMessage("Please select State and District.");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.");
        return;
    }

    // MANDAL EMPLOYEE REGISTRATION
    if (currentRegisterRole === "Mandal Employee") {
        if (!mandal) {
            showMessage("Please select your Mandal / Taluk.");
            return;
        }

        const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
        if (mandalAccounts.some(function (acc) { return (acc.username || "").toLowerCase() === username; })) {
            showMessage("That username is already taken. Please choose another username.");
            return;
        }

        if (mandalAccounts.some(function (acc) { return (acc.email || "").toLowerCase() === email; })) {
            showMessage("An account is already registered with this official email address.");
            return;
        }

        const newMandalAccount = {
            id: "mandal_" + Date.now(),
            mandal: mandal,
            district: district,
            state: state,
            officerName: name,
            employeeId: "MND-" + Math.floor(1000 + Math.random() * 9000),
            email: email,
            username: username,
            password: password,
            role: "Mandal Employee",
            address: address,
            status: "Pending", // REQUIRES DISTRICT ADMIN APPROVAL!
            approvedBy: null,
            approvedAt: null,
            createdAt: new Date().toLocaleString()
        };

        mandalAccounts.unshift(newMandalAccount);
        localStorage.setItem("disasterMandalAccounts", JSON.stringify(mandalAccounts));

        // Sync with general user accounts
        const userAccounts = JSON.parse(localStorage.getItem("disasterUserAccounts") || "[]");
        userAccounts.unshift({
            name: name,
            email: email,
            username: username,
            password: password,
            role: "Mandal Employee",
            mandal: mandal,
            district: district,
            state: state,
            status: "Pending"
        });
        localStorage.setItem("disasterUserAccounts", JSON.stringify(userAccounts));

        const regModalEl = document.getElementById("registerModal");
        const regModal = bootstrap.Modal.getInstance(regModalEl);
        if (regModal) regModal.hide();
        event.target.reset();
        setupStateDistrictMandalCascade("registerState", "registerDistrict", "registerMandal");

        showMessage(`Mandal account created for ${mandal} (${district})! Status is PENDING APPROVAL by the District Admin.`);
        openLogin("Mandal Employee");
        const loginUserEl = document.getElementById("loginUsername");
        if (loginUserEl) loginUserEl.value = username;
        return;
    }

    // DISTRICT ADMIN REGISTRATION
    const districtAdmins = JSON.parse(localStorage.getItem("disasterDistrictAdmins") || "[]");
    if (districtAdmins.some(function (acc) { return (acc.username || "").toLowerCase() === username; })) {
        showMessage("That username is already taken. Please choose another username.");
        return;
    }

    if (districtAdmins.some(function (acc) { return (acc.email || "").toLowerCase() === email; })) {
        showMessage("An administrator is already registered with this official email.");
        return;
    }

    const newAdmin = {
        id: "admin_" + Date.now(),
        name: name,
        email: email,
        username: username,
        password: password,
        role: "Admin",
        state: state,
        district: district,
        address: address,
        title: `District Collector & DM / ${district} Admin`,
        createdAt: new Date().toLocaleString()
    };

    districtAdmins.unshift(newAdmin);
    localStorage.setItem("disasterDistrictAdmins", JSON.stringify(districtAdmins));

    // Keep general user accounts table in sync
    const userAccounts = JSON.parse(localStorage.getItem("disasterUserAccounts") || "[]");
    userAccounts.unshift({
        name: name,
        email: email,
        username: username,
        password: password,
        role: "Admin",
        state: state,
        district: district
    });
    localStorage.setItem("disasterUserAccounts", JSON.stringify(userAccounts));

    const regModalEl = document.getElementById("registerModal");
    const regModal = bootstrap.Modal.getInstance(regModalEl);
    if (regModal) regModal.hide();
    event.target.reset();
    setupStateDistrictMandalCascade("registerState", "registerDistrict", "registerMandal");

    showMessage(`Admin account successfully registered for ${name} (${district} District)! You can now sign in.`);
    openLogin("Admin");
    const loginUserEl = document.getElementById("loginUsername");
    if (loginUserEl) loginUserEl.value = username;
}

function loginUser(event) {
    event.preventDefault();

    const role = document.getElementById("loginRole").textContent.trim();
    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (document.getElementById("rememberPassword").checked) {
        localStorage.setItem("disasterRememberedEmail", username);
        localStorage.setItem("disasterRememberedPassword", password);
    } else {
        localStorage.removeItem("disasterRememberedEmail");
        localStorage.removeItem("disasterRememberedPassword");
    }

    // MANDAL EMPLOYEE LOGIN (Requires prior District Admin approval)
    if (role === "Mandal Employee") {
        const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
        const account = mandalAccounts.find(function (acc) {
            return (acc.username || "").toLowerCase() === username && acc.password === password;
        });

        if (!account) {
            showMessage("Invalid username or password for Mandal / Employee login.");
            return;
        }

        if (account.status === "Pending") {
            showMessage(`Approval Required: Your Mandal Employee login for "${account.mandal}" is PENDING APPROVAL by the ${account.district} District Admin.`);
            return;
        }

        // Account is approved!
        localStorage.setItem("disasterCurrentMandal", JSON.stringify(account));
        window.location.href = "mandal.html";
        return;
    }

    // DISTRICT ADMIN LOGIN
    if (role === "Admin") {
        const districtAdmins = JSON.parse(localStorage.getItem("disasterDistrictAdmins") || "[]");
        const matchedAdmin = districtAdmins.find(function (a) {
            return (a.username || "").toLowerCase() === username && a.password === password;
        });

        if (matchedAdmin) {
            localStorage.setItem("disasterAdminDistrict", matchedAdmin.district);
            localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: matchedAdmin.state, district: matchedAdmin.district }));
            if (matchedAdmin.name) localStorage.setItem("disasterAdminName", matchedAdmin.name);
            window.location.href = "admin.html";
            return;
        }

        if ((username === "admin" || username === "admin_krishna") && password === "admin123") {
            localStorage.setItem("disasterAdminDistrict", "Krishna");
            localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: "Andhra Pradesh", district: "Krishna" }));
            window.location.href = "admin.html";
            return;
        } else if (username === "admin_chennai" && password === "admin123") {
            localStorage.setItem("disasterAdminDistrict", "Chennai");
            localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: "Tamil Nadu", district: "Chennai" }));
            window.location.href = "admin.html";
            return;
        } else if (username === "admin_wayanad" && password === "admin123") {
            localStorage.setItem("disasterAdminDistrict", "Wayanad");
            localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: "Kerala", district: "Wayanad" }));
            window.location.href = "admin.html";
            return;
        } else {
            showMessage("Invalid Admin credentials. Try admin_krishna / admin123 or admin / admin123.");
            return;
        }
    }

    // VOLUNTEER LOGIN
    if (role === "Volunteer") {
        const accounts = JSON.parse(localStorage.getItem("disasterUserAccounts") || "[]");
        const volunteers = JSON.parse(localStorage.getItem("disasterVolunteers") || "[]");

        const account = accounts.find(function (savedAccount) {
            return (savedAccount.username || "").toLowerCase() === username &&
                savedAccount.password === password &&
                savedAccount.role === "Volunteer";
        });

        const volMatch = volunteers.find(function (v) {
            return (v.username || "").toLowerCase() === username &&
                (v.phone === password || password === "volunteer123");
        });

        if (!account && !volMatch && !(username === "volunteer" && password === "volunteer123")) {
            showMessage("Invalid username or password for Volunteer login.");
            return;
        }

        const volUser = account || volMatch || { username: "volunteer", role: "Volunteer", name: "Volunteer" };
        localStorage.setItem("disasterCurrentUser", JSON.stringify(volUser));
        localStorage.setItem("disasterCurrentVolunteer", JSON.stringify(volUser));
        window.location.href = "volunteer.html";
        return;
    }

    showMessage("Citizen login has been removed. Operational access is reserved for District Admin, Mandal Employee, and Volunteer accounts.");
}


let activeForgotSession = null;

function forgotPassword() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    if (loginModal) loginModal.hide();

    activeForgotSession = null;
    const step1 = document.getElementById("forgotStep1");
    const step2 = document.getElementById("forgotStep2");
    if (step1) step1.style.display = "block";
    if (step2) step2.style.display = "none";

    const emailInput = document.getElementById("forgotEmail");
    if (emailInput) emailInput.value = "";
    const otpInput = document.getElementById("forgotOtpInput");
    if (otpInput) otpInput.value = "";
    const newPassInput = document.getElementById("forgotNewPassword");
    if (newPassInput) newPassInput.value = "";
    const confirmPassInput = document.getElementById("forgotConfirmPassword");
    if (confirmPassInput) confirmPassInput.value = "";

    const forgotModalEl = document.getElementById("forgotPasswordModal");
    if (forgotModalEl) {
        bootstrap.Modal.getOrCreateInstance(forgotModalEl).show();
        setTimeout(function () {
            if (emailInput) emailInput.focus();
        }, 300);
    }
}

function backToForgotStep1() {
    const step1 = document.getElementById("forgotStep1");
    const step2 = document.getElementById("forgotStep2");
    if (step1) step1.style.display = "block";
    if (step2) step2.style.display = "none";
    const emailInput = document.getElementById("forgotEmail");
    if (emailInput) emailInput.focus();
}

function switchToLoginFromForgot() {
    const forgotModal = bootstrap.Modal.getInstance(document.getElementById("forgotPasswordModal"));
    if (forgotModal) forgotModal.hide();
    activeForgotSession = null;
    openLogin("Admin");
}

function handleSendForgotOtp(event) {
    event.preventDefault();

    const emailInput = document.getElementById("forgotEmail");
    const email = (emailInput ? emailInput.value : "").trim().toLowerCase();

    if (!email) {
        showMessage("Please enter your registered email address.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.");
        return;
    }

    // Search across accounts
    const districtAdmins = JSON.parse(localStorage.getItem("disasterDistrictAdmins") || "[]");
    const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
    const userAccounts = JSON.parse(localStorage.getItem("disasterUserAccounts") || "[]");
    const volunteers = JSON.parse(localStorage.getItem("disasterVolunteers") || "[]");

    let matchedRole = null;
    let matchedUsername = null;
    let matchedRecord = null;

    const adminMatch = districtAdmins.find(function (a) { return (a.email || "").toLowerCase() === email; });
    if (adminMatch) {
        matchedRole = "Admin";
        matchedUsername = adminMatch.username;
        matchedRecord = adminMatch;
    } else {
        const mandalMatch = mandalAccounts.find(function (m) { return (m.email || "").toLowerCase() === email; });
        if (mandalMatch) {
            matchedRole = "Mandal Employee";
            matchedUsername = mandalMatch.username;
            matchedRecord = mandalMatch;
        } else {
            const userMatch = userAccounts.find(function (u) { return (u.email || "").toLowerCase() === email; });
            if (userMatch) {
                matchedRole = userMatch.role || "Admin";
                matchedUsername = userMatch.username;
                matchedRecord = userMatch;
            } else {
                const volMatch = volunteers.find(function (v) { return (v.email || "").toLowerCase() === email; });
                if (volMatch) {
                    matchedRole = "Volunteer";
                    matchedUsername = volMatch.username || volMatch.phone;
                    matchedRecord = volMatch;
                }
            }
        }
    }

    if (!matchedRecord) {
        showMessage(`No registered account found with email "${email}". Please verify your email or register an Admin account.`);
        return;
    }

    // Generate 6-digit OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    activeForgotSession = {
        email: email,
        otp: generatedOtp,
        role: matchedRole,
        username: matchedUsername,
        createdAt: Date.now()
    };

    const targetEmailDisplay = document.getElementById("forgotTargetEmailDisplay");
    if (targetEmailDisplay) targetEmailDisplay.textContent = email;

    const otpCodeDisplay = document.getElementById("forgotGeneratedOtpCode");
    if (otpCodeDisplay) otpCodeDisplay.textContent = generatedOtp;

    const step1 = document.getElementById("forgotStep1");
    const step2 = document.getElementById("forgotStep2");
    if (step1) step1.style.display = "none";
    if (step2) step2.style.display = "block";

    const otpInput = document.getElementById("forgotOtpInput");
    if (otpInput) {
        otpInput.value = "";
        otpInput.focus();
    }

    showMessage(`Verification OTP generated: ${generatedOtp}. Enter this 6-digit OTP to rebuild your password.`);
}

function handleRebuildPassword(event) {
    event.preventDefault();

    if (!activeForgotSession) {
        showMessage("Password reset session expired. Please request a new OTP.");
        backToForgotStep1();
        return;
    }

    const otpInput = document.getElementById("forgotOtpInput");
    const enteredOtp = (otpInput ? otpInput.value : "").trim();
    const newPassword = (document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "");
    const confirmPassword = (document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "");

    if (enteredOtp !== activeForgotSession.otp) {
        showMessage("Invalid verification OTP. Please enter the 6-digit code shown.");
        return;
    }

    if (!newPassword || newPassword.length < 6) {
        showMessage("New password must be at least 6 characters long.");
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage("Passwords do not match. Please re-enter.");
        return;
    }

    const targetEmail = activeForgotSession.email;
    const restoredRole = activeForgotSession.role || "Admin";
    const restoredUsername = activeForgotSession.username;

    // Update password across collections
    const districtAdmins = JSON.parse(localStorage.getItem("disasterDistrictAdmins") || "[]");
    let adminUpdated = false;
    districtAdmins.forEach(function (adm) {
        if ((adm.email || "").toLowerCase() === targetEmail) {
            adm.password = newPassword;
            adminUpdated = true;
        }
    });
    if (adminUpdated) {
        localStorage.setItem("disasterDistrictAdmins", JSON.stringify(districtAdmins));
    }

    const mandalAccounts = JSON.parse(localStorage.getItem("disasterMandalAccounts") || "[]");
    let mandalUpdated = false;
    mandalAccounts.forEach(function (mnd) {
        if ((mnd.email || "").toLowerCase() === targetEmail) {
            mnd.password = newPassword;
            mandalUpdated = true;
        }
    });
    if (mandalUpdated) {
        localStorage.setItem("disasterMandalAccounts", JSON.stringify(mandalAccounts));
    }

    const userAccounts = JSON.parse(localStorage.getItem("disasterUserAccounts") || "[]");
    let userUpdated = false;
    userAccounts.forEach(function (usr) {
        if ((usr.email || "").toLowerCase() === targetEmail) {
            usr.password = newPassword;
            userUpdated = true;
        }
    });
    if (userUpdated) {
        localStorage.setItem("disasterUserAccounts", JSON.stringify(userAccounts));
    }

    const volunteers = JSON.parse(localStorage.getItem("disasterVolunteers") || "[]");
    let volUpdated = false;
    volunteers.forEach(function (vol) {
        if ((vol.email || "").toLowerCase() === targetEmail) {
            vol.password = newPassword;
            volUpdated = true;
        }
    });
    if (volUpdated) {
        localStorage.setItem("disasterVolunteers", JSON.stringify(volunteers));
    }

    // Clear saved password
    localStorage.removeItem("disasterRememberedPassword");

    // Close forgot password modal
    const forgotModalEl = document.getElementById("forgotPasswordModal");
    const forgotModal = bootstrap.Modal.getInstance(forgotModalEl);
    if (forgotModal) forgotModal.hide();

    activeForgotSession = null;

    showMessage(`Password successfully rebuilt for ${restoredUsername || targetEmail}! You can now sign in with your new password.`);

    // Switch to login modal
    openLogin(restoredRole);
    const loginUserInput = document.getElementById("loginUsername");
    const loginPassInput = document.getElementById("loginPassword");
    if (loginUserInput && restoredUsername) loginUserInput.value = restoredUsername;
    if (loginPassInput) {
        loginPassInput.value = "";
        loginPassInput.focus();
    }
}

// Bind globally for inline HTML events
window.forgotPassword = forgotPassword;
window.backToForgotStep1 = backToForgotStep1;
window.switchToLoginFromForgot = switchToLoginFromForgot;
window.handleSendForgotOtp = handleSendForgotOtp;
window.handleRebuildPassword = handleRebuildPassword;
window.registerUser = registerUser;
window.openRegister = openRegister;
window.switchToLogin = switchToLogin;
window.setRegisterRole = setRegisterRole;


function openSubmissionModal(id) {

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById(id)
    ).show();

}


function openHelpRequest() {

    openSubmissionModal("helpRequestModal");

}


function openVolunteerApplication() {

    openSubmissionModal("volunteerModal");

}


function openDonationForm() {

    openSubmissionModal("donationModal");

}


function saveSubmission(key, record) {

    const records =
        JSON.parse(localStorage.getItem(key) || "[]");

    const savedRecord = {
        id: Date.now(),
        createdAt: new Date().toLocaleString(),
        ...record
    };

    records.unshift(savedRecord);

    localStorage.setItem(key, JSON.stringify(records));
    return savedRecord;

}

function createApplicationAccount(username, password, role, profileName) {
    const normalizedUsername = username.trim().toLowerCase();
    const accounts = JSON.parse(localStorage.getItem("disasterUserAccounts") || "[]");

    if (accounts.some(function (account) { return account.username === normalizedUsername; })) {
        throw new Error("That username is already registered. Please choose another username.");
    }

    accounts.unshift({
        id: Date.now(),
        username: normalizedUsername,
        password: password,
        role: role,
        profileName: profileName,
        createdAt: new Date().toLocaleString()
    });

    localStorage.setItem("disasterUserAccounts", JSON.stringify(accounts));
    return normalizedUsername;
}


function closeSubmission(id) {

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById(id)
    ).hide();

}


async function submitHelpRequest(event) {

    event.preventDefault();

    const mobileNumber = document.getElementById("helpPhone").value.replace(/\D/g, "");

    if (mobileNumber.length !== 10) {
        showMessage("Please enter a valid 10-digit mobile number.");
        return;
    }

    const helpCategories = Array.from(document.querySelectorAll("#helpCategoryOptions input:checked"), function (input) { return input.value; });
    if (helpCategories.length === 0) {
        showMessage("Please select at least one help category.");
        return;
    }

    const proof = document.getElementById("helpProof").files[0];
    const proofData = proof ? await new Promise(function (resolve) {
        const reader = new FileReader();
        reader.onload = function () { resolve({ name: proof.name, type: proof.type, data: reader.result }); };
        reader.readAsDataURL(proof);
    }) : null;

    const trackId = "DR-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(100000 + Math.random() * 900000);
    saveSubmission("disasterHelpRequests", {
        trackId: trackId,
        name: document.getElementById("helpName").value.trim(),
        fatherName: document.getElementById("helpFatherName").value.trim(),
        mobileNumber: mobileNumber,
        location: document.getElementById("helpVillage").value.trim(),
        state: document.getElementById("helpState").value,
        district: document.getElementById("helpDistrict").value.trim(),
        mandal: document.getElementById("helpMandal").value.trim(),
        village: document.getElementById("helpVillage").value.trim(),
        disasterType: document.getElementById("helpDisasterType").value,
        gps: document.getElementById("helpGps").value,
        proof: proofData,
        help: helpCategories.join(", "),
        priority: document.getElementById("helpPriority").value,
        details: document.getElementById("helpDetails").value,
        status: "Pending"
    });

    closeSubmission("helpRequestModal");
    event.target.reset();
    setupStateDistrictMandalCascade("helpState", "helpDistrict", "helpMandal");
    showMessage("Request submitted. Your Track ID is " + trackId + ". Save it to check status.");

}

function trackHelpRequest() {
    const trackInput = document.getElementById("helpTrackId");
    const status = document.getElementById("helpTrackStatus");
    const trackId = trackInput.value.trim().toUpperCase();
    const requests = JSON.parse(localStorage.getItem("disasterHelpRequests") || "[]");
    const request = requests.find(function (item) { return item.trackId === trackId; });

    if (!trackId) {
        status.textContent = "Enter a Track ID first.";
        status.className = "tracking-error";
        return;
    }

    if (!request) {
        status.textContent = "No request found for this Track ID.";
        status.className = "tracking-error";
        return;
    }

    status.textContent = "Status: " + (request.status || "Pending") + " | Submitted: " + request.createdAt;
    status.className = "tracking-success";
}


document.getElementById("trackHelpRequest").addEventListener("click", trackHelpRequest);

document.getElementById("sendVolunteerPhoneOtp").addEventListener("click", sendVolunteerPhoneOtp);
document.getElementById("confirmVolunteerPhoneOtp").addEventListener("click", confirmVolunteerPhoneOtp);

const helpPhoneInput = document.getElementById("helpPhone");
if (helpPhoneInput) {
    helpPhoneInput.addEventListener("input", function () {
        helpPhoneInput.value = helpPhoneInput.value.replace(/\D/g, "").slice(0, 10);
    });
}

const volunteerPhoneInput = document.getElementById("volunteerPhone");
if (volunteerPhoneInput) {
    volunteerPhoneInput.addEventListener("input", function () {
        volunteerPhoneInput.value = volunteerPhoneInput.value.replace(/\D/g, "").slice(0, 10);
    });
}

let volunteerPhoneOtpValue = "";

async function sendVolunteerPhoneOtp() {
    const mobileNumber = document.getElementById("volunteerPhone").value.replace(/\D/g, "");
    const otpGroup = document.getElementById("volunteerPhoneOtpGroup");
    const statusText = document.getElementById("volunteerPhoneStatus");

    if (mobileNumber.length !== 10) {
        showMessage("Please enter a valid 10-digit mobile number.");
        return;
    }

    try {
        const payload = await requestMobileOtp(mobileNumber);
        volunteerPhoneOtpValue = payload.txnId || "OTP_TXN";
        otpGroup.style.display = "block";
        statusText.textContent = "Demo OTP: " + payload.demoOtp + ". Enter this 6-digit code below to verify.";
        statusText.style.color = "#20a177";
        showMessage("OTP sent! Demo code: " + payload.demoOtp);
    } catch (error) {
        showMessage(error.message || "Unable to send OTP.");
    }
}

async function confirmVolunteerPhoneOtp() {
    const otpInput = document.getElementById("volunteerOtp");
    const statusText = document.getElementById("volunteerPhoneStatus");
    const verifiedInput = document.getElementById("volunteerPhoneVerified");
    const mobileNumber = document.getElementById("volunteerPhone").value.replace(/\D/g, "");

    if (!volunteerPhoneOtpValue || (volunteerPhoneOtpValue === "OTP_TXN" && !otpInput.value.trim())) {
        showMessage("Please send an OTP first.");
        return;
    }

    try {
        const payload = await verifyMobileOtp(mobileNumber, otpInput.value.trim(), volunteerPhoneOtpValue);

        if (payload.verified) {
            verifiedInput.value = "true";
            statusText.textContent = "Mobile number verified successfully.";
            statusText.style.color = "#20a177";
            showMessage(payload.message || "Mobile verification successful.");
            return;
        }

        verifiedInput.value = "false";
        showMessage(payload.message || "Invalid OTP. Please try again.");
    } catch (error) {
        verifiedInput.value = "false";
        showMessage(error.message || "OTP verification failed.");
    }
}

async function submitVolunteerApplication(event) {

    event.preventDefault();

    const mobileNumber = document.getElementById("volunteerPhone").value.replace(/\D/g, "");
    const isPhoneVerified = document.getElementById("volunteerPhoneVerified").value === "true";

    if (mobileNumber.length !== 10 || !isPhoneVerified) {
        showMessage("Please enter a valid 10-digit mobile number and verify it with OTP.");
        return;
    }

    let username;
    try {
        username = createApplicationAccount(
            document.getElementById("volunteerUsername").value,
            document.getElementById("volunteerPassword").value,
            "Volunteer",
            document.getElementById("volunteerName").value.trim()
        );
    } catch (error) {
        showMessage(error.message);
        return;
    }

    const volunteerPhoto = document.getElementById("volunteerPhoto").files[0];
    const photoData = volunteerPhoto ? await new Promise(function (resolve) {
        const reader = new FileReader();
        reader.onload = function () { resolve({ name: volunteerPhoto.name, type: volunteerPhoto.type, data: reader.result }); };
        reader.readAsDataURL(volunteerPhoto);
    }) : null;

    saveSubmission("disasterVolunteers", {
        name: document.getElementById("volunteerName").value.trim(),
        fatherName: document.getElementById("volunteerFatherName").value.trim(),
        phone: mobileNumber,
        username: username,
        mobileNumber: mobileNumber,
        mobileAuthentication: "Verified via OTP",
        location: document.getElementById("volunteerLocation").value,
        state: document.getElementById("volunteerState").value,
        district: document.getElementById("volunteerDistrict").value.trim(),
        mandal: document.getElementById("volunteerMandal").value.trim(),
        skills: document.getElementById("volunteerSkills").value,
        profilePhoto: photoData,
        availability: "Available",
        status: "New"
    });

    closeSubmission("volunteerModal");
    event.target.reset();
    setupStateDistrictMandalCascade("volunteerState", "volunteerDistrict", "volunteerMandal");
    volunteerPhoneOtpValue = "";
    document.getElementById("volunteerPhoneVerified").value = "false";
    document.getElementById("volunteerPhoneOtpGroup").style.display = "none";
    document.getElementById("volunteerPhoneStatus").textContent = "Enter the 10-digit mobile number and verify it with OTP.";
    document.getElementById("volunteerPhoneStatus").style.color = "";
    showMessage("Volunteer registered successfully. You can now sign in from Volunteer Login.");

}


function applyDonationTypes() {

    const selectedTypes = Array.from(document.querySelectorAll("#donationTypeOptions input:checked"), function (input) { return input.value; });
    const selection = document.getElementById("donationTypeSelection");

    if (selectedTypes.length === 0) {
        selection.dataset.types = "[]";
        selection.textContent = "Choose at least one donation type.";
        return;
    }

    selection.dataset.types = JSON.stringify(selectedTypes);
    selection.textContent = "Selected: " + selectedTypes.join(", ");
    document.getElementById("donationTypePicker").open = false;
}


function submitDonation(event) {

    event.preventDefault();

    const donationTypes = JSON.parse(document.getElementById("donationTypeSelection").dataset.types || "[]");
    if (donationTypes.length === 0) {
        showMessage("Please select at least one donation type.");
        return;
    }

    saveSubmission("disasterDonations", {
        donor: document.getElementById("donorName").value,
        state: document.getElementById("donationState").value,
        district: document.getElementById("donationDistrict").value.trim(),
        mandal: document.getElementById("donationMandal") ? document.getElementById("donationMandal").value.trim() : "",
        type: donationTypes.join(", "),
        quantity: document.getElementById("donationQuantity").value,
        phone: document.getElementById("donorPhone").value,
        message: document.getElementById("donationMessage").value.trim(),
        status: "Registered"
    });

    closeSubmission("donationModal");
    event.target.reset();
    setupStateDistrictMandalCascade("donationState", "donationDistrict", "donationMandal");
    document.getElementById("donationTypeSelection").dataset.types = "[]";
    document.getElementById("donationTypeSelection").textContent = "No donation types selected yet.";
    showMessage("Donation registered for Admin tracking.");

}


// =====================================================
// TOAST MESSAGE
// =====================================================

function showMessage(message) {

    document.getElementById(
        "toastMessage"
    ).textContent = message;


    const toastElement =
        document.getElementById(
            "siteToast"
        );


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 4000
            }
        );


    toast.show();

}


// =====================================================
// INDIA MAP INTERACTION
// =====================================================

const mapPins =
    document.querySelectorAll(".map-pin");


mapPins.forEach(function (pin) {

    pin.addEventListener("click", function () {

        showMessage(
            "Emergency response location selected."
        );

    });

});


// =====================================================
// HERO ALERT
// =====================================================

setInterval(function () {

    const alert =
        document.querySelector(".alert-pill");


    if (alert) {

        alert.classList.toggle(
            "alert-active"
        );

    }

}, 3000);