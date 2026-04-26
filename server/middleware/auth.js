import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chessBet-dev-secret-change-me'

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ error: err.message })
    }
}

export { JWT_SECRET }
export default authMiddleware
