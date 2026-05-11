import jwt from 'jsonwebtoken'

const roles = ['owner', 'viewer']

export function generateToken(req, res) {
    try {
        const { role } = req.body // the request body should contain the role (owner or viewer)

        if (!role) {
            return res.status(400).json({ error: 'Role is required' })
        }

        if (!roles.includes(role)) {
            return res.status(400).json({ error: `Invalid role: ${role}` })
        }

        if (!process.env.JWT_SECRET) {
            // error throw for debugging, remove in production
            console.error('ERROR: JWT_SECRET is not defined in .env')
            return res.status(500).json({ error: 'Server configuration error: JWT_SECRET missing' })
        }

        const token = jwt.sign(
            { role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1m' }
        )

        return res.status(201).json({ token })
    } catch (error) {
        // error throw for debugging, remove in production
        console.error('Token generation error:', error.message)
        res.status(500).json({ error: `Failed to generate token: ${error.message}` })
    }
}