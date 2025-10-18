require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({
    user: String(process.env.DB_USER),
    host: String(process.env.DB_HOST),
    database: String(process.env.DB_DATABASE),
    password: String(process.env.DB_PASSWORD),
    port: Number(process.env.DB_PORT) || 5432,
});

module.exports = pool;