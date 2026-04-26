import express from 'express';
import register from './routes/register.js';
import login from './routes/login.js';
import profile from './routes/profile.js';
import tournaments from './routes/tournaments.js'
import game from './routes/game.js'
import rounds from './routes/rounds.js'
import bets, { settlePendingBets } from './routes/bets.js'
import cors from 'cors';

const app = express()
const PORT = Number(process.env.PORT) || 8000;

// CLIENT_ORIGIN can be a single URL or comma-separated list.
// Falls back to '*' in dev so local React keeps working without env vars.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
}))

app.use(express.json())

app.use('/register', register)
app.use('/login', login)
app.use('/profile', profile)
app.use('/tournaments', tournaments)
app.use('/game', game)
app.use('/round', rounds)
app.use('/bets', bets)

// Health check — Render hits this to confirm the service is up.
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'chessbet-api' })
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT)
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
