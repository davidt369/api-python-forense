import { StorageProvider } from "./storage-provider.interface";
import { CloudinaryProvider } from "./cloudinary.provider";

// Instancia global del proveedor de almacenamiento.
// Si en el futuro se desea cambiar de Cloudinary a S3 u otro,
// simplemente se cambia la instancia aquí.
export const storageService: StorageProvider = new CloudinaryProvider();
