import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailNotificationData {
  recipientEmail: string
  recipientName: string
  subject: string
  type: string
  data?: any
}

export async function sendEmailNotification({
  recipientEmail,
  recipientName,
  subject,
  type,
  data,
}: EmailNotificationData) {
  try {
    let html = ""

    switch (type) {
      case "message":
        html = generateMessageEmailTemplate(recipientName, data)
        break
      case "like":
        html = generateLikeEmailTemplate(recipientName, data)
        break
      case "follow":
        html = generateFollowEmailTemplate(recipientName, data)
        break
      case "order_update":
        html = generateOrderUpdateEmailTemplate(recipientName, data)
        break
      case "price_drop":
        html = generatePriceDropEmailTemplate(recipientName, data)
        break
      default:
        html = generateGenericEmailTemplate(recipientName, subject, data?.message || "")
    }

    await resend.emails.send({
      from: "notifications@bazari.com",
      to: recipientEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error("Error sending email notification:", error)
    throw error
  }
}

function generateMessageEmailTemplate(recipientName: string, data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Message</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p style="font-size: 18px; margin: 0 0 15px 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          You have a new message from <strong>${data.senderName}</strong>:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0; font-style: italic; color: #555;">"${data.messagePreview}"</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages/${data.conversationId}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          Reply Now
        </a>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Best regards,<br>The Bazari Team</p>
        <p style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
        </p>
      </div>
    </div>
  `
}

function generateLikeEmailTemplate(recipientName: string, data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">❤️ Someone Liked Your Item!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p style="font-size: 18px; margin: 0 0 15px 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Great news! <strong>${data.likerName}</strong> liked your item:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
          ${data.itemImage ? `<img src="${data.itemImage}" alt="${data.itemTitle}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">` : ""}
          <div>
            <h3 style="margin: 0 0 5px 0; color: #333;">${data.itemTitle}</h3>
            <p style="margin: 0; color: #666; font-size: 18px; font-weight: bold;">$${data.itemPrice}</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/items/${data.itemId}" 
           style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          View Item
        </a>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Keep up the great work!<br>The Bazari Team</p>
      </div>
    </div>
  `
}

function generateFollowEmailTemplate(recipientName: string, data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">👥 New Follower!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p style="font-size: 18px; margin: 0 0 15px 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          <strong>${data.followerName}</strong> started following you on Bazari!
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
          ${data.followerAvatar ? `<img src="${data.followerAvatar}" alt="${data.followerName}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">` : ""}
          <h3 style="margin: 0; color: #333;">@${data.followerUsername}</h3>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/${data.followerUsername}" 
           style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          View Profile
        </a>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Your community is growing!<br>The Bazari Team</p>
      </div>
    </div>
  `
}

function generateOrderUpdateEmailTemplate(recipientName: string, data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📦 Order Update</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p style="font-size: 18px; margin: 0 0 15px 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Your order <strong>#${data.orderNumber}</strong> has been updated:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #00b894;">
            Status: ${data.status.toUpperCase()}
          </p>
          ${data.trackingNumber ? `<p style="margin: 0; color: #666;">Tracking: ${data.trackingNumber}</p>` : ""}
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" 
           style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          View Order
        </a>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Thank you for shopping with us!<br>The Bazari Team</p>
      </div>
    </div>
  `
}

function generatePriceDropEmailTemplate(recipientName: string, data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏷️ Price Drop Alert!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p style="font-size: 18px; margin: 0 0 15px 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Great news! An item you're watching has dropped in price:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
          ${data.itemImage ? `<img src="${data.itemImage}" alt="${data.itemTitle}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">` : ""}
          <div>
            <h3 style="margin: 0 0 5px 0; color: #333;">${data.itemTitle}</h3>
            <p style="margin: 0; color: #666;">
              <span style="text-decoration: line-through; color: #999;">$${data.originalPrice}</span>
              <span style="font-size: 20px; font-weight: bold; color: #e84393; margin-left: 10px;">$${data.currentPrice}</span>
            </p>
            <p style="margin: 5px 0 0 0; color: #00b894; font-weight: bold;">
              You save $${(data.originalPrice - data.currentPrice).toFixed(2)}!
            </p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/items/${data.itemId}" 
           style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          Buy Now
        </a>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Happy shopping!<br>The Bazari Team</p>
      </div>
    </div>
  `
}

function generateGenericEmailTemplate(recipientName: string, subject: string, message: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${subject}</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p style="font-size: 18px; margin: 0 0 15px 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0;">${message}</p>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <p>Best regards,<br>The Bazari Team</p>
        <p style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #667eea;">Manage notification preferences</a>
        </p>
      </div>
    </div>
  `
}
