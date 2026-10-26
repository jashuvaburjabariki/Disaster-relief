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

    if (!navbar) return;
    const isAboutPage = window.location.pathname.endsWith("about.html") || window.location.pathname.includes("about.html");

    if (window.scrollY > 40) {

        navbar.classList.add("scrolled");

    } else if (!isAboutPage) {

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

        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
            link.classList.remove("active");

            if (href === "#" + currentSection) {

                link.classList.add("active");

            }
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
// SHOW / HIDE PASSWORD TOGGLE
// =====================================================

function updatePasswordToggleState(isVisible) {
    const toggleBtn = document.getElementById("showPasswordToggleBtn");
    const toggleIcon = document.getElementById("showPasswordToggleIcon");
    const toggleText = document.getElementById("showPasswordToggleText");

    if (toggleIcon) {
        toggleIcon.className = isVisible ? "bi bi-eye-slash" : "bi bi-eye";
    }
    if (toggleText) {
        toggleText.textContent = isVisible ? "Hide" : "Show";
    }
    if (toggleBtn) {
        const label = isVisible ? "Hide password" : "Show password";
        toggleBtn.setAttribute("aria-label", label);
        toggleBtn.setAttribute("title", label);
    }
}

function updateLoginPasswordToggleVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const toggleBtn = document.getElementById("showPasswordToggleBtn");
    const checkboxLabel = document.getElementById("showPasswordCheckboxLabel");
    const checkboxInput = document.getElementById("showPasswordCheckbox");

    if (!passwordInput) return;

    const hasValue = Boolean(passwordInput.value && passwordInput.value.length > 0);

    if (toggleBtn) {
        toggleBtn.style.display = hasValue ? "inline-flex" : "none";
    }
    if (checkboxLabel) {
        checkboxLabel.style.display = hasValue ? "inline-flex" : "none";
    }

    if (!hasValue) {
        passwordInput.type = "password";
        if (checkboxInput) checkboxInput.checked = false;
        updatePasswordToggleState(false);
    }
}

function toggleLoginPasswordVisibility(forceState) {
    const passwordInput = document.getElementById("loginPassword");
    const checkboxInput = document.getElementById("showPasswordCheckbox");
    if (!passwordInput) return;

    const isCurrentlyVisible = passwordInput.type === "text";
    const nextState = typeof forceState === "boolean" ? forceState : !isCurrentlyVisible;

    passwordInput.type = nextState ? "text" : "password";

    if (checkboxInput) {
        checkboxInput.checked = nextState;
    }
    updatePasswordToggleState(nextState);

    if (typeof passwordInput.setSelectionRange === "function") {
        const len = passwordInput.value.length;
        passwordInput.setSelectionRange(len, len);
    }
    passwordInput.focus();
}

function toggleGenericPassword(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;

    const nextState = input.type !== "text";
    input.type = nextState ? "text" : "password";

    const icon = btn.querySelector("i");
    const text = btn.querySelector("span");
    if (icon) icon.className = nextState ? "bi bi-eye-slash" : "bi bi-eye";
    if (text) text.textContent = nextState ? "Hide" : "Show";
    const label = nextState ? "Hide password" : "Show password";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);

    if (typeof input.setSelectionRange === "function") {
        const len = input.value.length;
        input.setSelectionRange(len, len);
    }
    input.focus();
}

function attachGenericPasswordWatcher(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;

    function check() {
        const hasValue = Boolean(input.value && input.value.length > 0);
        btn.style.display = hasValue ? "inline-flex" : "none";
        if (!hasValue) {
            input.type = "password";
            const icon = btn.querySelector("i");
            const text = btn.querySelector("span");
            if (icon) icon.className = "bi bi-eye";
            if (text) text.textContent = "Show";
            btn.setAttribute("aria-label", "Show password");
            btn.setAttribute("title", "Show password");
        }
    }

    input.addEventListener("input", check);
    input.addEventListener("keyup", check);
    input.addEventListener("change", check);
    input.addEventListener("paste", function () { setTimeout(check, 10); });
    check();
}

