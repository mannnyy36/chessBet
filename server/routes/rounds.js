import express from 'express'

const route = express.Router()

const lichessAPI = 'https://lichess.org/api/broadcast/'

// GET /round/:tourSlug/:roundSlug/:roundId/games
// Lichess requires all three pieces — tournament slug, round slug, round id —
// to return a round's data. The response is JSON with { round, tour, study, games[] }.
route.get('/:tourSlug/:roundSlug/:roundId/games', async (req, res) => {
    try {
        const { tourSlug, roundSlug, roundId } = req.params

        const url = `${lichessAPI}${tourSlug}/${roundSlug}/${roundId}`
        const response = await fetch(url)

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Lichess responded with ${response.status}`
            })
        }

        const data = await response.json()

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
