const path = require('node:path');
const { randomUUID } = require('node:crypto');
const AppError = require('./appError');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async upload(file, owner) {
    if (!file) {
      throw new AppError(400, 'FILE_REQUIRED', "Envie um arquivo no campo 'file'.");
    }

    const id = file.filename || randomUUID();
    const document = {
      id,
      originalName: path.basename(file.originalname.replace(/\\/g, '/')),
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      storedName: file.filename,
    };

    try {
      this.documentRepository.save(document);
    } catch (error) {
      await this.documentRepository.removeStoredFile(file.filename);
      throw error;
    }

    const { storedName, ...publicDocument } = document;
    return publicDocument;
  }

  list(owner) {
    return this.documentRepository.findByOwner(owner);
  }

  async getDownload(owner, id) {
    const file = await this.documentRepository.findFileByIdAndOwner(id, owner);
    if (!file) {
      throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }
    return file;
  }
}

module.exports = DocumentService;