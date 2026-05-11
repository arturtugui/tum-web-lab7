import express from 'express'
import { generateToken } from '../controllers/authController.js'

const router = express.Router()

/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: Generate JWT token
 *     description: Creates a new JWT token for the specified role (owner or viewer). Token expires in 1 minute.
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: ['owner', 'viewer']
 *                 description: User role for the token
 *             required: ['role']
 *           example:
 *             role: 'owner'
 *     responses:
 *       201:
 *         description: Token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token (use in Authorization header)
 *             example:
 *               token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoib3duZXIiLCJpYXQiOjE3Nzg0OTMxNDgsImV4cCI6MTc3ODQ5Mzc0OH0.2emfPJjDhe35YGApLhATAX51qw6KkGzQcSYZsn3MSho'
 *       400:
 *         description: Bad request - role is required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Invalid role: admin'
 *       500:
 *         description: Server error - token generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// these paths are realtive to /auth
// so they will be for example /auth/token
router.post('/token', generateToken)

export default router