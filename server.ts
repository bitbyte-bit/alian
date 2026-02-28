import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("asmin.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user' -- 'user', 'regional_officer', 'master_admin'
  );

  -- Migration: Add missing columns if they don't exist
  -- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS directly in one statement easily without PRAGMA check
  -- but we can try to add them and ignore the error if they already exist.
  -- Better way: check PRAGMA table_info(users)
`);

// Migration helper
const ensureColumn = (table: string, column: string, type: string) => {
  const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  if (!info.find(col => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
};

db.exec(`
  CREATE TABLE IF NOT EXISTS donation_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    vulnerable_name TEXT,
    images TEXT, -- JSON array of base64 strings
    active_phone TEXT,
    alt_phone TEXT,
    guardian_name TEXT,
    country TEXT,
    district TEXT,
    county TEXT,
    sub_county TEXT,
    parish TEXT,
    village TEXT,
    chairperson_name TEXT,
    chairperson_phone TEXT,
    recommendation_letter TEXT, -- Base64 string
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'forwarded', 'replied'
    officer_reply TEXT,
    date TEXT,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS accounts (
    user_id INTEGER PRIMARY KEY,
    balance REAL DEFAULT 0,
    auto_pay_asmin INTEGER DEFAULT 0, -- 0 for manual, 1 for auto
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_name TEXT,
    amount REAL,
    date TEXT,
    message TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'deposit', 'asmin_collection'
    amount REAL,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region TEXT,
    location TEXT,
    is_head_office INTEGER DEFAULT 0,
    officer_name TEXT,
    officer_bio TEXT,
    officer_photo TEXT -- Base64 encoded image
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    title TEXT,
    description TEXT,
    date TEXT,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    name TEXT,
    type TEXT, -- 'document', 'tool', 'fund'
    description TEXT,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS regional_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    requester_name TEXT,
    contact TEXT,
    need_description TEXT,
    status TEXT DEFAULT 'pending',
    date TEXT,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS regional_donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    donor_name TEXT,
    amount REAL,
    message TEXT,
    date TEXT,
    is_anonymous INTEGER DEFAULT 0,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS impact_stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    title TEXT,
    story TEXT,
    beneficiary_name TEXT,
    image TEXT,
    date TEXT,
    is_approved INTEGER DEFAULT 0,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    reset_token TEXT,
    expires_at TEXT,
    is_used INTEGER DEFAULT 0
  );