function setupLoginPasswordListeners() {
    const passwordInput = document.getElementById("loginPassword");
    const toggleBtn = document.getElementById("showPasswordToggleBtn");
    const checkboxInput = document.getElementById("showPasswordCheckbox");
    const loginModalEl = document.getElementById("loginModal");

    if (passwordInput) {
        passwordInput.addEventListener("input", updateLoginPasswordToggleVisibility);
        passwordInput.addEventListener("keyup", updateLoginPasswordToggleVisibility);
        passwordInput.addEventListener("change", updateLoginPasswordToggleVisibility);
        passwordInput.addEventListener("paste", function () {
            setTimeout(updateLoginPasswordToggleVisibility, 10);
        });
        passwordInput.addEventListener("cut", function () {
            setTimeout(updateLoginPasswordToggleVisibility, 10);
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleLoginPasswordVisibility();
        });
    }

    if (checkboxInput) {
        checkboxInput.addEventListener("change", function () {
            toggleLoginPasswordVisibility(checkboxInput.checked);
        });
    }

    if (loginModalEl) {
        loginModalEl.addEventListener("hidden.bs.modal", function () {
            if (passwordInput) passwordInput.type = "password";
            if (checkboxInput) checkboxInput.checked = false;
            updatePasswordToggleState(false);
            updateLoginPasswordToggleVisibility();
        });
        loginModalEl.addEventListener("shown.bs.modal", function () {
            updateLoginPasswordToggleVisibility();
        });
    }

    attachGenericPasswordWatcher("registerPassword", "registerPasswordToggleBtn");
    attachGenericPasswordWatcher("forgotNewPassword", "forgotNewPasswordToggleBtn");
    attachGenericPasswordWatcher("forgotConfirmPassword", "forgotConfirmPasswordToggleBtn");

    updateLoginPasswordToggleVisibility();
}

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
    if (passwordInput) {
        passwordInput.value = rememberedPassword || "";
        passwordInput.type = "password";
    }
    if (rememberCheckbox) rememberCheckbox.checked = Boolean(rememberedEmail || rememberedPassword);

    const checkboxInput = document.getElementById("showPasswordCheckbox");
    if (checkboxInput) checkboxInput.checked = false;
    updatePasswordToggleState(false);
    updateLoginPasswordToggleVisibility();

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

        if ((username === "admin" || username === "admin_asr" || username === "admin_alluri") && password === "admin123") {
            localStorage.setItem("disasterAdminDistrict", "Alluri Sitharama Raju");
            localStorage.setItem("disasterAdminJurisdiction", JSON.stringify({ state: "Andhra Pradesh", district: "Alluri Sitharama Raju" }));
            localStorage.setItem("disasterAdminName", "District Collector & Magistrate");
            window.location.href = "admin.html";
            return;
        } else if (username === "admin_krishna" && password === "admin123") {
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
            showMessage("Invalid Admin credentials. Try admin_asr / admin123 or admin_krishna / admin123.");
            return;
        }
    }

    // VOLUNTEER LOGIN (Requires Mandal Officer approval)
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
                (v.phone === password || password === "volunteer123" || v.password === password);
        });

        if (!account && !volMatch && !(username === "volunteer" && password === "volunteer123")) {
            showMessage("Invalid username or password for Volunteer login.");
            return;
        }

        // CHECK MANDAL OFFICER APPROVAL
        const isDemo = username === "volunteer" && password === "volunteer123";
        if (!isDemo) {
            const target = volMatch || (account ? volunteers.find(function (v) {
                return (v.username || "").toLowerCase() === (account.username || "").toLowerCase() || v.name === account.profileName;
            }) : null);

            const isPending = (target && (target.status === "Pending" || target.approvalStatus === "Pending" || target.status === "New")) ||
                              (account && (account.status === "Pending" || account.approvalStatus === "Pending"));

            if (isPending) {
                const targetMandal = (target && target.mandal) || "local";
                showMessage(`Approval Required: Your Volunteer registration for ${targetMandal} Mandal is PENDING APPROVAL by the Mandal Officer. Once approved, you can log in.`);
                return;
            }
        }

        const volUser = account || volMatch || { username: "volunteer", role: "Volunteer", name: "Volunteer", status: "Approved" };
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
    try {
        const records = JSON.parse(localStorage.getItem(key) || "[]");
        const savedRecord = {
            id: Date.now(),
            createdAt: new Date().toLocaleString(),
            ...record
        };
        records.unshift(savedRecord);
        try {
            localStorage.setItem(key, JSON.stringify(records));
        } catch (storageErr) {
            console.warn("Storage quota limit reached for " + key + ", attempting trim...", storageErr);
            if (savedRecord.proof) {
                savedRecord.proof = { name: savedRecord.proof.name || "Verification file", note: "Stored at control desk" };
            }
            records[0] = savedRecord;
            if (records.length > 50) records.splice(50);
            try {
                localStorage.setItem(key, JSON.stringify(records));
            } catch (err2) {
                console.error("Critical storage error:", err2);
            }
        }
        return savedRecord;
    } catch (err) {
        console.error("saveSubmission failed", err);
        return { id: Date.now(), createdAt: new Date().toLocaleString(), ...record };
    }
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
        approvalStatus: role === "Volunteer" ? "Pending" : "Approved",
        status: role === "Volunteer" ? "Pending" : "Approved",
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
    if (event) event.preventDefault();

    const alertEl = document.getElementById("helpFormAlert");
    if (alertEl) {
        alertEl.style.display = "none";
        alertEl.innerHTML = "";
    }

    const name = (document.getElementById("helpName") ? document.getElementById("helpName").value : "").trim();
    const fatherName = (document.getElementById("helpFatherName") ? document.getElementById("helpFatherName").value : "").trim();
    const phoneInput = document.getElementById("helpPhone");
    const mobileNumber = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";

    if (mobileNumber.length !== 10) {
        const errorMsg = "Please enter a valid 10-digit mobile number.";
        if (alertEl) {
            alertEl.className = "alert alert-danger py-2 px-3 small";
            alertEl.textContent = errorMsg;
            alertEl.style.display = "block";
        }
        showMessage(errorMsg);
        if (phoneInput) phoneInput.focus();
        return;
    }

    const lossCategories = Array.from(document.querySelectorAll("#helpLossesOptions input:checked"), function (input) { return input.value; });
    let helpCategories = Array.from(document.querySelectorAll("#helpCategoryOptions input:checked"), function (input) { return input.value; });
    if (helpCategories.length === 0) {
        helpCategories = ["Emergency Disaster Relief"];
    }

    let proofData = null;
    const proofInput = document.getElementById("helpProof");
    if (proofInput && proofInput.files && proofInput.files[0]) {
        const proof = proofInput.files[0];
        try {
            proofData = await new Promise(function (resolve) {
                const reader = new FileReader();
                reader.onload = function () {
                    resolve({ name: proof.name, type: proof.type, data: reader.result });
                };
                reader.onerror = function () { resolve(null); };
                reader.readAsDataURL(proof);
            });
        } catch (e) {
            console.warn("Could not read attached proof file", e);
        }
    }

    const state = document.getElementById("helpState") ? document.getElementById("helpState").value : "";
    const district = document.getElementById("helpDistrict") ? document.getElementById("helpDistrict").value.trim() : "";
    const mandal = document.getElementById("helpMandal") ? document.getElementById("helpMandal").value.trim() : "";
    const village = document.getElementById("helpVillage") ? document.getElementById("helpVillage").value.trim() : "";
    const disasterType = document.getElementById("helpDisasterType") ? document.getElementById("helpDisasterType").value : "Emergency";
    const gps = document.getElementById("helpGps") ? document.getElementById("helpGps").value : "";
    const priority = document.getElementById("helpPriority") ? document.getElementById("helpPriority").value : "High";
    const details = document.getElementById("helpDetails") ? document.getElementById("helpDetails").value : "";

    const trackId = "DR-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(100000 + Math.random() * 900000);

    const record = {
        trackId: trackId,
        name: name,
        fatherName: fatherName,
        mobileNumber: mobileNumber,
        phone: mobileNumber,
        location: village || "Local Area",
        state: state,
        district: district,
        mandal: mandal,
        village: village,
        disasterType: disasterType,
        gps: gps,
        proof: proofData,
        losses: lossCategories.join(", "),
        help: helpCategories.join(", "),
        priority: priority,
        details: details,
        status: "Pending"
    };

    saveSubmission("disasterHelpRequests", record);

    // Update tracking panel in modal
    const trackInput = document.getElementById("helpTrackId");
    if (trackInput) trackInput.value = trackId;
    const trackStatus = document.getElementById("helpTrackStatus");
    if (trackStatus) {
        trackStatus.textContent = `Request Submitted. Track ID: ${trackId} (Status: Pending Verification)`;
        trackStatus.className = "tracking-success";
    }

    if (alertEl) {
        alertEl.className = "alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-3";
        alertEl.innerHTML = `<div><i class="bi bi-check-circle-fill text-success me-1"></i> <strong>Request submitted successfully!</strong><div class="small text-muted">Your Track ID is <strong class="font-monospace text-primary">${trackId}</strong></div></div><button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" onclick="navigator.clipboard && navigator.clipboard.writeText('${trackId}')">Copy ID</button>`;
        alertEl.style.display = "block";
    }

    showMessage("Help Request submitted successfully! Your Track ID is " + trackId);

    // Reset inputs
    const form = document.getElementById("helpRequestForm");
    if (form) form.reset();

    // Re-check default assistance checkbox
    const defaultBox = document.querySelector("#helpCategoryOptions input[value='Food and water']");
    if (defaultBox) defaultBox.checked = true;

    // Reset cascade
    setupStateDistrictMandalCascade("helpState", "helpDistrict", "helpMandal");

    // Close modal after brief confirmation so citizen can see Track ID
    setTimeout(function () {
        closeSubmission("helpRequestModal");
        if (alertEl) alertEl.style.display = "none";
    }, 2400);
}

