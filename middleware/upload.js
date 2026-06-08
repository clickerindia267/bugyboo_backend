import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
]

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type'), false)
  }
}

const createS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new Error('AWS credentials or region are not configured')
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
}

export const adminMediaUpload = (maxFiles = 4, folder = 'admin') => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024
    },
    fileFilter
  }).array('media', maxFiles)

  return (req, res, next) => {
    upload(req, res, async err => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Oversized file: Maximum size allowed is 100MB' })
        }
        return res.status(400).json({ success: false, message: err.message })
      }

      if (!req.files || req.files.length === 0) {
        return next()
      }

      // Validate files by mime type and size limits
      for (const file of req.files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return res.status(400).json({ success: false, message: 'Unsupported file type' })
        }
        if (file.mimetype.startsWith('image/') && file.size > 50 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: 'Oversized file: Images must be under 50MB' })
        }
        if (file.mimetype.startsWith('video/') && file.size > 100 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: 'Oversized file: Videos must be under 100MB' })
        }
      }

      const bucketName = process.env.AWS_S3_BUCKET_NAME
      if (!bucketName) {
        return res.status(500).json({ success: false, message: 'S3 bucket not configured' })
      }

      let s3Client
      try {
        s3Client = createS3Client()
      } catch (clientError) {
        return res.status(500).json({ success: false, message: clientError.message })
      }

      try {
        const uploads = await Promise.all(
          req.files.map(async file => {
            const timestamp = Date.now()
            const safeName = file.originalname.replace(/\s+/g, '-')
            const key = `${folder}/${timestamp}-${safeName}`

            await s3Client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
              })
            )

            return {
              ...file,
              key,
              location: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`
            }
          })
        )

        req.files = uploads
        next()
      } catch (uploadError) {
        next(uploadError)
      }
    })
  }
}

