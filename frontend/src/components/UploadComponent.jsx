import { useRef, useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      await onUpload(file);
      setSuccess('Documento enviado.');
      setFile(null);
      formRef.current?.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Novo documento</p>
          <h2 id="upload-title">Adicionar arquivo</h2>
        </div>
        <span className="section-mark" aria-hidden="true">+</span>
      </div>
      <form className="upload-form" onSubmit={handleSubmit} ref={formRef}>
        <label className="file-picker">
          <span className="file-picker-title">
            {file ? file.name : 'Escolha um arquivo do dispositivo'}
          </span>
          <span className="file-picker-hint">
            {file ? `${file.size.toLocaleString('pt-BR')} bytes` : 'Todos os formatos'}
          </span>
          <input
            type="file"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError('');
              setSuccess('');
            }}
          />
        </label>
        <button className="button button-primary" type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {success && <p className="notice notice-success" role="status">{success}</p>}
    </section>
  );
}