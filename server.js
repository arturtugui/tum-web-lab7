import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json()) // parse JSON request bodies

app.get('/', (req, res) => {
  res.json({ message: 'PIT API Server running' })
})

app.get('/items', (req, res) => {
  res.json({ items: [] }) // send JSON response
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))