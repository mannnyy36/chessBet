import express from 'express'
import db from '../db.js'
import bcrypt from 'bcrypt'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await db(
            'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *',
        [username, email, hashedPassword])
        res.status(201).json(result.rows[0])
    } catch(err) {
        console.log(err)
        res.status(500).json({ error: err.message})
    }
});

export default router