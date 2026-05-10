import store from '../data/store.js'

export async function getAllItems() {
  return await store.loadItems()
}

export async function getItemById(id) {
  const items = await store.loadItems()
  return items.find(item => item.id === id)
}

export async function addItem(item) {
  const items = await store.loadItems()
  items.push(item)
  await store.saveItems(items)
}

export async function updateItem(updatedItem) {
  const items = await store.loadItems()
  const index = items.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    items[index] = updatedItem
    await store.saveItems(items)
  }
}

export async function deleteItem(id) {
  const items = await store.loadItems()
  const filteredItems = items.filter(item => item.id !== id)
  await store.saveItems(filteredItems)
}

export async function hideItem(id) {
  const items = await store.loadItems()
  const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
    items[index].isHidden = true
    await store.saveItems(items)
    }
}

export async function unhideItem(id) {
  const items = await store.loadItems()
  const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
        items[index].isHidden = false
        await store.saveItems(items)
    }
}