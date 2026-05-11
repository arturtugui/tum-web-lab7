import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import { authenticate } from './middleware/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//middleware, that allows us to parse JSON request bodies
app.use(express.json())


// routes
app.use('/auth', authRoutes)

// global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal Server Error' })
})

//****
//this code does not follow the architecture yet
app.get('/', (req, res) => {
  res.json({ message: 'PIT API Server running' })
})

app.get('/items', authenticate, (req, res) => {
  res.json({ items: [] }) // send JSON response
})
//****

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))