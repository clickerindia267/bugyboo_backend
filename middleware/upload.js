import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'

const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image and video files are allowed'), false)
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
      fileSize: 25 * 1024 * 1024
    },
    fileFilter
  }).array('media', maxFiles)

  return (req, res, next) => {
    upload(req, res, async err => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }

      if (!req.files || req.files.length === 0) {
        return next()
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

