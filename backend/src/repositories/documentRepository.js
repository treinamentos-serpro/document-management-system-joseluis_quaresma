const fs = require('node:fs/promises');
const path = require('node:path');

class DocumentRepository {
  constructor(storageDirectory) {
    this.storageDirectory = storageDirectory;
    this.documents = new Map();
  }

  save(document) {
    this.documents.set(document.id, document);
    return document;
  }

  findByOwner(owner) {
    return [...this.documents.values()]
      .filter((document) => document.owner === owner)
      .map(({ id, originalName, size, uploadedAt, owner: documentOwner }) => ({
        id,
        originalName,
        size,
        uploadedAt,
        owner: documentOwner,
      }));
  }

  async findFileByIdAndOwner(id, owner) {
    const document = this.documents.get(id);
    if (!document || document.owner !== owner) {
      return null;
    }

    const filePath = path.join(this.storageDirectory, document.storedName);
    try {
      await fs.access(filePath);
      return { filePath, originalName: document.originalName };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async removeStoredFile(storedName) {
    try {
      await fs.unlink(path.join(this.storageDirectory, storedName));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

module.exports = DocumentRepository;