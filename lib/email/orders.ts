import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail(order: any, recipient: "buyer" | "seller") {
  const recipientEmail = recipient === "buyer" ? order.buyer.email : order.seller.email
  const recipientName = recipient === "buyer" ? order.buyer.full_name : order.seller.full_name
  const otherParty = recipient === "buyer" ? order.seller : order.buyer

  const subject =
    recipient === "buyer" ? `Order Confirmation #${order.id.slice(0, 8)}` : `New Sale #${order.id.slice(0, 8)}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">${subject}</h1>
      
      <p>Hi ${recipientName},</p>
      
      <p>${
        recipient === "buyer"
          ? "Thank you for your purchase! Your order has been confirmed."
          : "You have a new sale! The buyer's payment has been processed."
      }</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
        <p><strong>Total:</strong> $${order.total_amount}</p>
        <p><strong>${recipient === "buyer" ? "Seller" : "Buyer"}:</strong> ${otherParty.full_name}</p>
        
        <h4>Items:</h4>
        ${order.order_items
          .map(
            (item: any) => `
          <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
            <p><strong>${item.item.title}</strong></p>
            <p>Quantity: ${item.quantity} × $${item.price} = $${(item.quantity * item.price).toFixed(2)}</p>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <p>${
        recipient === "buyer"
          ? "The seller will process your order and provide tracking information once shipped."
          : "Please prepare the item for shipping and update the order status when shipped."
      }</p>
      
      <p>Best regards,<br>The Bazari Team</p>
    </div>
  `

  try {
    await resend.emails.send({
      from: "orders@bazari.com",
      to: recipientEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error("Error sending email:", error)
  }
}
