"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AddToCartButtonProps {
  item: {
    id: string
    title: string
    price: number
    seller_id: string
    quantity?: number
    item_images?: { image_url: string; is_primary: boolean }[]
  }
  sellerName: string
  className?: string
}

export function AddToCartButton({ item, sellerName, className }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, items } = useCart()
  const { user } = useAuth()

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please sign in to add items to cart")
      return
    }

    if (user.id === item.seller_id) {
      toast.error("You can't add your own items to cart")
      return
    }

    const primaryImage = item.item_images?.find((img) => img.is_primary)

    addToCart({
      itemId: item.id,
      title: item.title,
      price: item.price,
      quantity,
      imageUrl: primaryImage?.image_url,
      sellerId: item.seller_id,
      sellerName,
      maxQuantity: item.quantity || 999,
    })

    toast.success(`Added ${quantity} item(s) to cart`)
    setQuantity(1)
  }

  const maxQuantity = item.quantity || 999
  const cartItem = items.find((cartItem) => cartItem.itemId === item.id)
  const currentInCart = cartItem?.quantity || 0
  const availableQuantity = Math.max(0, maxQuantity - currentInCart)

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <Input
          type="number"
          min="1"
          max={availableQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(availableQuantity, Math.max(1, Number.parseInt(e.target.value) || 1)))}
          className="w-20 text-center"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
          disabled={quantity >= availableQuantity}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Button onClick={handleAddToCart} disabled={availableQuantity === 0} className="w-full">
        <ShoppingCart className="w-4 h-4 mr-2" />
        {availableQuantity === 0 ? "Out of Stock" : `Add to Cart - $${(item.price * quantity).toFixed(2)}`}
      </Button>

      {currentInCart > 0 && (
        <p className="text-sm text-muted-foreground text-center">{currentInCart} already in cart</p>
      )}

      {availableQuantity < 5 && availableQuantity > 0 && (
        <p className="text-sm text-orange-600 text-center">Only {availableQuantity} left!</p>
      )}
    </div>
  )
}
