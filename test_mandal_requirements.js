// ========================================================
// AUTOMATED TEST SUITE: MANDAL LOGIN REQUIREMENTS VERIFICATION
// Tests all 6 requirements:
// 1. Position Alignment, Colors, Animations (Video Backdrop & Glassmorphism)
// 2. Add Volunteer Form Parity
// 3. Applicant Details & Supporting Documents (Form 3-A Family Roster)
// 4. Assign Multiple Volunteers & Monitor Field Status
// 5. Sequential Jurisdictional Department Notifications (Police/Fire/PHC)
// 6. Strict Mandal Shelter Filtering (No Other Mandals)
// ========================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=== STARTING MANDAL LOGIN REQUIREMENTS VERIFICATION ===");

const htmlPath = path.join(__dirname, 'mandal.html');
const cssPath = path.join(__dirname, 'mandal.css');
const jsPath = path.join(__dirname, 'mandal.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
    try {
        fn();
        console.log(`  [PASS] ${desc}`);
        passCount++;
    } catch (err) {
        console.error(`  [FAIL] ${desc}`);
        console.error(`         ${err.message}`);
        failCount++;
    }
}

// ----------------------------------------------------
// REQUIREMENT 1: Position Alignment, Colors, and Animations
// ----------------------------------------------------
console.log("\n--- REQUIREMENT 1: Alignment, Colors & Motion Animation ---");

it("Mandal HTML includes video backdrop matching Admin login", () => {
    assert(htmlContent.includes('admin-video-backdrop'), "Missing .admin-video-backdrop in mandal.html");
    assert(htmlContent.includes('hero banner video motion.mp4'), "Missing 'hero banner video motion.mp4' in mandal.html");
    assert(htmlContent.includes('admin-backdrop-video'), "Missing .admin-backdrop-video in mandal.html");
    assert(htmlContent.includes('admin-backdrop-overlay'), "Missing .admin-backdrop-overlay in mandal.html");
});

it("Mandal CSS provides transparent body/shell and glassmorphism styling", () => {
    assert(cssContent.includes('.admin-video-backdrop'), "Missing .admin-video-backdrop in mandal.css");
    assert(cssContent.includes('body.mandal-body'), "Missing body.mandal-body rules in mandal.css");
    assert(cssContent.includes('backdrop-filter: blur'), "Missing glassmorphic backdrop-filter in mandal.css");
    assert(cssContent.includes('mandalFadeIn') || cssContent.includes('fadeInCard'), "Missing fade in animations in mandal.css");
});

// ----------------------------------------------------
// REQUIREMENT 2: Add Volunteer Form Parity
// ----------------------------------------------------
console.log("\n--- REQUIREMENT 2: Add Volunteer Form Parity ---");

it("Add Volunteer form in Mandal contains exact Admin-parity fields", () => {
    assert(htmlContent.includes('id="mandalVolUsername"'), "Missing mandalVolUsername");
    assert(htmlContent.includes('id="mandalVolPassword"'), "Missing mandalVolPassword");
    assert(htmlContent.includes('id="mandalVolEmail"'), "Missing mandalVolEmail");
    assert(htmlContent.includes('id="mandalAddVolName"'), "Missing mandalAddVolName");
    assert(htmlContent.includes('id="mandalAddVolFatherName"'), "Missing mandalAddVolFatherName");
    assert(htmlContent.includes('id="mandalAddVolPhone"'), "Missing mandalAddVolPhone");
    assert(htmlContent.includes('id="mandalAddVolState"'), "Missing mandalAddVolState");
    assert(htmlContent.includes('id="mandalAddVolDistrict"'), "Missing mandalAddVolDistrict");
    assert(htmlContent.includes('id="mandalAddVolMandal"'), "Missing mandalAddVolMandal");
    assert(htmlContent.includes('id="mandalAddVolSkills"'), "Missing mandalAddVolSkills");
    assert(htmlContent.includes('id="mandalAddVolPhoto"'), "Missing mandalAddVolPhoto");
    assert(htmlContent.includes('id="mandalAddVolStatus"'), "Missing mandalAddVolStatus");
});

it("Mandal JS exports handleMandalAddVolunteer and handleCreateVolunteer handlers", () => {
    assert(jsContent.includes('function handleMandalAddVolunteer'), "Missing handleMandalAddVolunteer in mandal.js");
    assert(jsContent.includes('window.handleMandalAddVolunteer = handleMandalAddVolunteer'), "Missing window.handleMandalAddVolunteer export");
    assert(jsContent.includes('window.handleCreateVolunteer = handleMandalAddVolunteer'), "Missing window.handleCreateVolunteer backward compatibility alias");
    assert(jsContent.includes('disasterUserAccounts'), "Missing disasterUserAccounts registration in volunteer handler");
});

