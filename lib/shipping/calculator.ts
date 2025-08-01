export interface ShippingAddress {
  country: string
  state: string
  city: string
  zipCode: string
}

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

export function calculateShipping(items: any[], address: ShippingAddress): ShippingOption[] {
  const totalWeight = items.reduce((weight, item) => {
    // Assume 0.5 lbs per item if no weight specified
    return weight + (item.weight || 0.5) * item.quantity
  }, 0)

  const basePrice = 5.99
  const weightPrice = Math.max(0, (totalWeight - 1) * 2.5)

  // International shipping
  if (address.country !== "US") {
    return [
      {
        id: "international_standard",
        name: "International Standard",
        description: "7-14 business days",
        price: 15.99 + weightPrice,
        estimatedDays: "7-14",
      },
      {
        id: "international_express",
        name: "International Express",
        description: "3-7 business days",
        price: 29.99 + weightPrice,
        estimatedDays: "3-7",
      },
    ]
  }

  // Domestic US shipping
  const options: ShippingOption[] = [
    {
      id: "standard",
      name: "Standard Shipping",
      description: "5-7 business days",
      price: basePrice + weightPrice,
      estimatedDays: "5-7",
    },
    {
      id: "expedited",
      name: "Expedited Shipping",
      description: "2-3 business days",
      price: (basePrice + weightPrice) * 1.8,
      estimatedDays: "2-3",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      description: "1 business day",
      price: (basePrice + weightPrice) * 3.2,
      estimatedDays: "1",
    },
  ]

  // Free shipping for orders over $75
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  if (subtotal >= 75) {
    options[0].price = 0
    options[0].name = "Free Standard Shipping"
  }

  return options
}
