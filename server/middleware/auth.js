import jwt from 'jsonwebtoken';

const privateKey = 'chessBet'

const authMiddleware = (req, res, next) => {
    try{
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token){
            res.status(401).json({error : 'No token provided'})
        }

        const decoded = jwt.verify(token, privateKey)
        
        req.user = decoded

        next()
    } catch(err) {
        res.status(401).json({error : err.message})
    }
}

export default authMiddleware;