import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { getAllItems as getItemsUtil } from '../controllers/itemsController.js'

const router = express.Router()

// Wrapper to convert utility function to route handler
async function getAllItems(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0
    const result = await getItemsUtil(limit, offset)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve items' })
  }
}

router.get('/', authenticate, getAllItems)

export default router