function trackHelpRequest() {
    const trackInput = document.getElementById("helpTrackId");
    const status = document.getElementById("helpTrackStatus");
    const query = trackInput ? trackInput.value.trim().toUpperCase() : "";
    const requests = JSON.parse(localStorage.getItem("disasterHelpRequests") || "[]");
    const request = requests.find(function (item) {
        return (item.trackId && item.trackId.toUpperCase() === query) ||
               String(item.id) === query ||
               (item.mobileNumber && item.mobileNumber === query);
    });

    if (!query) {
        status.textContent = "Please enter a Track ID or 10-digit mobile number.";
        status.className = "tracking-error";
        return;
    }

    if (!request) {
        status.textContent = "No request found for this Track ID / Mobile Number.";
        status.className = "tracking-error";
        return;
    }

    const assignedInfo = request.assignedVolunteer ? ` · Assigned Responder: ${request.assignedVolunteer.name} (${request.assignedVolunteer.phone || ''})` : "";
    const lossInfo = request.losses ? ` · Reported Losses: ${request.losses}` : "";
    status.textContent = `Status: ${request.status || "Pending"}${assignedInfo}${lossInfo} | Submitted: ${request.createdAt || "Recent"}`;
    status.className = "tracking-success";
}


const trackHelpBtn = document.getElementById("trackHelpRequest");
if (trackHelpBtn) {
    trackHelpBtn.addEventListener("click", trackHelpRequest);
}

