import {loadItems, saveItems} from '../data/store.js'

export async function getAllItems() {
  return await loadItems()
}

export async function getItemById(id) {
  const items = await loadItems()
  return items.find(item => item.id === id) // returns 1st mathching item or undefined if not found
}

export async function addItem(item) {
  const items = await loadItems()
  items.push(item)
  await saveItems(items)
}

export async function updateItem(updatedItem) {
  const items = await loadItems()
  const index = items.findIndex(item => item.id === updatedItem.id) // returns index of 1st matching item or -1 if not found
  if (index !== -1) {
    items[index] = updatedItem
    await saveItems(items)
  }
}

export async function deleteItem(id) {
  const items = await loadItems()
  const filteredItems = items.filter(item => item.id !== id) // returns new array with all matches
  await saveItems(filteredItems)
}

export async function hideItem(id) {
  const items = await loadItems()
  const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
    items[index].isHidden = true
    await saveItems(items)
    }
}

export async function unhideItem(id) {
  const items = await loadItems()
  const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
        items[index].isHidden = false
        await saveItems(items)
    }
}