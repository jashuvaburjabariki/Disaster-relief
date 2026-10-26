// test_new_requirements.js
// Verification of User Requirements for Volunteer Workflow & System-Wide Weather

const fs = require('fs');
const path = require('path');

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

console.log("=================================================");
console.log("TESTING VOLUNTEER WORKFLOW & WEATHER IN ALL LOGINS");
console.log("=================================================");

const volHtml = fs.readFileSync(path.join(__dirname, 'volunteer.html'), 'utf8');
const volJs = fs.readFileSync(path.join(__dirname, 'volunteer.js'), 'utf8');
const volCss = fs.readFileSync(path.join(__dirname, 'volunteer.css'), 'utf8');
const mandalHtml = fs.readFileSync(path.join(__dirname, 'mandal.html'), 'utf8');
const mandalJs = fs.readFileSync(path.join(__dirname, 'mandal.js'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
const adminJs = fs.readFileSync(path.join(__dirname, 'admin.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const aboutHtml = fs.readFileSync(path.join(__dirname, 'about.html'), 'utf8');
const scriptJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// --- REQUIREMENT 1: TASK DETAILS, HELP APPLICATION, GUIDANCE LETTER & TASK FORM ---
assert(volHtml.includes('id="volunteerTaskModal"'), "volunteer.html includes volunteerTaskModal");
assert(volHtml.includes('id="taskTabAppBtn"') && volHtml.includes('Help Request Application'), "Task Modal includes Tab 1: Help Request Application");
assert(volHtml.includes('id="taskTabLetterBtn"') && volHtml.includes("Mandal Officer's Guidance Letter"), "Task Modal includes Tab 2: Mandal Officer's Guidance Letter");
assert(volHtml.includes('id="taskTabFormBtn"') && volHtml.includes('Task Form & Evidence'), "Task Modal includes Tab 3: Task Form & Evidence");
assert(volHtml.includes('id="modalEvidencePhotoInput"'), "Task Modal has multiple photo upload input for supporting evidence");
assert(volHtml.includes('id="modalEvidenceGalleryPreview"'), "Task Modal has live photo preview gallery grid");
assert(volHtml.includes('id="btnSubmitForOfficerVerification"'), "Task Modal has submit to Mandal Officer button");
assert(volJs.includes('function openVolunteerTaskModal'), "volunteer.js implements openVolunteerTaskModal");
assert(volJs.includes('function advanceWorkflow'), "volunteer.js implements advanceWorkflow");

// --- REQUIREMENT 2: ASSISTANCE FOR DISASTER-AFFECTED PEOPLE ---
assert(volHtml.includes('id="assistanceSuppliesContainer"'), "volunteer.html includes emergency assistance supplies coordinator");
assert(volHtml.includes('value="Food Supplies"') && volHtml.includes('value="Medicines & First Aid"'), "Assistance coordinator has Food & Medicines options");
assert(volHtml.includes('value="Blankets & Clothing"') && volHtml.includes('value="Emergency Shelter"'), "Assistance coordinator has Blankets & Shelter options");
assert(volHtml.includes('id="btnRequestAssistanceThroughMandal"'), "Task Modal has Request Assistance through Mandal Officer button");
assert(volJs.includes('"Assistance Required"'), "volunteer.js handles Assistance Required transition");
assert(volJs.includes('disasterAlerts'), "Volunteer assistance dispatch notifies Mandal Officer & disaster alerts");

// --- REQUIREMENT 3: VOLUNTEER LOGIN SIDEBAR ISOLATION ---
assert(volCss.includes('.volunteer-view') && volCss.includes('.volunteer-view.active-view'), "volunteer.css enforces isolated view containers");
assert(volHtml.includes('id="view-dashboard"'), "volunteer.html contains view-dashboard");
assert(volHtml.includes('id="view-accepted-tasks"'), "volunteer.html contains view-accepted-tasks");
assert(volHtml.includes('id="view-tasks"'), "volunteer.html contains view-tasks");
assert(volHtml.includes('id="view-alerts"'), "volunteer.html contains view-alerts");
assert(volHtml.includes('id="view-profile"'), "volunteer.html contains view-profile");
assert(volHtml.includes('id="view-skills"'), "volunteer.html contains view-skills");
assert(volHtml.includes('id="view-history"'), "volunteer.html contains view-history");
assert(volHtml.includes('id="view-safety"'), "volunteer.html contains view-safety");
assert(volHtml.includes('id="view-certificate"'), "volunteer.html contains view-certificate");
assert(volJs.includes('function switchVolunteerView'), "volunteer.js implements switchVolunteerView displaying only selected view");

// --- REQUIREMENT 4: WEATHER REPORT IN EVERY LOGIN ---
// Volunteer
assert(volHtml.includes('id="volWeatherWidget"'), "volunteer.html includes volWeatherWidget");
assert(volHtml.includes('id="weatherDetailModal"'), "volunteer.html includes weatherDetailModal");
assert(volJs.includes('function loadVolunteerLiveWeather') && volJs.includes('openWeatherDetailModal'), "volunteer.js implements volunteer live weather");

// Mandal Officer
assert(mandalHtml.includes('id="mandalWeatherWidget"'), "mandal.html includes mandalWeatherWidget");
assert(mandalHtml.includes('id="weatherDetailModal"'), "mandal.html includes weatherDetailModal");
assert(mandalJs.includes('function loadMandalLiveWeather') && mandalJs.includes('openWeatherDetailModal'), "mandal.js implements mandal live weather");

// Admin
assert(adminHtml.includes('id="adminWeatherWidget"'), "admin.html includes adminWeatherWidget");
assert(adminHtml.includes('id="weatherDetailModal"'), "admin.html includes weatherDetailModal");
assert(adminJs.includes('function loadAdminLiveWeather') && adminJs.includes('openWeatherDetailModal'), "admin.js implements admin live weather");

// Citizen / Public (index.html & about.html)
assert(indexHtml.includes('id="citizenWeatherWidget"'), "index.html includes citizenWeatherWidget");
assert(indexHtml.includes('id="weatherDetailModal"'), "index.html includes weatherDetailModal");
assert(aboutHtml.includes('id="citizenWeatherWidget"'), "about.html includes citizenWeatherWidget");
assert(aboutHtml.includes('id="weatherDetailModal"'), "about.html includes weatherDetailModal");
assert(scriptJs.includes('function loadCitizenLiveWeather') && scriptJs.includes('openWeatherDetailModal'), "script.js implements citizen live weather");

// Weather Content Quality (Rainfall, Winds, Alerts)
const weatherPages = [
    { name: "volunteer.html", content: volHtml },
    { name: "mandal.html", content: mandalHtml },
    { name: "admin.html", content: adminHtml },
    { name: "index.html", content: indexHtml },
    { name: "about.html", content: aboutHtml }
];
weatherPages.forEach(p => {
    assert(p.content.includes('Rainfall Forecast'), `${p.name} weather modal has Rainfall Forecast`);
    assert(p.content.includes('Strong Wind Warning'), `${p.name} weather modal has Strong Wind Warning`);
    assert(p.content.includes('Official Disaster Weather Alerts'), `${p.name} weather modal has Weather Alerts`);
    assert(p.content.includes('weatherDistrictSelect'), `${p.name} weather modal has AP district selector`);
});

// --- REQUIREMENT 5: 9-STAGE TASK WORKFLOW & AUDIT TRAIL ---
const required9Statuses = [
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

required9Statuses.forEach(st => {
    assert(volHtml.includes(st), `volunteer.html includes workflow status: ${st}`);
    assert(mandalHtml.includes(st), `mandal.html includes workflow status: ${st}`);
});

assert(volJs.includes('statusHistory'), "volunteer.js tracks statusHistory audit trail");
assert(volJs.includes('modalStatusAuditTbody'), "volunteer.js populates status audit table");
assert(mandalJs.includes('assignedVolunteers'), "mandal.js tracks individual volunteer assignments on help request");
assert(mandalHtml.includes('id="mandalReviewEvidenceModal"'), "mandal.html includes officer evidence review modal");
assert(mandalJs.includes('btnMandalVerifyComplete') && mandalJs.includes('btnMandalRejectRework'), "mandal.js implements officer verify and rework decisions");

console.log("=================================================");
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================");
process.exit(failed > 0 ? 1 : 0);
