import express from 'express';
import db from './db.js';
import register from './routes/register.js';
import login from './routes/login.js';
import profile from './routes/profile.js';
import tournaments from './routes/tournaments.js'
import game from './routes/game.js'
import rounds from './routes/rounds.js'
import bets, { settlePendingBets } from './routes/bets.js'
import cors from 'cors';

const app = express()
const PORT = 8000;

app.use(cors())

app.use(express.json())

app.use('/register', register)
app.use('/login', login)
app.use('/profile', profile)
app.use('/tournaments', tournaments)
app.use('/game', game)
app.use('/round', rounds)
app.use('/bets', bets)

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

// Settle finished games every 60 seconds.
const SETTLEMENT_INTERVAL_MS = 60_000
setInterval(() => {
    settlePendingBets()
        .then(({ settled, errors }) => {
            if (settled > 0) console.log(`[settlement] resolved ${settled} bet(s)`)
            if (errors.length > 0) console.warn('[settlement] errors:', errors)
        })
        .catch(err => console.error('[settlement] fatal:', err))
}, SETTLEMENT_INTERVAL_MS)

