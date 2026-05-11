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

        const token = jwt.sign(
            { role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1m' }
        )

        return res.status(201).json({ token })
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate token' })
    }
}