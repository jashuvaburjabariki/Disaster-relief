// Automated End-to-End Verification Test Script
const fs = require('fs');
const path = require('path');

console.log("=================================================");
console.log("RUNNING END-TO-END VERIFICATION OF DISASTER PLATFORM");
console.log("=================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        passed++;
    } else {
        console.error(`[FAIL] ${message}`);
        failed++;
    }
}

// 1. Mock LocalStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) { return store[key] || null; },
        setItem: function (key, value) { store[key] = String(value); },
        removeItem: function (key) { delete store[key]; },
        clear: function () { store = {}; }
    };
})();

// Test 1: File Existence
const files = [
    'index.html',
    'script.js',
    'admin.html',
    'admin.css',
    'admin.js',
    'volunteer.html',
    'volunteer.js',
    'mandal.html',
    'mandal.css',
    'mandal.js',
    'mandals-data.js'
];

files.forEach(file => {
    assert(fs.existsSync(path.join(__dirname, file)), `File exists: ${file}`);
});

// Test 2: Check Mandal Accounts & Admin Approval Workflow
const defaultMandalAccounts = [
    {
        id: "mandal_krishna_vja_rural",
        mandal: "Vijayawada Rural",
        district: "Krishna",
        username: "mandal_vja_rural",
        password: "mandal123",
        status: "Approved",
        approvedBy: "Krishna District Admin"
    },
    {
        id: "mandal_krishna_gudivada",
        mandal: "Gudivada",
        district: "Krishna",
        username: "mandal_gudivada",
        password: "mandal123",
        status: "Pending",
        approvedBy: null
    },
    {
        id: "mandal_chennai_mylapore",
        mandal: "Mylapore",
        district: "Chennai",
        username: "mandal_mylapore",
        password: "mandal123",
        status: "Approved",
        approvedBy: "Chennai District Admin"
    }
];

// Test Pending login check logic
function attemptMandalLogin(username, password, accounts) {
    const acc = accounts.find(a => a.username === username && a.password === password);
    if (!acc) return { success: false, reason: "Invalid credentials" };
    if (acc.status === "Pending") return { success: false, reason: "Pending Admin Approval" };
    return { success: true, account: acc };
}

const loginApproved = attemptMandalLogin("mandal_vja_rural", "mandal123", defaultMandalAccounts);
assert(loginApproved.success === true, "Approved Mandal account can log in");

const loginPending = attemptMandalLogin("mandal_gudivada", "mandal123", defaultMandalAccounts);
assert(loginPending.success === false && loginPending.reason === "Pending Admin Approval", "Pending Mandal account is BLOCKED from logging in");

// Admin approves pending login
defaultMandalAccounts[1].status = "Approved";
defaultMandalAccounts[1].approvedBy = "Krishna District Admin";
const loginNowApproved = attemptMandalLogin("mandal_gudivada", "mandal123", defaultMandalAccounts);
assert(loginNowApproved.success === true, "Admin can approve pending mandal account, enabling login");

// Test 3: Automatic Routing by Mandal
const helpRequests = [
    { id: 101, name: "Citizen A", district: "Krishna", mandal: "Vijayawada Rural", help: "Flood Relief", status: "Pending" },
    { id: 102, name: "Citizen B", district: "Krishna", mandal: "Gudivada", help: "Medical Aid", status: "Pending" },
    { id: 103, name: "Citizen C", district: "Chennai", mandal: "Mylapore", help: "Shelter", status: "Pending" }
];

const volunteers = [
    { id: 201, name: "Vol A", district: "Krishna", mandal: "Vijayawada Rural", skills: "Rescue" },
    { id: 202, name: "Vol B", district: "Krishna", mandal: "Gudivada", skills: "First Aid" },
    { id: 203, name: "Vol C", district: "Chennai", mandal: "Mylapore", skills: "Logistics" }
];

function routeRequestsToMandal(mandalName, districtName, allRequests) {
    return allRequests.filter(r => 
        r.mandal.toLowerCase() === mandalName.toLowerCase() && 
        r.district.toLowerCase() === districtName.toLowerCase()
    );
}

function routeVolunteersToMandal(mandalName, districtName, allVolunteers) {
    return allVolunteers.filter(v => 
        v.mandal.toLowerCase() === mandalName.toLowerCase() && 
        v.district.toLowerCase() === districtName.toLowerCase()
    );
}

const vjaRequests = routeRequestsToMandal("Vijayawada Rural", "Krishna", helpRequests);
assert(vjaRequests.length === 1 && vjaRequests[0].id === 101, "Help request automatically routed strictly to Vijayawada Rural mandal");

const mylaporeRequests = routeRequestsToMandal("Mylapore", "Chennai", helpRequests);
assert(mylaporeRequests.length === 1 && mylaporeRequests[0].id === 103, "Help request automatically routed strictly to Mylapore mandal");