`);

// Migration: Add missing columns if they don't exist
ensureColumn('users', 'phone', 'TEXT');
ensureColumn('users', 'bio', 'TEXT');
ensureColumn('users', 'photo', 'TEXT');
ensureColumn('users', 'branch_id', 'INTEGER');
ensureColumn('branches', 'officer_name', 'TEXT');
ensureColumn('branches', 'officer_bio', 'TEXT');
ensureColumn('branches', 'officer_photo', 'TEXT');
ensureColumn('branches', 'officer_photos', 'TEXT'); // JSON array of base64 strings
ensureColumn('activities', 'status', "TEXT DEFAULT 'active'");
ensureColumn('resources', 'url', 'TEXT');
ensureColumn('resources', 'date', 'TEXT');

// Seed master admin if empty
const adminExists = db.prepare("SELECT * FROM users WHERE email = 'asmin@zion.com'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run('asmin@zion.com', 'asmin', 'Master Admin', 'master_admin');
}

// Seed branches if empty
const branchCount = db.prepare("SELECT COUNT(*) as count FROM branches").get() as { count: number };
if (branchCount.count === 0) {
  // No hardcoded branches anymore, master admin will add them.
} else {
  // Cleanup hardcoded "Head Office" if it was seeded previously and has no officer
  const hardcoded = db.prepare("SELECT id FROM branches WHERE region = 'Head Office' AND location = 'Kampala'").get() as { id: number } | undefined;
  if (hardcoded) {
    const hasOfficer = db.prepare("SELECT id FROM users WHERE branch_id = ?").get(hardcoded.id);
    if (!hasOfficer) {
      db.prepare("DELETE FROM branches WHERE id = ?").run(hardcoded.id);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  const PORT = 3000;

  // --- API Routes ---

  // Auth (Simplified for demo)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, branch_id: user.branch_id, photo: user.photo } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Profile Management
  app.post("/api/profile/update", (req, res) => {
    const { userId, name, email, phone, bio, photo, currentPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const passwordToSet = newPassword || currentPassword;
    
    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const emailTaken = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, userId);
      if (emailTaken) {
        return res.status(400).json({ error: "Email already taken" });
      }
    }

    db.prepare("UPDATE users SET name = ?, email = ?, phone = ?, bio = ?, photo = ?, password = ? WHERE id = ?")
      .run(name, email, phone, bio, photo, passwordToSet, userId);
    
    res.json({ success: true, user: { id: userId, name, email, role: user.role, branch_id: user.branch_id, photo } });
  });

  // Donation Applications
  app.post("/api/branches/:id/apply", (req, res) => {
    const { 
      vulnerableName, images, activePhone, altPhone, guardianName,
      country, district, county, subCounty, parish, village,
      chairpersonName, chairpersonPhone, recommendationLetter 
    } = req.body;
    
    db.prepare(`
      INSERT INTO donation_applications (
        branch_id, vulnerable_name, images, active_phone, alt_phone, guardian_name,
        country, district, county, sub_county, parish, village,
        chairperson_name, chairperson_phone, recommendation_letter, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id, vulnerableName, JSON.stringify(images), activePhone, altPhone, guardianName,
      country, district, county, subCounty, parish, village,
      chairpersonName, chairpersonPhone, recommendationLetter, new Date().toISOString()
    );
    
    res.json({ success: true });
  });

  // Regional Officer Dashboard
  app.get("/api/admin/regional/applications/:branchId", (req, res) => {
    const apps = db.prepare("SELECT * FROM donation_applications WHERE branch_id = ? ORDER BY date DESC").all(req.params.branchId);
    res.json(apps);
  });

  app.post("/api/admin/regional/reply", (req, res) => {
    const { appId, reply } = req.body;
    db.prepare("UPDATE donation_applications SET officer_reply = ?, status = 'replied' WHERE id = ?").run(reply, appId);
    res.json({ success: true });
  });

  app.post("/api/admin/regional/forward", (req, res) => {
    const { appId } = req.body;
    db.prepare("UPDATE donation_applications SET status = 'forwarded' WHERE id = ?").run(appId);
    res.json({ success: true });
  });

  app.post("/api/admin/regional/status", (req, res) => {
    const { appId, status } = req.body;
    db.prepare("UPDATE donation_applications SET status = ? WHERE id = ?").run(status, appId);
    res.json({ success: true });
  });

  // Master Admin Dashboard
  app.get("/api/admin/master/all-activities", (req, res) => {
    const donations = db.prepare("SELECT * FROM donations").all();
    const transactions = db.prepare("SELECT * FROM transactions").all();
    const applications = db.prepare("SELECT * FROM donation_applications").all();
    const users = db.prepare("SELECT id, name, email, role, branch_id FROM users").all();
    res.json({ donations, transactions, applications, users });
  });

  app.get("/api/admin/master/officers", (req, res) => {
    const officers = db.prepare("SELECT id, name, email, role, branch_id FROM users WHERE role = 'regional_officer'").all();
    res.json(officers);
  });

  app.post("/api/admin/master/officers", (req, res) => {
    const { name, email, password, branchName, isHeadOffice } = req.body;
    try {
      // If this is a head office, unset other head offices first
      if (isHeadOffice) {
        db.prepare("UPDATE branches SET is_head_office = 0").run();
      }

      // Find or create branch
      let branch = db.prepare("SELECT id FROM branches WHERE region = ?").get(branchName) as { id: number } | undefined;
      if (!branch) {
        const info = db.prepare("INSERT INTO branches (region, location, is_head_office) VALUES (?, ?, ?)")
          .run(branchName, branchName, isHeadOffice ? 1 : 0);
        branch = { id: info.lastInsertRowid as number };
      } else {
        // Update existing branch head office status if requested
        if (isHeadOffice) {
          db.prepare("UPDATE branches SET is_head_office = 1 WHERE id = ?").run(branch.id);
        }
      }

      db.prepare("INSERT INTO users (name, email, password, role, branch_id) VALUES (?, ?, ?, 'regional_officer', ?)")
        .run(name, email, password, branch.id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Email already exists or database error" });
    }
  });

  app.put("/api/admin/master/officers/:id", (req, res) => {
    const { name, email, password, branchId } = req.body;
    db.prepare("UPDATE users SET name = ?, email = ?, password = ?, branch_id = ? WHERE id = ?")
      .run(name, email, password, branchId, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/master/officers/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/master/branches", (req, res) => {
    const branches = db.prepare("SELECT * FROM branches").all() as any[];
    const branchesWithActivities = branches.map(branch => {
      const activities = db.prepare("SELECT * FROM activities WHERE branch_id = ?").all(branch.id);
      return { ...branch, activities };
    });
    res.json(branchesWithActivities);
  });

  app.put("/api/admin/master/branches/:id", (req, res) => {
    const { region, location, isHeadOffice, officerName, officerBio, officerPhotos } = req.body;
    if (isHeadOffice) {
      db.prepare("UPDATE branches SET is_head_office = 0").run();
    }
    db.prepare("UPDATE branches SET region = ?, location = ?, is_head_office = ?, officer_name = ?, officer_bio = ?, officer_photos = ? WHERE id = ?")
      .run(region, location, isHeadOffice ? 1 : 0, officerName, officerBio, JSON.stringify(officerPhotos), req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/master/branches/:id", (req, res) => {
    db.prepare("DELETE FROM branches WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM activities WHERE branch_id = ?").run(req.params.id);
    db.prepare("DELETE FROM resources WHERE branch_id = ?").run(req.params.id);
    db.prepare("UPDATE users SET branch_id = NULL WHERE branch_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/master/activities/:id", (req, res) => {
    const { title, description, status } = req.body;
    db.prepare("UPDATE activities SET title = ?, description = ?, status = ? WHERE id = ?")
      .run(title, description, status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/master/activities/:id", (req, res) => {
    db.prepare("DELETE FROM activities WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Account & Savings
  app.get("/api/account/:userId", (req, res) => {
    const account = db.prepare("SELECT * FROM accounts WHERE user_id = ?").get(req.params.userId);
    res.json(account);
  });

  app.post("/api/account/deposit", (req, res) => {
    const { userId, amount } = req.body;
    
    // Server-side validation
    const errors = validateInput({ amount }, {
      amount: (v) => typeof v === 'number' && v > 0
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    db.prepare("UPDATE accounts SET balance = balance + ? WHERE user_id = ?").run(amount, userId);
    db.prepare("INSERT INTO transactions (user_id, type, amount, date) VALUES (?, 'deposit', ?, ?)").run(userId, amount, new Date().toISOString());
    
    // Add to audit log
    db.prepare("INSERT INTO audit_logs (user_id, action, details, date) VALUES (?, ?, ?, ?)").run(userId, 'deposit', `Deposited ${amount}`, new Date().toISOString());
    
    res.json({ success: true });
  });

  app.post("/api/account/settings", (req, res) => {
    const { userId, autoPay } = req.body;
    db.prepare("UPDATE accounts SET auto_pay_asmin = ? WHERE user_id = ?").run(autoPay ? 1 : 0, userId);
    res.json({ success: true });
  });

  app.post("/api/account/pay-asmin", (req, res) => {
    const { userId, amount } = req.body;
    const account = db.prepare("SELECT balance FROM accounts WHERE user_id = ?").get(userId) as any;
    if (account.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE user_id = ?").run(amount, userId);
    db.prepare("INSERT INTO transactions (user_id, type, amount, date) VALUES (?, 'asmin_collection', ?, ?)").run(userId, amount, new Date().toISOString());
    res.json({ success: true });
  });

  // Withdrawal from savings
  app.post("/api/account/withdraw", (req, res) => {
    const { userId, amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const account = db.prepare("SELECT balance FROM accounts WHERE user_id = ?").get(userId) as any;
    if (!account || account.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE user_id = ?").run(amount, userId);
    db.prepare("INSERT INTO transactions (user_id, type, amount, date) VALUES (?, 'withdrawal', ?, ?)").run(userId, amount, new Date().toISOString());
    
    // Add to audit log
    db.prepare("INSERT INTO audit_logs (user_id, action, details, date) VALUES (?, ?, ?, ?)").run(userId, 'withdrawal', `Withdrew ${amount}`, new Date().toISOString());
    
    res.json({ success: true });
  });

  // Donations
  app.get("/api/donations", (req, res) => {
    const donations = db.prepare("SELECT * FROM donations ORDER BY date DESC LIMIT 10").all();
    res.json(donations);
  });

  // Branches
  app.get("/api/branches", (req, res) => {
    const branches = db.prepare("SELECT * FROM branches").all();
    res.json(branches);
  });

  app.get("/api/branches/:id", (req, res) => {
    const branch = db.prepare("SELECT * FROM branches WHERE id = ?").get(req.params.id);
    const activities = db.prepare("SELECT * FROM activities WHERE branch_id = ? ORDER BY date DESC").all(req.params.id);
    const resources = db.prepare("SELECT * FROM resources WHERE branch_id = ?").all(req.params.id);
    res.json({ ...branch, activities, resources });
  });

  app.post("/api/branches/:id/profile", (req, res) => {
    const { officerName, officerBio, officerPhoto } = req.body;
    db.prepare("UPDATE branches SET officer_name = ?, officer_bio = ?, officer_photo = ? WHERE id = ?")
      .run(officerName, officerBio, officerPhoto, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/branches/:id/activities", (req, res) => {
    const { title, description } = req.body;
    db.prepare("INSERT INTO activities (branch_id, title, description, date) VALUES (?, ?, ?, ?)")
      .run(req.params.id, title, description, new Date().toISOString());
    res.json({ success: true });
  });

  app.post("/api/branches/:id/resources", (req, res) => {
    const { name, type, description, url } = req.body;
    db.prepare("INSERT INTO resources (branch_id, name, type, description, url, date) VALUES (?, ?, ?, ?, ?, ?)")
      .run(req.params.id, name, type, description, url, new Date().toISOString());
    res.json({ success: true });
  });

  app.delete("/api/resources/:id", (req, res) => {
    db.prepare("DELETE FROM resources WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/branches/:id/donate", (req, res) => {
    const { donorName, amount, message, isAnonymous } = req.body;
    db.prepare("INSERT INTO regional_donations (branch_id, donor_name, amount, message, date, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)")
      .run(req.params.id, donorName, amount, message, new Date().toISOString(), isAnonymous ? 1 : 0);
    res.json({ success: true });
  });

  app.post("/api/branches/:id/request", (req, res) => {
    const { requesterName, contact, needDescription } = req.body;
    db.prepare("INSERT INTO regional_requests (branch_id, requester_name, contact, need_description, date) VALUES (?, ?, ?, ?, ?)")
      .run(req.params.id, requesterName, contact, needDescription, new Date().toISOString());
    res.json({ success: true });
  });

  // Password Reset
  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    db.prepare("INSERT INTO password_resets (email, reset_token, expires_at) VALUES (?, ?, ?)")
      .run(email, resetToken, expiresAt);
    // In production, send email with reset link
    res.json({ success: true, message: "Password reset link sent to email", token: resetToken });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { token, newPassword } = req.body;
    const reset = db.prepare("SELECT * FROM password_resets WHERE reset_token = ? AND is_used = 0").get(token) as any;
    if (!reset) {
      return res.status(400).json({ error: "Invalid or used token" });
    }
    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: "Token expired" });
    }
    db.prepare("UPDATE users SET password = ? WHERE email = ?").run(newPassword, reset.email);
    db.prepare("UPDATE password_resets SET is_used = 1 WHERE id = ?").run(reset.id);
    res.json({ success: true, message: "Password reset successful" });
  });

  // Search
  app.get("/api/search", (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Search query required" });
    }
    const searchTerm = `%${q}%`;
    const branches = db.prepare("SELECT id, region, location FROM branches WHERE region LIKE ? OR location LIKE ?").all(searchTerm, searchTerm);
    const users = db.prepare("SELECT id, name, email, role FROM users WHERE name LIKE ? OR email LIKE ?").all(searchTerm, searchTerm);
    const donations = db.prepare("SELECT * FROM donations WHERE donor_name LIKE ? OR message LIKE ? ORDER BY date DESC LIMIT 10").all(searchTerm, searchTerm);
    res.json({ branches, users, donations });
  });

  // Analytics for Master Admin
  app.get("/api/admin/master/analytics", (req, res) => {
    const totalDonations = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM donations").get() as any;
    const totalRegionalDonations = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM regional_donations").get() as any;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any;
    const totalOfficers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'regional_officer'").get() as any;
    const totalBranches = db.prepare("SELECT COUNT(*) as count FROM branches").get() as any;
    const pendingApplications = db.prepare("SELECT COUNT(*) as count FROM donation_applications WHERE status = 'pending'").get() as any;
    const approvedApplications = db.prepare("SELECT COUNT(*) as count FROM donation_applications WHERE status = 'replied'").get() as any;
    const totalSavings = db.prepare("SELECT COALESCE(SUM(balance), 0) as total FROM accounts").get() as any;
    
    // Monthly donations for the last 6 months
    const monthlyDonations = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, SUM(amount) as total 
      FROM donations 
      WHERE date >= date('now', '-6 months') 
      GROUP BY month ORDER BY month
    `).all();
    
    res.json({
      totalDonations: totalDonations.total,
      totalRegionalDonations: totalRegionalDonations.total,
      totalUsers: totalUsers.count,
      totalOfficers: totalOfficers.count,
      totalBranches: totalBranches.count,
      pendingApplications: pendingApplications.count,
      approvedApplications: approvedApplications.count,
      totalSavings: totalSavings.total,
      monthlyDonations
    });
  });

  // Impact Stories
  app.get("/api/impact-stories", (req, res) => {
    const stories = db.prepare("SELECT * FROM impact_stories WHERE is_approved = 1 ORDER BY date DESC").all();
    res.json(stories);
  });

  app.get("/api/admin/master/impact-stories", (req, res) => {
    const stories = db.prepare("SELECT * FROM impact_stories ORDER BY date DESC").all();
    res.json(stories);
  });

  app.post("/api/admin/master/impact-stories", (req, res) => {
    const { branchId, title, story, beneficiaryName, image } = req.body;
    db.prepare("INSERT INTO impact_stories (branch_id, title, story, beneficiary_name, image, date, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)")
      .run(branchId, title, story, beneficiaryName, image, new Date().toISOString());
    res.json({ success: true });
  });

  app.put("/api/admin/master/impact-stories/:id", (req, res) => {
    const { title, story, beneficiaryName, image, isApproved } = req.body;
    db.prepare("UPDATE impact_stories SET title = ?, story = ?, beneficiary_name = ?, image = ?, is_approved = ? WHERE id = ?")
      .run(title, story, beneficiaryName, image, isApproved ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/master/impact-stories/:id", (req, res) => {
    db.prepare("DELETE FROM impact_stories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Transaction History
  app.get("/api/transactions/:userId", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(req.params.userId);
    res.json(transactions);
  });

  // Generate Receipt
  app.get("/api/receipt/:transactionId", (req, res) => {
    const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.transactionId) as any;
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    const user = db.prepare("SELECT name, email FROM users WHERE id = ?").get(transaction.user_id) as any;
    
    const receipt = {
      receiptId: `RCP-${transaction.id}-${Date.now()}`,
      transactionId: transaction.id,
      userName: user?.name || 'N/A',
      userEmail: user?.email || 'N/A',
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      organization: "Arise and Shine Ministries International",
      message: "Thank you for your support!"
    };
    res.json(receipt);
  });

  // Regional Requests - Get all for branch
  app.get("/api/branches/:id/requests", (req, res) => {
    const requests = db.prepare("SELECT * FROM regional_requests WHERE branch_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(requests);
  });

  // Regional Requests - Update status
  app.put("/api/admin/regional/requests/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE regional_requests SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Regional Donations - Get all for branch (public)
  app.get("/api/branches/:id/donations", (req, res) => {
    const donations = db.prepare("SELECT id, donor_name, amount, message, date, is_anonymous FROM regional_donations WHERE branch_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(donations);
  });

  // Audit Logs
  app.get("/api/admin/master/audit-logs", (req, res) => {
    const logs = db.prepare("SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.date DESC LIMIT 100").all();
    res.json(logs);
  });

  // Input Validation Helper
  const validateInput = (data: any, rules: Record<string, (val: any) => boolean>) => {
    const errors: string[] = [];
    for (const [field, validator] of Object.entries(rules)) {
      if (!validator(data[field])) {
        errors.push(`Invalid ${field}`);
      }
    }
    return errors;
  };

  // Apply validation to registration
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    
    // Server-side validation
    const errors = validateInput({ email, password, name }, {
      email: (v) => typeof v === 'string' && v.includes('@'),
      password: (v) => typeof v === 'string' && v.length >= 4,
      name: (v) => typeof v === 'string' && v.length >= 2
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    try {
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
      db.prepare("INSERT INTO accounts (user_id) VALUES (?)").run(info.lastInsertRowid);
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Apply validation to donations
  app.post("/api/donations", (req, res) => {
    const { donorName, amount, message, isAnonymous } = req.body;
    
    const errors = validateInput({ amount }, {
      amount: (v) => typeof v === 'number' && v > 0
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    const name = isAnonymous ? 'Anonymous' : donorName;
    db.prepare("INSERT INTO donations (donor_name, amount, date, message) VALUES (?, ?, ?, ?)").run(name, amount, new Date().toISOString(), message);
    res.json({ success: true });
  });

  // 404 for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    if (req.path.startsWith("/api/")) {
      res.status(500).json({ error: err.message || "Internal server error" });
    } else {
      next(err);
    }
  });

  // Serve static files from dist folder (production)
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
