// server.js

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const { pool, checkDatabase, ensureSchema } = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers + CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
      },
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

app.post("/submit", (req, res) => {
  const first_name = String(req.body.first_name || "").trim();
  const second_name = String(req.body.second_name || "").trim();
  const email = String(req.body.email || "").trim();
  const phone = String(req.body.phone || "").trim();
  const eir_code = String(req.body.eir_code || "").trim();

  // Rules from CA brief:
  // - Names: alphanumeric, max 20
  // - Email: valid format
  // - Phone: 10 digits, numbers only
  // - Eircode: 6 chars, alphanumeric, starts with a number
  const errors = [];

  if (!/^[a-zA-Z0-9]{1,20}$/.test(first_name)) {
    errors.push("First name must be alphanumeric and max 20 characters.");
  }
  if (!/^[a-zA-Z0-9]{1,20}$/.test(second_name)) {
    errors.push("Second name must be alphanumeric and max 20 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email must be a valid email address.");
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    errors.push("Phone must be exactly 10 digits (numbers only).");
  }
  if (!/^[0-9][a-zA-Z0-9]{5}$/.test(eir_code)) {
    errors.push("Eircode must be 6 characters, alphanumeric, and start with a number.");
  }

  if (errors.length > 0) {
    // Simple, readable error response for now
    return res.status(400).send(errors.join("<br>"));
  }

    // Insert into DB (parameterized query)
  pool.query(
    "INSERT INTO mysql_table (first_name, second_name, email, phone, eir_code) VALUES (?, ?, ?, ?, ?)",
    [first_name, second_name, email, phone, eir_code]
  )
    .then(() => res.send("Saved to database successfully."))
    .catch((err) => res.status(500).send("DB insert error: " + err.message));
});


// Start server only if DB + schema are OK
(async () => {
  try {
    const dbOk = await checkDatabase();
    if (!dbOk) {
      console.error("Database check failed.");
      process.exit(1);
    }

    await ensureSchema();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Database connection: OK");
      console.log("Database schema: OK");
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
})();