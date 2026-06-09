/**
 * ADMIN FEATURES ONLY
 * Blood Inventory + Donor Search
 */

// Load Blood Inventory
function loadInventory() {
    const mockInventoryData = {
        "A+": 42, "A-": 18, "B+": 35, "B-": 12, 
        "O+": 68, "O-": 29, "AB+": 15, "AB-": 8
    };

    let text = "CURRENT BLOOD INVENTORY\n";
    text += "══════════════════════\n\n";
    
    for (const [bloodType, qty] of Object.entries(mockInventoryData)) {
        text += `${bloodType.padEnd(5)} : ${qty.toString().padStart(3)} units\n`;
    }
    
    const display = document.getElementById("inventoryDisplay");
    if (display) display.value = text;
}

// Search Registered Donors
function handleSearch() {
    const query = document.getElementById("searchInput").value.trim();
    const mode = document.getElementById("searchMode").value;
    const output = document.getElementById("searchOutput");

    if (!query) {
        output.value = "Please enter a search term.";
        return;
    }

    // Mock search results
    let resultText = `SEARCH RESULTS (${mode})\n`;
    resultText += "══════════════════════\n\n";

    if (query.toLowerCase().includes("dustin") || mode === "Name") {
        resultText += `Name: Dustin Kwer Indolos\n`;
        resultText += `Blood Group: O+\n`;
        resultText += `Last Donation: 2026-03-15\n`;
        resultText += `Total Donations: 12\n`;
        resultText += `Status: Active Donor\n`;
    } else {
        resultText += `No records found for "${query}"\n`;
        resultText += `Try searching with different keywords.`;
    }

    output.value = resultText;
}

// Toggle Admin Mode (for testing)
function toggleAdminMode(isAdmin) {
    const adminMenu = document.getElementById('adminMenu');
    if (isAdmin) {
        adminMenu.classList.remove('hidden');
        alert("Admin Mode Activated\nInventory and Search tools are now available.");
    } else {
        adminMenu.classList.add('hidden');
    }
}

// Auto load inventory when admin tab is opened
document.addEventListener('DOMContentLoaded', () => {
    // Optional: Auto-refresh inventory when switching to admin tab
    const observer = new MutationObserver(() => {
        const inventoryTab = document.getElementById('tab-inventory');
        if (inventoryTab && !inventoryTab.classList.contains('hidden')) {
            loadInventory();
        }
    });
    
    observer.observe(document.getElementById('mainAppWidget') || document.body, { 
        attributes: true, 
        subtree: true 
    });
});