const sendOtpBtn = document.getElementById("sendVolunteerPhoneOtp");
if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", sendVolunteerPhoneOtp);
}

const confirmOtpBtn = document.getElementById("confirmVolunteerPhoneOtp");
if (confirmOtpBtn) {
    confirmOtpBtn.addEventListener("click", confirmVolunteerPhoneOtp);
}

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
        availability: "Pending Approval",
        status: "Pending",
        approvalStatus: "Pending",
        approvedBy: null
    });

    closeSubmission("volunteerModal");
    event.target.reset();
    setupStateDistrictMandalCascade("volunteerState", "volunteerDistrict", "volunteerMandal");
    volunteerPhoneOtpValue = "";
    document.getElementById("volunteerPhoneVerified").value = "false";
    document.getElementById("volunteerPhoneOtpGroup").style.display = "none";
    document.getElementById("volunteerPhoneStatus").textContent = "Enter the 10-digit mobile number and verify it with OTP.";
    document.getElementById("volunteerPhoneStatus").style.color = "";
    showMessage("Volunteer application submitted! Your application is pending approval by your Mandal Officer. Once approved, you can log in.");
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


function updateDonationDestinationDisplay() {
    const dEl = document.getElementById("donationDistrict");
    const mEl = document.getElementById("donationMandal");
    const tEl = document.getElementById("donationIntendedDestinationText");
    if (dEl && mEl && tEl) {
        tEl.textContent = `${dEl.value} District Relief Fund (${mEl.value} Area/Mandal)`;
    }
}
window.updateDonationDestinationDisplay = updateDonationDestinationDisplay;

