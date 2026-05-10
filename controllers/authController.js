import jwt from 'jsonwebtoken'

const roles = ['owner', 'viewer']

export function generateToken(role) {
    if (!roles.includes(role)) {
        throw new Error(`Invalid role: ${role}`)
    }

    const token = jwt.sign(
        { role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1m' }
    )

    return token
}