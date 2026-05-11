// routes/items.js
import express from "express";
import { authenticate, requireOwner } from "../middleware/authMiddleware.js";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  hideItem,
  unhideItem,
} from "../controllers/itemsController.js";

const router = express.Router();

// you create a next() chain
// GET /items — all roles, supports ?limit=20&offset=0
router.get('/items', authenticate, getAllItems)

// GET /items/:id — all roles
router.get('/items/:id', authenticate, getItemById)

// POST /items — owner only
router.post('/items', authenticate, requireOwner, addItem)

// PUT /items/:id — owner only (full replacement)
router.put('/items/:id', authenticate, requireOwner, updateItem)

// PATCH /items/:id — owner only (partial update)
router.patch('/items/:id', authenticate, requireOwner, updateItem)

// DELETE /items/:id — owner only
router.delete('/items/:id', authenticate, requireOwner, deleteItem)

// PATCH /items/:id/hide — owner only
router.patch('/items/:id/hide', authenticate, requireOwner, hideItem)

// PATCH /items/:id/unhide — owner only
router.patch('/items/:id/unhide', authenticate, requireOwner, unhideItem)


export default router;