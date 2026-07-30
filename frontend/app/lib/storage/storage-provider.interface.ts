export interface StorageProvider {
  /**
   * Sube una imagen al proveedor de almacenamiento
   * @param fileBuffer Buffer del archivo a subir
   * @param fileName Nombre original o generado del archivo
   * @param folder Carpeta o ruta donde se debe guardar
   * @returns La URL pública/segura del archivo subido
   */
  uploadImage(fileBuffer: Buffer, fileName: string, folder: string): Promise<string>;
}
