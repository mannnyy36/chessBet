import express from 'express'
import authMiddleware from '../middleware/auth.js'
import db, { pool } from '../db.js'
import { fetchRound, outcomeFromStatus } from '../lichess.js'

const route = express.Router()

const calculateOdds = (ratingA, ratingB) => {
    const drawRate = 0.35
    const winProb = (1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))) * (1 - drawRate)
    const lossProb = (1 / (1 + Math.pow(10, (ratingA - ratingB) / 400))) * (1 - drawRate)
    return {
        win: parseFloat((1 / winProb).toFixed(2)),
        draw: parseFloat((1 / drawRate).toFixed(2)),
        loss: parseFloat((1 / lossProb).toFixed(2)),
    }
}

// POST /bets — place a bet
//
// We deliberately do NOT trust client-supplied ratings or player names.
// The server fetches the round from Lichess, finds the game by id, and
// uses the actual ratings/players from that response. Balance debit and
// bet insert run inside one transaction with FOR UPDATE on the user row
// so concurrent requests can't double-spend.
route.post('/', authMiddleware, async (req, res) => {
    const { game_id, round_id, tour_slug, round_slug, selection, amount } = req.body
    const user_id = req.user.id

    if (!['win', 'draw', 'loss'].includes(selection)) {
        return res.status(400).json({ error: 'Invalid selection — must be win, draw or loss' })
    }
    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' })
    }
    if (!game_id || !round_id || !tour_slug || !round_slug) {
        return res.status(400).json({ error: 'Missing game/round identifiers' })
    }

    // Verify against Lichess
    let game
    try {
        const data = await fetchRound(tour_slug, round_slug, round_id)
        game = (data.games || []).find(g => g.id === game_id)
    } catch (err) {
        return res.status(502).json({ error: `Could not verify game with Lichess: ${err.message}` })
    }

    if (!game) {
        return res.status(404).json({ error: 'Game not found in this round' })
    }
    if (outcomeFromStatus(game.status) !== null) {
        return res.status(400).json({ error: 'Game has already finished' })
    }

    const players = game.players || []
    const white = players[0]
    const black = players[1]
    if (!white || !black) {
        return res.status(400).json({ error: 'Game pairing not available' })
    }

    const odds = calculateOdds(white.rating || 1500, black.rating || 1500)
    const selectedOdds = odds[selection]

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const userResult = await client.query(
            'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
            [user_id]
        )
        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({ error: 'User not found' })
        }

        const balance = Number(userResult.rows[0].balance)
        if (balance < numAmount) {
            await client.query('ROLLBACK')
            return res.status(400).json({ error: 'Insufficient balance' })
        }

        await client.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2',
            [numAmount, user_id]
        )

        const insert = await client.query(
            `INSERT INTO bets (
                user_id, game_id, round_id, tour_slug, round_slug,
                player, opponent, selection, amount, odds, status
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
             RETURNING *`,
            [user_id, game_id, round_id, tour_slug, round_slug,
             white.name, black.name, selection, numAmount, selectedOdds]
        )

        await client.query('COMMIT')
        res.status(201).json({ bet: insert.rows[0] })
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {})
        res.status(500).json({ error: err.message })
    } finally {
        client.release()
    }
})

// GET /bets — current user's bet history (newest first)
route.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await db(
            `SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        )
        res.status(200).json({ bets: result.rows })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// POST /bets/settle — manual trigger; also runs on a 60s interval from server.js
route.post('/settle', authMiddleware, async (req, res) => {
    try {
        const result = await settlePendingBets()
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Walks all rounds with pending bets, fetches each one from Lichess once,
// and resolves any bets whose game has finished. Pays out winners.
//
// Race-safety: the UPDATE includes `WHERE status = 'pending'` and uses
// RETURNING to confirm we won the transition. If a parallel settler beat
// us to it, rowCount is 0 and we skip the credit.
export async function settlePendingBets() {
    const rounds = await db(
        `SELECT DISTINCT round_id, tour_slug, round_slug
         FROM bets
         WHERE status = 'pending'`
    )

    let settled = 0
    const errors = []

    for (const round of rounds.rows) {
        let games
        try {
            const data = await fetchRound(round.tour_slug, round.round_slug, round.round_id)
            games = data.games || []
        } catch (err) {
            errors.push({ round_id: round.round_id, error: err.message })
            continue
        }

        const gameById = new Map(games.map(g => [g.id, g]))

        const pending = await db(
            `SELECT id, user_id, game_id, selection, amount, odds
             FROM bets
             WHERE round_id = $1 AND status = 'pending'`,
            [round.round_id]
        )

        for (const bet of pending.rows) {
            const game = gameById.get(bet.game_id)
            if (!game) continue

            const outcome = outcomeFromStatus(game.status)
            if (outcome === null) continue // still ongoing

            const won = outcome === bet.selection
            const payout = won ? Number(bet.amount) * Number(bet.odds) : 0

            const client = await pool.connect()
            try {
                await client.query('BEGIN')

                const update = await client.query(
                    `UPDATE bets
                     SET status = $1, payout = $2, settled_at = NOW()
                     WHERE id = $3 AND status = 'pending'
                     RETURNING user_id`,
                    [won ? 'won' : 'lost', payout, bet.id]
                )

                if (update.rowCount === 1 && won) {
                    await client.query(
                        'UPDATE users SET balance = balance + $1 WHERE id = $2',
                        [payout, bet.user_id]
                    )
                }

                await client.query('COMMIT')
                if (update.rowCount === 1) settled++
            } catch (err) {
                await client.query('ROLLBACK').catch(() => {})
                errors.push({ bet_id: bet.id, error: err.message })
            } finally {
                client.release()
            }
        }
    }

    return { settled, errors }
}

export default route
