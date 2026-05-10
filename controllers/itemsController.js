import {loadItems, saveItems} from '../data/store.js'

// I use return both status and error because
// Route will have a try/catch to handle errors
// In case of error it will return the error message and error status code

export async function getAllItems(limit = 20, offset = 0) {
  try {
    const items = await loadItems()
    const total = items.length
    const paginatedItems = items.slice(offset, offset + limit)

    return {
      items: paginatedItems,
      total,
      limit,
      offset
    }
  } 
  catch (error) {
    throw new Error(`Failed to get items: ${error.message}`)
  }
}

export async function getItemById(id) {
  try {
    const items = await loadItems()
    const item = items.find(item => item.id === id)

    if (!item) {
      throw new Error(`Item with id ${id} not found`)
    }

    return item
  } 
  catch (error) {
    throw new Error(`Failed to get item: ${error.message}`)
  }
}

export async function addItem(item) {
  try {
    if (!item.id || !item.title || !item.category || !item.status) {
      throw new Error('Missing required fields: id, title, category, status')
    }

    const items = await loadItems()
    items.push(item)
    await saveItems(items)

    return { success: true, item }
  } 
  catch (error) {
    throw new Error(`Failed to add item: ${error.message}`)
  }
}

export async function updateItem(updatedItem) {
  try {
    if (!updatedItem.id) {
      throw new Error('Item id is required')
    }

    const items = await loadItems()
    const index = items.findIndex(item => item.id === updatedItem.id)
    
    if (index === -1) {
      throw new Error(`Item with id ${updatedItem.id} not found`)
    }

    items[index] = updatedItem
    await saveItems(items)

    return { success: true, item: updatedItem }
  } 
  
  catch (error) {
    throw new Error(`Failed to update item: ${error.message}`)
  }
}

export async function deleteItem(id) {
  try {
    const items = await loadItems()
    const index = items.findIndex(item => item.id === id)

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`)
    }

    items.splice(index, 1) //mutates the items array, returns the deleted
    await saveItems(items)

    return { success: true, message: 'Item deleted' }
  } 
  catch (error) {
    throw new Error(`Failed to delete item: ${error.message}`)
  }
}

export async function hideItem(id) {
  try {
    const items = await loadItems()
    const index = items.findIndex(item => item.id === id)

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`)
    }

    items[index].isHidden = true
    await saveItems(items)

    return { success: true, message: 'Item hidden' }
  } 
  catch (error) {
    throw new Error(`Failed to hide item: ${error.message}`)
  }
}

export async function unhideItem(id) {
  try {
    const items = await loadItems()
    const index = items.findIndex(item => item.id === id)

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`)
    }

    items[index].isHidden = false
    await saveItems(items)

    return { success: true, message: 'Item unhidden' }
  } 
  catch (error) {
    throw new Error(`Failed to unhide item: ${error.message}`)
  }
}