// Global Application Session Variables
let currentUser = "Anonymous Donor";
let userRole = "Donor";

/**
 * Tab Navigation Router Engine
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
            item.classList.add('active');
        }
    });
}

/**
 * Logout Function
 */
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        alert("You have been logged out.");
        // Optional: window.location.reload();
    }
}

/**
 * Business Logic: Donor Registration
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
 * Business Logic: Eligibility Checker
 */
function verifyEligibility() {
    const age = parseInt(document.getElementById("chkAge").value) || 0;
    const weight = parseFloat(document.getElementById("chkWeight").value) || 0;
    const months = parseInt(document.getElementById("chkMonths").value) || 0;
    const illness = document.getElementById("chkIllness").value === "Yes";
    const output = document.getElementById("chkOutput");

    if (age >= 18 && age <= 65 && weight >= 50 && months >= 3 && !illness) {
        output.innerText = "ELIGIBLE TO DONATE";
        output.className = "text-center text-xl font-bold p-6 bg-green-50 text-green-700 border border-green-200 rounded-2xl";
    } else {
        output.innerText = "NOT ELIGIBLE";
        output.className = "text-center text-xl font-bold p-6 bg-red-50 text-red-700 border border-red-200 rounded-2xl";
    }
}

/**
 * Book Appointment
 */
function bookAppointment(location) {
    const isEligible = confirm(`Have you completed eligibility screening recently?\n\n(OK = Yes / Cancel = No)`);
    if (isEligible) {
        const preferredDate = prompt(`Appointment at ${location}\n\nEnter preferred date (YYYY-MM-DD):`);
        if (preferredDate) {
            alert(`Appointment booked successfully at ${location} on ${preferredDate}!`);
        }
    } else {
        alert("Please complete eligibility verification first.");
    }
}

// Auto age calculation
function calculateAge() {
    const birthInput = document.getElementById("regBirthdate").value;
    if (!birthInput) return;
    const birthDate = new Date(birthInput);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    document.getElementById("regAge").value = age;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Load real-time date (if not already in HTML)
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const updateDate = () => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-US', options);
        };
        updateDate();
        setInterval(updateDate, 60000);
    }

    document.getElementById('userWelcomeDisplay').textContent = "";
    
    // Auto-show admin panel if role is Admin
    if (userRole === "Admin") {
        document.getElementById('adminMenu').classList.remove('hidden');
    }
});