import express from 'express'
import { generateToken } from '../controllers/authController.js'

const router = express.Router()

// these paths are realtive to /auth
// so they will be for example /auth/token
router.post('/token', generateToken)

export default router