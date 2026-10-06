const express = require('express');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const config = require('../config');

function createDocumentRoutes(controller) {
  const router = express.Router();
  const storage = multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdir(config.storageDirectory, { recursive: true }, (error) => {
        callback(error, config.storageDirectory);
      });
    },
    filename(req, file, callback) {
      callback(null, randomUUID());
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: config.maxFileSizeBytes },
  });

  router.post('/upload', controller.requireUser, upload.single('file'), controller.upload);
  router.get('/documents', controller.requireUser, controller.list);
  router.get('/documents/:id/download', controller.requireUser, controller.download);

  return router;
}

module.exports = createDocumentRoutes;