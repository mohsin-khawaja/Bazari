"use client"

import { useState, useEffect } from "react"
import {
  getCartItems,
  addToCart as addToCartStorage,
  removeFromCart as removeFromCartStorage,
  updateCartItemQuantity as updateQuantityStorage,
  clearCart as clearCartStorage,
  getCartTotal,
  getCartItemCount,
  type CartItem,
} from "@/lib/cart/storage"

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setItems(getCartItems())
    setIsLoading(false)
  }, [])

  const addToCart = (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    addToCartStorage(item)
    setItems(getCartItems())
  }

  const removeFromCart = (cartItemId: string) => {
    removeFromCartStorage(cartItemId)
    setItems(getCartItems())
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    updateQuantityStorage(cartItemId, quantity)
    setItems(getCartItems())
  }

  const clearCart = () => {
    clearCartStorage()
    setItems([])
  }

  const total = getCartTotal()
  const itemCount = getCartItemCount()

  return {
    items,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  }
}
