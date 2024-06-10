import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary'

import path from 'path'
import fs from 'fs'
import os from 'os'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const cloudinaryUpload = async (
  buffer: Buffer,
  fileName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tempFilePath = path.join(os.tmpdir(), fileName)

    fs.writeFile(tempFilePath, buffer, (writeError) => {
      cloudinary.uploader.upload(
        tempFilePath,
        (
          uploadError: UploadApiErrorResponse | undefined,
          result: UploadApiResponse,
        ) => {
          if (uploadError) {
            reject(new Error(uploadError.message))
          } else {
            const uploadResult: string = result.secure_url
            resolve(uploadResult)
          }
        },
      )
    })
  })
}
export default cloudinaryUpload
