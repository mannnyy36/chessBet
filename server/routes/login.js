import express from 'express'
import db from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, password} = req.body
        const result = await db('SELECT * FROM users WHERE username = $1', [username])
        
        if(!result.rows[0]) {
            return res.status(404).json({error: 'User not found'})
        }
        
        const match = await bcrypt.compare(password, result.rows[0].password)

        if(!match) {
            return res.status(401).json({error: 'Invalid password'})
        }
        
        const privateKey = 'chessBet'
        const token = jwt.sign({id: result.rows[0].id}, privateKey, {expiresIn: '1h'})

        res.status(200).json({message: 'Login Succesful', token: token})
    } catch(err) {
        console.log(err)
        res.status(500).json({error: err})
    }
});

export default router