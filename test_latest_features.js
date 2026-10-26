// test_latest_features.js
// Automated verification script for the latest set of user requirements.

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`[PASS] ${testName}`);
        passed++;
    } else {
        console.error(`[FAIL] ${testName}`);
        failed++;
    }
}

const indexHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const aboutHtml = fs.readFileSync(path.join(__dirname, "about.html"), "utf8");
const adminHtml = fs.readFileSync(path.join(__dirname, "admin.html"), "utf8");
const mandalHtml = fs.readFileSync(path.join(__dirname, "mandal.html"), "utf8");
const volunteerHtml = fs.readFileSync(path.join(__dirname, "volunteer.html"), "utf8");

const scriptJs = fs.readFileSync(path.join(__dirname, "script.js"), "utf8");
const adminJs = fs.readFileSync(path.join(__dirname, "admin.js"), "utf8");
const mandalJs = fs.readFileSync(path.join(__dirname, "mandal.js"), "utf8");
const volunteerJs = fs.readFileSync(path.join(__dirname, "volunteer.js"), "utf8");
const styleCss = fs.readFileSync(path.join(__dirname, "style.css"), "utf8");
const adminCss = fs.readFileSync(path.join(__dirname, "admin.css"), "utf8");

console.log("=================================================");
console.log("TESTING LATEST FEATURES IMPLEMENTATION");
console.log("=================================================");

// 1. HELP REQUEST FORM & LOSS REPORTING
assert(indexHtml.includes('id="lossHouse"') && indexHtml.includes('House / Shelter Damaged'), "index.html includes House loss checkbox");
assert(indexHtml.includes('id="lossAnimals"') && indexHtml.includes('Animals / Livestock Lost'), "index.html includes Animals loss checkbox");
assert(indexHtml.includes('id="lossAgriculture"') && indexHtml.includes('Agriculture / Crops Ruined'), "index.html includes Agriculture loss checkbox");
assert(indexHtml.includes('id="lossInjure"') && indexHtml.includes('Person Injured / Casualties'), "index.html includes Person Injured loss checkbox");
assert(indexHtml.includes('id="helpFormAlert"'), "index.html includes helpFormAlert for feedback");
assert(scriptJs.includes('losses: lossCategories.join(", ")'), "script.js saves losses in help request record");
assert(scriptJs.includes('help: helpCategories.join(", ")'), "script.js saves assistance categories in help request");

// 2. CONTACT ADMIN REMOVED IN VOLUNTEER LOGIN
const logoutIdx = volunteerHtml.indexOf('id="volunteerLogout"');
const contactAdminIdx = volunteerHtml.toLowerCase().indexOf("contact admin");
assert(contactAdminIdx === -1 || contactAdminIdx > logoutIdx, "Contact Admin removed from upside of logout button in volunteer.html");

// 3. MANDAL OFFICER VOLUNTEER APPROVAL WORKFLOW
assert(scriptJs.includes('approvalStatus: "Pending"') || scriptJs.includes("approvalStatus: 'Pending'"), "Volunteer registration marks approvalStatus Pending");
assert(mandalHtml.includes('mandalVolunteersTable') && mandalHtml.includes('Pending Approval'), "mandal.html volunteers table supports Pending Approval filter");
assert(mandalJs.includes('function approveVolunteerApplication'), "mandal.js implements approveVolunteerApplication");
assert(mandalJs.includes('vol.status = "Available"') && mandalJs.includes('vol.approvalStatus = "Approved"'), "approveVolunteerApplication activates volunteer status");
assert(scriptJs.includes('PENDING APPROVAL by the Mandal Officer') || scriptJs.includes('isPending'), "Volunteer login is blocked while pending approval");

// 4. UNIVERSAL FOOTER & LOGO ON EVERY LOGIN AND EVERY PAGE
const pages = [
    { name: "index.html", content: indexHtml },
    { name: "about.html", content: aboutHtml },
    { name: "admin.html", content: adminHtml },
    { name: "mandal.html", content: mandalHtml },
    { name: "volunteer.html", content: volunteerHtml }
];

pages.forEach(p => {
    assert(p.content.includes('<footer') && p.content.includes('DISASTER') && p.content.includes('RELIEF'), `${p.name} has homepage footer`);
    assert(p.content.includes('brand-logo') && p.content.includes('bi-shield-fill-check'), `${p.name} has official shield brand logo`);
});

// 5. MANDAL OFFICER ASSIGNS VOLUNTEERS TO HELP REQUESTS
assert(mandalHtml.includes('id="view-assign"'), "mandal.html includes assign volunteers view");
assert(mandalHtml.includes('id="mandalAssignSelectRequest"'), "mandal.html includes assign select request dropdown");
assert(mandalHtml.includes('id="mandalAssignSelectVolunteer"'), "mandal.html includes assign select volunteer dropdown");
assert(mandalHtml.includes('id="executeMandalAssignmentBtn"'), "mandal.html includes confirm dispatch button");
assert(mandalJs.includes('function executeMandalAssignment'), "mandal.js implements executeMandalAssignment");
assert(mandalJs.includes('req.status = "Assigned"') && mandalJs.includes('vol.status = "Assigned"'), "executeMandalAssignment updates request and volunteer to Assigned");

