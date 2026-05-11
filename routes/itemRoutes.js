import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticate, getAllItems)