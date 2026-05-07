export const signupConfirmationTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created - Bugyboo</title>
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
                max-width: 600px;
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
                margin-bottom: 10px;
            }
            .header p {
                font-size: 14px;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .greeting strong {
                color: #667eea;
            }
            .message {
                color: #666;
                font-size: 14px;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            .features {
                background-color: #f9f9f9;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 30px 0;
                border-radius: 4px;
            }
            .features h3 {
                color: #667eea;
                font-size: 16px;
                margin-bottom: 15px;
            }
            .feature-list {
                list-style: none;
            }
            .feature-list li {
                color: #666;
                padding: 8px 0;
                font-size: 14px;
                padding-left: 25px;
                position: relative;
            }
            .feature-list li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
                font-size: 16px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 40px;
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
                margin: 10px 0;
            }
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #667eea;
                text-decoration: none;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Bugyboo!</h1>
                <p>Your Account Has Been Created Successfully</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hi <strong>${userName}</strong>,
                </div>
                
                <div class="message">
                    <p>Welcome to the Bugyboo family! We're thrilled to have you join our community of parents who trust us for premium baby products and clothing.</p>
                    <p>Your account has been successfully created and you're all set to start shopping!</p>
                </div>
                
                <div class="features">
                    <h3>What You Can Enjoy:</h3>
                    <ul class="feature-list">
                        <li>Browse our exclusive collection of baby products</li>
                        <li>Easy checkout and multiple delivery options</li>
                        <li>Track your orders in real-time</li>
                        <li>Exclusive deals and discounts for members</li>
                        <li>Secure shopping with encrypted payment</li>
                    </ul>
                </div>
                
                <a href="${process.env.FRONTEND_URL || 'https://bugyboo.com'}" class="cta-button">Start Shopping Now</a>
                
                <div class="message" style="margin-top: 30px;">
                    <p>If you have any questions or need assistance, our support team is here to help. Feel free to reach out to us anytime.</p>
                    <p style="margin-top: 15px; color: #999; font-size: 13px;">Account Details:</p>
                    <p style="color: #666; font-size: 13px;">This account is registered to this email address and cannot be changed for security reasons.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; 2026 Bugyboo. All rights reserved.</p>
                <p>Made with ❤️ for your little ones</p>
                <div class="social-links">
                    <a href="#">Contact Us</a> | 
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}
