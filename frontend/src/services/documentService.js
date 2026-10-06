async function readResponse(response) {
  if (response.ok) {
    return response;
  }

  let message = 'Não foi possível concluir a solicitação.';
  try {
    const body = await response.json();
    message = body.error?.message || message;
  } catch {
    message = response.statusText || message;
  }
  throw new Error(message);
}

function userHeaders(owner) {
  return { 'X-User-Id': owner };
}

export async function listDocuments(owner) {
  const response = await fetch('/api/documents', {
    headers: userHeaders(owner),
  });
  await readResponse(response);
  return response.json();
}

export async function uploadDocument(owner, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: userHeaders(owner),
    body: formData,
  });
  await readResponse(response);
  return response.json();
}

export async function downloadDocument(owner, documentMetadata) {
  const response = await fetch(
    `/api/documents/${encodeURIComponent(documentMetadata.id)}/download`,
    { headers: userHeaders(owner) },
  );
  await readResponse(response);

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = documentMetadata.originalName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}