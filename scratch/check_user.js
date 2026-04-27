const { neon } = require("@neondatabase/serverless");
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUser() {
  const users = await sql`SELECT id, name, email FROM users WHERE id = 5`;
  console.log("👤 User 5 details:", users[0]);
}

checkUser();
