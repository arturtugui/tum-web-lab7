import jwt from 'jsonwebtoken'

//.env is loaded in server.js, so we can access process.env.JWT_SECRET here

// 401 - Unauthorized
// 403 - Forbidden

export function authenticate(req, res, next) {
    const header = req.headers['authorization']
    if (!header) {
        return res.status(401).json({ error: 'Authorization header missing' })
    }

    const token = header.split(' ')[1] // Expecting "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: 'Token missing' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // check if token is valid and not expired
        req.user = decoded // attach user info to request object (as another field)
        next() // pass control to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

export function requireOwner(req, res, next) {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ error: 'Forbidden: owner role required' })
  }
  next()
}