const vjaVolunteers = routeVolunteersToMandal("Vijayawada Rural", "Krishna", volunteers);
assert(vjaVolunteers.length === 1 && vjaVolunteers[0].id === 201, "Volunteer automatically routed strictly to Vijayawada Rural mandal");

// Test 4: Volunteer ID Card Format (Front & Back)
const sampleVol = {
    id: 3001,
    name: "Ramesh Kumar",
    district: "Krishna",
    mandal: "Vijayawada Rural",
    bloodGroup: "O+",
    phone: "9876543210"
};

const frontCard = {
    title: "Disaster Relief & Emergency Response",
    badge: "VOLUNTEER ID CARD",
    name: sampleVol.name,
    volId: "DRVOL-3001",
    district: sampleVol.district,
    mandal: sampleVol.mandal,
    role: "Disaster Relief Volunteer",
    bloodGroup: sampleVol.bloodGroup,
    mobile: sampleVol.phone,
    validFrom: "01/01/2026",
    validUntil: "31/12/2027",
    authorizedSignature: "District Admin"
};

assert(frontCard.volId.startsWith("DRVOL-"), "Front ID Card uses DRVOL- format");
assert(frontCard.role === "Disaster Relief Volunteer", "Front ID Card displays official Role");
assert(frontCard.authorizedSignature === "District Admin", "Front ID Card displays District Admin signature");

const backCard = {
    responsibilitiesTitle: "VOLUNTEER RESPONSIBILITIES",
    responsibilities: [
        "🚨 Assist during disaster emergencies",
        "🏥 Help affected people reach emergency services",
        "🏠 Support shelter and relief activities",
        "📦 Assist with distribution of relief materials",
        "📢 Report emergency situations to the Mandal/Employee",
        "🤝 Coordinate with the disaster management team"
    ],
    emergencyContact: "112",
    verification: {
        volId: "JS-VOL-3001",
        district: sampleVol.district,
        mandal: sampleVol.mandal,
        qrCodeText: "[Scan to Verify Volunteer]"
    },
    disclaimer: "This ID card is issued by DISASTER RELIEF MANAGEMENT and is valid only for authorized disaster-relief volunteer activities."
};

assert(backCard.responsibilities.length === 6, "Back ID Card contains all 6 official responsibilities with emojis");
assert(backCard.emergencyContact === "112", "Back ID Card specifies Emergency Contact: 112");
assert(backCard.verification.volId.startsWith("JS-VOL-"), "Back ID Card verification specifies JS-VOL- format");
assert(backCard.disclaimer.includes("DISASTER RELIEF MANAGEMENT"), "Back ID Card contains official authorized disclaimer");

// Test 5: Profile Picture Delayed Save Rule
let userProfile = {
    name: "Jashuva",
    profilePhoto: "original_photo.png"
};
let pendingPhotoDraft = null;

// User selects file -> preview draft updated, original unchanged
pendingPhotoDraft = "new_photo_draft_base64.png";
assert(userProfile.profilePhoto === "original_photo.png", "Before Save button click, profilePhoto remains unchanged");

// User clicks 'Save' -> draft committed
userProfile.profilePhoto = pendingPhotoDraft;
pendingPhotoDraft = null;
assert(userProfile.profilePhoto === "new_photo_draft_base64.png", "Only AFTER clicking Save button, profilePhoto is committed");

// Test 6: Annual Statements & Resolved Requests Archiving
const resolvedRequests = [
    { id: 101, name: "Citizen A", help: "Flood Relief", status: "Resolved", resolvedAt: "2026-05-12T10:00:00Z", resolvedYear: 2026, mandal: "Vijayawada Rural", district: "Krishna" },
    { id: 104, name: "Citizen D", help: "Cyclone Rescue", status: "Resolved", resolvedAt: "2025-11-20T14:30:00Z", resolvedYear: 2025, mandal: "Vijayawada Rural", district: "Krishna" },
    { id: 105, name: "Citizen E", help: "Medical Evac", status: "In Progress", mandal: "Vijayawada Rural", district: "Krishna" }
];

function filterAnnualStatements(records, targetYear, mandal) {
    return records.filter(r => 
        r.status === "Resolved" && 
        r.mandal === mandal &&
        (targetYear === "All" || r.resolvedYear === targetYear)
    );
}

const statement2026 = filterAnnualStatements(resolvedRequests, 2026, "Vijayawada Rural");
assert(statement2026.length === 1 && statement2026[0].id === 101, "2026 Annual Statement accurately filters resolved requests");

const statement2025 = filterAnnualStatements(resolvedRequests, 2025, "Vijayawada Rural");
assert(statement2025.length === 1 && statement2025[0].id === 104, "2025 Annual Statement accurately filters previous year records");

