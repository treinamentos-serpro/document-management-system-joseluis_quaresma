const express = require('express');
const multer = require('multer');
const config = require('./config');
const DocumentRepository = require('./repositories/documentRepository');
const DocumentService = require('./services/documentService');
const createDocumentController = require('./controllers/documentController');
const createDocumentRoutes = require('./routes/documentRoutes');
const AppError = require('./services/appError');

const app = express();
const repository = new DocumentRepository(config.storageDirectory);
const service = new DocumentService(repository);
const controller = createDocumentController(service);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(createDocumentRoutes(controller));

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const isTooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(isTooLarge ? 413 : 400).json({
      error: {
        code: isTooLarge ? 'FILE_TOO_LARGE' : 'INVALID_REQUEST',
        message: isTooLarge
          ? 'O arquivo excede o limite permitido.'
          : 'Não foi possível processar o arquivo enviado.',
      },
    });
  }

  const status = error instanceof AppError ? error.status : 500;
  const code = error instanceof AppError ? error.code : 'STORAGE_ERROR';
  const message = error instanceof AppError
    ? error.message
    : 'Ocorreu um erro interno ao processar a solicitação.';

  res.status(status).json({ error: { code, message } });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DMS backend ouvindo na porta ${config.port}`);
  });
}

module.exports = app;
