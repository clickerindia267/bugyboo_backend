# Email Templates Documentation

## Overview

This directory contains email templates and services for sending automated emails in the Bugyboo application.

## Files

### 1. `emailService.js`
Main email service file containing functions to send emails.

**Functions:**
- `sendSignupConfirmationEmail(email, userName)` - Sends signup confirmation email
- `sendOrderConfirmationEmail(orderData)` - Sends order confirmation email

**Usage:**
```javascript
import { sendSignupConfirmationEmail } from '../emailTemplates/emailService.js'

// In signup controller
await sendSignupConfirmationEmail(user.email, user.name)
```

### 2. `signupConfirmation.js`
HTML email template for account creation confirmation.

**Features:**
- Professional gradient header with welcome message
- User name personalization
- Features list highlighting platform benefits
- Call-to-action button
- Responsive design for mobile devices
- Professional footer with links

**Variables:**
- `userName` - User's full name

**Example:**
```javascript
const htmlContent = signupConfirmationTemplate(userName)
```

### 3. `orderConfirmation.js`
HTML email template for order confirmation.

**Features:**
- Order number and status display
- Product table with:
  - Product image
  - Product name and description
  - Unit price
  - Quantity
  - Subtotal
- Price summary section
- Delivery address details
- Payment method information (COD)
- Tracking information
- Contact support section
- Responsive design

**Variables:**
- `orderNumber` - Order ID (last 8 characters)
- `userName` - Customer name
- `products` - Array of order items with:
  - `productName` - Product name
  - `productDescription` - Product description
  - `price` - Unit price (₹)
  - `quantity` - Quantity ordered
  - `productImage` - URL to product image
- `totalAmount` - Total order amount
- `deliveryAddress` - Address object with:
  - `addressLine` - Full address
  - `city` - City name
  - `state` - State/Province
  - `pinCode` - Postal code
- `contact` - Contact object with:
  - `name` - Customer name
  - `mobile` - Phone number

**Example:**
```javascript
const htmlContent = orderConfirmationTemplate({
  orderNumber: '12345ABC',
  userName: 'John Doe',
  products: [
    {
      productName: 'Baby Shirt',
      productDescription: 'Soft cotton baby shirt',
      price: 699,
      quantity: 2,
      productImage: 'https://...'
    }
  ],
  totalAmount: 1398,
  deliveryAddress: { ... },
  contact: { ... }
})
```

## Email Design Features

### Signup Confirmation Email
- **Color Scheme:** Purple gradient (#667eea to #764ba2)
- **Layout:** Header, content section, features list, CTA button, footer
- **Typography:** Clean, modern fonts (Segoe UI)
- **Responsive:** Mobile-friendly with media queries

### Order Confirmation Email
- **Color Scheme:** Purple gradient with green success accent
- **Layout:** Header with order number, product table, price summary, address, footer
- **Tables:** Responsive product table with product details
- **Visual Elements:** Icons (✅, 📦, 📍, 📬) for better visual hierarchy
- **Information Cards:** Organized sections for delivery address and payment method

## Styling Guidelines

### Colors
```css
Primary: #667eea
Secondary: #764ba2
Success: #d4fc79 / #96e6a1
Background: #f9f9f9 / #f5f5f5
Text Dark: #333
Text Medium: #666
Text Light: #999
```

### Typography
- Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Body Text: 14px
- Headers: 18-28px
- Links: #667eea

### Spacing
- Container Padding: 30px
- Section Margin: 20-25px
- Line Height: 1.6-1.8

## Integration Points

### In `controllers/authController.js`:
```javascript
import { sendSignupConfirmationEmail } from '../emailTemplates/emailService.js'

// After user creation
await sendSignupConfirmationEmail(user.email, user.name)
```

### In `controllers/orderController.js`:
```javascript
import { sendOrderConfirmationEmail } from '../emailTemplates/emailService.js'

// After order creation
await sendOrderConfirmationEmail(emailData)
```

## Configuration

Email sending is configured in `config/emailConfig.js` using Nodemailer with support for:
- Gmail with App Passwords
- Custom SMTP servers (Mailtrap, SendGrid, etc.)

See `EMAIL_SETUP_GUIDE.md` for detailed configuration instructions.

## Best Practices

1. **Always include product images** - Enhance visual appeal and verification
2. **Clear pricing information** - Show unit price and subtotal
3. **Complete delivery details** - Address, contact, and delivery status
4. **Call-to-action buttons** - Guide users to next steps
5. **Professional branding** - Consistent colors and fonts
6. **Mobile optimization** - Test on various devices
7. **Error handling** - Gracefully handle email failures
8. **Logging** - Log email sending for debugging

## Testing

### Local Testing with Mailtrap:
1. Set up Mailtrap account (see EMAIL_SETUP_GUIDE.md)
2. Configure `.env` with Mailtrap credentials
3. Run signup/order endpoints
4. Check Mailtrap inbox for emails

### Email Inspection:
- View HTML rendering in Mailtrap
- Check raw email headers
- Verify all links work correctly
- Test on mobile devices

## Future Enhancements

- [ ] Email templates for password reset
- [ ] Refund/cancellation confirmation emails
- [ ] Shipping update notifications
- [ ] Review request emails
- [ ] Newsletter templates
- [ ] Email template versioning
- [ ] A/B testing capabilities
- [ ] Email unsubscribe management

## Support

For issues or questions about email functionality, see `EMAIL_SETUP_GUIDE.md` troubleshooting section.
