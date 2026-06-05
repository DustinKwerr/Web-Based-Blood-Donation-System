<?php
// Prevent manual browser access; only allow execution via CLI/Node.js
if (php_sapi_name() !== 'cli') {
    die(json_encode(["success" => false, "message" => "Unauthorized access vector."]));
}

// =========================================================================
// INTERFACES & OOP ABSTRACT LAYERS
// =========================================================================
interface Searchable {
    public function searchByName(string $name);
    public function searchByBloodType(string $bloodType): array;
}

class Person {
    private string $name;
    private int $age;
    private string $contact;

    public function __construct(string $name, int $age, string $contact) {
        $this->name = $name;
        $this->age = $age;
        $this->contact = $contact;
    }

    public function getName(): string { return $this->name; }
    public function getAge(): int { return $this->age; }
    public function getContact(): string { return $this->contact; }
}

class Donor extends Person {
    private string $bloodType;
    private float $weight;

    public function __construct(string $name, int $age, string $contact, string $bloodType, float $weight) {
        parent::__construct($name, $age, $contact);
        $this->bloodType = $bloodType;
        $this->weight = $weight;
    }

    public function getBloodType(): string { return $this->bloodType; }
    public function getWeight(): float { return $this->weight; }
}

// =========================================================================
// CORE DATABASE PIPELINE ENGINE
// =========================================================================
class BloodDonationDatabase implements Searchable {
    private array $config;
    private ?PDO $persistentConn = null;

    public function __construct(string $host, string $user, string $password, string $database) {
        $this->config = ['host' => $host, 'user' => $user, 'password' => $password, 'database' => $database];
    }

    public function getConnection(): PDO {
        if ($this->persistentConn === null) {
            $dsn = "mysql:host=" . $this->config['host'] . ";dbname=" . $this->config['database'] . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->persistentConn = new PDO($dsn, $this->config['user'], $this->config['password'], $options);
        }
        return $this->persistentConn;
    }

    public function authenticateUser(string $username, string $password): ?string {
        $query = "SELECT password_hash, role FROM users WHERE username = :username";
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute([':username' => $username]);
        $result = $stmt->fetch();
        if ($result && $result['password_hash'] === $password) {
            return $result['role'];
        }
        return null;
    }

    public function searchByName(string $name): ?Donor {
        $query = "SELECT name, age, contact, blood_type, weight FROM donors WHERE name = :name";
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute([':name' => $name]);
        $row = $stmt->fetch();
        if ($row) {
            return new Donor($row['name'], (int)$row['age'], $row['contact'], $row['blood_type'], (float)$row['weight']);
        }
        return null;
    }

    public function searchByBloodType(string $bloodType): array {
        $query = "SELECT name, age, contact, blood_type, weight FROM donors WHERE blood_type = :blood_type";
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute([':blood_type' => $bloodType]);
        $rows = $stmt->fetchAll();
        $donorList = [];
        foreach ($rows as $row) {
            $donorList[] = new Donor($row['name'], (int)$row['age'], $row['contact'], $row['blood_type'], (float)$row['weight']);
        }
        return $donorList;
    }

    public function registerDonor(Donor $donor): bool {
        $insertDonorQuery = "INSERT INTO donors (name, age, contact, blood_type, weight) VALUES (:name, :age, :contact, :blood_type, :weight)";
        $updateInventoryQuery = "UPDATE blood_inventory SET units = units + 1 WHERE blood_type = :blood_type";
        
        $pdo = $this->getConnection();
        $pdo->beginTransaction();
        try {
            $stmt1 = $pdo->prepare($insertDonorQuery);
            $stmt1->execute([
                ':name'       => $donor->getName(),
                ':age'        => $donor->getAge(),
                ':contact'    => $donor->getContact(),
                ':blood_type' => $donor->getBloodType(),
                ':weight'     => $donor->getWeight()
            ]);

            $stmt2 = $pdo->prepare($updateInventoryQuery);
            $stmt2->execute([':blood_type' => strtoupper($donor->getBloodType())]);

            $pdo->commit();
            return true;
        } catch (Exception $e) {
            $pdo->rollBack();
            return false;
        }
    }
}

class BloodInventory {
    private BloodDonationDatabase $db;
    public function __construct(BloodDonationDatabase $dbInstance) { $this->db = $dbInstance; }

    public function getInventoryData(): array {
        $query = "SELECT blood_type, units FROM blood_inventory";
        $stmt = $this->db->getConnection()->query($query);
        $inventoryDict = [];
        foreach ($stmt->fetchAll() as $row) {
            $inventoryDict[$row['blood_type']] = (int)$row['units'];
        }
        return $inventoryDict;
    }
}

// =========================================================================
// CLI ARGUMENT ROUTING MATRIX (Connects to Node.js)
// =========================================================================
try {
    $db = new BloodDonationDatabase("localhost", "root", "", "blood_donation_system_database");
    $inventory = new BloodInventory($db);

    // Read the instruction block sent by Node.js
    $action = $argv[1] ?? '';
    $payload = json_decode($argv[2] ?? '{}', true);

    switch ($action) {
        case 'login':
            $role = $db->authenticateUser($payload['username'] ?? '', $payload['password'] ?? '');
            if ($role) {
                echo json_encode(["success" => true, "role" => $role, "username" => $payload['username']]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid credentials."]);
            }
            break;

        case 'inventory':
            echo json_encode($inventory->getInventoryData());
            break;

        case 'register-donor':
            $donor = new Donor($payload['name'], (int)$payload['age'], $payload['contact'], $payload['blood_type'], (float)$payload['weight']);
            $res = $db->registerDonor($donor);
            echo json_encode(["success" => $res, "message" => $res ? "Profile saved successfully!" : "Database transaction failed."]);
            break;

        case 'search':
            $mode = $payload['mode'] ?? '';
            $query = $payload['query'] ?? '';
            $results = [];

            if ($mode === 'Name') {
                $d = $db->searchByName($query);
                if ($d) {
                    $results[] = ["name" => $d->getName(), "age" => $d->getAge(), "contact" => $d->getContact(), "blood_type" => $d->getBloodType(), "weight" => $d->getWeight()];
                }
            } else {
                foreach ($db->searchByBloodType($query) as $d) {
                    $results[] = ["name" => $d->getName(), "age" => $d->getAge(), "contact" => $d->getContact(), "blood_type" => $d->getBloodType(), "weight" => $d->getWeight()];
                }
            }
            echo json_encode($results);
            break;

        default:
            echo json_encode(["success" => false, "message" => "Unknown action command."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}