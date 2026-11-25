// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST ,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('✅ Connexion réussie à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue de la base de données:', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};