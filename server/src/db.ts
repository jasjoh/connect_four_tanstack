import { Client } from "pg";

console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL);

const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///connect_four_test"
    : process.env.DATABASE_URL || "postgresql:///connect_four";

let db = new Client({
  connectionString: DB_URI
});

// console.log("DB_URI:", DB_URI);

db.connect();

export default db;