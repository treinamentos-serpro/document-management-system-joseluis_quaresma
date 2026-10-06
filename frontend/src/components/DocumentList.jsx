import DownloadButton from './DownloadButton.jsx';

function formatSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  return `${(size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, isLoading, onDownload }) {
  if (isLoading) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-symbol" aria-hidden="true">—</span>
        <h3>Nenhum documento por aqui</h3>
        <p>Os arquivos enviados para este usuário aparecerão nesta lista.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="document-table">
        <thead>
          <tr>
            <th scope="col">Documento</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>
                <span className="document-name">{document.originalName}</span>
              </td>
              <td className="table-secondary">{formatSize(document.size)}</td>
              <td className="table-secondary">{formatDate(document.uploadedAt)}</td>
              <td className="table-action">
                <DownloadButton document={document} onDownload={onDownload} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}