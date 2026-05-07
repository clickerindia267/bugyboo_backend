# Quick Start Guide - Email Configuration

## 📋 Checklist

- [ ] Nodemailer is installed (already done!)
- [ ] `.env` file created from `.env.example`
- [ ] Email service credentials added to `.env`
- [ ] Server restarted
- [ ] Test emails sent successfully

## ⚡ Quick Setup (5 minutes)

### 1. Gmail Setup (Fastest)

```bash
# 1. Go to: https://myaccount.google.com/apppasswords
# 2. Generate app password (16 characters)
# 3. Add to .env:

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-password
EMAIL_FROM="Bugyboo <your-email@gmail.com>"
FRONTEND_URL=http://localhost:8080

# 4. Restart server:
npm run dev
```

### 2. Mailtrap Setup (Best for Testing)

```bash
# 1. Sign up at https://mailtrap.io (free)
# 2. Create project and get credentials
# 3. Add to .env:

EMAIL_SERVICE=custom
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
EMAIL_FROM="Bugyboo <noreply@bugyboo.com>"
FRONTEND_URL=http://localhost:8080

# 4. Restart server:
npm run dev
```

## 🧪 Test Commands

### Test 1: Signup Email

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "TestPass123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "role": "user"
  }
}
```

Check your email inbox for confirmation email! ✉️

### Test 2: Order Confirmation Email

```bash
# Step 1: Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "TestPass123"
  }'

# Save the accessToken from response

# Step 2: Add product to cart
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 1
  }'

# Step 3: Create address
curl -X POST http://localhost:5000/api/address \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400001"
  }'

# Save the addressId from response

# Step 4: Place order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "name": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "addressId": "ADDRESS_ID",
    "paymentMethod": "COD"
  }'
```

Check your email for order confirmation! 📦

## 📧 Using Mailtrap to View Emails

1. Go to https://mailtrap.io
2. Log in to your account
3. Click on your project
4. View all test emails in the inbox
5. Click on email to view HTML, raw content, headers

## 🔧 Environment Variables

### Gmail
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Bugyboo <your-email@gmail.com>"
FRONTEND_URL=http://localhost:8080
```

### Mailtrap
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mailtrap_user_id
SMTP_PASSWORD=mailtrap_password
EMAIL_FROM="Bugyboo <noreply@bugyboo.com>"
FRONTEND_URL=http://localhost:8080
```

### SendGrid
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=sg_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Bugyboo <noreply@bugyboo.com>"
FRONTEND_URL=https://bugyboo.com
```

## 🚀 Testing with Postman

1. Import the collection: `Bugyboo_API_Collection.postman_collection.json`
2. Set `base_url` variable: `http://localhost:5000/api`
3. Set `access_token` after login
4. Test endpoints:
   - Auth → Sign Up (will send email)
   - Orders → Place Order (will send email)

## ✅ Verify Setup

Check server logs for:
```
Email service is ready to send emails
```

If you see:
```
Email configuration error: [error message]
```

Then check your `.env` file and credentials.

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Module not found: 'nodemailer' | Run: `npm install nodemailer` |
| Invalid login credentials | For Gmail: Use App Password (not regular password) |
| SMTP connection refused | Check SMTP_HOST and SMTP_PORT |
| Email not received | Check spam folder, check server logs |
| .env not loading | Ensure you're using ES6 import: `import dotenv from 'dotenv'` |

## 📚 Documentation Files

- **EMAIL_SETUP_GUIDE.md** - Full setup and troubleshooting
- **IMPLEMENTATION_SUMMARY.md** - What was implemented
- **emailTemplates/README.md** - Email template details
- **.env.example** - Configuration template

## 🎯 What Gets Emailed

### Signup Email Contains:
- Welcome message with user name
- Account creation confirmation
- Features and benefits list
- Button to start shopping
- Professional branding

### Order Email Contains:
- Order confirmation number
- Product images, names, prices, quantities, descriptions
- Delivery address
- Contact information
- Total amount
- Order status and tracking info
- Support contact details

## 🔒 Security Notes

✓ Never commit `.env` to Git
✓ Use App Passwords for Gmail (not regular password)
✓ Keep email credentials private
✓ For production, use professional services (SendGrid, etc.)

---

Ready to send emails? Follow the 5-minute setup above! 🚀
