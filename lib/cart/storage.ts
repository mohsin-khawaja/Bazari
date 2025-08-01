"use client"

export interface CartItem {
  id: string
  itemId: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
  sellerId: string
  sellerName: string
  maxQuantity?: number
}

const CART_STORAGE_KEY = "bazari_cart"

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error("Error saving cart:", error)
  }
}

export function addToCart(item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }): void {
  const cartItems = getCartItems()
  const existingIndex = cartItems.findIndex((cartItem) => cartItem.itemId === item.itemId)

  if (existingIndex >= 0) {
    // Update quantity
    const newQuantity = cartItems[existingIndex].quantity + (item.quantity || 1)
    const maxQuantity = item.maxQuantity || 999

    cartItems[existingIndex].quantity = Math.min(newQuantity, maxQuantity)
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random()}`,
      quantity: item.quantity || 1,
    }
    cartItems.push(newItem)
  }

  saveCartItems(cartItems)
}

export function removeFromCart(cartItemId: string): void {
  const cartItems = getCartItems()
  const filtered = cartItems.filter((item) => item.id !== cartItemId)
  saveCartItems(filtered)
}

export function updateCartItemQuantity(cartItemId: string, quantity: number): void {
  const cartItems = getCartItems()
  const itemIndex = cartItems.findIndex((item) => item.id === cartItemId)

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
    } else {
      const maxQuantity = cartItems[itemIndex].maxQuantity || 999
      cartItems[itemIndex].quantity = Math.min(quantity, maxQuantity)
      saveCartItems(cartItems)
    }
  }
}

export function clearCart(): void {
  saveCartItems([])
}

export function getCartTotal(): number {
  const items = getCartItems()
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function getCartItemCount(): number {
  const items = getCartItems()
  return items.reduce((count, item) => count + item.quantity, 0)
}
