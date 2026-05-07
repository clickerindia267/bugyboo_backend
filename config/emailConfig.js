import nodemailer from 'nodemailer'

const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER
const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.mailtrap.io'
const emailPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587)
const emailSecure = (process.env.EMAIL_SECURE || process.env.SMTP_SECURE) === 'true'

let transporter

if (process.env.EMAIL_SERVICE === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  })
} else {
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  })
}

transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error)
  } else {
    console.log('Email service is ready to send emails')
  }
})

export default transporter
