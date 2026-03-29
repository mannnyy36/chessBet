import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
    user: 'emmanuelosemwengie',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'chessbet'
});

const query = (text, params) => pool.query(text, params)

export default query
