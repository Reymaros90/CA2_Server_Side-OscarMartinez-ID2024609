// index.js

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { pool, ensureSchema } = require("./database");

// Validation helpers (aligned with CA brief)
function isAlphaNumMax20(value) {
  if (typeof value !== "string") return false;
  return /^[a-zA-Z0-9]{1,20}$/.test(value.trim());
}

function isValidEmail(value) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value) {
  const s = String(value ?? "").trim();
  return /^[0-9]{10}$/.test(s);
}

function isValidEircode(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  // CA rule: starts with a number, alphanumeric, 6 chars
  return /^[0-9][a-zA-Z0-9]{5}$/.test(s);
}

function validateRow(row) {
  // CSV headers confirmed:
  // first_name,last_name,email,phone,eir_code
  const first_name = String(row.first_name ?? "").trim();
  const second_name = String(row.last_name ?? "").trim(); // map last_name -> second_name
  const email = String(row.email ?? "").trim();
  const phone = String(row.phone ?? "").trim();
  const eir_code = String(row.eir_code ?? "").trim();

  const errors = [];
  if (!isAlphaNumMax20(first_name)) errors.push("Invalid first_name");
  if (!isAlphaNumMax20(second_name)) errors.push("Invalid second_name");
  if (!isValidEmail(email)) errors.push("Invalid email");
  if (!isValidPhone(phone)) errors.push("Invalid phone");
  if (!isValidEircode(eir_code)) errors.push("Invalid eir_code");

  return {
    ok: errors.length === 0,
    errors,
    clean: { first_name, second_name, email, phone, eir_code }
  };
}

async function insertBatch(validRows) {
  if (validRows.length === 0) return 0;

  const values = validRows.map(r => [
    r.first_name,
    r.second_name,
    r.email,
    r.phone,
    r.eir_code
  ]);

  const sql = `
    INSERT INTO mysql_table (first_name, second_name, email, phone, eir_code)
    VALUES ?
  `;

  const [result] = await pool.query(sql, [values]);
  return result.affectedRows || 0;
}

async function main() {
  // Ensure table exists before inserting (schema check)
  await ensureSchema();

  const csvPath = path.join(__dirname, "..", "personal_information.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found at:", csvPath);
    process.exit(1);
  }

  let rowNumber = 1; // data row number (excluding header)
  let validCount = 0;
  let invalidCount = 0;

  const validRows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        const result = validateRow(row);

        if (!result.ok) {
          invalidCount++;
          console.error(`Row ${rowNumber} failed: ${result.errors.join(", ")}`);
        } else {
          validCount++;
          validRows.push(result.clean);
        }

        rowNumber++;
      })
      .on("end", resolve)
      .on("error", reject);
  });

  const inserted = await insertBatch(validRows);

  console.log("CSV import complete.");
  console.log("Valid rows:", validCount);
  console.log("Invalid rows:", invalidCount);
  console.log("Inserted rows:", inserted);

  await pool.end();
}

main().catch((err) => {
  console.error("Import failed:", err.message);
});
