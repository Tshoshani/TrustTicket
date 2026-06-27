/**
 * seed.js - One-command database bootstrap for TrustTicket.
 *
 * Runs migrations/schema.sql (DROP + CREATE database + all tables) followed by
 * migrations/seed.sql (mock data). Works against any MySQL host configured via
 * environment variables - local MySQL or AWS RDS.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 *
 * Reads connection settings from the environment (see .env.example):
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
 *
 * Note: this connects WITHOUT selecting a database, because schema.sql creates
 * the `trustticket` database itself (DROP DATABASE IF EXISTS / CREATE DATABASE).
 * The DB_USER must therefore have privileges to create databases (the AWS RDS
 * master user does).
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function runSqlFile(connection, fileName) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`-> Running ${fileName} ...`);
  // multipleStatements is enabled on the connection, so the whole file runs at once.
  await connection.query(sql);
  console.log(`   ${fileName} applied.`);
}

async function seed() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true, // required to run a full .sql file in one query
  };

  console.log(`Connecting to MySQL at ${config.host}:${config.port} as ${config.user} ...`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
  } catch (err) {
    console.error("Could not connect to the database:", err.message);
    process.exit(1);
  }

  try {
    await runSqlFile(connection, "schema.sql");
    await runSqlFile(connection, "seed.sql");
    console.log(
      '\nDone. Database "trustticket" recreated with all tables and mock data.'
    );
    console.log("Test accounts (password: password123):");
    console.log("  tomer@trustticket.com (admin)");
    console.log("  shay@trustticket.com  (user)");
    console.log("  amit@trustticket.com  (manager)");
  } catch (err) {
    console.error("\nSeeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

seed();
