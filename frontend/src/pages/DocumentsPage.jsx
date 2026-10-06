import { useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList.jsx';
import UploadComponent from '../components/UploadComponent.jsx';
import { downloadDocument, listDocuments, uploadDocument } from '../services/documentService.js';

const DEFAULT_OWNER = 'usuario-demo';

export default function DocumentsPage() {
  const [ownerInput, setOwnerInput] = useState(DEFAULT_OWNER);
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError('');

    listDocuments(owner)
      .then((result) => {
        if (isCurrent) {
          setDocuments(result);
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [owner, refreshKey]);

  async function handleUpload(file) {
    await uploadDocument(owner, file);
    setRefreshKey((currentKey) => currentKey + 1);
  }

  function handleOwnerSubmit(event) {
    event.preventDefault();
    const nextOwner = ownerInput.trim();
    if (!nextOwner) {
      setError('Informe um identificador de usuário.');
      return;
    }
    setOwner(nextOwner);
    setError('');
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DMS <small>ARQUIVOS</small></span>
        </a>
        <span className="topbar-note">GESTÃO LOCAL DE DOCUMENTOS</span>
      </header>

      <div className="content-wrap">
        <section className="page-intro">
          <div>
            <p className="eyebrow">Espaço de trabalho</p>
            <h1>Seus documentos<span>.</span></h1>
            <p className="intro-copy">Envie e encontre seus arquivos em um só lugar.</p>
          </div>
          <form className="owner-form" onSubmit={handleOwnerSubmit}>
            <label htmlFor="owner-id">Usuário de demonstração</label>
            <div className="owner-control">
              <input
                id="owner-id"
                value={ownerInput}
                onChange={(event) => setOwnerInput(event.target.value)}
                autoComplete="off"
                required
              />
              <button className="button button-secondary" type="submit">Abrir</button>
            </div>
          </form>
        </section>

        <UploadComponent onUpload={handleUpload} />

        <section className="documents-section" aria-labelledby="documents-title">
          <div className="section-heading list-heading">
            <div>
              <p className="eyebrow">Biblioteca</p>
              <h2 id="documents-title">Documentos enviados</h2>
            </div>
            <div className="list-tools">
              <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
              <button
                className="button button-quiet"
                type="button"
                onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
                disabled={isLoading}
              >
                Atualizar
              </button>
            </div>
          </div>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            onDownload={(document) => downloadDocument(owner, document)}
          />
        </section>
      </div>
      <footer className="page-footer">
        <span>Documentos armazenados localmente</span>
        <span>Usuário atual: {owner}</span>
      </footer>
    </main>
  );
}