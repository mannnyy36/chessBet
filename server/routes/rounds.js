import express from 'express'
import { fetchRound } from '../lichess.js'

const route = express.Router()

// GET /round/:tourSlug/:roundSlug/:roundId/games
// Lichess requires all three pieces — tournament slug, round slug, round id —
// to return a round's data. Response includes { round, tour, study, games[] }.
route.get('/:tourSlug/:roundSlug/:roundId/games', async (req, res) => {
    try {
        const { tourSlug, roundSlug, roundId } = req.params
        const data = await fetchRound(tourSlug, roundSlug, roundId)
        res.status(200).json({
            round: data.round,
            tour: data.tour,
            games: data.games || []
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default route
