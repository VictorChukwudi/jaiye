import { Router } from 'express'
const router = Router()
import asyncHandler from 'express-async-handler'
import multerConfig from '../config/multer.js'
import cloudinary from '../config/cloudinary.js'

//

router.post('/', multerConfig.single('image'), asyncHandler(async(req, res) => {
  const result =  await cloudinary.uploader.upload(req.file.path)

  res.send(result.secure_url)
  
}))

export default router