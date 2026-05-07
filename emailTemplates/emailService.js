import transporter from '../config/emailConfig.js'
import { signupConfirmationTemplate } from './signupConfirmation.js'
import { orderConfirmationTemplate } from './orderConfirmation.js'

/**
 * Send signup confirmation email
 * @param {string} email - User's email address
 * @param {string} userName - User's full name
 */
export const sendSignupConfirmationEmail = async (email, userName) => {
  try {
    const htmlContent = signupConfirmationTemplate(userName)

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bugyboo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Bugyboo - Account Created Successfully! 🎉',
      html: htmlContent,
      text: `Welcome to Bugyboo, ${userName}! Your account has been created successfully.`
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Signup confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending signup confirmation email:', error)
    throw error
  }
}

/**
 * Send order confirmation email
 * @param {Object} orderData - Order details including products, address, total
 */
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const { email, orderNumber, userName, products, totalAmount, deliveryAddress, contact } = orderData

    // Format products for email template
    const formattedProducts = products.map((item) => ({
      name: item.productName,
      description: item.productDescription,
      price: item.price,
      quantity: item.quantity,
      image: item.productImage || 'https://via.placeholder.com/80x80?text=Product'
    }))

    const emailData = {
      orderNumber,
      userName,
      products: formattedProducts,
      totalAmount,
      deliveryAddress,
      contact
    }

    const htmlContent = orderConfirmationTemplate(emailData)

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bugyboo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - #${orderNumber} | Bugyboo 📦`,
      html: htmlContent,
      text: `Your order #${orderNumber} has been confirmed. Thank you for shopping with Bugyboo!`
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}