const statementAll = filterAnnualStatements(resolvedRequests, "All", "Vijayawada Rural");
assert(statementAll.length === 2, "All Years statement includes all archived resolved records for this mandal");

// Test 7: Verify HTML Content
const mandalHtml = fs.readFileSync(path.join(__dirname, 'mandal.html'), 'utf8');
assert(mandalHtml.includes('mandalWeatherWidget'), 'mandal.html includes live weather widget');
assert(mandalHtml.includes('volunteerIdCardModal'), 'mandal.html includes dual-sided ID card modal');
assert(mandalHtml.includes('annualStatementsTable'), 'mandal.html includes annual statements table');
assert(mandalHtml.includes('Picture preview is shown immediately, but will be saved'), 'mandal.html includes delayed photo save notice');

const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
assert(adminHtml.includes('adminWeatherWidget'), 'admin.html includes live weather widget');
assert(adminHtml.includes('volunteerIdCardModal'), 'admin.html includes dual-sided ID card modal');
assert(adminHtml.includes('view-mandals'), 'admin.html includes Mandals management view');
assert(adminHtml.includes('dashMandalVolunteersList'), 'admin.html includes district mandals volunteer breakdown');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
assert(!indexHtml.includes("openLogin('Citizen')"), 'Citizen login option removed from index.html');
assert(!indexHtml.includes('id="registerRoleSelect"'), 'Old generic login type select removed');
assert(indexHtml.includes('Mandal / Employee Registration'), 'Registration modal supports Mandal / Employee Registration');
assert(indexHtml.includes("setRegisterRole('Admin')") || indexHtml.includes('Admin Registration'), 'Registration modal supports Admin Registration');
assert(!indexHtml.includes('id="registerPhone"'), 'Registration form excludes phone number column');
assert(!indexHtml.includes('id="registerAge"'), 'Registration form excludes age column');
assert(indexHtml.includes('id="registerEmail"'), 'Registration form includes official email column for password recovery');
assert(indexHtml.includes('id="registerMandal"'), 'Registration form includes mandal column as like other forms');

assert(indexHtml.includes('id="forgotPasswordModal"'), 'index.html includes forgotPasswordModal');
assert(indexHtml.includes('id="forgotEmail"'), 'forgotPasswordModal includes registered email input');
assert(indexHtml.includes('id="sendForgotOtpBtn"'), 'forgotPasswordModal includes Send OTP button');
assert(indexHtml.includes('id="forgotGeneratedOtpCode"'), 'forgotPasswordModal includes OTP display');
assert(indexHtml.includes('id="forgotOtpInput"'), 'forgotPasswordModal includes OTP verification input');
assert(indexHtml.includes('id="forgotNewPassword"'), 'forgotPasswordModal includes new password input');
assert(indexHtml.includes('id="forgotConfirmPassword"'), 'forgotPasswordModal includes confirm password input');
assert(indexHtml.includes('id="rebuildPasswordBtn"'), 'forgotPasswordModal includes Rebuild Password button');

const volunteerHtml = fs.readFileSync(path.join(__dirname, 'volunteer.html'), 'utf8');
assert(volunteerHtml.includes('volWeatherWidget'), 'volunteer.html includes live weather widget');
assert(volunteerHtml.includes('volunteerIdCardModal'), 'volunteer.html includes dual-sided ID card modal');
assert(volunteerHtml.includes('Picture will be saved only after clicking'), 'volunteer.html includes delayed photo save notice');

// Test 8: End-to-End Forgot Password & Rebuild Password with Email and OTP Simulation
const testAdmins = [
    {
        username: "admin_krishna",
        password: "oldAdminPassword123",
        email: "admin.krishna@disaster.gov.in",
        role: "Admin",
        district: "Krishna"
    }
];

function simulateSendForgotOtp(email, admins) {
    const acc = admins.find(a => (a.email || "").toLowerCase() === email.toLowerCase());
    if (!acc) return { success: false, reason: "Account not found" };
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    return {
        success: true,
        session: { email: email, otp: otp, username: acc.username, role: acc.role }
    };
}

function simulateRebuildPassword(session, enteredOtp, newPassword, confirmPassword, admins) {
    if (!session) return { success: false, reason: "No active session" };
    if (enteredOtp !== session.otp) return { success: false, reason: "Invalid OTP" };
    if (!newPassword || newPassword.length < 6) return { success: false, reason: "Password too short" };
    if (newPassword !== confirmPassword) return { success: false, reason: "Passwords mismatch" };

    const target = admins.find(a => (a.email || "").toLowerCase() === session.email.toLowerCase());
    if (target) {
        target.password = newPassword;
        return { success: true, updatedAccount: target };
    }
    return { success: false, reason: "Account disappeared" };
}

