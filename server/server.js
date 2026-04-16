import express from 'express';
import db from './db.js';
import register from './routes/register.js';
import login from './routes/login.js';
import profile from './routes/profile.js';
import cors from 'cors';

const app = express()
const PORT = 8000;

app.use(cors())

app.use(express.json())

app.use('/register', register)
app.use('/login', login)
app.use('/profile', profile)

app.get('/', async (req, res) => {
    try {
        const result = await db('SELECT * FROM users');
        res.json(result.rows);
    } catch (err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT + '/')
});