function submitDonation(event) {
    event.preventDefault();

    const donationTypes = JSON.parse(document.getElementById("donationTypeSelection").dataset.types || "[]");
    if (donationTypes.length === 0) {
        showMessage("Please select at least one donation type.");
        return;
    }

    const dist = document.getElementById("donationDistrict").value.trim() || "Alluri Sitharama Raju";
    const mandal = document.getElementById("donationMandal") ? document.getElementById("donationMandal").value.trim() : "Paderu";

    saveSubmission("disasterDonations", {
        donor: document.getElementById("donorName").value,
        state: document.getElementById("donationState").value || "Andhra Pradesh",
        district: dist,
        mandal: mandal,
        destinationMandal: mandal,
        officialAccount: "38588079208",
        officialBank: "State Bank of India (SBIN0018884)",
        intendedDestination: `Alluri Sitharama Raju District (${mandal})`,
        type: donationTypes.join(", "),
        quantity: document.getElementById("donationQuantity").value,
        phone: document.getElementById("donorPhone").value,
        message: document.getElementById("donationMessage").value.trim(),
        status: "Registered",
        createdAt: new Date().toLocaleString()
    });

    closeSubmission("donationModal");
    event.target.reset();
    document.getElementById("donationTypeSelection").dataset.types = '["Money"]';
    document.getElementById("donationTypeSelection").textContent = "Selected: Money";
    showMessage(`Official donation registered successfully for ${mandal}, ${dist}! Credited to State Bank of India A/C 38588079208.`);
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

// ==========================================
// PRE-DISASTER MOBILE TEXT ALERT FUNCTIONS
// ==========================================
function initHomePageSmsBanner() {
    try {
        const rawAlerts = localStorage.getItem("disasterAlerts");
        const alerts = rawAlerts ? JSON.parse(rawAlerts) : [];
        const sms = alerts.find(function (a) { return a.isSms; }) || alerts[0];
        const bannerText = document.getElementById("latestSmsText");
        if (bannerText && sms) {
            bannerText.textContent = `${sms.type || 'EMERGENCY'}: ${sms.title || 'Disaster Alert'} - ${sms.message || sms.details || ''}`;
        }
    } catch (e) {
        console.error("Error loading pre-disaster SMS alert banner:", e);
    }
}

function openSmsNotificationModal(alertObj) {
    if (!alertObj) {
        try {
            const rawAlerts = localStorage.getItem("disasterAlerts");
            const alerts = rawAlerts ? JSON.parse(rawAlerts) : [];
            alertObj = alerts.find(function (a) { return a.isSms; }) || alerts[0] || {
                sender: "DISASTER CONTROL ROOM",
                message: "⚠️ URGENT PRE-DISASTER WARNING: Severe weather & flood warning dispatched to your mobile. Relocate to designated shelters immediately.",
                createdAt: "Delivered to registered mobile numbers"
            };
        } catch (e) {
            alertObj = {
                sender: "DISASTER CONTROL ROOM",
                message: "⚠️ URGENT PRE-DISASTER WARNING: Severe weather & flood warning dispatched to your mobile. Relocate to designated shelters immediately.",
                createdAt: "Delivered to registered mobile numbers"
            };
        }
    }
    const senderEl = document.getElementById("modalSmsSender");
    const bodyEl = document.getElementById("modalSmsBody");
    const timeEl = document.getElementById("modalSmsTime");
    if (senderEl) senderEl.textContent = alertObj.sender || "DISASTER CONTROL ROOM";
    if (bodyEl) bodyEl.textContent = alertObj.message || alertObj.details || alertObj.title || "";
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

// Initialize password toggle handlers and export helpers
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        setupLoginPasswordListeners();
        initHomePageSmsBanner();
    });
} else {
    setupLoginPasswordListeners();
    initHomePageSmsBanner();
}

