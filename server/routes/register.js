import express from 'express'
import db from '../db.js'
import bcrypt from 'bcrypt'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email and password are required' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await db(
            `INSERT INTO users(username, email, password)
             VALUES($1, $2, $3)
             RETURNING id, username, email, balance, created_at`,
            [username, email, hashedPassword]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        console.log(err)
        // Postgres unique-violation
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username or email already taken' })
        }
        res.status(500).json({ error: err.message })
    }
});

export default router
