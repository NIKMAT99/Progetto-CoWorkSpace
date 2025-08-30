const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Nikmat99@localhost:5432/CoWorkSpace",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Test connessione
pool.connect()
    .then(client => {
        console.log("✅ Connessione a PostgreSQL su Render riuscita!");
        client.release();
    })
    .catch(err => console.error("❌ Errore connessione al DB:", err.stack));

module.exports = pool;
