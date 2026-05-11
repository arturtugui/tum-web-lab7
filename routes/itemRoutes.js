import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { getAllItems } from '../controllers/itemsController.js'

const router = express.Router()

router.get('/', authenticate, getAllItems)

export default router