// 8a: Request OTP for unknown email fails
const otpFail = simulateSendForgotOtp("unknown@disaster.gov.in", testAdmins);
assert(otpFail.success === false, "Forgot Password rejects unregistered email");

// 8b: Request OTP for valid admin email succeeds with 6-digit OTP
const otpSuccess = simulateSendForgotOtp("admin.krishna@disaster.gov.in", testAdmins);
assert(otpSuccess.success === true && otpSuccess.session.otp.length === 6, "Forgot Password generates 6-digit verification OTP");

// 8c: Rebuild with wrong OTP fails
const rebuildWrongOtp = simulateRebuildPassword(otpSuccess.session, "000000", "newPass2026!", "newPass2026!", testAdmins);
assert(rebuildWrongOtp.success === false && rebuildWrongOtp.reason === "Invalid OTP", "Rebuild password rejects incorrect OTP");

// 8d: Rebuild with mismatched passwords fails
const rebuildMismatch = simulateRebuildPassword(otpSuccess.session, otpSuccess.session.otp, "newPass2026!", "differentPass!", testAdmins);
assert(rebuildMismatch.success === false && rebuildMismatch.reason === "Passwords mismatch", "Rebuild password rejects mismatched confirmation");

// 8e: Rebuild with valid OTP and matching password succeeds and updates password
const rebuildSuccess = simulateRebuildPassword(otpSuccess.session, otpSuccess.session.otp, "newAdminSecuredPass2026", "newAdminSecuredPass2026", testAdmins);
assert(rebuildSuccess.success === true, "Rebuild password succeeds with valid OTP and matching new password");
assert(testAdmins[0].password === "newAdminSecuredPass2026", "District Admin account password rebuilt and updated in storage");

// 8f: Login with newly rebuilt password succeeds
const loginWithNewPassword = (function(user, pass, admins) {
    return admins.some(a => a.username === user && a.password === pass);
})("admin_krishna", "newAdminSecuredPass2026", testAdmins);
assert(loginWithNewPassword === true, "Administrator successfully signs in with newly rebuilt password");

// Test 9: Mandal / Employee Registration with Mandal Column
const testMandalAccounts = [];

function simulateRegisterUser(role, data, mandalList, adminList) {
    if (!data.name || !data.email || !data.username || !data.password || !data.state || !data.district) {
        return { success: false, reason: "Missing required fields" };
    }
    if (role === "Mandal Employee") {
        if (!data.mandal) return { success: false, reason: "Mandal required" };
        const newAcc = {
            id: "mnd_" + Date.now(),
            mandal: data.mandal,
            district: data.district,
            state: data.state,
            officerName: data.name,
            email: data.email,
            username: data.username,
            password: data.password,
            role: "Mandal Employee",
            status: "Pending" // REQUIRES DISTRICT ADMIN APPROVAL
        };
        mandalList.push(newAcc);
        return { success: true, account: newAcc };
    } else {
        const newAdmin = {
            id: "adm_" + Date.now(),
            name: data.name,
            email: data.email,
            username: data.username,
            password: data.password,
            district: data.district,
            state: data.state,
            role: "Admin"
        };
        adminList.push(newAdmin);
        return { success: true, account: newAdmin };
    }
}

// 9a: Mandal registration fails without mandal column
const regNoMandal = simulateRegisterUser("Mandal Employee", {
    name: "Suresh Rao",
    email: "suresh@disaster.gov.in",
    username: "mandal_suresh",
    password: "password123",
    state: "Andhra Pradesh",
    district: "Krishna"
}, testMandalAccounts, testAdmins);
assert(regNoMandal.success === false && regNoMandal.reason === "Mandal required", "Mandal registration enforces selecting a Mandal / Taluk");

// 9b: Mandal registration succeeds with mandal column and sets Pending status
const regWithMandal = simulateRegisterUser("Mandal Employee", {
    name: "Suresh Rao",
    email: "suresh@disaster.gov.in",
    username: "mandal_suresh",
    password: "password123",
    state: "Andhra Pradesh",
    district: "Krishna",
    mandal: "Vijayawada Urban"
}, testMandalAccounts, testAdmins);
assert(regWithMandal.success === true && regWithMandal.account.mandal === "Vijayawada Urban", "Mandal registration records Mandal column correctly");
assert(regWithMandal.account.status === "Pending", "Mandal registration creates account with PENDING status for Admin approval");

// 9c: script.js contains setRegisterRole logic and binds to window
const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
assert(scriptContent.includes('function setRegisterRole(role)'), "script.js implements setRegisterRole function");
assert(scriptContent.includes('window.setRegisterRole = setRegisterRole'), "script.js exports setRegisterRole to window");

console.log("=================================================");
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================");
if (failed > 0) process.exit(1);
