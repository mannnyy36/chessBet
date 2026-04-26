import express from 'express'
import authMiddleware from '../middleware/auth.js'
import db from '../db.js'

const route = express.Router()

const calculateOdds = (ratingA, ratingB) => {
    const drawRate = 0.35

    const winProb = (1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))) * (1 - drawRate)
    const lossProb = (1 / (1 + Math.pow(10, (ratingA - ratingB) / 400))) * (1 - drawRate)
    const drawProb = drawRate

    return {
        win: parseFloat((1 / winProb).toFixed(2)),
        draw: parseFloat((1 / drawProb).toFixed(2)),
        loss: parseFloat((1 / lossProb).toFixed(2))
    }
}

route.post('/', authMiddleware, async (req, res) => {
    try {
        const { game_id, round_id, player, opponent, player_rating, opponent_rating, selection, amount } = req.body
        const user_id = req.user.id

        if (!['win', 'draw', 'loss'].includes(selection)) {
            return res.status(400).json({ error: 'Invalid selection — must be win, draw or loss' })
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' })
        }

        const userResult = await db.query('SELECT balance FROM users WHERE id = $1', [user_id])
        const balance = userResult.rows[0].balance

        if (balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' })
        }

        const odds = calculateOdds(player_rating, opponent_rating)
        const selectedOdds = odds[selection]

        await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, user_id])

        const result = await db.query(
            `INSERT INTO bets (game_id, round_id, user_id, player, selection, amount, odds, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
            [game_id, round_id, user_id, player, selection, amount, selectedOdds]
        )

        res.status(201).json({ bet: result.rows[0] })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

route.get('/:tournamentId', authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.id
        const { tournamentId } = req.params

        const result = await db.query(
            `SELECT * FROM bets 
             WHERE user_id = $1 AND round_id = ANY(
                SELECT id FROM bets WHERE game_id LIKE $2
             )
             ORDER BY created_at DESC`,
            [user_id, `%${tournamentId}%`]
        )

        res.status(200).json({ bets: result.rows })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

export default route