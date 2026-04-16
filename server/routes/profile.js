import express from 'express';
import authMiddleware from '../middleware/auth.js';
import db from '../db.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
    try {
        const currentID = req.user.id

        const result = await db('SELECT * FROM users where id = $1', [currentID])

        res.status(200).json({userInfo : result.rows[0]})
    } catch(err) {
        res.status(400).json({error : err})
    }
})

export default router;