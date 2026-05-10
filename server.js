import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//middleware - runs between request arriving and route handlers
app.use(express.json()) // parse JSON request bodies

// Routes
app.use(authRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'PIT API Server running' })
})

app.get('/items', authenticate, (req, res) => {
  res.json({ items: [] }) // send JSON response
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))