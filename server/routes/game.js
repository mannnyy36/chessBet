import express from 'express'

const route = express.Router()

const lichessAPI = 'https://lichess.org/api/broadcast/'

route.get('/:id', async (req, res) => {
    try{
        const gameID = req.params.id

        const response = await fetch(lichessAPI + gameID)

        const gameInfo = await response.json()
        
        res.status(200).json( {game : gameInfo})
    } catch (err) {
        res.status(400).json({error: err})
    }
})

export default route