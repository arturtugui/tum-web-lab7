import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//middleware - runs between request arriving and route handlers
app.use(express.json()) // parse JSON request bodies

app.get('/', (req, res) => {
  res.json({ message: 'PIT API Server running' })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))