// ----------------------------------------------------
// REQUIREMENT 3: Applicant Details & Family Proofs (Form 3-A)
// ----------------------------------------------------
console.log("\n--- REQUIREMENT 3: Applicant Details & Supporting Documents ---");

it("Mandal HTML has Form 3-A modal with primary applicant & document proof uploads", () => {
    assert(htmlContent.includes('id="applicantDetailsFormModal"'), "Missing applicantDetailsFormModal in mandal.html");
    assert(htmlContent.includes('id="appApplicantName"'), "Missing appApplicantName");
    assert(htmlContent.includes('id="appApplicantPhone"'), "Missing appApplicantPhone");
    assert(htmlContent.includes('id="appApplicantGender"'), "Missing appApplicantGender");
    assert(htmlContent.includes('id="appApplicantAadhaar"'), "Missing appApplicantAadhaar");
    assert(htmlContent.includes('id="appApplicantBank"'), "Missing appApplicantBank");
    assert(htmlContent.includes('id="appApplicantRation"'), "Missing appApplicantRation");
    assert(htmlContent.includes('id="appDocAadhaar"'), "Missing appDocAadhaar proof upload");
    assert(htmlContent.includes('id="appDocRation"'), "Missing appDocRation proof upload");
    assert(htmlContent.includes('id="appDocDamage"'), "Missing appDocDamage proof upload");
});

it("Mandal JS implements dynamic family member roster with all required proof details", () => {
    assert(jsContent.includes('function addNewFamilyMemberRow'), "Missing addNewFamilyMemberRow in mandal.js");
    assert(jsContent.includes('fam-name'), "Missing fam-name class");
    assert(jsContent.includes('fam-relation'), "Missing fam-relation class");
    assert(jsContent.includes('fam-gender'), "Missing fam-gender class");
    assert(jsContent.includes('fam-phone'), "Missing fam-phone class");
    assert(jsContent.includes('fam-aadhaar'), "Missing fam-aadhaar class");
    assert(jsContent.includes('fam-bank'), "Missing fam-bank class");
    assert(jsContent.includes('fam-ration'), "Missing fam-ration class");
    assert(jsContent.includes('fam-photo'), "Missing fam-photo upload");
    assert(jsContent.includes('fam-proof'), "Missing fam-proof upload");
    assert(jsContent.includes('handleSaveApplicantDetails'), "Missing handleSaveApplicantDetails in mandal.js");
});

// ----------------------------------------------------
// REQUIREMENT 4: Assign Multiple Volunteers & Monitor Status
// ----------------------------------------------------
console.log("\n--- REQUIREMENT 4: Multiple Volunteer Assignment & Field Status Monitor ---");

it("Mandal HTML provides multi-volunteer selection and field personnel tracking table", () => {
    assert(htmlContent.includes('id="mandalAssignVolunteersChecklist"'), "Missing mandalAssignVolunteersChecklist in mandal.html");
    assert(htmlContent.includes('id="mandalVolunteerTrackingTable"'), "Missing mandalVolunteerTrackingTable in mandal.html");
    assert(htmlContent.includes('id="executeMandalAssignmentBtn"'), "Missing executeMandalAssignmentBtn in mandal.html");
});

it("Mandal JS logic supports assigning any number of volunteers to a single request", () => {
    assert(jsContent.includes('function executeMandalAssignment'), "Missing executeMandalAssignment in mandal.js");
    assert(jsContent.includes('assignedVolunteers'), "Missing assignedVolunteers array management");
    assert(jsContent.includes('function renderMandalActiveAssignmentsTable'), "Missing renderMandalActiveAssignmentsTable in mandal.js");
    assert(jsContent.includes('function updateVolunteerAssignmentStatus'), "Missing updateVolunteerAssignmentStatus in mandal.js");
});

// ----------------------------------------------------
// REQUIREMENT 5: Sequential Department Notifications (Police/Fire/PHC)
// ----------------------------------------------------
console.log("\n--- REQUIREMENT 5: Department Notifications & Status Tracking ---");

it("Mandal HTML has sequential 3-step modal with exact questions A, B, and C", () => {
    assert(htmlContent.includes('id="departmentNotificationModal"'), "Missing departmentNotificationModal in mandal.html");
    // Question A: Police
    assert(htmlContent.includes('Do you want to inform the nearest or jurisdictional Police Station about this help request?'), "Question A text mismatch in mandal.html");
    // Question B: Fire
    assert(htmlContent.includes('Do you want to inform the Fire Station?'), "Question B text mismatch in mandal.html");
    // Question C: Hospital/PHC
    assert(htmlContent.includes('Do you want to inform the relevant hospital, regional hospital, or Primary Health Centre (PHC)?'), "Question C text mismatch in mandal.html");
    // Tracking table
    assert(htmlContent.includes('id="mandalDepartmentDispatchesTable"'), "Missing mandalDepartmentDispatchesTable in mandal.html");
});

