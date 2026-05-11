import { loadItems, saveItems } from '../data/store.js'

// Controllers receive (req, res) and send responses
// They catch errors from store and send appropriate status codes

export async function getAllItems(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0
    const items = await loadItems()
    const total = items.length
    const paginatedItems = items.slice(offset, offset + limit)

    res.status(200).json({
      items: paginatedItems,
      total,
      limit,
      offset
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve items' })
  }
}

export async function getItemById(req, res) {
  try {
    const { id } = req.params
    const items = await loadItems()
    const item = items.find(item => item.id == id)

    if (!item) {
      return res.status(404).json({ error: `Item with id ${id} not found` })
    }

    res.status(200).json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve item' })
  }
}

export async function addItem(req, res) {
  try {
    const item = req.body

    if (!item.id || !item.title || !item.category || !item.status) {
      return res.status(400).json({ error: 'Missing required fields: id, title, category, status' })
    }

    const items = await loadItems()
    items.push(item)
    await saveItems(items)

    res.status(201).json({ item })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item' })
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params
    const updatedItem = { ...req.body, id }

    if (!id) {
      return res.status(400).json({ error: 'Item id is required' })
    }

    const items = await loadItems()
    const index = items.findIndex(item => item.id == id)

    if (index === -1) {
      return res.status(404).json({ error: `Item with id ${id} not found` })
    }

    items[index] = updatedItem
    await saveItems(items)

    res.status(200).json({ item: updatedItem })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' })
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params
    const items = await loadItems()
    const index = items.findIndex(item => item.id == id)

    if (index === -1) {
      return res.status(404).json({ error: `Item with id ${id} not found` })
    }

    items.splice(index, 1)
    await saveItems(items)

    res.status(204).send() // 204 No Content — resource deleted, nothing to return
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' })
  }
}

export async function hideItem(req, res) {
  try {
    const { id } = req.params
    const items = await loadItems()
    const index = items.findIndex(item => item.id == id)

    if (index === -1) {
      return res.status(404).json({ error: `Item with id ${id} not found` })
    }

    items[index].isHidden = true
    await saveItems(items)

    res.status(200).json({ item: items[index] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to hide item' })
  }
}

export async function unhideItem(req, res) {
  try {
    const { id } = req.params
    const items = await loadItems()
    const index = items.findIndex(item => item.id == id)

    if (index === -1) {
      return res.status(404).json({ error: `Item with id ${id} not found` })
    }

    items[index].isHidden = false
    await saveItems(items)

    res.status(200).json({ item: items[index] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to unhide item' })
  }
}