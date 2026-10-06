const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

let server;
let baseUrl;
let storageDirectory;

before(async () => {
  storageDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  process.env.STORAGE_DIR = storageDirectory;
  process.env.MAX_FILE_SIZE_BYTES = '9';
  const app = require('../src/app');
  server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(storageDirectory, { recursive: true, force: true });
  delete process.env.STORAGE_DIR;
  delete process.env.MAX_FILE_SIZE_BYTES;
});

test('gerencia documentos localmente e isola acesso por usuário', async () => {
  const health = await fetch(`${baseUrl}/health`);
  assert.deepEqual(await health.json(), { status: 'ok' });

  const missingOwner = await fetch(`${baseUrl}/documents`);
  assert.equal(missingOwner.status, 400);
  assert.equal((await missingOwner.json()).error.code, 'USER_REQUIRED');

  const missingFile = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'alice' },
  });
  assert.equal(missingFile.status, 400);
  assert.equal((await missingFile.json()).error.code, 'FILE_REQUIRED');

  const tooLargeForm = new FormData();
  tooLargeForm.append('file', new Blob(['1234567890']), 'grande.txt');
  const tooLarge = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'alice' },
    body: tooLargeForm,
  });
  assert.equal(tooLarge.status, 413);
  assert.equal((await tooLarge.json()).error.code, 'FILE_TOO_LARGE');

  const form = new FormData();
  form.append('file', new Blob(['conteudo']), 'notas.txt');
  const uploaded = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'alice' },
    body: form,
  });
  assert.equal(uploaded.status, 201);
  const document = await uploaded.json();
  assert.deepEqual(Object.keys(document).sort(), [
    'id', 'originalName', 'owner', 'size', 'uploadedAt',
  ]);
  assert.equal(document.owner, 'alice');
  assert.equal(document.originalName, 'notas.txt');
  assert.equal(document.size, 8);

  const aliceDocuments = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'alice' },
  });
  assert.equal(aliceDocuments.status, 200);
  assert.equal((await aliceDocuments.json()).length, 1);

  const bobDocuments = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'bob' },
  });
  assert.deepEqual(await bobDocuments.json(), []);

  const forbiddenDownload = await fetch(
    `${baseUrl}/documents/${document.id}/download`,
    { headers: { 'X-User-Id': 'bob' } },
  );
  assert.equal(forbiddenDownload.status, 404);
  assert.equal((await forbiddenDownload.json()).error.code, 'DOCUMENT_NOT_FOUND');

  const download = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'alice' },
  });
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition'), /notas\.txt/);
  assert.equal(await download.text(), 'conteudo');
});
