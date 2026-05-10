import express from 'express'
import { generateToken } from '../controllers/authController.js'

const router = express.Router()

router.post('/login', (req, res) => {
    try{
        const { role } = req.body // the request body should contain the role (owner or viewer)

        if (!role) {
            return res.status(400).json({ error: 'Role is required' })
        }

        const token = generateToken(role)
        res.json({ token })

    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

})

export default router