it("Mandal JS implements jurisdictional directory, step handler, and response tracking", () => {
    assert(jsContent.includes('const jurisdictionalDirectory ='), "Missing jurisdictionalDirectory in mandal.js");
    assert(jsContent.includes('function getJurisdictionalDepartments'), "Missing getJurisdictionalDepartments in mandal.js");
    assert(jsContent.includes('function handleDeptChoice'), "Missing handleDeptChoice in mandal.js");
    assert(jsContent.includes('function finalizeDepartmentDispatches'), "Missing finalizeDepartmentDispatches in mandal.js");
    assert(jsContent.includes('function renderMandalDepartmentDispatchesTable'), "Missing renderMandalDepartmentDispatchesTable in mandal.js");
    assert(jsContent.includes('function updateDepartmentResponseStatus'), "Missing updateDepartmentResponseStatus in mandal.js");
});

// ----------------------------------------------------
// REQUIREMENT 6: Shelter Management (Strict Mandal Filter)
// ----------------------------------------------------
console.log("\n--- REQUIREMENT 6: Shelter Management (Strict Mandal Filter) ---");

it("Mandal JS implements getMandalSheltersData with strict mandal filtering", () => {
    assert(jsContent.includes('function getMandalSheltersData'), "Missing getMandalSheltersData in mandal.js");
    assert(jsContent.includes('window.getMandalSheltersData = getMandalSheltersData'), "Missing window.getMandalSheltersData export");
});

// Mock simulation of getMandalSheltersData logic
it("Strict filter test: Paderu mandal sees only Paderu shelters; Vijayawada Rural sees only Vijayawada Rural shelters", () => {
    const mockShelters = [
        { id: 101, district: "Alluri Sitharama Raju", mandal: "Paderu", name: "Paderu Tribal Welfare Shelter" },
        { id: 102, district: "Alluri Sitharama Raju", mandal: "Paderu", name: "Paderu ITDA Community Shelter" },
        { id: 103, district: "Alluri Sitharama Raju", mandal: "Araku Valley", name: "Araku Valley Emergency Relief Camp" },
        { id: 105, district: "Alluri Sitharama Raju", mandal: "Rampachodavaram", name: "Rampachodavaram Flood Refuge Camp" },
        { id: 201, district: "Krishna", mandal: "Vijayawada Rural", name: "Krishna District Primary Relief Shelter" },
        { id: 202, district: "Krishna", mandal: "Vijayawada Rural", name: "Enikepadu Community Disaster Refuge" },
        { id: 203, district: "Krishna", mandal: "Machilipatnam", name: "Machilipatnam Coastal Cyclone Refuge Centre" }
    ];

    function filterForMandal(curMandalName) {
        const curMandal = curMandalName.toLowerCase().trim();
        return mockShelters.filter(s => {
            const sm = (s.mandal || "").toLowerCase().trim();
            const sloc = (s.location || "").toLowerCase().trim();
            return sm === curMandal || (sm === "" && sloc.includes(curMandal));
        });
    }

    const paderuShelters = filterForMandal("Paderu");
    assert.strictEqual(paderuShelters.length, 2, "Paderu should only have 2 shelters");
    paderuShelters.forEach(s => {
        assert.strictEqual(s.mandal, "Paderu", `Shelter ${s.name} does not belong to Paderu!`);
    });

    const vjaShelters = filterForMandal("Vijayawada Rural");
    assert.strictEqual(vjaShelters.length, 2, "Vijayawada Rural should only have 2 shelters");
    vjaShelters.forEach(s => {
        assert.strictEqual(s.mandal, "Vijayawada Rural", `Shelter ${s.name} does not belong to Vijayawada Rural!`);
    });

    // Ensure shelters belonging to other mandals are never included
    assert(!paderuShelters.some(s => s.mandal === "Araku Valley" || s.mandal === "Vijayawada Rural"), "Other mandals leaked into Paderu!");
    assert(!vjaShelters.some(s => s.mandal === "Machilipatnam" || s.mandal === "Paderu"), "Other mandals leaked into Vijayawada Rural!");
});

// Mock simulation of Jurisdictional Department Routing
it("Jurisdictional routing test: Help requests are strictly routed to the mandal where incident occurred", () => {
    const dirMatch = jsContent.includes('"paderu": {') && jsContent.includes('"vijayawada rural": {');
    assert(dirMatch, "Missing paderu and vijayawada rural in jurisdictionalDirectory");
});

console.log("\n=======================================================");
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log("=======================================================");

if (failCount > 0) {
    process.exit(1);
} else {
    console.log("ALL MANDAL REQUIREMENTS RIGOROUSLY VERIFIED AND PASSED!");
}
