const AppError = require('../services/appError');

function createDocumentController(documentService) {
  function requireUser(req, res, next) {
    const owner = req.get('X-User-Id')?.trim();
    if (!owner) {
      return next(new AppError(400, 'USER_REQUIRED', 'Informe o cabeçalho X-User-Id.'));
    }
    req.owner = owner;
    next();
  }

  return {
    requireUser,

    async upload(req, res) {
      const document = await documentService.upload(req.file, req.owner);
      res.status(201).json(document);
    },

    list(req, res) {
      res.json(documentService.list(req.owner));
    },

    async download(req, res, next) {
      const file = await documentService.getDownload(req.owner, req.params.id);
      res.download(file.filePath, file.originalName, (error) => {
        if (error) {
          if (res.headersSent) {
            return next(error);
          }
          next(new AppError(500, 'STORAGE_ERROR', 'Não foi possível ler o documento.'));
        }
      });
    },
  };
}

module.exports = createDocumentController;