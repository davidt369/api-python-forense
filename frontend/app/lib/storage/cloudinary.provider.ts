import { StorageProvider } from "./storage-provider.interface";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary usando variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryProvider implements StorageProvider {
  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Extraemos el nombre sin extensión para usarlo como public_id
      const publicId = fileName.split('.').slice(0, -1).join('.') || fileName;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        }
      );

      // Escribir el buffer de la imagen en el stream de subida
      uploadStream.end(fileBuffer);
    });
  }
}
