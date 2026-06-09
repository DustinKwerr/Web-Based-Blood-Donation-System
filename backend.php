<?php
// Prevent direct browser access
if (php_sapi_name() !== 'cli') {
    die(json_encode(["success" => false, "message" => "Unauthorized access."]));
}

class BloodDonationDatabase {
    private ?PDO $conn = null;

    public function __construct() {
        try {
            $dsn = "mysql:host=localhost;dbname=blood_donation_system_database;charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, "root", "", $options);
        } catch (PDOException $e) {
            die(json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]));
        }
    }

    public function getConnection(): PDO {
        return $this->conn;
    }

    // Admin Login
    public function adminLogin($username, $password) {
        $stmt = $this->conn->prepare("SELECT user_id, username, role FROM users WHERE username = ? AND password_hash = ? LIMIT 1");
        $stmt->execute([$username, $password]);
        return $stmt->fetch();
    }

    // Register New Donor
    public function registerDonor($data) {
        $stmt = $this->conn->prepare("INSERT INTO donors (name, age, birthdate, contact, blood_type, weight) 
                                      VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['name'] ?? null,
            $data['age'] ?? null,
            $data['birthdate'] ?? null,
            $data['contact'] ?? null,
            $data['blood_type'] ?? null,
            $data['weight'] ?? null
        ]);
    }

    // Get Blood Inventory
    public function getInventory() {
        $stmt = $this->conn->query("SELECT blood_type, units FROM blood_inventory ORDER BY blood_type");
        $result = [];
        foreach ($stmt->fetchAll() as $row) {
            $result[$row['blood_type']] = (int)$row['units'];
        }
        return $result;
    }

    // Search Donors
    public function searchDonors($mode, $query) {
        if (empty($query)) return [];

        if ($mode === 'Name' || $mode === 'name') {
            $stmt = $this->conn->prepare("SELECT * FROM donors WHERE name LIKE ?");
            $stmt->execute(["%$query%"]);
        } else {
            $stmt = $this->conn->prepare("SELECT * FROM donors WHERE blood_type = ?");
            $stmt->execute([strtoupper($query)]);
        }
        return $stmt->fetchAll();
    }
}

// ====================== MAIN EXECUTION ======================
try {
    $db = new BloodDonationDatabase();
    $action = $argv[1] ?? '';
    $payload = json_decode($argv[2] ?? '{}', true);

    switch ($action) {
        case 'admin-login':
            $user = $db->adminLogin($payload['username'] ?? '', $payload['password'] ?? '');
            if ($user) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Login successful", 
                    "username" => $user['username'], 
                    "role" => $user['role']
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid username or password"]);
            }
            break;

        case 'register-donor':
            $success = $db->registerDonor($payload);
            echo json_encode([
                "success" => $success, 
                "message" => $success ? "Donor registered successfully!" : "Failed to register donor"
            ]);
            break;

        case 'inventory':
            echo json_encode($db->getInventory());
            break;

        case 'search':
            $results = $db->searchDonors($payload['mode'] ?? 'Name', $payload['query'] ?? '');
            echo json_encode($results);
            break;

        default:
            echo json_encode(["success" => false, "message" => "Unknown action: " . $action]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}