# Email Configuration Guide

This guide explains how to set up email functionality for sending signup confirmation and order confirmation emails in the Bugyboo backend.

## Features

1. **Signup Confirmation Email** - Automatically sent when a user creates an account
2. **Order Confirmation Email** - Automatically sent when a user places an order with:
   - Product images
   - Product names and descriptions
   - Product prices and quantities
   - Delivery address
   - Order tracking information

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

#### Prerequisites:
- A Gmail account
- 2-Factor Authentication enabled on your Gmail account

#### Steps:

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Follow the prompts to enable 2FA

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password

3. **Update `.env` file:**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM="Bugyboo <your-email@gmail.com>"
   FRONTEND_URL=http://localhost:8080
   ```

### Option 2: Mailtrap (Recommended for Testing)

Mailtrap provides a sandbox for testing emails without actually sending them.

#### Steps:

1. **Create Mailtrap Account:**
   - Go to https://mailtrap.io
   - Sign up for a free account
   - Create a new project

2. **Get SMTP Credentials:**
   - In Mailtrap dashboard, click on "Integrations"
   - Select "Nodemailer"
   - Copy the credentials

3. **Update `.env` file:**
   ```
   EMAIL_SERVICE=custom
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_mailtrap_user_id
   SMTP_PASSWORD=your_mailtrap_password
   EMAIL_FROM="Bugyboo <noreply@bugyboo.com>"
   FRONTEND_URL=http://localhost:8080
   ```

### Option 3: SendGrid (Production)

#### Steps:

1. **Create SendGrid Account:**
   - Go to https://sendgrid.com
   - Sign up for a free account
   - Verify your sender identity

2. **Get API Key:**
   - In SendGrid dashboard, go to Settings > API Keys
   - Create a new API key
   - Copy the key

3. **Update `.env` file:**
   ```
   EMAIL_SERVICE=custom
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM="Bugyboo <noreply@bugyboo.com>"
   FRONTEND_URL=https://bugyboo.com
   ```

## Email Templates

### Signup Confirmation Email (`emailTemplates/signupConfirmation.js`)

Automatically sent when user signs up with:
- Welcome message
- Account creation confirmation
- Features list
- Call-to-action button
- Professional branding

### Order Confirmation Email (`emailTemplates/orderConfirmation.js`)

Automatically sent when order is placed with:
- Order number
- Product details (images, names, prices, quantities, descriptions)
- Total amount calculation
- Delivery address
- Contact information
- Payment method (COD)
- Tracking information
- Professional HTML template

## File Structure

```
emailTemplates/
├── emailService.js              # Email sending service
├── signupConfirmation.js        # Signup email template
└── orderConfirmation.js         # Order confirmation template

config/
├── emailConfig.js               # Email transporter configuration
└── db.js

controllers/
├── authController.js            # Updated with signup email
└── orderController.js           # Updated with order email
```

## Error Handling

Both email services are wrapped in try-catch blocks:
- If email sending fails, it logs the error but does not prevent the signup/order from being processed
- Users will still complete their action successfully, even if the email fails

## Testing

### Test Signup Email:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "password": "TestPass123"
  }'
```

### Using Mailtrap for Testing:
- All test emails will appear in your Mailtrap inbox
- No actual emails are sent to external addresses
- Inspect HTML, raw content, and headers in Mailtrap dashboard

### Using Postman:
- Use the provided Postman collection: `Bugyboo_API_Collection.postman_collection.json`
- Set the `access_token` variable after login
- Test endpoints from the Auth and Orders sections

## Customization

### Customize Email Templates:

1. **Signup Template:** Edit `emailTemplates/signupConfirmation.js`
   - Change HTML/CSS
   - Modify greeting or features
   - Update branding colors

2. **Order Template:** Edit `emailTemplates/orderConfirmation.js`
   - Add more product details
   - Modify layout
   - Add company contact information

### Customize Sender Information:

Update in `.env`:
```
EMAIL_FROM="Your Company Name <your-email@domain.com>"
FRONTEND_URL=https://your-frontend-url.com
```

## Troubleshooting

### Emails Not Sending

1. **Check `.env` file is properly configured:**
   ```bash
   npm install dotenv
   ```

2. **Verify credentials are correct:**
   - For Gmail: Use App Password (not regular password)
   - For Mailtrap: Check user ID and password match

3. **Check server logs:**
   - Look for error messages about email configuration
   - Verify email service connection

4. **Firewall/Network Issues:**
   - Ensure your server can reach SMTP server
   - Check if SMTP port is not blocked

### Common Errors

| Error | Solution |
|-------|----------|
| `Invalid login credentials` | Check EMAIL_USER and EMAIL_PASSWORD in .env |
| `SMTP connection refused` | Verify SMTP_HOST and SMTP_PORT are correct |
| `Authentication failed` | For Gmail, ensure App Password is used (not regular password) |
| `Certificate error` | For custom SMTP, set SMTP_SECURE=false if using port 587 |

## Production Recommendations

1. **Use SendGrid or similar service** for production emails
2. **Implement email queue** for handling high volume
3. **Add email retry logic** for failed attempts
4. **Monitor email delivery** rates
5. **Set up domain authentication** (SPF, DKIM, DMARC)
6. **Keep credentials secure** - use environment variables
7. **Test thoroughly** before deploying to production

## Next Steps

1. Copy `.env.example` to `.env`
2. Add your email service credentials to `.env`
3. Restart the server: `npm run dev`
4. Test signup and order endpoints
5. Check email inbox or Mailtrap dashboard for emails