window.toggleLoginPasswordVisibility = toggleLoginPasswordVisibility;
window.updateLoginPasswordToggleVisibility = updateLoginPasswordToggleVisibility;
window.toggleGenericPassword = toggleGenericPassword;
window.openLogin = openLogin;

// ==========================================
// SECTION: CITIZEN LIVE WEATHER INTELLIGENCE
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

async function loadCitizenLiveWeather() {
    const tempEl = document.getElementById("citizenWeatherTemp");
    const condEl = document.getElementById("citizenWeatherCondition");
    const badgeEl = document.getElementById("citizenWeatherBadge");
    const iconEl = document.getElementById("citizenWeatherIcon");
    if (!tempEl || !condEl) return;

    const loc = getDistrictLocation("Krishna");

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
        condEl.textContent = `${condition} · Andhra Pradesh`;
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
        condEl.textContent = `Clear Skies · Andhra Pradesh`;
        if (badgeEl) {
            badgeEl.className = "badge bg-success text-white py-0 px-1";
            badgeEl.textContent = "Normal";
        }
        if (iconEl) {
            iconEl.innerHTML = '<i class="bi bi-sun-fill text-warning"></i>';
        }
    }
}
window.loadCitizenLiveWeather = loadCitizenLiveWeather;

async function openWeatherDetailModal(districtName) {
    const targetDist = districtName || "Krishna";
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
        if (heroLoc) heroLoc.textContent = `${loc.name}, Andhra Pradesh`;

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
                windBoxEl.textContent = "⚠️ DANGER: Strong gale winds. Tree falls and tin roof hazards expected. Follow evacuation instructions.";
            }
        } else if (wind > 35) {
            if (windCatEl) { windCatEl.textContent = "Strong Breeze"; windCatEl.className = "badge bg-warning text-dark"; }
            if (windBoxEl) {
                windBoxEl.style.background = "#fffbeb"; windBoxEl.style.borderColor = "#fde68a"; windBoxEl.style.color = "#92400e";
                windBoxEl.textContent = "Elevated wind speeds. Caution advised near water bodies and temporary structures.";
            }
        } else {
            if (windCatEl) { windCatEl.textContent = "Moderate Breeze"; windCatEl.className = "badge bg-success"; }
            if (windBoxEl) {
                windBoxEl.style.background = "#f0fdf4"; windBoxEl.style.borderColor = "#bbf7d0"; windBoxEl.style.color = "#166534";
                windBoxEl.textContent = "Wind conditions within safe operational limits for field relief and boats.";
            }
        }
    } catch (e) {
        console.warn("Open-Meteo weather load error:", e);
    }
}
window.openWeatherDetailModal = openWeatherDetailModal;

// Event Listeners for Citizen Weather
if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            loadCitizenLiveWeather();
        });
    } else {
        loadCitizenLiveWeather();
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
}
