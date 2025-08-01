export interface TaxInfo {
  rate: number
  amount: number
  jurisdiction: string
}

// Simplified tax calculation - in production, use a service like TaxJar or Avalara
export function calculateTax(subtotal: number, shippingAddress: any): TaxInfo {
  const stateTaxRates: Record<string, number> = {
    CA: 0.0725, // California
    NY: 0.08, // New York
    TX: 0.0625, // Texas
    FL: 0.06, // Florida
    WA: 0.065, // Washington
    OR: 0.0, // Oregon (no sales tax)
    NH: 0.0, // New Hampshire (no sales tax)
    MT: 0.0, // Montana (no sales tax)
    DE: 0.0, // Delaware (no sales tax)
  }

  const state = shippingAddress?.state?.toUpperCase()
  const rate = stateTaxRates[state] || 0.05 // Default 5% for unknown states
  const amount = subtotal * rate

  return {
    rate,
    amount,
    jurisdiction: state ? `${state} State Tax` : "Sales Tax",
  }
}
