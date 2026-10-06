# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, consultem e baixem seus documentos, mantendo arquivos no filesystem local e metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem e download de documentos associados ao usuário da requisição.
- Interface React para upload, listagem e download.
- Arquivos locais com Multer `diskStorage`; metadados em memória durante a execução.

### Fora do escopo

- Armazenamento externo ou em nuvem, banco de dados e versionamento.
- Cadastro, autenticação e recuperação de credenciais.
- Compartilhamento, exclusão, edição, pré-visualização ou conversão de documentos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo no campo multipart `file`. |
| RF-02 | O sistema exige usuário, arquivo e respeito ao limite configurado. |
| RF-03 | O sistema grava o arquivo localmente e retorna seus metadados. |
| RF-04 | Cada documento é associado ao usuário informado na requisição. |
| RF-05 | O usuário lista somente documentos associados à sua identidade. |
| RF-06 | O usuário baixa um documento pelo identificador se ele lhe pertencer. |
| RF-07 | O sistema informa erros para entrada inválida, arquivo acima do limite ou documento indisponível. |
| RF-08 | A interface permite enviar arquivo, consultar listagem e baixar documento. |
| RF-09 | A interface apresenta estados de carregamento, vazio e erro. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Upload local com Multer `diskStorage`, sem provedores externos. |
| RNF-02 | Metadados mantidos em memória; reiniciar o processo perde a associação entre arquivos e metadados. |
| RNF-03 | Caminho físico e nome interno de armazenamento nunca são expostos pela API. |
| RNF-04 | Nome original é dado não confiável e não é usado como caminho de armazenamento. |
| RNF-05 | Porta, diretório e limite de upload podem ser configurados por ambiente. |
| RNF-06 | O frontend usa `/api`; o proxy Vite remove esse prefixo antes de encaminhar ao backend. |
| RNF-07 | Metadados e erros são JSON; download é conteúdo binário com `Content-Disposition`. |
| RNF-08 | Documento inexistente ou de outro usuário resulta em `404`, sem revelar sua existência. |

## 5. Modelo de dados

### Documento (resposta pública)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único e opaco. |
| `originalName` | string | Nome original tratado como nome de arquivo, para exibição/download. |
| `size` | number | Tamanho em bytes. |
| `uploadedAt` | string | Data/hora do upload em ISO 8601 UTC. |
| `owner` | string | Identificador do usuário proprietário. |

O armazenamento pode manter um nome interno gerado pelo sistema, não incluído na resposta pública.

## 6. Contratos de API

Os caminhos públicos incluem `/api`; o proxy de desenvolvimento remove esse prefixo.
Todas as operações de documento exigem `X-User-Id`. Neste MVP local, esse cabeçalho é apenas contexto de proprietário, não autenticação, e não deve ser considerado seguro para exposição pública.

### `POST /api/upload`

- Entrada: `multipart/form-data`, campo obrigatório `file`, cabeçalho `X-User-Id`.
- Sucesso: `201 Created` e objeto de metadados do documento.
- Erros: `400` para usuário/arquivo/requisição inválidos; `413` para arquivo acima do limite; `500` para falha de armazenamento.

### `GET /api/documents`

- Entrada: cabeçalho `X-User-Id`.
- Sucesso: `200 OK` e array de metadados do usuário; array vazio se não houver documentos.

### `GET /api/documents/:id/download`

- Entrada: cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, bytes do arquivo e `Content-Disposition: attachment`.
- Erros: `404` se inexistente, indisponível ou pertencente a outro usuário; `500` para falha de leitura.

### Formato de erro

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Envie um arquivo no campo 'file'."
  }
}
```

Códigos previstos: `USER_REQUIRED`, `FILE_REQUIRED`, `FILE_TOO_LARGE`, `INVALID_REQUEST`, `DOCUMENT_NOT_FOUND` e `STORAGE_ERROR`.

## 7. Decisões arquiteturais e riscos

- Backend CommonJS em `routes -> controllers -> services -> repositories`.
- Rotas conectam endpoint, validação de upload e controller; controllers tratam HTTP; services concentram regras; repositories guardam metadados e localizam arquivos.
- Multer e Express ficam na borda; regras de negócio não dependem deles.
- Frontend React organizado em páginas, componentes e serviço `fetch`.
- Configuração: `PORT` (padrão `3000`), `STORAGE_DIR` (padrão `backend/storage`) e `MAX_FILE_SIZE_BYTES` (padrão `10485760`, 10 MiB).
- A validação de tipos MIME/extensões não está definida; o MVP não promete validar tipos de conteúdo.
- Reiniciar o processo pode deixar arquivos locais sem metadados correspondentes. Recuperação e limpeza estão fora do escopo.
- `X-User-Id` não autentica nem verifica identidade; uso público exige decisão e implementação explícitas de autenticação/autorização.

## 8. Plano de execução

1. Documentar requisitos, modelo, contratos, decisões e riscos em `docs/specs/dms-spec.md`.
2. Implementar o backend em `backend/src/routes`, `controllers`, `services` e `repositories`; validar contratos, limite, armazenamento local e isolamento com testes em `backend/test`.
3. Implementar interface e consumo da API em `frontend/src/pages`, `components` e `services`; cobrir upload, estados da listagem e download.
4. Validar integração via proxy Vite e executar testes backend e build frontend.