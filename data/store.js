import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'items.json')

export async function loadItems() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load items:', error.message)
    return [] // return empty array if file doesn't exist
  }
}

export async function saveItems(items) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save items:', error.message)
  }
}