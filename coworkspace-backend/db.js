const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // obbligatorio su Render
});

// Test connessione
pool.connect()
    .then(client => {
        console.log("✅ Connessione a PostgreSQL su Render riuscita!");
        client.release();
    })
    .catch(err => console.error("❌ Errore connessione al DB:", err.stack));

module.exports = pool;
