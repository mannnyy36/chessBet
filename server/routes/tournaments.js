import express from 'express';

const router = express.Router()

const lichessAPI = 'https://lichess.org/api/broadcast/top'

router.get('/', async (req, res) => {
    try {
        const response = await fetch(lichessAPI)

        const data = await response.json()

        if(!data){  
            return res.status(400).json({error: 'No active tournaments found'})
        }

        res.status(200).json(data.active)
    } catch(err) {
        res.status(400).json({error : err})
    }
})

export default router;