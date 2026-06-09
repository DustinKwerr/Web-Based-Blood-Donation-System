let isAdminLoggedIn = false;

function showAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('hidden');
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('hidden');
}

async function loginAdmin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const messageEl = document.getElementById('loginMessage');

    if (!username || !password) {
        messageEl.innerHTML = '<span class="text-red-600">Please enter username and password</span>';
        return;
    }

    try {
        const res = await fetch('http://localhost:5000/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            isAdminLoggedIn = true;
            document.getElementById('adminMenu').classList.remove('hidden');
            closeAdminLogin();
            alert(`✅ Welcome, Administrator ${data.username}!`);
            switchTab('inventory');
        } else {
            messageEl.innerHTML = `<span class="text-red-600">${data.message}</span>`;
        }
    } catch (err) {
        messageEl.innerHTML = '<span class="text-red-600">Cannot connect to server. Is Node.js running?</span>';
    }
}

// Load Inventory
async function loadInventory() {
    const display = document.getElementById("inventoryDisplay");
    try {
        const res = await fetch('http://localhost:5000/api/inventory');
        const data = await res.json();

        let text = "CURRENT BLOOD INVENTORY\n══════════════════════\n\n";
        Object.entries(data).forEach(([type, qty]) => {
            text += `${type.padEnd(6)} : ${qty} units\n`;
        });
        display.value = text;
    } catch (e) {
        display.value = "Error connecting to database.";
    }
}

// Search Donors
async function handleSearch() {
    const query = document.getElementById("searchInput").value.trim();
    const mode = document.getElementById("searchMode").value;
    const output = document.getElementById("searchOutput");

    if (!query) {
        output.value = "Please enter a search term.";
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/search?mode=${mode}&query=${encodeURIComponent(query)}`);
        const results = await res.json();

        let text = `SEARCH RESULTS (${mode})\n══════════════════════\n\n`;
        if (results.length === 0) {
            text += "No matching records found.";
        } else {
            results.forEach(d => {
                text += `Name: ${d.name}\n`;
                text += `Blood Type: ${d.blood_type}\n`;
                text += `Age: ${d.age} | Weight: ${d.weight}kg\n`;
                text += `Contact: ${d.contact}\n\n`;
            });
        }
        output.value = text;
    } catch (e) {
        output.value = "Error connecting to database.";
    }
}