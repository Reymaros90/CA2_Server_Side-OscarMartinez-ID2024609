# Project Structure

This document outlines the structure of the CA2 Server Side Programming project.

## Root Directory

- `package.json` - Project configuration and dependencies
- `package-lock.json` - Dependency lock file
- `.env.example` - Environment variable template
- `personal_information.csv` - CSV data source
- `README.md` - Project overview and usage instructions

## src Directory

- `server.js` - Main Express server and routing logic
- `database.js` - Database connection and schema handling
- `index.js` - CSV import and validation script
- `form.html` - HTML form for user input
- `test-db.js` - Database connection testing script

## Notes

The project follows a modular structure to separate concerns between
server logic, database handling, and data processing.
