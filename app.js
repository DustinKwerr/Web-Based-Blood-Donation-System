// Global Application Session Variables (Mimics PySide's class instance attributes)
let currentUser = null;
let userRole = null;

/**
 * Authentication check interface handler simulation routing logic rules
 */
function authenticateUser(user, pwd) {
    if (user.toLowerCase() === "admin") return "Staff";
    return "Donor";
}

/**
 * Interactive execution routine: Handles Application Log-In Sequence 
 */
function login() {
    const user = document.getElementById("usernameInput").value.trim();
    const pwd = document.getElementById("passwordInput").value.trim();
    const errorLabel = document.getElementById("loginError");

    if (!user || !pwd) {
        errorLabel.innerText = "Please fill all fields";
        return;
    }

    const role = authenticateUser(user, pwd);
    if (role) {
        currentUser = user;
        userRole = role;

        document.getElementById("loginWidget").classList.add("hidden");
        document.getElementById("mainAppWidget").classList.remove("hidden");
        document.getElementById("userWelcomeDisplay").innerText = `Logged in as: ${user} (${role})`;

        // System verification routing controlling administrative level layout visualization 
        const adminMenu = document.getElementById("adminMenu");
        if (role !== "Donor") {
            adminMenu.classList.remove("hidden");
        } else {
            adminMenu.classList.add("hidden");
        }

        alert(`Login Successful! Welcome, ${user}!`);
        switchTab('home');
        loadInventory();
    } else {
        errorLabel.innerText = "Invalid username or password";
    }
}

/**
 * Interactive execution routine: Disconnects current session contexts
 */
function logout() {
    currentUser = null;
    userRole = null;
    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("loginError").innerText = "";
    
    document.getElementById("mainAppWidget").classList.add("hidden");
    document.getElementById("loginWidget").classList.remove("hidden");
}

/**
 * Tab Navigation Router Engine (Replicates layout controls of PySide's QTabWidget)
 */
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
}

/**
 * Dialog/Modal window interface controllers
 */
function showForgotPassword() {
    document.getElementById("forgotPasswordModal").classList.remove("hidden");
}

function hideForgotPassword() {
    document.getElementById("forgotPasswordModal").classList.add("hidden");
    document.getElementById("resetUsernameInput").value = "";
    document.getElementById("resetModalError").innerText = "";
}

function submitForgotPassword() {
    const username = document.getElementById("resetUsernameInput").value.trim();
    const errorLabel = document.getElementById("resetModalError");

    if (username) {
        alert(`Success: Password reset link sent to ${username}`);
        hideForgotPassword();
    } else {
        errorLabel.innerText = "Please enter username";
        errorLabel.className = "text-sm font-medium mb-3 h-5 text-red-500";
    }
}

/**
 * Business Logic Module: Evaluates registration metrics input tracking
 */
function processRegistration() {
    const name = document.getElementById("regName").value.trim();
    const output = document.getElementById("regOutput");

    if (!name) {
        alert("Error: Name is required");
        return;
    }
    output.innerText = "✅ Profile saved successfully!";
    output.className = "text-center font-medium text-green-600";
}

/**
 * Business Logic Module: Evaluates numerical donor viability criteria parameters
 */
function verifyEligibility() {
    const age = parseInt(document.getElementById("chkAge").value) || 0;
    const weight = parseFloat(document.getElementById("chkWeight").value) || 0;
    const months = parseInt(document.getElementById("chkMonths").value) || 0;
    const illness = document.getElementById("chkIllness").value === "Yes";
    const output = document.getElementById("chkOutput");

    try {
        if (age >= 18 && age <= 65 && weight >= 50 && months >= 3 && !illness) {
            output.innerText = "✅ ELIGIBLE TO DONATE";
            output.className = "text-center text-xl font-bold p-2 bg-green-50 text-green-600 border border-green-200 rounded";
        } else {
            output.innerText = "❌ NOT ELIGIBLE";
            output.className = "text-center text-xl font-bold p-2 bg-red-50 text-red-600 border border-red-200 rounded";
        }
    } catch (err) {
        output.innerText = "Please enter valid numbers";
        output.className = "text-center text-xl font-bold p-2 text-orange-500";
    }
}

/**
 * Action Interceptor Logic: Handles booking request popups
 */
function bookAppointment(location) {
    if (!currentUser) return;

    const isEligible = confirm(`Have you completed eligibility screening recently?\n\n(OK = Yes / Cancel = No)`);
    if (isEligible) {
        const preferredDate = prompt(`Appointment at ${location}\n\nEnter preferred date (YYYY-MM-DD):`);
        if (preferredDate) {
            alert(`Appointment booked successfully at ${location} on ${preferredDate}!\n\nYou will receive a confirmation shortly.`);
        }
    } else {
        alert("Please complete eligibility verification first.");
    }
}

/**
 * Data Pipeline Simulation: Fetches mock warehouse storage volume structures
 */
function loadInventory() {
    const mockInventoryData = {
        "A+": 12, "A-": 4, "B+": 18, "B-": 2, 
        "O+": 25, "O-": 9, "AB+": 7, "AB-": 1
    };

    let text = "Current Blood Stock:\n\n";
    for (const [bt, qty] of Object.entries(mockInventoryData)) {
        text += `${bt}: ${qty} units\n`;
    }
    document.getElementById("inventoryDisplay").value = text;
}

/**
 * Analytical Pipeline Routine: Handles catalog classification filtering requests
 */
function handleSearch() {
    const query = document.getElementById("searchInput").value;
    const mode = document.getElementById("searchMode").value;
    document.getElementById("searchOutput").value = `Results for '${query}' (${mode}):\n\nNo records found (implement API database connect routine logic handles).`;
}