// 6. VOLUNTEER TASK ACCEPTED TIMESTAMP TRACKING
assert(volunteerHtml.includes('id="accepted-tasks"') || volunteerHtml.includes('id="acceptedTaskList"'), "volunteer.html includes accepted tasks tracker section");
assert(volunteerJs.includes('request.acceptedAt = new Date().toLocaleString()'), "volunteer.js records exact acceptedAt timestamp");
assert(volunteerJs.includes('request.acceptedTimestamp = Date.now()'), "volunteer.js records numeric acceptedTimestamp");
assert(volunteerJs.includes('Accepted At:') && volunteerJs.includes('Elapsed Mission Time:'), "volunteer.js displays accepted timestamp and elapsed time");

// 7. PRE-DISASTER MOBILE TEXT (SMS) WARNING NOTIFICATIONS
pages.forEach(p => {
    assert(p.content.includes('id="preDisasterSmsBar"'), `${p.name} includes preDisasterSmsBar alert banner`);
    assert(p.content.includes('id="smsNotificationModal"'), `${p.name} includes smartphone SMS preview modal`);
});
assert(adminHtml.includes('id="preDisasterSmsModal"'), "admin.html includes pre-disaster SMS broadcast modal");
assert(mandalHtml.includes('id="preDisasterSmsModal"'), "mandal.html includes pre-disaster SMS broadcast modal");

// 8. LOSS REPORTING IN ADMIN & MANDAL MODALS / TABLES
assert(adminHtml.includes('modalLossesSection') && adminHtml.includes('modalLossesBadges'), "admin.html displays reported losses in request modal");
assert(mandalHtml.includes('modalLossesSection') && mandalHtml.includes('modalLossesReported'), "mandal.html displays reported losses in request modal");
assert(adminHtml.includes('lossesFilter'), "admin.html includes losses filter dropdown");

// 9. FILTER OPTION ON EVERY LIST IN EVERY LOGIN
// Admin
assert(adminHtml.includes('requestSearch') && adminHtml.includes('statusFilter'), "admin.html has requests filter");
assert(adminHtml.includes('mandalSearchInput') && adminHtml.includes('mandalApprovalFilter'), "admin.html has mandals filter");
assert(adminHtml.includes('volunteerSearchInput') && adminHtml.includes('volunteerStatusFilter'), "admin.html has volunteers filter");
assert(adminHtml.includes('alertSearchInput') && adminHtml.includes('alertTypeFilter'), "admin.html has alerts filter");
assert(adminHtml.includes('shelterSearchInput') && adminHtml.includes('shelterStatusFilter'), "admin.html has shelters filter");
assert(adminHtml.includes('inventorySearchInput') && adminHtml.includes('inventoryCategoryFilter'), "admin.html has inventory filter");
assert(adminHtml.includes('donationSearchInput') && adminHtml.includes('donationTypeFilter'), "admin.html has donations filter");

// Mandal
assert(mandalHtml.includes('requestSearchInput') && mandalHtml.includes('requestStatusFilter'), "mandal.html has requests filter");
assert(mandalHtml.includes('volSearchInput') && mandalHtml.includes('volStatusFilter'), "mandal.html has volunteers filter");
assert(mandalHtml.includes('shelterSearchInput') && mandalHtml.includes('shelterStatusFilter'), "mandal.html has shelters filter");
assert(mandalHtml.includes('inventorySearchInput') && mandalHtml.includes('inventoryCategoryFilter'), "mandal.html has inventory filter");
assert(mandalHtml.includes('donationSearchInput') && mandalHtml.includes('donationTypeFilter'), "mandal.html has donations filter");
assert(mandalHtml.includes('annualYearSelect') && mandalHtml.includes('annualSearchInput'), "mandal.html has annual statement filter");

// Volunteer
assert(volunteerHtml.includes('acceptedTaskSearchInput') && volunteerHtml.includes('acceptedTaskStatusFilter'), "volunteer.html has accepted tasks filter");
assert(volunteerHtml.includes('taskSearchInput') && volunteerHtml.includes('taskPriorityFilter'), "volunteer.html has tasks filter");
assert(volunteerHtml.includes('alertSearchInput') && volunteerHtml.includes('alertTypeFilter'), "volunteer.html has alerts filter");
assert(volunteerHtml.includes('historySearchInput'), "volunteer.html has history filter");

console.log("=================================================");
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================");

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
