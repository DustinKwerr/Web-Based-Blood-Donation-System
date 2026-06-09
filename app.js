// Global Application Session Variables (Mimics PySide's class instance attributes)
let currentUser = "Anonymous Donor";
let userRole = "Donor";

/**
 * Tab Navigation Router Engine
 */
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    // Show selected tab
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
    }

    // Move active indicator
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
            item.classList.add('active');
        }
    });
}

// Add logout function (was missing)
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        alert("You have been logged out.");
        // You can redirect or reset here
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
    output.innerText = "Profile saved successfully!";
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
            output.innerText = "ELIGIBLE TO DONATE";
            output.className = "text-center text-xl font-bold p-2 bg-green-50 text-green-600 border border-green-200 rounded";
        } else {
            output.innerText = "NOT ELIGIBLE";
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

// Automatically load mock elements on layout initializing sequences 
window.addEventListener('DOMContentLoaded', () => {
    loadInventory();
});