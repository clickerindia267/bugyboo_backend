export const orderConfirmationTemplate = (orderData) => {
  const { orderNumber, userName, products, totalAmount, deliveryAddress, contact } = orderData

  let productsHTML = products
    .map(
      (item) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong style="color: #333; display: block; margin-bottom: 4px;">${item.name}</strong>
                <p style="color: #999; font-size: 12px; margin: 4px 0;">${item.description || 'N/A'}</p>
                <p style="color: #666; font-size: 13px; margin: 4px 0;">
                    <strong>Qty:</strong> ${item.quantity}
                </p>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                <p style="color: #333; font-size: 14px;">₹${item.price.toFixed(2)}</p>
                <p style="color: #666; font-size: 12px;">Each</p>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                <strong style="color: #667eea; font-size: 15px;">₹${(item.price * item.quantity).toFixed(2)}</strong>
            </td>
        </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Bugyboo</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                line-height: 1.6;
            }
            .container {
                max-width: 700px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                font-size: 28px;
                margin-bottom: 5px;
            }
            .order-number {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                font-size: 12px;
                margin-top: 10px;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 16px;
                color: #333;
                margin-bottom: 20px;
            }
            .greeting strong {
                color: #667eea;
            }
            .status-box {
                background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                text-align: center;
                color: #2d5016;
                font-weight: 600;
            }
            .section-title {
                font-size: 16px;
                color: #333;
                font-weight: 600;
                margin-top: 25px;
                margin-bottom: 15px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 8px;
            }
            .products-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .products-table th {
                background-color: #f9f9f9;
                padding: 12px;
                text-align: left;
                font-size: 12px;
                color: #666;
                font-weight: 600;
                border-bottom: 2px solid #eee;
            }
            .products-table th:last-child {
                text-align: right;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .info-card {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #667eea;
            }
            .info-card h4 {
                color: #667eea;
                font-size: 13px;
                margin-bottom: 8px;
                text-transform: uppercase;
            }
            .info-card p {
                color: #666;
                font-size: 13px;
                line-height: 1.6;
            }
            .price-summary {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .price-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 14px;
                color: #666;
            }
            .price-row.total {
                border-top: 2px solid #ddd;
                padding-top: 12px;
                margin-top: 12px;
                font-size: 16px;
                color: #333;
                font-weight: 600;
            }
            .price-row.total span:last-child {
                color: #667eea;
                font-size: 18px;
            }
            .tracking-note {
                background: #e3f2fd;
                border-left: 4px solid #2196F3;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 13px;
                color: #1976d2;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
            }
            .cta-button:hover {
                opacity: 0.9;
            }
            .footer {
                background-color: #f5f5f5;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #eee;
            }
            .footer p {
                color: #999;
                font-size: 12px;
                margin: 8px 0;
            }
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
                .products-table {
                    font-size: 12px;
                }
                .content {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Order Confirmed!</h1>
                <div class="order-number">Order #${orderNumber}</div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Thank you for your order, <strong>${userName}</strong>!
                </div>
                
                <div class="status-box">
                    ✓ Your order has been successfully placed and is being processed
                </div>
                
                <div class="section-title">📦 Order Items</div>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Details</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsHTML}
                    </tbody>
                </table>
                
                <div class="price-summary">
                    <div class="price-row">
                        <span>Subtotal:</span>
                        <span>₹${totalAmount.toFixed(2)}</span>
                    </div>
                    <div class="price-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <div class="price-row total">
                        <span>Total Amount:</span>
                        <span>₹${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="section-title">📍 Delivery Address</div>
                <div class="info-grid">
                    <div class="info-card">
                        <h4>Shipping To</h4>
                        <p>
                            <strong>${contact.name}</strong><br>
                            ${deliveryAddress.addressLine}<br>
                            ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.pinCode}<br>
                            <strong>Phone:</strong> ${contact.mobile}
                        </p>
                    </div>
                    <div class="info-card">
                        <h4>Payment Method</h4>
                        <p>
                            <strong>Cash on Delivery (COD)</strong><br>
                            Pay when your order arrives at your doorstep
                        </p>
                    </div>
                </div>
                
                <div class="tracking-note">
                    <strong>📬 What's Next?</strong> Your order will be shipped within 24-48 hours. You'll receive a tracking update email with all the details. You can also check your order status anytime by logging into your account.
                </div>
                
                <a href="${process.env.FRONTEND_URL || 'https://bugyboo.com'}/orders" class="cta-button">Track Your Order</a>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                    <p style="color: #666; font-size: 13px; margin-bottom: 10px;">
                        <strong>Need Help?</strong> If you have any questions about your order, please don't hesitate to contact our customer support team.
                    </p>
                    <p style="color: #999; font-size: 12px;">
                        Email: support@bugyboo.com | Phone: +91-XXX-XXX-XXXX
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; 2026 Bugyboo. All rights reserved.</p>
                <p>Made with ❤️ for your little ones</p>
                <p>
                    <a href="#">Track Order</a> | 
                    <a href="#">Help Center</a> | 
                    <a href="#">Privacy Policy</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}
