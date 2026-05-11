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

// Routes — traffic map only, no logic, no try/catch
router.get("/items", authenticate, getAllItems);
router.get("/items/:id", authenticate, getItemById);
router.post("/items", authenticate, requireOwner, addItem);
router.put("/items/:id", authenticate, requireOwner, updateItem); // update entire item
router.patch("/items/:id", authenticate, requireOwner, updateItem); // partial update
router.delete("/items/:id", authenticate, requireOwner, deleteItem);
router.patch("/items/:id/hide", authenticate, requireOwner, hideItem);
router.patch("/items/:id/unhide", authenticate, requireOwner, unhideItem);

export default router;