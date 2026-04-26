import pg from 'pg'

const { Pool } = pg

// In production (Render), DATABASE_URL is provided and SSL is required.
// Locally, fall back to individual fields so dev keeps working without changes.
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new Pool({
        user: process.env.PG_USER || 'emmanuelosemwengie',
        password: process.env.PG_PASSWORD || '',
        host: process.env.PG_HOST || 'localhost',
        port: Number(process.env.PG_PORT) || 5432,
        database: process.env.PG_DATABASE || 'chessbet',
    });

const query = (text, params) => pool.query(text, params)

export { pool }
export default query
