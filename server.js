import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
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
const ensureColumn = (table, column, type) => {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
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
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    user_photo TEXT,
    message TEXT,
    image TEXT,
    document TEXT,
    document_name TEXT,
    timestamp TEXT,
    reactions TEXT DEFAULT '{}',
    read_by TEXT DEFAULT '[]',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    title TEXT,
    description TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    category TEXT,
    created_at TEXT,
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS event_rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    user_id INTEGER,
    timestamp TEXT,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    message TEXT,
    type TEXT,
    related_id INTEGER,
    read INTEGER DEFAULT 0,
    timestamp TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);
// Migration: Add missing columns if they don't exist
ensureColumn('users', 'phone', 'TEXT');
ensureColumn('users', 'bio', 'TEXT');
ensureColumn('users', 'photo', 'TEXT');
ensureColumn('users', 'branch_id', 'INTEGER');
ensureColumn('users', 'card_status', "TEXT DEFAULT 'none'");
ensureColumn('users', 'card_id', 'TEXT');
ensureColumn('users', 'card_issued_at', 'TEXT');
ensureColumn('users', 'card_expires_at', 'TEXT');
ensureColumn('users', 'card_full_name', 'TEXT');
ensureColumn('users', 'card_phone', 'TEXT');
ensureColumn('users', 'card_photo', 'TEXT');
ensureColumn('users', 'card_rejection_reason', 'TEXT');
ensureColumn('users', 'status', "TEXT DEFAULT 'active'");
ensureColumn('users', 'location', 'TEXT');
ensureColumn('branches', 'officer_name', 'TEXT');
ensureColumn('branches', 'officer_bio', 'TEXT');
ensureColumn('branches', 'officer_photo', 'TEXT');
ensureColumn('branches', 'officer_photos', 'TEXT'); // JSON array of base64 strings
ensureColumn('activities', 'status', "TEXT DEFAULT 'active'");
ensureColumn('resources', 'url', 'TEXT');
ensureColumn('resources', 'date', 'TEXT');
ensureColumn('chat_messages', 'image', 'TEXT');
ensureColumn('chat_messages', 'document', 'TEXT');
ensureColumn('chat_messages', 'document_name', 'TEXT');
ensureColumn('chat_messages', 'user_photo', 'TEXT');
ensureColumn('chat_messages', 'reactions', "TEXT DEFAULT '{}'");
ensureColumn('chat_messages', 'read_by', "TEXT DEFAULT '[]'");
ensureColumn('chat_messages', 'reply_to', 'TEXT'); // JSON string of the replied message
// Seed master admin if empty
const adminExists = db.prepare("SELECT * FROM users WHERE email = 'asminadmin@gmail.com'").get();
if (!adminExists) {
    db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run('asminadmin@gmail.com', 'asminadmin', 'Master Admin', 'master_admin');
}
// Seed branches if empty
const branchCount = db.prepare("SELECT COUNT(*) as count FROM branches").get();
if (branchCount.count === 0) {
    // No hardcoded branches anymore, master admin will add them.
}
else {
    // Cleanup hardcoded "Head Office" if it was seeded previously and has no officer
    const hardcoded = db.prepare("SELECT id FROM branches WHERE region = 'Head Office' AND location = 'Kampala'").get();
    if (hardcoded) {
        const hasOfficer = db.prepare("SELECT id FROM users WHERE branch_id = ?").get(hardcoded.id);
        if (!hasOfficer) {
            db.prepare("DELETE FROM branches WHERE id = ?").run(hardcoded.id);
        }
    }
}
async function startServer() {
    const app = express();
    const server = createServer(app);
    const wss = new WebSocketServer({ server });
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    const PORT = 3000;
    // --- WebSocket Logic ---
    const clients = new Set();
    wss.on("connection", (ws) => {
        clients.add(ws);
        // Send message history
        const history = db.prepare("SELECT * FROM chat_messages ORDER BY timestamp ASC LIMIT 100").all();
        ws.send(JSON.stringify({ type: "history", messages: history }));
        ws.on("message", (data) => {
            try {
                const payload = JSON.parse(data.toString());
                if (payload.type === "message") {
                    const { userId, userName, userPhoto, message, image, document, documentName, replyTo } = payload;
                    const timestamp = new Date().toISOString();
                    const info = db.prepare("INSERT INTO chat_messages (user_id, user_name, user_photo, message, image, document, document_name, timestamp, reactions, read_by, reply_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .run(userId, userName, userPhoto || null, message, image || null, document || null, documentName || null, timestamp, '{}', JSON.stringify([userId]), replyTo ? JSON.stringify(replyTo) : null);
                    const newMessage = {
                        id: info.lastInsertRowid,
                        user_id: userId,
                        user_name: userName,
                        user_photo: userPhoto,
                        message,
                        image,
                        document,
                        document_name: documentName,
                        timestamp,
                        reactions: {},
                        read_by: [userId],
                        reply_to: replyTo
                    };
                    const broadcastData = JSON.stringify({ type: "message", message: newMessage });
                    clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(broadcastData);
                        }
                    });
                }
                else if (payload.type === "delete") {
                    const { messageId, userId } = payload;
                    const msg = db.prepare("SELECT user_id FROM chat_messages WHERE id = ?").get(messageId);
                    if (msg && msg.user_id === userId) {
                        db.prepare("DELETE FROM chat_messages WHERE id = ?").run(messageId);
                        const broadcastData = JSON.stringify({ type: "delete_update", messageId });
                        clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(broadcastData);
                            }
                        });
                    }
                }
                else if (payload.type === "edit") {
                    const { messageId, userId, newMessage } = payload;
                    const msg = db.prepare("SELECT user_id FROM chat_messages WHERE id = ?").get(messageId);
                    if (msg && msg.user_id === userId) {
                        db.prepare("UPDATE chat_messages SET message = ? WHERE id = ?").run(newMessage, messageId);
                        const broadcastData = JSON.stringify({ type: "edit_update", messageId, newMessage });
                        clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(broadcastData);
                            }
                        });
                    }
                }
                else if (payload.type === "typing") {
                    const { userId, userName, isTyping } = payload;
                    const broadcastData = JSON.stringify({ type: "typing", userId, userName, isTyping });
                    clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(broadcastData);
                        }
                    });
                }
                else if (payload.type === "reaction") {
                    const { messageId, userId, emoji } = payload;
                    const msg = db.prepare("SELECT reactions FROM chat_messages WHERE id = ?").get(messageId);
                    if (msg) {
                        const reactions = JSON.parse(msg.reactions);
                        if (!reactions[emoji])
                            reactions[emoji] = [];
                        const index = reactions[emoji].indexOf(userId);
                        if (index > -1) {
                            reactions[emoji].splice(index, 1);
                            if (reactions[emoji].length === 0)
                                delete reactions[emoji];
                        }
                        else {
                            reactions[emoji].push(userId);
                        }
                        db.prepare("UPDATE chat_messages SET reactions = ? WHERE id = ?").run(JSON.stringify(reactions), messageId);
                        const broadcastData = JSON.stringify({ type: "reaction_update", messageId, reactions });
                        clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(broadcastData);
                            }
                        });
                    }
                }
                else if (payload.type === "read") {
                    const { messageId, userId } = payload;
                    const msg = db.prepare("SELECT read_by FROM chat_messages WHERE id = ?").get(messageId);
                    if (msg) {
                        const readBy = JSON.parse(msg.read_by);
                        if (!readBy.includes(userId)) {
                            readBy.push(userId);
                            db.prepare("UPDATE chat_messages SET read_by = ? WHERE id = ?").run(JSON.stringify(readBy), messageId);
                            const broadcastData = JSON.stringify({ type: "read_update", messageId, readBy });
                            clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(broadcastData);
                                }
                            });
                        }
                    }
                }
            }
            catch (e) {
                console.error("WS Message Error:", e);
            }
        });
        ws.on("close", () => {
            clients.delete(ws);
        });
    });
    // --- API Routes ---
    // Auth (Simplified for demo)
    app.post("/api/auth/register", (req, res) => {
        const { email, password, name } = req.body;
        try {
            const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
            db.prepare("INSERT INTO accounts (user_id) VALUES (?)").run(info.lastInsertRowid);
            res.json({ success: true, userId: info.lastInsertRowid });
        }
        catch (e) {
            res.status(400).json({ error: "Email already exists" });
        }
    });
    app.post("/api/auth/login", (req, res) => {
        const { email, password } = req.body;
        const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
        if (user) {
            res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, branch_id: user.branch_id, photo: user.photo } });
        }
        else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
    // Profile Management
    app.post("/api/profile/update", (req, res) => {
        const { userId, name, email, phone, bio, photo, currentPassword, newPassword } = req.body;
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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
        const { vulnerableName, images, activePhone, altPhone, guardianName, country, district, county, subCounty, parish, village, chairpersonName, chairpersonPhone, recommendationLetter } = req.body;
        db.prepare(`
      INSERT INTO donation_applications (
        branch_id, vulnerable_name, images, active_phone, alt_phone, guardian_name,
        country, district, county, sub_county, parish, village,
        chairperson_name, chairperson_phone, recommendation_letter, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, vulnerableName, JSON.stringify(images), activePhone, altPhone, guardianName, country, district, county, subCounty, parish, village, chairpersonName, chairpersonPhone, recommendationLetter, new Date().toISOString());
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
    app.post("/api/admin/message", (req, res) => {
        const { userId, message } = req.body;
        db.prepare("INSERT INTO notifications (user_id, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?)")
            .run(userId, "Admin Message", message, "admin_message", new Date().toISOString());
        res.json({ success: true });
    });
    // Master Admin Dashboard
    // Master Admin
    app.get("/api/admin/master/users", (req, res) => {
        const users = db.prepare("SELECT id, name, email, role, branch_id FROM users WHERE role = 'user'").all();
        res.json(users);
    });
    app.get("/api/admin/master/analytics", (req, res) => {
        const donations = db.prepare("SELECT amount, date FROM donations").all();
        const transactions = db.prepare("SELECT amount, date, type FROM transactions").all();
        const users = db.prepare("SELECT count(*) as count, strftime('%Y-%m', 'now') as month FROM users").get();
        res.json({ donations, transactions, users });
    });
    app.get("/api/admin/regional/analytics/:branch_id", (req, res) => {
        const branchId = req.params.branch_id;
        const transactions = db.prepare(`
      SELECT t.* FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE u.branch_id = ?
    `).all(branchId);
        const applications = db.prepare("SELECT status, count(*) as count FROM donation_applications WHERE branch_id = ? GROUP BY status").all(branchId);
        res.json({ transactions, applications });
    });
    app.get("/api/transactions/:user_id", (req, res) => {
        const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(req.params.user_id);
        res.json(transactions);
    });
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
            let branch = db.prepare("SELECT id FROM branches WHERE region = ?").get(branchName);
            if (!branch) {
                const info = db.prepare("INSERT INTO branches (region, location, is_head_office) VALUES (?, ?, ?)")
                    .run(branchName, branchName, isHeadOffice ? 1 : 0);
                branch = { id: info.lastInsertRowid };
            }
            else {
                // Update existing branch head office status if requested
                if (isHeadOffice) {
                    db.prepare("UPDATE branches SET is_head_office = 1 WHERE id = ?").run(branch.id);
                }
            }
            db.prepare("INSERT INTO users (name, email, password, role, branch_id) VALUES (?, ?, ?, 'regional_officer', ?)")
                .run(name, email, password, branch.id);
            res.json({ success: true });
        }
        catch (e) {
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
        const branches = db.prepare("SELECT * FROM branches").all();
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
        res.json(account || null);
    });
    app.post("/api/account/deposit", (req, res) => {
        const { userId, amount } = req.body;
        db.prepare("UPDATE accounts SET balance = balance + ? WHERE user_id = ?").run(amount, userId);
        db.prepare("INSERT INTO transactions (user_id, type, amount, date) VALUES (?, 'deposit', ?, ?)").run(userId, amount, new Date().toISOString());
        res.json({ success: true });
    });
    app.post("/api/account/settings", (req, res) => {
        const { userId, autoPay } = req.body;
        db.prepare("UPDATE accounts SET auto_pay_asmin = ? WHERE user_id = ?").run(autoPay ? 1 : 0, userId);
        res.json({ success: true });
    });
    app.post("/api/account/pay-asmin", (req, res) => {
        const { userId, amount } = req.body;
        const account = db.prepare("SELECT balance FROM accounts WHERE user_id = ?").get(userId);
        if (account.balance < amount) {
            return res.status(400).json({ error: "Insufficient balance" });
        }
        db.prepare("UPDATE accounts SET balance = balance - ? WHERE user_id = ?").run(amount, userId);
        db.prepare("INSERT INTO transactions (user_id, type, amount, date) VALUES (?, 'asmin_collection', ?, ?)").run(userId, amount, new Date().toISOString());
        res.json({ success: true });
    });
    // Donations
    app.get("/api/donations", (req, res) => {
        const donations = db.prepare("SELECT * FROM donations ORDER BY date DESC LIMIT 10").all();
        res.json(donations);
    });
    app.post("/api/donations", (req, res) => {
        const { donorName, amount, message } = req.body;
        db.prepare("INSERT INTO donations (donor_name, amount, date, message) VALUES (?, ?, ?, ?)").run(donorName, amount, new Date().toISOString(), message);
        res.json({ success: true });
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
        const { donorName, amount, message } = req.body;
        db.prepare("INSERT INTO regional_donations (branch_id, donor_name, amount, message, date) VALUES (?, ?, ?, ?, ?)")
            .run(req.params.id, donorName, amount, message, new Date().toISOString());
        res.json({ success: true });
    });
    app.post("/api/branches/:id/request", (req, res) => {
        const { requesterName, contact, needDescription } = req.body;
        db.prepare("INSERT INTO regional_requests (branch_id, requester_name, contact, need_description, date) VALUES (?, ?, ?, ?, ?)")
            .run(req.params.id, requesterName, contact, needDescription, new Date().toISOString());
        res.json({ success: true });
    });
    // Events & Notifications
    app.get("/api/events", (req, res) => {
        const events = db.prepare(`
      SELECT e.*, (b.region || ' - ' || b.location) as branch_name, 
      (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id) as rsvp_count
      FROM events e
      JOIN branches b ON e.branch_id = b.id
      ORDER BY e.date ASC
    `).all();
        res.json(events);
    });
    app.post("/api/events", (req, res) => {
        const { branchId, title, description, date, time, location, category } = req.body;
        const info = db.prepare(`
      INSERT INTO events (branch_id, title, description, date, time, location, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(branchId, title, description, date, time, location, category, new Date().toISOString());
        // Notify users in this branch
        const users = db.prepare("SELECT id FROM users WHERE branch_id = ?").all(branchId);
        const stmt = db.prepare("INSERT INTO notifications (user_id, title, message, type, related_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
        users.forEach(u => {
            stmt.run(u.id, "New Event", `A new event "${title}" has been posted in your branch.`, "event", info.lastInsertRowid, new Date().toISOString());
        });
        res.json({ success: true, eventId: info.lastInsertRowid });
    });
    app.get("/api/events/:id/rsvps", (req, res) => {
        const rsvps = db.prepare("SELECT user_id FROM event_rsvps WHERE event_id = ?").all(req.params.id);
        res.json(rsvps.map((r) => r.user_id));
    });
    app.post("/api/events/:id/rsvp", (req, res) => {
        const { userId } = req.body;
        const existing = db.prepare("SELECT id FROM event_rsvps WHERE event_id = ? AND user_id = ?").get(req.params.id, userId);
        if (existing) {
            db.prepare("DELETE FROM event_rsvps WHERE id = ?").run(existing.id);
            res.json({ success: true, rsvp: false });
        }
        else {
            db.prepare("INSERT INTO event_rsvps (event_id, user_id, timestamp) VALUES (?, ?, ?)")
                .run(req.params.id, userId, new Date().toISOString());
            res.json({ success: true, rsvp: true });
        }
    });
    app.get("/api/notifications/:userId", (req, res) => {
        const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50").all(req.params.userId);
        res.json(notifications);
    });
    app.post("/api/notifications/:id/read", (req, res) => {
        db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id);
        res.json({ success: true });
    });
    // Membership Card Management
    app.post("/api/card/request", (req, res) => {
        const { userId, fullName, phone, photo } = req.body;
        db.prepare(`
      UPDATE users 
      SET card_status = 'pending', 
          card_full_name = ?, 
          card_phone = ?, 
          card_photo = ?,
          card_rejection_reason = NULL
      WHERE id = ?
    `).run(fullName, phone, photo, userId);
        res.json({ success: true });
    });
    app.get("/api/admin/pending-cards", (req, res) => {
        const pending = db.prepare(`
      SELECT id, name, email, photo, role, card_full_name, card_phone, card_photo 
      FROM users 
      WHERE card_status = 'pending'
    `).all();
        res.json(pending);
    });
    app.post("/api/admin/approve-card/:userId", (req, res) => {
        const userId = req.params.userId;
        const cardId = Array.from({ length: 16 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join('');
        const issuedAt = new Date().toISOString();
        const expiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString();
        db.prepare("UPDATE users SET card_status = 'approved', card_id = ?, card_issued_at = ?, card_expires_at = ? WHERE id = ?")
            .run(cardId, issuedAt, expiresAt, userId);
        // Notify user
        db.prepare("INSERT INTO notifications (user_id, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?)")
            .run(userId, "Membership Card Approved", "Your official membership card has been approved and issued.", "card", new Date().toISOString());
        res.json({ success: true, cardId, issuedAt, expiresAt });
    });
    app.post("/api/admin/reject-card/:userId", (req, res) => {
        const userId = req.params.userId;
        const { reason } = req.body;
        db.prepare("UPDATE users SET card_status = 'rejected', card_rejection_reason = ? WHERE id = ?")
            .run(reason, userId);
        // Notify user
        db.prepare("INSERT INTO notifications (user_id, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?)")
            .run(userId, "Membership Card Rejected", `Your membership card request was rejected. Reason: ${reason}. Please update your details and try again.`, "card", new Date().toISOString());
        res.json({ success: true });
    });
    // Admin User Management
    app.post("/api/admin/users/:id/warn", (req, res) => {
        const { id } = req.params;
        const { message } = req.body;
        db.prepare("INSERT INTO notifications (user_id, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?)").run(id, "Warning from Admin", message, "warning", new Date().toISOString());
        res.json({ success: true });
    });
    app.post("/api/admin/users/:id/suspend", (req, res) => {
        const { id } = req.params;
        db.prepare("UPDATE users SET status = 'suspended' WHERE id = ?").run(id);
        db.prepare("INSERT INTO notifications (user_id, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?)").run(id, "Account Suspended", "Your account has been suspended by the administrator.", "alert", new Date().toISOString());
        res.json({ success: true });
    });
    app.post("/api/admin/users/:id/ban", (req, res) => {
        const { id } = req.params;
        db.prepare("UPDATE users SET status = 'banned' WHERE id = ?").run(id);
        res.json({ success: true });
    });
    app.delete("/api/admin/users/:id", (req, res) => {
        const { id } = req.params;
        db.prepare("DELETE FROM users WHERE id = ?").run(id);
        db.prepare("DELETE FROM accounts WHERE user_id = ?").run(id);
        res.json({ success: true });
    });
    // 404 for API routes
    app.use("/api/*", (req, res) => {
        res.status(404).json({ error: "API route not found" });
    });
    // Global error handler
    app.use((err, req, res, next) => {
        console.error(err);
        if (req.path.startsWith("/api/")) {
            res.status(500).json({ error: err.message || "Internal server error" });
        }
        else {
            next(err);
        }
    });
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    }
    else {
        app.use(express.static(path.join(__dirname, "dist")));
        app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "dist", "index.html"));
        });
    }
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
startServer();
