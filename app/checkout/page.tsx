"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { calculateShipping, type ShippingAddress } from "@/lib/shipping/calculator"
import { calculateTax } from "@/lib/tax/calculator"
import { createCheckoutSession } from "@/lib/stripe/checkout"
import { toast } from "sonner"
import { CreditCard, Truck, MapPin } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    country: "US",
    state: "",
    city: "",
    zipCode: "",
  })
  const [selectedShipping, setSelectedShipping] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loading, setLoading] = useState(false)

  const shippingOptions = calculateShipping(items, shippingAddress)
  const selectedShippingOption = shippingOptions.find((option) => option.id === selectedShipping)
  const shippingCost = selectedShippingOption?.price || 0

  const taxInfo = calculateTax(total, shippingAddress)
  const finalTotal = total + shippingCost + taxInfo.amount

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout")
      return
    }

    if (items.length === 0) {
      router.push("/")
      return
    }

    // Auto-select first shipping option
    if (shippingOptions.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingOptions[0].id)
    }
  }, [user, items, router, shippingOptions, selectedShipping])

  const handleCheckout = async () => {
    if (!selectedShippingOption) {
      toast.error("Please select a shipping option")
      return
    }

    if (!shippingAddress.state || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error("Please fill in all shipping address fields")
      return
    }

    setLoading(true)

    try {
      // Group items by seller
      const itemsBySeller = items.reduce(
        (acc, item) => {
          if (!acc[item.sellerId]) {
            acc[item.sellerId] = []
          }
          acc[item.sellerId].push(item)
          return acc
        },
        {} as Record<string, typeof items>,
      )

      // Create separate checkout sessions for each seller
      const checkoutPromises = Object.entries(itemsBySeller).map(async ([sellerId, sellerItems]) => {
        const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const sellerShipping = (shippingCost * sellerTotal) / total // Proportional shipping
        const sellerTax = (taxInfo.amount * sellerTotal) / total // Proportional tax

        return createCheckoutSession(
          sellerItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            imageUrl: item.imageUrl,
          })),
          user!.id,
          sellerId,
          {
            ...shippingAddress,
            shippingOption: selectedShippingOption,
            shippingCost: sellerShipping,
            taxAmount: sellerTax,
          },
        )
      })

      const sessions = await Promise.all(checkoutPromises)

      // For simplicity, redirect to the first session
      // In a real app, you might want to handle multiple sellers differently
      const stripe = await import("@stripe/stripe-js").then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
      )

      if (stripe && sessions[0]) {
        clearCart()
        await stripe.redirectToCheckout({ sessionId: sessions[0].sessionId })
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to process checkout")
    } finally {
      setLoading(false)
    }
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={shippingAddress.country}
                    onValueChange={(value) => setShippingAddress((prev) => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="CA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="94102"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                {shippingOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="font-medium">
                        {option.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{option.price === 0 ? "Free" : `$${option.price.toFixed(2)}`}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1">
                    Credit/Debit Card
                  </Label>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                      MC
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                  <RadioGroupItem value="paypal" id="paypal" disabled />
                  <Label htmlFor="paypal" className="flex-1">
                    PayPal (Coming Soon)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                  <RadioGroupItem value="apple" id="apple" disabled />
                  <Label htmlFor="apple" className="flex-1">
                    Apple Pay (Coming Soon)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.imageUrl && (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>{taxInfo.jurisdiction}</span>
                  <span>${taxInfo.amount.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} disabled={loading || !selectedShipping} className="w-full" size="lg">
                {loading ? "Processing..." : `Pay $${finalTotal.toFixed(2)}`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your payment information is secure and encrypted
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
