# CA2 – Server Side Programming

This project was developed as part of the CA2 for Server Side Programming.

It demonstrates the use of Node.js, Express, and MySQL to handle server-side
logic, form processing, CSV data validation, and secure database interaction.

---

## Project Features

- Express server handling HTTP requests
- HTML form for user data input
- Server-side validation of user input
- MySQL database integration using a connection pool
- CSV file import with row-by-row validation
- Only valid CSV records are inserted into the database
- Basic security measures using middleware and headers

---

## How to Run the Project

1. Install dependencies:
2. Create a '.env' file based on '.env.example' and set database credentials
3. Start the server
4. Open a browser and navigate to http://localhost:3000

---

## CSV Import

To process and import CSV data:

The script validates each record, reports invalid rows with row numbers,
and inserts only valid records into the database.

---

## Notes

This project follows the requirements specified in the CA brief and focuses
on correctness, validation, and secure handling of data.

