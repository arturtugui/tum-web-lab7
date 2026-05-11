// routes/items.js
import express from "express";
import { authenticate, requireOwner } from "../middleware/authMiddleware.js";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  partialUpdateItem,
  deleteItem,
  hideItem,
  unhideItem,
} from "../controllers/itemsController.js";

const router = express.Router();

// Routes are mounted at /items in server.js, so paths are relative to that
// GET /items — all roles, supports ?limit=20&offset=0
router.get('/', authenticate, getAllItems)

// GET /items/:id — all roles
router.get('/:id', authenticate, getItemById)

// POST /items — owner only
router.post('/', authenticate, requireOwner, addItem)

// PUT /items/:id — owner only (full replacement)
router.put('/:id', authenticate, requireOwner, updateItem)

// PATCH /items/:id — owner only (partial update, merges with existing fields)
router.patch('/:id', authenticate, requireOwner, partialUpdateItem)

// DELETE /items/:id — owner only
router.delete('/:id', authenticate, requireOwner, deleteItem)

// PATCH /items/:id/hide — owner only
router.patch('/:id/hide', authenticate, requireOwner, hideItem)

// PATCH /items/:id/unhide — owner only
router.patch('/:id/unhide', authenticate, requireOwner, unhideItem)

export default router;