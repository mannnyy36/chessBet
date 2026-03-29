import express from 'express';
import db from './db.js';

const app = express()
const PORT = 3000;


app.get('/', async (req, res) => {
    try {
        const result = await db('SELECT * FROM user');
        res.json(result.rows);
    } catch (err){
        console.log(err);
        res.status(500).send('Inter Server Error');
    }
});

app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT + '/')
});

